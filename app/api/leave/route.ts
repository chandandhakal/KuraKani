import { NextRequest, NextResponse } from 'next/server';
import { store, VALID_MOODS } from '@/lib/store';
import pusher from '@/lib/pusher-server';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const roomId = store.userRoom[userId];

  if (roomId) {
    const room = store.activeRooms[roomId];
    if (room) {
      const partnerId = room.user1 === userId ? room.user2 : room.user1;
      await pusher.trigger(`vl-${partnerId}`, 'partner_left', {});
      delete store.userRoom[room.user1];
      delete store.userRoom[room.user2];
      delete store.activeRooms[roomId];
    }
  } else {
    for (const mood of VALID_MOODS) {
      store.waitingUsers[mood] = store.waitingUsers[mood].filter((id) => id !== userId);
    }
  }

  return NextResponse.json({ status: 'left' });
}
