import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { roomId } = await req.json();

  if (!process.env.DAILY_API_KEY) {
    return NextResponse.json({ error: 'Video calls not configured' }, { status: 503 });
  }

  // Daily room names: lowercase alphanumeric + hyphens, max 85 chars
  const name = roomId
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .slice(0, 85)
    .toLowerCase();

  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name,
      properties: { exp: Math.floor(Date.now() / 1000) + 3600 },
    }),
  });

  // Room already exists — fetch and return existing URL
  if (res.status === 422) {
    const existing = await fetch(`https://api.daily.co/v1/rooms/${name}`, {
      headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
    });
    const data = await existing.json();
    return NextResponse.json({ url: data.url });
  }

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error }, { status: 500 });
  return NextResponse.json({ url: data.url });
}
