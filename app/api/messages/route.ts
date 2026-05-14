import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import pusher from '@/lib/pusher-server';

export async function POST(req: NextRequest) {
  const { userId, text } = await req.json();

  if (!userId || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const roomId = store.userRoom[userId];
  if (!roomId) return NextResponse.json({ error: 'Not in a room' }, { status: 400 });

  const room = store.activeRooms[roomId];
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 400 });

  const message = {
    senderId: userId,
    text: text.trim().slice(0, 500),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  await Promise.all([
    pusher.trigger(`vl-${room.user1}`, 'new_message', message),
    pusher.trigger(`vl-${room.user2}`, 'new_message', message),
  ]);

  return NextResponse.json({ status: 'sent' });
}
