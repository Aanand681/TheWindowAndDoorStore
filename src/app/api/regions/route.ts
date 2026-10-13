import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RegionConfig from '@/models/RegionConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const regions = await RegionConfig.find().sort({ name: 1 });
    return NextResponse.json(regions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
