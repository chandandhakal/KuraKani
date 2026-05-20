'use client';

import { useState, useEffect } from 'react';
import { getFriends, listenUserPresence } from '@/lib/firestore';

interface Friend {
  id: string;
  nickname: string;
}

interface Props {
  userId: string;
  onBack: () => void;
  onOpenDM: (partner: { id: string; nickname: string }) => void;
}

function FriendRow({ friend, onOpenDM }: { friend: Friend; onOpenDM: (f: Friend) => void }) {
  const [online,  setOnline]  = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const unsub = listenUserPresence(friend.id, setOnline);
    return unsub;
  }, [friend.id]);

  return (
    <button
      onClick={() => onOpenDM(friend)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 w-full text-left rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: hovered ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
        border: hovered ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        boxShadow: hovered ? '0 0 24px rgba(124,58,237,0.2)' : '0 4px 16px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-200"
          style={{
            background: `radial-gradient(circle at 35% 30%,rgba(124,58,237,${hovered ? 0.5 : 0.3}),rgba(79,70,229,${hovered ? 0.2 : 0.1}))`,
            border: `1px solid rgba(124,58,237,${hovered ? 0.55 : 0.3})`,
            boxShadow: hovered ? '0 0 16px rgba(124,58,237,0.45)' : '0 0 8px rgba(124,58,237,0.15)',
          }}
        >
          {friend.nickname[0].toUpperCase()}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 transition-all duration-500"
          style={{ background: online ? '#34d399' : 'rgba(255,255,255,0.18)', borderColor: '#050508', boxShadow: online ? '0 0 6px #34d399' : 'none' }}
        />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight truncate transition-colors duration-200" style={{ color: hovered ? '#fff' : 'rgba(255,255,255,0.88)' }}>
          {friend.nickname}
        </p>
        <p className="text-xs mt-0.5 transition-colors duration-200" style={{ color: online ? (hovered ? '#34d399' : 'rgba(52,211,153,0.7)') : (hovered ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.28)') }}>
          {online ? 'Online now' : 'Tap to message'}
        </p>
      </div>

      {/* Arrow */}
      <span
        className="text-sm shrink-0 transition-all duration-200"
        style={{ color: hovered ? '#a78bfa' : 'rgba(255,255,255,0.18)', transform: hovered ? 'translateX(2px)' : 'translateX(0)' }}
      >
        →
      </span>
    </button>
  );
}

export default function Friends({ userId, onBack, onOpenDM }: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFriends(userId).then(list => {
      setFriends(list);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div
      className="relative min-h-screen flex flex-col max-w-lg mx-auto overflow-hidden"
      style={{ background: '#050508' }}
    >
      {/* Aurora blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 600, height: 600, top: '-25%', left: '-20%', background: 'radial-gradient(circle,rgba(124,58,237,0.09),transparent 65%)', filter: 'blur(50px)', animationName: 'aurora-a', animationDuration: '24s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle,rgba(79,70,229,0.07),transparent 65%)', filter: 'blur(40px)', animationName: 'aurora-b', animationDuration: '30s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
      </div>

      {/* Header */}
      <div
        className="relative flex items-center gap-3 px-4 py-4 shrink-0 z-10"
        style={{ background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed)', backgroundSize: '200% auto', animationName: 'shimmer-text', animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />

        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.color = '#a78bfa'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg select-none" style={{ filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.6))' }}>👥</span>
          <h2 className="text-white font-bold text-base tracking-tight">Friends</h2>
        </div>

        {!loading && friends.length > 0 && (
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            {friends.length}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 px-4 py-6">

        {loading && (
          <div className="flex justify-center mt-20 gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(124,58,237,0.7)', animationName: 'typing-bounce', animationDuration: '1.2s', animationDelay: `${i * 0.2}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
            ))}
          </div>
        )}

        {!loading && friends.length === 0 && (
          <div className="flex flex-col items-center text-center mt-16 px-8" style={{ animationName: 'enter-up', animationDuration: '0.5s', animationFillMode: 'both' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5" style={{ background: 'radial-gradient(circle at 35% 30%,rgba(124,58,237,0.25),rgba(79,70,229,0.08))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 30px rgba(124,58,237,0.2)', animationName: 'mood-breathe', animationDuration: '3s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}>
              👥
            </div>
            <h3 className="text-white font-semibold text-base mb-2">No friends yet</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              During any chat, tap <span style={{ color: '#a78bfa' }}>+ Friend</span> to send a request.
              <br />Once they accept, they&apos;ll appear here.
            </p>
          </div>
        )}

        {!loading && friends.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {friends.map((f, idx) => (
              <div
                key={f.id}
                style={{ animationName: 'card-enter', animationDuration: `${0.35 + idx * 0.06}s`, animationFillMode: 'both' }}
              >
                <FriendRow friend={f} onOpenDM={onOpenDM} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
