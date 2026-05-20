'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { saveMessage, sendFriendRequest } from '@/lib/firestore';
import { MOOD_CONFIG } from '@/lib/mood-config';

const REACTIONS = ['👍', '❤️', '😂', '😮', '🔥'];

interface Message {
  senderId: string;
  senderNickname: string;
  text: string;
  time: string;
}

interface Props {
  userId: string;
  nickname: string;
  roomId: string;
  mood: string;
  partnerId: string;
  partnerNickname: string;
  onLeave: () => void;
}

export default function Chat({ userId, nickname, roomId, mood, partnerId, partnerNickname, onLeave }: Props) {
  const [messages,         setMessages]         = useState<Message[]>([]);
  const [inputText,        setInputText]        = useState('');
  const [partnerLeft,      setPartnerLeft]      = useState(false);
  const [isTyping,         setIsTyping]         = useState(false);
  const [countdown,        setCountdown]        = useState(5);
  const [requestSent,      setRequestSent]      = useState(false);
  const [focused,          setFocused]          = useState(false);
  const [videoUrl,         setVideoUrl]         = useState('');
  const [loadingVideo,     setLoadingVideo]     = useState(false);
  const [videoError,       setVideoError]       = useState('');
  const [callSecs,         setCallSecs]         = useState(0);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [reactions,        setReactions]        = useState<Record<number, Record<string, number>>>({});
  const [hoverMsg,         setHoverMsg]         = useState<number | null>(null);
  const [copied,           setCopied]           = useState<number | null>(null);

  const messagesEndRef   = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const m = MOOD_CONFIG[mood] ?? MOOD_CONFIG.bored;

  const bgParticles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i, left: `${(i * 19 + 7) % 94}%`, top: `${(i * 31 + 13) % 88}%`,
      delay: `${(i * 0.8) % 6}s`, dur: `${7 + (i * 0.9) % 5}s`,
    })), []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  useEffect(() => {
    const ch = getPusherClient().subscribe(`vl-${userId}`);
    ch.bind('new_message', (msg: Message) => setMessages(p => [...p, msg]));
    ch.bind('partner_left', () => setPartnerLeft(true));
    ch.bind('partner_typing', ({ isTyping: t }: { isTyping: boolean }) => setIsTyping(t));
    return () => { ch.unbind_all(); getPusherClient().unsubscribe(`vl-${userId}`); };
  }, [userId]);

  useEffect(() => {
    if (!partnerLeft) return;
    const iv = setInterval(() => setCountdown(c => { if (c <= 1) clearInterval(iv); return c - 1; }), 1000);
    return () => clearInterval(iv);
  }, [partnerLeft]);

  useEffect(() => { if (partnerLeft && countdown <= 0) onLeave(); }, [countdown, partnerLeft, onLeave]);

  useEffect(() => {
    if (videoUrl) {
      callTimerRef.current = setInterval(() => setCallSecs(s => s + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallSecs(0);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [videoUrl]);

  async function sendMessage() {
    const text = inputText.trim();
    if (!text || partnerLeft) return;
    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text }),
    });
    const msg: Message = {
      senderId: userId, senderNickname: nickname, text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    saveMessage(roomId, msg).catch(console.error);
  }

  async function handleAddFriend() {
    if (requestSent || !partnerId) return;
    await sendFriendRequest(userId, partnerId, nickname);
    setRequestSent(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
    fetch('/api/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, isTyping: true }) });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      fetch('/api/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, isTyping: false }) });
    }, 2000);
  }

  async function confirmLeave() {
    setShowLeaveConfirm(false);
    await fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
    onLeave();
  }

  async function toggleVideoCall() {
    if (videoUrl) { setVideoUrl(''); setVideoError(''); return; }
    setLoadingVideo(true); setVideoError('');
    try {
      const res  = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId }) });
      const data = await res.json();
      if (data.url) setVideoUrl(data.url);
      else setVideoError(data.error || 'Video call unavailable');
    } catch { setVideoError('Network error'); }
    setLoadingVideo(false);
  }

  function addReaction(msgIdx: number, emoji: string) {
    setReactions(prev => {
      const cur = { ...(prev[msgIdx] || {}) };
      cur[emoji] = (cur[emoji] || 0) + 1;
      return { ...prev, [msgIdx]: cur };
    });
    setHoverMsg(null);
  }

  async function copyMessage(text: string, idx: number) {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(idx);
    setTimeout(() => setCopied(null), 1800);
  }

  function fmtSecs(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  const canSend = inputText.trim().length > 0 && !partnerLeft;

  return (
    <div
      className="relative min-h-screen flex flex-col max-w-lg mx-auto overflow-hidden"
      style={{ background: `radial-gradient(ellipse 120% 45% at 50% 0%,${m.bgFrom}99 0%,#050508 50%)` }}
    >
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bgParticles.map(p => (
          <span key={p.id} className="absolute select-none" style={{ left: p.left, top: p.top, fontSize: 8, color: m.primary, opacity: 0.045, animationName: 'mood-float', animationDuration: p.dur, animationDelay: p.delay, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}>
            {m.particleChar}
          </span>
        ))}
      </div>

      {/* Mood overlays */}
      {mood === 'gaming' && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,135,0.008) 3px,rgba(0,255,135,0.008) 4px)', animationName: 'screen-flicker', animationDuration: '9s', animationIterationCount: 'infinite' }} />
          <div className="absolute w-full h-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom,transparent,rgba(0,255,135,0.03),transparent)', animationName: 'scan-sweep', animationDuration: '5s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
            <div key={i} className={`absolute w-6 h-6 z-20 ${pos}`} style={{ borderTop: i < 2 ? '1.5px solid rgba(0,255,135,0.35)' : undefined, borderBottom: i >= 2 ? '1.5px solid rgba(0,255,135,0.35)' : undefined, borderLeft: i % 2 === 0 ? '1.5px solid rgba(0,255,135,0.35)' : undefined, borderRight: i % 2 === 1 ? '1.5px solid rgba(0,255,135,0.35)' : undefined }} />
          ))}
        </>
      )}
      {mood === 'study' && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle,rgba(0,212,255,0.04) 1px,transparent 1px)', backgroundSize: '28px 28px', animationName: 'grid-pulse', animationDuration: '5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
      )}

      {/* Leave confirmation dialog */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div
            className="mx-4 w-full max-w-xs rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'rgba(10,8,22,0.97)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', animationName: 'enter-up', animationDuration: '0.22s', animationFillMode: 'both' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-3xl mb-3 select-none">👋</div>
              <h3 className="text-white font-bold text-base">Leave this chat?</h3>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                You&apos;ll lose this conversation and return to mood selection.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}
              >
                Stay
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 0 20px rgba(239,68,68,0.25)' }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-between px-4 py-3 shrink-0 z-10"
        style={{ background: 'rgba(5,5,8,0.84)', backdropFilter: 'blur(24px)', borderBottom: `1px solid rgba(${m.rgb},0.15)` }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: m.accentGradient, backgroundSize: '200% auto', animationName: 'shimmer-text', animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `radial-gradient(circle at 35% 30%,rgba(${m.rgb},0.4),rgba(${m.rgb},0.12))`, border: `1px solid rgba(${m.rgb},0.42)`, boxShadow: `0 0 18px ${m.glow}` }}
            >
              {partnerNickname[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: '#34d399', borderColor: '#050508', boxShadow: '0 0 6px #34d399' }} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{partnerNickname}</p>
            <p className="text-[11px] font-medium" style={{ color: m.primary }}>{m.emoji} {m.name} mood</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleVideoCall}
            disabled={loadingVideo}
            title="Video call"
            className="text-xs px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: videoUrl ? `rgba(${m.rgb},0.15)` : 'rgba(255,255,255,0.05)', border: `1px solid ${videoUrl ? `rgba(${m.rgb},0.45)` : 'rgba(255,255,255,0.09)'}`, color: videoUrl ? m.primary : 'rgba(255,255,255,0.6)' }}
          >
            📹 {videoUrl ? 'End' : loadingVideo ? '…' : 'Call'}
          </button>
          <button
            onClick={handleAddFriend}
            disabled={requestSent || !partnerId}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: requestSent ? `rgba(${m.rgb},0.14)` : 'rgba(255,255,255,0.05)', border: `1px solid ${requestSent ? `rgba(${m.rgb},0.4)` : 'rgba(255,255,255,0.09)'}`, color: requestSent ? m.primary : 'rgba(255,255,255,0.6)' }}
          >
            {requestSent ? '✓ Friend' : '+ Friend'}
          </button>
          <button
            onClick={() => messages.length > 0 ? setShowLeaveConfirm(true) : confirmLeave()}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            Skip →
          </button>
        </div>
      </div>

      {/* Video error */}
      {videoError && (
        <div className="shrink-0 z-10 text-xs px-4 py-2 text-center" style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5' }}>
          {videoError} ·{' '}
          <button className="underline" onClick={() => setVideoError('')}>dismiss</button>
        </div>
      )}

      {/* ── VIDEO CALL PANEL ────────────────────────────────────────── */}
      {videoUrl && (
        <div className="shrink-0 z-10 relative overflow-hidden" style={{ background: '#000', borderBottom: `1px solid rgba(${m.rgb},0.22)` }}>
          <iframe
            src={videoUrl}
            allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
            allowFullScreen
            className="w-full h-64 sm:h-72 block"
            style={{ border: 'none' }}
          />
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 pointer-events-none" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.65),transparent)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" style={{ animationName: 'mood-breathe', animationDuration: '1.2s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
              <span className="text-white text-xs font-mono font-semibold tracking-widest">LIVE · {fmtSecs(callSecs)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-[11px]">{partnerNickname}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: '0 0 5px #34d399' }} />
            </div>
          </div>
        </div>
      )}

      {/* Partner left banner */}
      {partnerLeft && (
        <div className="text-center text-xs py-2 px-4 shrink-0 z-10 font-medium" style={{ background: `rgba(${m.rgb},0.08)`, borderBottom: `1px solid rgba(${m.rgb},0.18)`, color: m.primary }}>
          {partnerNickname} left · Returning in {Math.max(countdown, 0)}s
        </div>
      )}

      {/* ── MESSAGES ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2.5 relative z-10">
        <div className="flex justify-center py-1">
          <span className="text-xs px-3 py-1.5 rounded-full select-none" style={{ background: `rgba(${m.rgb},0.08)`, border: `1px solid rgba(${m.rgb},0.18)`, color: `rgba(${m.rgb},0.85)` }}>
            Matched · <span className="font-semibold text-white">{partnerNickname}</span> · Say hi! 👋
          </span>
        </div>

        {messages.map((msg, i) => {
          const isMe   = msg.senderId === userId;
          const msgRxn = reactions[i] || {};
          const hasRxn = Object.keys(msgRxn).length > 0;

          return (
            <div
              key={i}
              className={`relative flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
              style={{ animationName: isMe ? 'msg-in-right' : 'msg-in-left', animationDuration: '0.28s', animationFillMode: 'both', animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
              onMouseEnter={() => setHoverMsg(i)}
              onMouseLeave={() => setHoverMsg(null)}
            >
              <span className="text-[11px] px-1 font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {isMe ? 'You' : msg.senderNickname || partnerNickname}
              </span>

              {/* Reaction + copy bar (hover) */}
              {hoverMsg === i && (
                <div
                  className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-9 flex items-center gap-1 px-2 py-1 rounded-full z-30`}
                  style={{ background: 'rgba(12,9,24,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.6)', animationName: 'enter-up', animationDuration: '0.12s', animationFillMode: 'both' }}
                >
                  {REACTIONS.map(emoji => (
                    <button key={emoji} onClick={() => addReaction(i, emoji)} className="text-base leading-none transition-transform duration-100 hover:scale-125 select-none">{emoji}</button>
                  ))}
                  <span className="w-px h-4 mx-0.5 shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <button onClick={() => copyMessage(msg.text, i)} className="text-xs transition-colors select-none" style={{ color: copied === i ? '#34d399' : 'rgba(255,255,255,0.38)' }} title="Copy message">
                    {copied === i ? '✓' : '⎘'}
                  </button>
                </div>
              )}

              <div
                className="msg-bubble max-w-[78%] sm:max-w-sm px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? m.bubbleMe : 'rgba(255,255,255,0.055)',
                  border: isMe ? `1px solid rgba(${m.rgb},0.28)` : '1px solid rgba(255,255,255,0.09)',
                  backdropFilter: isMe ? 'none' : 'blur(14px)',
                  boxShadow: isMe ? `0 4px 20px rgba(${m.rgb},0.16)` : '0 4px 16px rgba(0,0,0,0.35)',
                  color: isMe ? m.bubbleMeText : 'rgba(255,255,255,0.88)',
                }}
              >
                <p className="break-words">{msg.text}</p>
                <p className="msg-time text-[10px] mt-1 text-right" style={{ opacity: 0.45 }}>{msg.time}</p>
              </div>

              {/* Reaction pills */}
              {hasRxn && (
                <div className={`flex gap-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'} px-1 mt-0.5`}>
                  {Object.entries(msgRxn).map(([emoji, count]) => (
                    <button key={emoji} onClick={() => addReaction(i, emoji)} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all hover:scale-110" style={{ background: `rgba(${m.rgb},0.12)`, border: `1px solid rgba(${m.rgb},0.22)`, color: 'rgba(255,255,255,0.82)' }}>
                      {emoji}<span style={{ color: m.primary }}>{count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && !partnerLeft && (
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[11px] px-1 font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>{partnerNickname}</span>
            <div className="px-4 py-3 flex gap-1.5 items-center" style={{ borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)' }}>
              {[0, 1, 2].map(j => (
                <span key={j} className="rounded-full inline-block" style={{ width: 6, height: 6, background: m.primary, boxShadow: `0 0 6px ${m.glow}`, animationName: 'typing-bounce', animationDuration: '1.2s', animationDelay: `${j * 0.18}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ─────────────────────────────────────────────────── */}
      <div className="px-4 py-3 shrink-0 z-10" style={{ background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(24px)', borderTop: `1px solid rgba(${m.rgb},0.13)` }}>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={partnerLeft ? 'Chat ended' : `Message ${partnerNickname}…`}
            disabled={partnerLeft}
            maxLength={500}
            autoFocus
            className="flex-1 text-white text-sm outline-none rounded-xl px-4 py-3 transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: focused ? `1px solid rgba(${m.rgb},0.52)` : '1px solid rgba(255,255,255,0.08)',
              boxShadow: focused ? `0 0 0 3px rgba(${m.rgb},0.07)` : 'none',
              caretColor: m.primary,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!canSend}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
            style={{
              background: canSend ? m.accentGradient : 'rgba(255,255,255,0.07)',
              backgroundSize: '200% auto',
              border: `1px solid rgba(${m.rgb},${canSend ? 0.4 : 0.08})`,
              boxShadow: canSend ? `0 0 18px ${m.glow},0 4px 12px rgba(0,0,0,0.3)` : 'none',
              animationName: canSend ? 'shimmer-text' : 'none',
              animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite',
            }}
          >
            Send
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.1)' }}>⏎ send · hover to react</span>
          <span className="text-[10px] tabular-nums" style={{ color: inputText.length > 450 ? '#f87171' : 'rgba(255,255,255,0.13)' }}>{inputText.length}/500</span>
        </div>
      </div>
    </div>
  );
}
