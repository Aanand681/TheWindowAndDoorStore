import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';
import { DEFAULT_LABOUR_UPGRADE_TIERS } from '@/lib/promo-logic';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = 'settings:global';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    let settings = await Settings.findOne({});
    
    // If no settings document exists, create one with defaults
    if (!settings) {
      settings = await Settings.create({ 
        surchargeRate: 8,
        addons: [
          { id: 'blinds', label: 'Blinds back on per window @ $60.00', lab: 60, misc: 0 },
          { id: 'drip', label: 'Drip edge install @ $30.00 per window', lab: 30, misc: 6.99 },
          { id: 'base', label: 'Basement windows $100.00 extra', lab: 100, misc: 0 },
          { id: 'stucco', label: 'Cut stucco around NF for BM @ $75', lab: 75, misc: 0 },
          { id: 'siding', label: 'Removal siding per window/door @ $130.00', lab: 130, misc: 0 },
          { id: 'scaf1', label: 'Scaffolding set up 1 section @ $60.00', lab: 60, misc: 0 },
          { id: 'scaf2', label: 'Scaffolding set up 2 sections @ $80.00', lab: 80, misc: 0 },
          { id: 'alum', label: 'Cut aluminum siding for BM @ $450', lab: 450, misc: 0 },
          { id: 'jchan', label: 'J channels (qty × $325 labour + $180 misc)', lab: 325, misc: 180 }
        ],
        jambs: [
          { id: 'j1', label: 'Vinyl Wrapped Jamb – 3/4 x 2 1/2', rate: 5.05 },
          { id: 'j2', label: 'Vinyl Wrapped Jamb – 3/4 x 3 1/4', rate: 6.05 },
          { id: 'j3', label: 'Vinyl Wrapped Jamb – 3/4 x 4 1/2', rate: 7.34 },
          { id: 'j4', label: 'Vinyl Wrapped Jamb – 3/4 x 5 1/4', rate: 8.49 },
          { id: 'j5', label: 'Vinyl Wrapped Jamb – 3/4 x 6 3/4', rate: 10.31 }
        ],
        casings: [
          { id: 'vinyl', label: 'Vinyl casing charge', rate: 5.69 },
          { id: 'oak', label: 'Oak casing charge', rate: 8.16 }
        ],
        vehicleRate: 0.98,
        crewRates: [
          { crewSize: '2', hourlyRate: 150 },
          { crewSize: '3', hourlyRate: 200 },
          { crewSize: '4', hourlyRate: 500 }
        ],
        labourUpgradeTiers: DEFAULT_LABOUR_UPGRADE_TIERS
      });
    } else if (!settings.labourUpgradeTiers || settings.labourUpgradeTiers.length === 0) {
      settings.labourUpgradeTiers = DEFAULT_LABOUR_UPGRADE_TIERS;
      await settings.save();
    }
    
    cacheSet('settings:global', settings, 86400).catch(() => {});
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    const canAccessAdmin = (session.user as any).canAccessAdmin || role === 'SUPERADMIN' || role === 'ADMIN';
    if (!canAccessAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    const updateFields: any = {};
    if (body.surchargeRate !== undefined) updateFields.surchargeRate = body.surchargeRate;
    if (body.addons !== undefined) updateFields.addons = body.addons;
    if (body.jambs !== undefined) updateFields.jambs = body.jambs;
    if (body.casings !== undefined) updateFields.casings = body.casings;
    if (body.vehicleRate !== undefined) updateFields.vehicleRate = body.vehicleRate;
    if (body.crewRates !== undefined) updateFields.crewRates = body.crewRates;
    if (body.labourUpgradeTiers !== undefined) updateFields.labourUpgradeTiers = body.labourUpgradeTiers;

    // Upsert the first settings document
    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $set: updateFields },
      { returnDocument: 'after', upsert: true }
    );

    // Invalidate settings cache
    cacheDel('settings:global').catch(() => {});

    return NextResponse.json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
