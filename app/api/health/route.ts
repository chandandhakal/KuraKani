import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    status: 'VibeLink server is running',
    onlineUsers: Object.keys(store.userRoom).length,
    waiting: Object.fromEntries(
      Object.entries(store.waitingUsers).map(([mood, users]) => [mood, users.length])
    ),
  });
}
