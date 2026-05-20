'use client';

import { useMemo, useState } from 'react';
import { MOOD_CONFIG, MOOD_KEYS } from '@/lib/mood-config';

interface Props {
  userId: string;
  nickname: string;
  onMoodSelect: (mood: string) => void;
  onOpenFriends: () => void;
}

/* ─── Per-mood ambient background layers ─────────────────────────────── */

function GamingBg({ active }: { active: boolean }) {
  const cols = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${(i * 11 + 2) % 92}%`,
    delay: `${(i * 0.28) % 2.4}s`,
    dur: `${1.6 + (i * 0.22) % 1.4}s`,
    chars: ('10アイサシカキ01エオ10').split(''),
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* scanlines */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,135,0.013) 3px,rgba(0,255,135,0.013) 4px)',
      }} />
      {/* vertical grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 29px,rgba(0,255,135,0.018) 29px,rgba(0,255,135,0.018) 30px)',
      }} />
      {/* HUD corner brackets */}
      <div className="absolute top-3 left-3 w-6 h-6" style={{ borderTop: '1.5px solid rgba(0,255,135,0.5)', borderLeft: '1.5px solid rgba(0,255,135,0.5)' }} />
      <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: '1.5px solid rgba(0,255,135,0.5)', borderRight: '1.5px solid rgba(0,255,135,0.5)' }} />
      <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: '1.5px solid rgba(0,255,135,0.5)', borderLeft: '1.5px solid rgba(0,255,135,0.5)' }} />
      <div className="absolute bottom-3 right-3 w-6 h-6" style={{ borderBottom: '1.5px solid rgba(0,255,135,0.5)', borderRight: '1.5px solid rgba(0,255,135,0.5)' }} />
      {/* scan sweep */}
      {active && (
        <div className="absolute w-full h-14" style={{
          background: 'linear-gradient(to bottom,transparent,rgba(0,255,135,0.07),transparent)',
          animationName: 'scan-sweep', animationDuration: '2.5s', animationTimingFunction: 'linear', animationIterationCount: 'infinite',
        }} />
      )}
      {/* matrix rain columns */}
      {cols.map(col => (
        <div key={col.id} className="absolute flex flex-col" style={{
          left: col.left, top: 0,
          animationName: 'matrix-fall', animationDuration: col.dur,
          animationDelay: col.delay, animationTimingFunction: 'linear', animationIterationCount: 'infinite',
        }}>
          {col.chars.map((c, i) => (
            <span key={i} style={{
              fontSize: 9, fontFamily: 'monospace', lineHeight: '14px',
              color: `rgba(0,255,135,${0.05 + (i / col.chars.length) * 0.22})`,
            }}>{c}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function StudyBg({ active }: { active: boolean }) {
  const items = useMemo(() => [
    '∫dx', 'E=mc²', 'π≈3.14', 'Σ', '∂/∂x', 'λ', '∞', 'F=ma', '∇·F', 'dx/dt', 'θ', 'μ',
  ].map((text, i) => ({
    id: i, text,
    left: `${8 + (i * 17) % 76}%`,
    top: `${10 + (i * 23) % 70}%`,
    dur: `${7 + (i * 0.9) % 5}s`,
    delay: `${(i * 0.65) % 4}s`,
    size: [14, 11, 10][i % 3],
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle,rgba(0,212,255,0.05) 1px,transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {items.map(f => (
        <span key={f.id} className="absolute font-mono select-none" style={{
          left: f.left, top: f.top, fontSize: f.size,
          color: 'rgba(0,212,255,0.16)',
          animationName: 'rise-fade', animationDuration: f.dur, animationDelay: f.delay,
          animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
        }}>{f.text}</span>
      ))}
    </div>
  );
}

function LonelyBg({ active }: { active: boolean }) {
  const staticStars = useMemo(() => Array.from({ length: 38 }, (_, i) => ({
    id: i,
    top: `${(i * 7.4) % 100}%`, left: `${(i * 11.9) % 100}%`,
    size: i % 5 === 0 ? 2 : 1,
    dur: `${2 + (i * 0.28) % 3}s`, delay: `${(i * 0.35) % 4}s`,
  })), []);
  const shooters = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    id: i,
    top: `${8 + (i * 14) % 74}%`,
    delay: `${(i * 1.05) % 5.5}s`,
    dur: `${2.2 + (i * 0.35) % 1.5}s`,
    len: 38 + (i * 14) % 55,
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {staticStars.map(s => (
        <div key={s.id} className="absolute rounded-full" style={{
          top: s.top, left: s.left, width: s.size, height: s.size,
          background: 'rgba(167,139,250,0.55)',
          animationName: 'mood-twinkle', animationDuration: s.dur, animationDelay: s.delay,
          animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
        }} />
      ))}
      {shooters.map(s => (
        <div key={s.id} className="absolute" style={{
          top: s.top, left: '-3%',
          animationName: 'shooting-star', animationDuration: s.dur, animationDelay: s.delay,
          animationTimingFunction: 'ease-in', animationIterationCount: 'infinite',
        }}>
          <div style={{
            width: s.len, height: 1.5,
            background: 'linear-gradient(90deg,rgba(167,139,250,0.75),transparent)',
            borderRadius: 2,
          }} />
        </div>
      ))}
    </div>
  );
}

function BoredBg({ active }: { active: boolean }) {
  const shapes = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    id: i,
    size: 48 + (i * 26) % 90,
    top: `${6 + (i * 22) % 80}%`, left: `${4 + (i * 19) % 82}%`,
    dur: `${14 + (i * 2) % 12}s`, delay: `${(i * 1.2) % 9}s`,
    isCircle: i % 2 === 0,
    opacity: 0.035 + (i * 0.009),
    rotate: (i * 47) % 360,
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(60deg,transparent,transparent 40px,rgba(126,179,216,0.01) 40px,rgba(126,179,216,0.01) 41px)',
      }} />
      {shapes.map(s => (
        <div key={s.id} className="absolute border" style={{
          width: s.size, height: s.size, top: s.top, left: s.left,
          borderColor: `rgba(126,179,216,${s.opacity})`,
          borderRadius: s.isCircle ? '50%' : '6px',
          transform: `rotate(${s.rotate}deg)`,
          animationName: 'geo-drift', animationDuration: s.dur, animationDelay: s.delay,
          animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
        }} />
      ))}
    </div>
  );
}

function MoodBg({ slug, active }: { slug: string; active: boolean }) {
  if (slug === 'gaming') return <GamingBg active={active} />;
  if (slug === 'study')  return <StudyBg  active={active} />;
  if (slug === 'lonely') return <LonelyBg active={active} />;
  if (slug === 'bored')  return <BoredBg  active={active} />;
  return null;
}

/* ─── Main component ──────────────────────────────────────────────────── */

export default function MoodSelect({ userId, nickname, onMoodSelect, onOpenFriends }: Props) {
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [entering, setEntering] = useState<string | null>(null);

  async function handleClick(slug: string) {
    if (entering) return;
    setEntering(slug);
    setTimeout(() => onMoodSelect(slug), 360);
    await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mood: slug, nickname }),
    });
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#050508' }}>

      {/* Portal flash on click */}
      {entering && (
        <div className="fixed inset-0 z-50 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 50% 50%,rgba(${MOOD_CONFIG[entering].rgb},0.35) 0%,transparent 65%)`,
          animationName: 'portal-flash', animationDuration: '0.38s',
          animationTimingFunction: 'ease-out', animationFillMode: 'forwards',
        }} />
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div
        className="relative z-20 flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{
          background: 'rgba(5,5,8,0.88)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Shimmer top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed)', backgroundSize: '200% auto', animationName: 'shimmer-text', animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 14px rgba(124,58,237,0.5)' }}
          >
            {nickname[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">{nickname}</div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 5px #34d399' }} />
              <span className="text-emerald-400 text-[10px]">online</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-black tracking-[-0.04em] leading-none select-none absolute left-1/2 -translate-x-1/2"
          style={{
            fontSize: 'clamp(1.4rem,3.5vw,2rem)',
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

        {/* Friends button */}
        <button
          onClick={onOpenFriends}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.color = '#a78bfa'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >
          👥 <span className="hidden sm:inline">Friends</span>
        </button>
      </div>

      {/* Subtitle */}
      <div className="relative z-10 text-center py-3 shrink-0">
        <p className="text-[11px] tracking-[0.45em] uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>Choose your vibe</p>
      </div>

      {/* ── DESKTOP: 2×2 GRID ──────────────────────────────────────────── */}
      <div
        className="hidden md:grid md:grid-cols-2 flex-1 relative z-10"
        style={{ gap: '1px', background: 'rgba(255,255,255,0.04)' }}
      >
        {MOOD_KEYS.map((slug, idx) => {
          const m   = MOOD_CONFIG[slug];
          const isH = hovered === slug;

          return (
            <div
              key={slug}
              className="relative overflow-hidden cursor-pointer select-none group"
              style={{
                background: m.sliceBg,
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                animationName: 'fade-in', animationDuration: `${0.35 + idx * 0.08}s`, animationFillMode: 'both',
              }}
              onMouseEnter={() => setHovered(slug)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(slug)}
            >
              <MoodBg slug={slug} active={isH} />

              {/* Radial glow overlay */}
              <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{
                background: `radial-gradient(ellipse at 50% 60%,rgba(${m.rgb},0.24) 0%,transparent 65%)`,
                opacity: isH ? 1 : 0.2,
              }} />
              {/* Top glow on hover */}
              <div className="absolute top-0 left-0 right-0 pointer-events-none transition-opacity duration-500" style={{
                height: '35%',
                background: `radial-gradient(ellipse at 50% 0%,rgba(${m.rgb},0.1) 0%,transparent 70%)`,
                opacity: isH ? 1 : 0,
              }} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                {/* Emoji orb */}
                <div
                  className="flex items-center justify-center text-5xl"
                  style={{
                    width: 96, height: 96, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 30%,rgba(${m.rgb},0.3),rgba(${m.rgb},0.06))`,
                    border: `1px solid rgba(${m.rgb},${isH ? 0.5 : 0.25})`,
                    boxShadow: isH
                      ? `0 0 44px ${m.glow},0 0 88px ${m.glowDim},inset 0 1px 0 rgba(255,255,255,0.12)`
                      : `0 0 20px ${m.glowDim}`,
                    transition: 'all 0.4s ease',
                    animationName: 'mood-breathe', animationDuration: `${2.5 + idx * 0.3}s`,
                    animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
                  }}
                >
                  {m.emoji}
                </div>

                {/* Name + tagline */}
                <div className="text-center">
                  <h2
                    className="font-black text-2xl tracking-tight transition-all duration-300"
                    style={{
                      color: 'white',
                      filter: isH ? `drop-shadow(0 0 20px rgba(${m.rgb},0.6))` : 'none',
                    }}
                  >
                    {m.name}
                  </h2>
                  <p className="text-sm font-medium mt-1 transition-all duration-300" style={{ color: m.primary, opacity: isH ? 1 : 0.65 }}>
                    {m.tagline}
                  </p>
                </div>

                {/* CTA */}
                <div
                  className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-semibold transition-all duration-300"
                  style={{
                    color: m.primary,
                    opacity: isH ? 1 : 0,
                    transform: isH ? 'translateY(0)' : 'translateY(6px)',
                  }}
                >
                  Enter portal <span>→</span>
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                style={{
                  height: isH ? 2 : 1,
                  background: m.accentGradient, backgroundSize: '200% auto',
                  animationName: isH ? 'shimmer-text' : 'none',
                  animationDuration: '2.5s', animationTimingFunction: 'linear', animationIterationCount: 'infinite',
                  boxShadow: isH ? `0 0 14px ${m.glow}` : 'none',
                  opacity: isH ? 1 : 0.35,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── MOBILE: VERTICAL CARD STACK ────────────────────────────────── */}
      <div className="md:hidden flex flex-col flex-1 gap-3 px-4 py-3 pb-8 overflow-y-auto relative z-10">
        {MOOD_KEYS.map((slug, idx) => {
          const m   = MOOD_CONFIG[slug];
          const isH = hovered === slug;

          return (
            <button
              key={slug}
              disabled={!!entering}
              onClick={() => handleClick(slug)}
              onMouseEnter={() => setHovered(slug)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex items-center gap-4 w-full text-left rounded-2xl overflow-hidden disabled:cursor-not-allowed"
              style={{
                padding: '18px 20px',
                background: isH ? `rgba(${m.rgb},0.1)` : 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(${m.rgb},${isH ? 0.42 : 0.13})`,
                backdropFilter: 'blur(20px)',
                boxShadow: isH ? `0 0 32px ${m.glowDim},0 8px 32px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.35)',
                transform: isH ? 'scale(1.015)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                animationName: 'card-enter', animationDuration: `${0.35 + idx * 0.07}s`, animationFillMode: 'both',
              }}
            >
              <MoodBg slug={slug} active={isH} />

              {/* Mood-colored left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" style={{ background: m.accentGradient, opacity: isH ? 1 : 0.4, transition: 'opacity 0.3s' }} />

              {/* Emoji orb */}
              <div
                className="relative z-10 flex items-center justify-center text-3xl shrink-0"
                style={{
                  width: 58, height: 58, borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 30%,rgba(${m.rgb},${isH ? 0.35 : 0.18}),rgba(${m.rgb},0.04))`,
                  border: `1px solid rgba(${m.rgb},${isH ? 0.5 : 0.22})`,
                  boxShadow: isH ? `0 0 20px ${m.glow}` : 'none',
                  transition: 'all 0.3s ease',
                  animationName: 'mood-breathe', animationDuration: `${3 + idx * 0.25}s`,
                  animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
                }}
              >
                {m.emoji}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 relative z-10">
                <div
                  className="font-bold text-base leading-tight transition-all duration-300"
                  style={{ color: isH ? '#fff' : 'rgba(255,255,255,0.88)' }}
                >
                  {m.name}
                </div>
                <div
                  className="text-xs mt-0.5 transition-all duration-300"
                  style={{ color: isH ? m.primary : `rgba(${m.rgb},0.5)` }}
                >
                  {m.tagline}
                </div>
              </div>

              {/* Arrow */}
              <span
                className="relative z-10 text-sm shrink-0 font-semibold transition-all duration-300"
                style={{
                  color: isH ? m.primary : 'rgba(255,255,255,0.2)',
                  transform: isH ? 'translateX(2px)' : 'translateX(0)',
                }}
              >
                →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
