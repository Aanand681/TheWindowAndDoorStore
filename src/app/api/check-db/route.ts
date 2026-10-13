import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI || '';
    const conn = await mongoose.createConnection(uri).asPromise();
    const adminDb = conn.db!.admin();
    const result = await adminDb.listDatabases();
    await conn.close();

    return NextResponse.json({ databases: result.databases.map((db: any) => db.name) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
