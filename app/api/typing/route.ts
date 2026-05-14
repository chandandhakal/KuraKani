import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import pusher from '@/lib/pusher-server';

export async function POST(req: NextRequest) {
  const { userId, isTyping } = await req.json();

  if (!userId || typeof isTyping !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const roomId = store.userRoom[userId];
  if (!roomId) return NextResponse.json({ status: 'ok' });

  const room = store.activeRooms[roomId];
  if (!room) return NextResponse.json({ status: 'ok' });

  const partnerId = room.user1 === userId ? room.user2 : room.user1;

  await pusher.trigger(`vl-${partnerId}`, 'partner_typing', { isTyping });

  return NextResponse.json({ status: 'ok' });
}
