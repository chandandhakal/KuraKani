'use client';

import { useEffect } from 'react';
import pusherClient from '@/lib/pusher-client';

const MOOD_META: Record<string, { emoji: string; label: string; color: string }> = {
  happy:    { emoji: '😊', label: 'Happy',    color: 'text-yellow-400' },
  sad:      { emoji: '😢', label: 'Sad',      color: 'text-blue-400'   },
  lonely:   { emoji: '🌙', label: 'Lonely',   color: 'text-purple-400' },
  romantic: { emoji: '💗', label: 'Romantic', color: 'text-pink-400'   },
  bored:    { emoji: '😑', label: 'Bored',    color: 'text-slate-400'  },
  gaming:   { emoji: '🎮', label: 'Gaming',   color: 'text-green-400'  },
  study:    { emoji: '📚', label: 'Study',    color: 'text-orange-400' },
};

interface Props {
  userId: string;
  mood: string;
  onMatchFound: (roomId: string) => void;
  onCancel: () => void;
}

export default function Waiting({ userId, mood, onMatchFound, onCancel }: Props) {
  const meta = MOOD_META[mood] ?? { emoji: '🌀', label: mood, color: 'text-white' };

  useEffect(() => {
    const channel = pusherClient.subscribe(`vl-${userId}`);

    channel.bind('match_found', ({ roomId }: { roomId: string }) => {
      onMatchFound(roomId);
    });

    return () => {
      pusherClient.unsubscribe(`vl-${userId}`);
    };
  }, [userId, onMatchFound]);

  async function handleCancel() {
    await fetch('/api/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    onCancel();
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">

      <div className="relative flex items-center justify-center mb-10">
        <div className="absolute w-28 h-28 rounded-full bg-purple-600 opacity-20 animate-ping" />
        <div
          className="absolute w-20 h-20 rounded-full bg-purple-600 opacity-30 animate-ping"
          style={{ animationDelay: '0.3s' }}
        />
        <div className="relative w-20 h-20 rounded-full bg-gray-800 border border-gray-700
          flex items-center justify-center text-4xl shadow-xl">
          {meta.emoji}
        </div>
      </div>

      <h2 className="text-white text-2xl font-bold mb-2">Finding your match...</h2>
      <p className="text-gray-400 text-sm text-center mb-8">
        Looking for someone feeling{' '}
        <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
      </p>

      <div className="flex gap-2 mb-10">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-purple-500 rounded-full inline-block animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <button
        onClick={handleCancel}
        className="text-gray-600 hover:text-gray-400 text-sm underline underline-offset-2 transition"
      >
        ← Cancel and go back
      </button>
    </div>
  );
}
