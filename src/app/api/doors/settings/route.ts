import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DoorSettings from '@/models/DoorSettings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';
import { DEFAULT_DOOR_SETTINGS_DATA } from '@/lib/doors/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = 'doors:settings';
    const cached = (await cacheGet(cacheKey)) as any;
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    let settings = await DoorSettings.findOne({});

    if (!settings) {
      settings = await DoorSettings.create(DEFAULT_DOOR_SETTINGS_DATA);
    }

    const plain = settings.toObject ? settings.toObject({ flattenMaps: true }) : settings;

    // Cache in Redis for 1 day
    cacheSet(cacheKey, plain, 86400).catch(() => { });
    return NextResponse.json(plain);
  } catch (error: any) {
    console.error('Error fetching door settings:', error);
    // Graceful fallback to spreadsheet defaults
    return NextResponse.json(DEFAULT_DOOR_SETTINGS_DATA);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const canAccessAdmin =
      (session.user as any)?.canAccessAdmin || role === 'SUPERADMIN' || role === 'ADMIN';

    if (!canAccessAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    let settings = await DoorSettings.findOne({});
    if (!settings) {
      settings = new DoorSettings(DEFAULT_DOOR_SETTINGS_DATA);
    }

    if (Array.isArray(body.presets)) {
      settings.presets = body.presets;
    }
    if (Array.isArray(body.upcharges)) {
      settings.upcharges = body.upcharges;
    }
    if (body.formula) {
      settings.formula = { ...settings.formula, ...body.formula };
    }
    if (body.logistics) {
      settings.logistics = { ...settings.logistics, ...body.logistics };
    }

    await settings.save();

    // Invalidate Redis cache
    await cacheDel('doors:settings').catch(() => { });

    const plain = settings.toObject ? settings.toObject({ flattenMaps: true }) : settings;
    return NextResponse.json({
      success: true,
      settings: plain,
    });
  } catch (error: any) {
    console.error('Error updating door settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}

