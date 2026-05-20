'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  getDmId, sendDmMessage, listenToDmMessages,
  setDmTyping, listenDmTyping,
  markDmRead, listenDmReadBy,
  listenUserPresence,
  toggleDmReaction, listenDmReactions,
} from '@/lib/firestore';

const REACTIONS = ['👍', '❤️', '😂', '😮', '🔥'];

interface Message {
  id: string;
  senderId: string;
  senderNickname: string;
  text: string;
  time: string;
  createdAt: number;
}

interface Props {
  userId: string;
  nickname: string;
  partnerId: string;
  partnerNickname: string;
  onBack: () => void;
}

const P = {
  primary:  '#a78bfa',
  rgb:      '124,58,237',
  glow:     'rgba(124,58,237,0.55)',
  glowDim:  'rgba(124,58,237,0.12)',
  gradient: 'linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed)',
  bubbleMe: 'rgba(79,46,180,0.95)',
};

export default function DMChat({ userId, nickname, partnerId, partnerNickname, onBack }: Props) {
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [inputText,     setInputText]     = useState('');
  const [focused,       setFocused]       = useState(false);
  const [videoUrl,      setVideoUrl]      = useState('');
  const [loadingVideo,  setLoadingVideo]  = useState(false);
  const [videoError,    setVideoError]    = useState('');
  const [callSecs,      setCallSecs]      = useState(0);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [readBy,        setReadBy]        = useState<Record<string, string>>({});
  const [allReactions,  setAllReactions]  = useState<Record<string, Record<string, string>>>({});
  const [hoverMsg,      setHoverMsg]      = useState<string | null>(null);
  const [copied,        setCopied]        = useState<string | null>(null);

  const messagesEndRef   = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const dmId = getDmId(userId, partnerId);

  useEffect(() => {
    const u1 = listenToDmMessages(dmId, setMessages);
    const u2 = listenDmTyping(dmId, partnerId, setPartnerTyping);
    const u3 = listenDmReadBy(dmId, setReadBy);
    const u4 = listenUserPresence(partnerId, setPartnerOnline);
    const u5 = listenDmReactions(dmId, setAllReactions);
    return () => {
      u1(); u2(); u3(); u4(); u5();
      setDmTyping(dmId, userId, false);
    };
  }, [dmId, partnerId, userId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, partnerTyping]);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    markDmRead(dmId, userId, last.id);
  }, [messages, dmId, userId]);

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
    if (!text) return;
    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setDmTyping(dmId, userId, false);
    await sendDmMessage(dmId, {
      senderId: userId, senderNickname: nickname, text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
    setDmTyping(dmId, userId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setDmTyping(dmId, userId, false), 2000);
  }

  async function toggleVideoCall() {
    if (videoUrl) { setVideoUrl(''); setVideoError(''); return; }
    setLoadingVideo(true); setVideoError('');
    try {
      const res  = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: dmId }) });
      const data = await res.json();
      if (data.url) setVideoUrl(data.url);
      else setVideoError(data.error || 'Could not start call');
    } catch { setVideoError('Network error'); }
    setLoadingVideo(false);
  }

  async function handleReaction(msgId: string, emoji: string) {
    await toggleDmReaction(dmId, msgId, userId, emoji);
    setHoverMsg(null);
  }

  async function copyMessage(text: string, id: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }

  function fmtSecs(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  const lastMyMsgId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === userId) return messages[i].id;
    }
    return null;
  }, [messages, userId]);

  const partnerReadMyLast = !!(lastMyMsgId && readBy[partnerId] === lastMyMsgId);
  const canSend = inputText.trim().length > 0;

  return (
    <div
      className="relative min-h-screen flex flex-col max-w-lg mx-auto overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 40% at 50% 0%,rgba(79,46,180,0.18) 0%,#050508 50%)' }}
    >
      {/* Background aurora */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 500, height: 500, top: '-20%', right: '-15%', background: 'radial-gradient(circle,rgba(124,58,237,0.07),transparent 65%)', filter: 'blur(40px)', animationName: 'aurora-a', animationDuration: '22s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
        <div className="absolute rounded-full" style={{ width: 350, height: 350, bottom: '-10%', left: '-10%', background: 'radial-gradient(circle,rgba(79,70,229,0.06),transparent 65%)', filter: 'blur(35px)', animationName: 'aurora-c', animationDuration: '18s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
      </div>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-between px-4 py-3 shrink-0 z-10"
        style={{ background: 'rgba(5,5,8,0.84)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: P.gradient, backgroundSize: '200% auto', animationName: 'shimmer-text', animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.color = P.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
          >
            ←
          </button>

          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'radial-gradient(circle at 35% 30%,rgba(124,58,237,0.45),rgba(79,70,229,0.15))', border: '1px solid rgba(124,58,237,0.45)', boxShadow: `${P.glow} 0 0 16px` }}
            >
              {partnerNickname[0]?.toUpperCase()}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 transition-all duration-500"
              style={{ background: partnerOnline ? '#34d399' : 'rgba(255,255,255,0.2)', borderColor: '#050508', boxShadow: partnerOnline ? '0 0 6px #34d399' : 'none' }}
            />
          </div>

          <div>
            <p className="text-white font-semibold text-sm leading-tight">{partnerNickname}</p>
            <p className="text-[10px] font-medium transition-colors duration-300" style={{ color: partnerTyping ? P.primary : partnerOnline ? '#34d399' : 'rgba(255,255,255,0.3)' }}>
              {partnerTyping ? 'typing…' : partnerOnline ? 'online' : 'offline'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleVideoCall}
          disabled={loadingVideo}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{ background: videoUrl ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${videoUrl ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.09)'}`, color: videoUrl ? P.primary : 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => { if (!videoUrl) { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = P.primary; } }}
          onMouseLeave={e => { if (!videoUrl) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
        >
          📹 {videoUrl ? 'End call' : loadingVideo ? 'Starting…' : 'Video'}
        </button>
      </div>

      {/* Video error */}
      {videoError && (
        <div className="shrink-0 z-10 text-xs px-4 py-2 text-center" style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
          {videoError} · <button className="underline" onClick={() => setVideoError('')}>dismiss</button>
        </div>
      )}

      {/* ── VIDEO CALL PANEL ────────────────────────────────────────── */}
      {videoUrl && (
        <div className="shrink-0 z-10 relative overflow-hidden" style={{ background: '#000', borderBottom: '1px solid rgba(124,58,237,0.22)' }}>
          <iframe
            src={videoUrl}
            allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
            allowFullScreen
            className="w-full h-72 block"
            style={{ border: 'none' }}
          />
          {/* Call status overlay */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 pointer-events-none" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.7),transparent)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" style={{ animationName: 'mood-breathe', animationDuration: '1.2s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
              <span className="text-white text-xs font-mono font-semibold tracking-widest">LIVE · {fmtSecs(callSecs)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-[11px] font-medium">{partnerNickname}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: '0 0 5px #34d399' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGES ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2.5 relative z-10">

        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center mt-16" style={{ animationName: 'enter-up', animationDuration: '0.5s', animationFillMode: 'both' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4" style={{ background: 'radial-gradient(circle at 35% 30%,rgba(124,58,237,0.25),rgba(79,70,229,0.08))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 24px rgba(124,58,237,0.18)', animationName: 'mood-breathe', animationDuration: '3s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}>
              💬
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Start a conversation with <span style={{ color: P.primary }}>{partnerNickname}</span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe    = msg.senderId === userId;
          const msgRxns = allReactions[msg.id] || {};
          const rxnCounts: Record<string, number> = {};
          Object.values(msgRxns).forEach(e => { rxnCounts[e] = (rxnCounts[e] || 0) + 1; });
          const myRxn   = msgRxns[userId] || null;
          const hasRxn  = Object.keys(rxnCounts).length > 0;
          const isLast  = i === messages.length - 1;
          const showSeen = isMe && isLast && partnerReadMyLast;

          return (
            <div
              key={msg.id}
              className={`relative flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
              style={{ animationName: isMe ? 'msg-in-right' : 'msg-in-left', animationDuration: '0.28s', animationFillMode: 'both', animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
              onMouseEnter={() => setHoverMsg(msg.id)}
              onMouseLeave={() => setHoverMsg(null)}
            >
              <span className="text-[11px] px-1 font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {isMe ? 'You' : msg.senderNickname}
              </span>

              {/* Reaction + copy bar */}
              {hoverMsg === msg.id && (
                <div
                  className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-9 flex items-center gap-1 px-2 py-1 rounded-full z-30`}
                  style={{ background: 'rgba(12,9,24,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.6)', animationName: 'enter-up', animationDuration: '0.12s', animationFillMode: 'both' }}
                >
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(msg.id, emoji)}
                      className="text-base leading-none transition-transform duration-100 hover:scale-125 select-none"
                      style={{ opacity: myRxn && myRxn !== emoji ? 0.4 : 1 }}
                    >
                      {emoji}
                    </button>
                  ))}
                  <span className="w-px h-4 mx-0.5 shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <button onClick={() => copyMessage(msg.text, msg.id)} className="text-xs transition-colors select-none" style={{ color: copied === msg.id ? '#34d399' : 'rgba(255,255,255,0.38)' }} title="Copy">
                    {copied === msg.id ? '✓' : '⎘'}
                  </button>
                </div>
              )}

              <div
                className="msg-bubble max-w-[78%] sm:max-w-sm px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? P.bubbleMe : 'rgba(255,255,255,0.055)',
                  border: isMe ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.09)',
                  backdropFilter: isMe ? 'none' : 'blur(14px)',
                  boxShadow: isMe ? '0 4px 20px rgba(124,58,237,0.2)' : '0 4px 16px rgba(0,0,0,0.35)',
                  color: isMe ? '#ede9fe' : 'rgba(255,255,255,0.88)',
                }}
              >
                <p className="break-words">{msg.text}</p>
                <p className="msg-time text-[10px] mt-1 text-right" style={{ opacity: 0.45 }}>{msg.time}</p>
              </div>

              {/* Reaction pills */}
              {hasRxn && (
                <div className={`flex gap-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'} px-1 mt-0.5`}>
                  {Object.entries(rxnCounts).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(msg.id, emoji)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all hover:scale-110"
                      style={{ background: myRxn === emoji ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)', border: myRxn === emoji ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.82)' }}
                    >
                      {emoji}<span style={{ color: P.primary }}>{count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Read receipt — seen by partner */}
              {showSeen && (
                <div className="flex items-center gap-1 px-1 mt-0.5" style={{ animationName: 'fade-in', animationDuration: '0.3s', animationFillMode: 'both' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] shrink-0 font-bold" style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.35),rgba(79,70,229,0.1))', border: '1px solid rgba(124,58,237,0.35)', color: '#ede9fe' }}>
                    {partnerNickname[0]?.toUpperCase()}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: P.primary }}>Seen</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Partner typing indicator */}
        {partnerTyping && (
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[11px] px-1 font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>{partnerNickname}</span>
            <div className="px-4 py-3 flex gap-1.5 items-center" style={{ borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)' }}>
              {[0, 1, 2].map(j => (
                <span key={j} className="rounded-full inline-block" style={{ width: 6, height: 6, background: P.primary, boxShadow: `0 0 6px ${P.glow}`, animationName: 'typing-bounce', animationDuration: '1.2s', animationDelay: `${j * 0.18}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ─────────────────────────────────────────────────── */}
      <div className="px-4 py-3 shrink-0 z-10" style={{ background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(124,58,237,0.13)' }}>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Message ${partnerNickname}…`}
            maxLength={500}
            autoFocus
            className="flex-1 text-white text-sm outline-none rounded-xl px-4 py-3 transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: focused ? '1px solid rgba(124,58,237,0.55)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
              caretColor: P.primary,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!canSend}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
            style={{
              background: canSend ? P.gradient : 'rgba(255,255,255,0.07)',
              backgroundSize: '200% auto',
              border: `1px solid rgba(124,58,237,${canSend ? 0.45 : 0.08})`,
              boxShadow: canSend ? '0 0 18px rgba(124,58,237,0.45),0 4px 12px rgba(0,0,0,0.3)' : 'none',
              animationName: canSend ? 'shimmer-text' : 'none',
              animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite',
            }}
          >
            Send
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.1)' }}>⏎ to send · hover to react</span>
          <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.13)' }}>{inputText.length}/500</span>
        </div>
      </div>
    </div>
  );
}
