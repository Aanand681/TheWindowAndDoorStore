import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RegionConfig from '@/models/RegionConfig';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = 'regions:all';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    
    // Auto-seed default "Supply Only" region if none exists
    const supplyExists = await RegionConfig.findOne({
      $or: [{ isSupplyOnly: true }, { name: /^supply only$/i }]
    });

    if (!supplyExists) {
      await RegionConfig.create({
        name: 'Supply Only',
        isSupplyOnly: true,
        officeLat: 48.6017,
        officeLon: -93.3986,
        freeCities: [],
        setupFeeOptions: [{ label: 'Supply Only (No Setup)', value: 0 }],
        labourPerSqft: 0,
        miscPerSqft: 0,
        labourMin: 0,
        miscMin: 0,
        extraLinPerWindow: 0,
        fixedSetupFee: 0,
        baseTravelFee: 0,
        polygon: [],
      });
    }

    const regions = await RegionConfig.find().sort({ name: 1 });
    cacheSet(cacheKey, regions, 86400).catch(() => {});
    return NextResponse.json(regions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Region name is required' }, { status: 400 });
    }

    const trimmedName = data.name.trim();
    const existing = await RegionConfig.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });
    if (existing) {
      return NextResponse.json({ error: 'A region with this name already exists' }, { status: 400 });
    }

    const isSupplyOnly = Boolean(data.isSupplyOnly || trimmedName.toLowerCase().includes('supply'));

    const newRegion = await RegionConfig.create({
      name: trimmedName,
      isSupplyOnly,
      officeLat: Number(data.officeLat) || 48.6017,
      officeLon: Number(data.officeLon) || -93.3986,
      freeCities: Array.isArray(data.freeCities) ? data.freeCities : [],
      setupFeeOptions: data.setupFeeOptions && data.setupFeeOptions.length > 0 
        ? data.setupFeeOptions 
        : isSupplyOnly 
          ? [{ label: 'Supply Only (No Setup)', value: 0 }] 
          : [{ label: 'Standard Setup', value: 140 }],
      labourPerSqft: isSupplyOnly ? 0 : (Number(data.labourPerSqft) ?? 19),
      miscPerSqft: isSupplyOnly ? 0 : (Number(data.miscPerSqft) ?? 8),
      labourMin: isSupplyOnly ? 0 : (Number(data.labourMin) ?? 325),
      miscMin: isSupplyOnly ? 0 : (Number(data.miscMin) ?? 74),
      extraLinPerWindow: isSupplyOnly ? 0 : (Number(data.extraLinPerWindow) ?? 2.17),
      fixedSetupFee: isSupplyOnly ? 0 : (Number(data.fixedSetupFee) ?? 140),
      baseTravelFee: isSupplyOnly ? 0 : (Number(data.baseTravelFee) ?? 0),
      polygon: Array.isArray(data.polygon) ? data.polygon : [],
    });

    cacheDel('regions:all').catch(() => {});

    return NextResponse.json(newRegion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
