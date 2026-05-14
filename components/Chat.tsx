'use client';

import { useState, useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher-client';

const MOOD_META: Record<string, { emoji: string; label: string; color: string }> = {
  happy:    { emoji: '😊', label: 'Happy',    color: 'text-yellow-400' },
  sad:      { emoji: '😢', label: 'Sad',      color: 'text-blue-400'   },
  lonely:   { emoji: '🌙', label: 'Lonely',   color: 'text-purple-400' },
  romantic: { emoji: '💗', label: 'Romantic', color: 'text-pink-400'   },
  bored:    { emoji: '😑', label: 'Bored',    color: 'text-slate-400'  },
  gaming:   { emoji: '🎮', label: 'Gaming',   color: 'text-green-400'  },
  study:    { emoji: '📚', label: 'Study',    color: 'text-orange-400' },
};

interface Message {
  senderId: string;
  text: string;
  time: string;
}

interface Props {
  userId: string;
  roomId: string;
  mood: string;
  onLeave: () => void;
}

export default function Chat({ userId, mood, onLeave }: Props) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [inputText, setInputText]     = useState('');
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [isTyping, setIsTyping]       = useState(false);
  const [countdown, setCountdown]     = useState(3);
  const messagesEndRef                = useRef<HTMLDivElement>(null);
  const typingTimeoutRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meta = MOOD_META[mood] ?? { emoji: '🌀', label: mood, color: 'text-white' };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const channel = getPusherClient().subscribe(`vl-${userId}`);

    channel.bind('new_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    channel.bind('partner_left', () => {
      setPartnerLeft(true);
    });

    channel.bind('partner_typing', ({ isTyping: typing }: { isTyping: boolean }) => {
      setIsTyping(typing);
    });

    return () => {
      getPusherClient().unsubscribe(`vl-${userId}`);
    };
  }, [userId]);

  useEffect(() => {
    if (!partnerLeft) return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          onLeave();
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [partnerLeft, onLeave]);

  async function sendMessage() {
    const text = inputText.trim();
    if (!text || partnerLeft) return;

    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text }),
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);

    fetch('/api/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isTyping: true }),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isTyping: false }),
      });
    }, 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function handleSkip() {
    await fetch('/api/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    onLeave();
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
        bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">
              {meta.emoji}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500
              rounded-full border-2 border-gray-900" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Anonymous Stranger</p>
            <p className={`text-xs ${meta.color}`}>{meta.label} mood</p>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700
            text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg
            transition active:scale-95"
        >
          Skip <span className="text-base">→</span>
        </button>
      </div>

      {/* Partner left banner */}
      {partnerLeft && (
        <div className="bg-red-950 border-b border-red-900 text-red-300
          text-center text-sm py-2 px-4 shrink-0">
          Your partner left. Returning in {countdown}s...
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <div className="text-center py-3">
          <span className="text-xs text-gray-600 bg-gray-900 px-3 py-1 rounded-full">
            You matched with a stranger feeling{' '}
            <span className={`font-medium ${meta.color}`}>{meta.label}</span> · Say hi! 👋
          </span>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMe
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                }
              `}>
                <p className="break-words">{msg.text}</p>
                <p className={`text-xs mt-1 text-right ${isMe ? 'text-purple-300' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          );
        })}

        {isTyping && !partnerLeft && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-gray-900 border-t border-gray-800 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={partnerLeft ? 'Chat ended' : 'Type a message...'}
            disabled={partnerLeft}
            maxLength={500}
            autoFocus
            className="
              flex-1 bg-gray-800 text-white placeholder-gray-600
              rounded-xl px-4 py-3 text-sm outline-none
              focus:ring-2 focus:ring-purple-600
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || partnerLeft}
            className="
              bg-purple-600 hover:bg-purple-500
              disabled:opacity-40 disabled:cursor-not-allowed
              text-white rounded-xl px-5 py-3 text-sm font-medium
              transition active:scale-95
            "
          >
            Send
          </button>
        </div>
        <p className="text-gray-700 text-xs text-right mt-1">{inputText.length}/500</p>
      </div>
    </div>
  );
}
