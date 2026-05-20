'use client';

import { useState } from 'react';
import { saveUserProfile } from '@/lib/firestore';

interface Props {
  userId: string;
  onDone: (nickname: string) => void;
}

function Stars() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 90 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width:  i % 12 === 0 ? 2 : 1,
            height: i % 12 === 0 ? 2 : 1,
            left:   `${(i * 17 + 3) % 99}%`,
            top:    `${(i * 29 + 7) % 97}%`,
            animationName: 'mood-twinkle',
            animationDuration: `${2.5 + (i * 0.37) % 3}s`,
            animationDelay:    `${(i * 0.19) % 6}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
}

export default function NicknameSetup({ userId, onDone }: Props) {
  const [value,   setValue]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nick = value.trim();
    if (nick.length < 2) return setError('At least 2 characters');
    if (nick.length > 20) return setError('Max 20 characters');
    setLoading(true);
    try {
      await saveUserProfile(userId, nick);
      onDone(nick);
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  const canSubmit = value.trim().length >= 2 && !loading;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: '#050508' }}
    >
      {/* Aurora blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 900, height: 900, top: '-30%', left: '-20%',
            background: 'radial-gradient(circle,rgba(124,58,237,0.11),transparent 65%)',
            filter: 'blur(50px)',
            animationName: 'aurora-a', animationDuration: '22s',
            animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700, bottom: '-20%', right: '-15%',
            background: 'radial-gradient(circle,rgba(255,60,125,0.09),transparent 65%)',
            filter: 'blur(50px)',
            animationName: 'aurora-b', animationDuration: '28s',
            animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500, top: '50%', left: '65%',
            background: 'radial-gradient(circle,rgba(0,212,255,0.07),transparent 65%)',
            filter: 'blur(50px)',
            animationName: 'aurora-c', animationDuration: '16s',
            animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
          }}
        />
      </div>

      <Stars />

      <div
        className="relative z-10 w-full max-w-[22rem] flex flex-col items-center text-center"
        style={{ animationName: 'enter-up', animationDuration: '0.7s', animationFillMode: 'both' }}
      >
        {/* Logomark */}
        <div
          className="mb-6 text-4xl select-none leading-none"
          style={{
            filter: 'drop-shadow(0 0 24px rgba(124,58,237,0.6))',
            animationName: 'mood-breathe', animationDuration: '3s',
            animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
          }}
        >
          ✦
        </div>

        {/* Brand */}
        <h1
          className="font-black tracking-[-0.04em] leading-none mb-1 select-none"
          style={{
            fontSize: 'clamp(3rem,8vw,4.5rem)',
            background: 'linear-gradient(135deg,#fff 20%,rgba(255,255,255,0.42) 55%,#fff 100%)',
            backgroundSize: '250% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animationName: 'shimmer-text', animationDuration: '5s',
            animationTimingFunction: 'linear', animationIterationCount: 'infinite',
          }}
        >
          Kurakani
        </h1>

        <p
          className="text-[10px] tracking-[0.55em] uppercase mb-14"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          mood · match · connect
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-7">
          <div className="text-left">
            <span
              className="text-[10px] tracking-[0.3em] uppercase block mb-3"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              Choose your alias
            </span>

            <input
              type="text"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. NightOwl99"
              maxLength={20}
              autoFocus
              className="w-full bg-transparent text-white text-xl font-medium outline-none pb-3 transition-all duration-300"
              style={{
                borderBottom: focused
                  ? '1px solid rgba(124,58,237,0.85)'
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: focused ? '0 1px 0 rgba(124,58,237,0.35)' : 'none',
                caretColor: '#7c3aed',
                color: 'white',
              }}
            />

            <div className="flex justify-between mt-2 h-4">
              <span className="text-xs text-red-400" style={{ opacity: error ? 1 : 0, transition: 'opacity 0.2s' }}>
                {error || ' '}
              </span>
              <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.18)' }}>
                {value.length}/20
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${canSubmit ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: canSubmit
                ? '0 0 28px rgba(124,58,237,0.35),0 4px 20px rgba(0,0,0,0.4)'
                : 'none',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block"
                    style={{
                      animationName: 'typing-bounce', animationDuration: '1s',
                      animationDelay: `${i * 0.15}s`, animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                    }}
                  />
                ))}
              </span>
            ) : 'Enter the world →'}
          </button>
        </form>

        <p className="text-[10px] mt-10 tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.1)' }}>
          No account · No trace · Just vibes
        </p>
      </div>
    </div>
  );
}
