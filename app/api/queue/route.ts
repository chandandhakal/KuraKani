import { NextRequest, NextResponse } from 'next/server';
import { store, VALID_MOODS } from '@/lib/store';
import pusher from '@/lib/pusher-server';

export async function POST(req: NextRequest) {
  const { userId, mood, nickname } = await req.json();

  if (!userId || !mood || !(VALID_MOODS as readonly string[]).includes(mood)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (nickname) store.userNicknames[userId] = nickname;

  store.waitingUsers[mood] = store.waitingUsers[mood].filter((id) => id !== userId);

  if (store.waitingUsers[mood].length > 0) {
    const partnerId = store.waitingUsers[mood].shift()!;
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    store.activeRooms[roomId] = { user1: partnerId, user2: userId, mood };
    store.userRoom[userId] = roomId;
    store.userRoom[partnerId] = roomId;

    const myNickname = store.userNicknames[userId] || 'Anonymous';
    const partnerNickname = store.userNicknames[partnerId] || 'Anonymous';

    await Promise.all([
      pusher.trigger(`vl-${userId}`, 'match_found', { roomId, mood, partnerId, partnerNickname }),
      pusher.trigger(`vl-${partnerId}`, 'match_found', { roomId, mood, partnerId: userId, partnerNickname: myNickname }),
    ]);

    return NextResponse.json({ status: 'matched', roomId, mood });
  }

  store.waitingUsers[mood].push(userId);
  return NextResponse.json({ status: 'waiting', mood });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  for (const mood of VALID_MOODS) {
    store.waitingUsers[mood] = store.waitingUsers[mood].filter((id) => id !== userId);
  }

  return NextResponse.json({ status: 'removed' });
}
