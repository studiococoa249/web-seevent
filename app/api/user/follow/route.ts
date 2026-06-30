import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target User ID wajib disertakan.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('seevent');
    const followsCollection = db.collection('follows');

    // 1. Get follower count for targetUserId (how many people follow them)
    const followersCount = await followsCollection.countDocuments({ followingId: targetUserId });

    // 2. Get following count for targetUserId (how many people they follow)
    const followingCount = await followsCollection.countDocuments({ followerId: targetUserId });

    // 3. Check if current user is following targetUserId
    let isFollowing = false;
    if (session?.userId) {
      const followDoc = await followsCollection.findOne({
        followerId: session.userId,
        followingId: targetUserId
      });
      isFollowing = !!followDoc;
    }

    return NextResponse.json({
      followersCount,
      followingCount,
      isFollowing
    });
  } catch (error: any) {
    console.error('Fetch follow details error:', error);
    return NextResponse.json({ error: 'Gagal memuat data follow/follower.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target User ID wajib disertakan.' }, { status: 400 });
    }

    if (session.userId === targetUserId) {
      return NextResponse.json({ error: 'Anda tidak dapat mengikuti diri sendiri.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('seevent');
    const followsCollection = db.collection('follows');

    // Check if relationship already exists
    const query = { followerId: session.userId, followingId: targetUserId };
    const existing = await followsCollection.findOne(query);

    let isFollowing = false;
    let message = '';

    if (existing) {
      // Unfollow
      await followsCollection.deleteOne(query);
      isFollowing = false;
      message = 'Batal mengikuti pengguna.';
    } else {
      // Follow
      await followsCollection.insertOne({
        ...query,
        createdAt: new Date()
      });
      isFollowing = true;
      message = 'Berhasil mengikuti pengguna.';
    }

    // Get updated counts
    const followersCount = await followsCollection.countDocuments({ followingId: targetUserId });
    const followingCount = await followsCollection.countDocuments({ followerId: targetUserId });

    return NextResponse.json({
      success: true,
      message,
      isFollowing,
      followersCount,
      followingCount
    });
  } catch (error: any) {
    console.error('Follow action error:', error);
    return NextResponse.json({ error: 'Gagal memproses aksi mengikuti.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
