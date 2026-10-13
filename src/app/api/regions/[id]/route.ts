import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RegionConfig from '@/models/RegionConfig';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const data = await req.json();
    const region = await RegionConfig.findByIdAndUpdate(resolvedParams.id, data, { returnDocument: 'after' });
    if (!region) return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    return NextResponse.json(region);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
