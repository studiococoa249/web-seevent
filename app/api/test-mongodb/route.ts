import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('seevent');
    const collection = db.collection('test_api_write');
    
    // Test write
    const insertResult = await collection.insertOne({
      test: true,
      timestamp: new Date()
    });
    
    // Test delete
    await collection.deleteOne({ _id: insertResult.insertedId });
    
    return NextResponse.json({
      success: true,
      message: "Koneksi ke MongoDB dari Next.js API berhasil dilakukan!",
      insertResult
    });
  } catch (error: any) {
    console.error("MongoDB API test failed:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
