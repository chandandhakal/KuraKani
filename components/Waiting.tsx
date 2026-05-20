'use client';

import { useEffect, useMemo } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { MOOD_CONFIG } from '@/lib/mood-config';

interface Props {
  userId: string;
  mood: string;
  onMatchFound: (roomId: string, partnerId: string, partnerNickname: string) => void;
  onCancel: () => void;
}

export default function Waiting({ userId, mood, onMatchFound, onCancel }: Props) {
  const m = MOOD_CONFIG[mood] ?? MOOD_CONFIG.happy;

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i, left: `${5 + (i * 23 + 7) % 88}%`, bottom: `${3 + (i * 13) % 20}%`,
      delay: `${(i * 0.5) % 6}s`, duration: `${5 + (i * 0.6) % 4}s`,
      size: i % 3 === 0 ? 14 : i % 3 === 1 ? 10 : 7,
    })),
  []);

  useEffect(() => {
    const channel = getPusherClient().subscribe(`vl-${userId}`);
    channel.bind('match_found', ({ roomId, partnerId, partnerNickname }: { roomId: string; partnerId: string; partnerNickname: string }) => {
      onMatchFound(roomId, partnerId, partnerNickname);
    });
    return () => { channel.unbind_all(); getPusherClient().unsubscribe(`vl-${userId}`); };
  }, [userId, onMatchFound]);

  async function handleCancel() {
    await fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
    onCancel();
  }

  const isGaming = mood === 'gaming';

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: `radial-gradient(ellipse 100% 80% at 50% 60%,${m.bgFrom} 0%,#050508 70%)` }}
    >
      {/* Gaming scanlines */}
      {isGaming && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,135,0.012) 3px,rgba(0,255,135,0.012) 4px)', animationName: 'screen-flicker', animationDuration: '7s', animationIterationCount: 'infinite' }} />
          <div className="absolute w-full h-16" style={{ background: 'linear-gradient(to bottom,transparent,rgba(0,255,135,0.04),transparent)', animationName: 'scan-sweep', animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />
        </>
      )}

      {/* Study dot grid */}
      {mood === 'study' && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle,rgba(0,212,255,0.06) 1px,transparent 1px)', backgroundSize: '28px 28px', animationName: 'grid-pulse', animationDuration: '4s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
      )}

      {/* Rising particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <span key={p.id} className="absolute select-none" style={{ left: p.left, bottom: p.bottom, fontSize: p.size, color: m.primary, animationName: 'rise-fade', animationDuration: p.duration, animationDelay: p.delay, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}>
            {m.particleChar}
          </span>
        ))}
      </div>

      {/* Sonar + orbital core */}
      <div className="relative flex items-center justify-center mb-14" style={{ width: 240, height: 240 }}>
        {/* Sonar pings */}
        {[0, 0.9, 1.8, 2.7].map((delay, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none" style={{ width: 90, height: 90, top: '50%', left: '50%', border: `1px solid rgba(${m.rgb},${0.55 - i * 0.1})`, animationName: 'sonar', animationDuration: '3.6s', animationDelay: `${delay}s`, animationTimingFunction: 'ease-out', animationIterationCount: 'infinite' }} />
        ))}

        {/* Outer orbital */}
        <div className="absolute rounded-full" style={{ width: 200, height: 200, border: `1px solid rgba(${m.rgb},0.1)`, animationName: 'orbit-cw', animationDuration: '18s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
          <div className="absolute rounded-full" style={{ width: 8, height: 8, top: -4, left: '50%', marginLeft: -4, background: m.primary, boxShadow: `0 0 10px ${m.glow}` }} />
        </div>

        {/* Inner orbital */}
        <div className="absolute rounded-full" style={{ width: 148, height: 148, border: `1px solid rgba(${m.rgb},0.18)`, animationName: 'orbit-ccw', animationDuration: '11s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
          <div className="absolute rounded-full bg-white" style={{ width: 5, height: 5, top: -2.5, left: '50%', marginLeft: -2.5, boxShadow: '0 0 6px white' }} />
        </div>

        {/* Ambient glow */}
        <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, top: '50%', left: '50%', background: `radial-gradient(circle,rgba(${m.rgb},0.18) 0%,transparent 65%)`, animationName: 'glow-expand', animationDuration: '3s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />

        {/* Emoji core */}
        <div className="relative flex items-center justify-center text-5xl select-none z-10" style={{ width: 88, height: 88, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%,rgba(${m.rgb},0.38),rgba(${m.rgb},0.07))`, border: `1px solid rgba(${m.rgb},0.48)`, boxShadow: `0 0 36px ${m.glow},0 0 72px ${m.glowDim},inset 0 1px 0 rgba(255,255,255,0.16)`, animationName: 'mood-breathe', animationDuration: '2.5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}>
          {m.emoji}
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight" style={{ filter: `drop-shadow(0 0 16px rgba(${m.rgb},0.4))` }}>
          {isGaming ? 'Scanning for players...' : `Finding your match...`}
        </h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Tuning into the{' '}
          <span className="font-semibold" style={{ color: m.primary, textShadow: `0 0 10px ${m.glow}` }}>{m.name}</span>
          {' '}frequency
        </p>
      </div>

      <div className="flex gap-3 mb-12">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className="rounded-full inline-block" style={{ width: 7, height: 7, background: m.primary, boxShadow: `0 0 8px ${m.glow}`, animationName: 'typing-bounce', animationDuration: '1.3s', animationDelay: `${i * 0.18}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
        ))}
      </div>

      {isGaming ? (
        <button onClick={handleCancel} className="relative px-6 py-2.5 text-xs tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95" style={{ border: '1px solid rgba(0,255,135,0.3)', color: 'rgba(0,255,135,0.6)', background: 'rgba(0,255,135,0.04)' }}>
          <div className="absolute top-0 left-0 w-2 h-2" style={{ borderTop: '1px solid rgba(0,255,135,0.7)', borderLeft: '1px solid rgba(0,255,135,0.7)' }} />
          <div className="absolute top-0 right-0 w-2 h-2" style={{ borderTop: '1px solid rgba(0,255,135,0.7)', borderRight: '1px solid rgba(0,255,135,0.7)' }} />
          <div className="absolute bottom-0 left-0 w-2 h-2" style={{ borderBottom: '1px solid rgba(0,255,135,0.7)', borderLeft: '1px solid rgba(0,255,135,0.7)' }} />
          <div className="absolute bottom-0 right-0 w-2 h-2" style={{ borderBottom: '1px solid rgba(0,255,135,0.7)', borderRight: '1px solid rgba(0,255,135,0.7)' }} />
          ✕ Abort mission
        </button>
      ) : (
        <button onClick={handleCancel} className="text-sm underline underline-offset-4 transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.25)' }}>
          ← Cancel and go back
        </button>
      )}
    </div>
  );
}
