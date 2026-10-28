import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SealedUnitSettings from '@/models/SealedUnitSettings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';
import {
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
} from '@/lib/sealed-units-logic';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = 'sealed_units:settings';
    const cached = (await cacheGet(cacheKey)) as any;
    if (cached) {
      if (!cached.grills) {
        cached.grills = DEFAULT_GRILL_SETTINGS;
      }
      return NextResponse.json(cached);
    }

    await dbConnect();
    let settings = await SealedUnitSettings.findOne({});

    if (!settings) {
      settings = await SealedUnitSettings.create({
        combos: DEFAULT_SEALED_UNIT_COMBOS,
        formula: DEFAULT_FORMULA_CONSTANTS,
        labour: DEFAULT_LABOUR_SETTINGS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        grills: DEFAULT_GRILL_SETTINGS,
      });
    }

    // Convert Mongoose document to plain object
    const plain = settings.toObject ? settings.toObject({ flattenMaps: true }) : settings;
    if (!plain.grills) {
      plain.grills = DEFAULT_GRILL_SETTINGS;
    }

    // Cache in Redis for 1 day
    cacheSet(cacheKey, plain, 86400).catch(() => {});
    return NextResponse.json(plain);
  } catch (error: any) {
    console.error('Error fetching sealed unit settings:', error);
    // Graceful fallback to default constants if MongoDB is momentarily unreachable
    return NextResponse.json({
      combos: DEFAULT_SEALED_UNIT_COMBOS,
      formula: DEFAULT_FORMULA_CONSTANTS,
      labour: DEFAULT_LABOUR_SETTINGS,
      thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
      grills: DEFAULT_GRILL_SETTINGS,
    });
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

    const updateFields: any = {};
    if (body.combos !== undefined) updateFields.combos = body.combos;
    if (body.formula !== undefined) updateFields.formula = body.formula;
    if (body.labour !== undefined) updateFields.labour = body.labour;
    if (body.thicknessBreaks !== undefined) updateFields.thicknessBreaks = body.thicknessBreaks;
    if (body.grills !== undefined) updateFields.grills = body.grills;

    const updatedSettings = await SealedUnitSettings.findOneAndUpdate(
      {},
      { $set: updateFields },
      { returnDocument: 'after', upsert: true }
    );

    const plain = updatedSettings.toObject
      ? updatedSettings.toObject({ flattenMaps: true })
      : updatedSettings;

    // Invalidate Redis cache
    cacheDel('sealed_units:settings').catch(() => {});

    return NextResponse.json({
      message: 'Sealed Unit settings updated successfully',
      settings: plain,
    });
  } catch (error: any) {
    console.error('Error updating sealed unit settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
