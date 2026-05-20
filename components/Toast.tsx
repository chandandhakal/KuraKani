'use client';

import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  leaving?: boolean;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: 'rgba(5,46,22,0.95)',   border: 'rgba(34,197,94,0.35)',  icon: '#4ade80', text: '#bbf7d0' },
  error:   { bg: 'rgba(30,8,8,0.95)',    border: 'rgba(239,68,68,0.35)',  icon: '#f87171', text: '#fecaca' },
  info:    { bg: 'rgba(10,8,20,0.95)',   border: 'rgba(124,58,237,0.4)',  icon: '#a78bfa', text: '#ede9fe' },
};

let toastCounter = 0;

export default function Toast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  }, []);

  useEffect(() => {
    function handler(e: Event) {
      const { type, message } = (e as CustomEvent<{ type: ToastType; message: string }>).detail;
      const id = ++toastCounter;
      setToasts(prev => [...prev.slice(-4), { id, type, message }]);
      setTimeout(() => dismiss(id), 4200);
    }
    window.addEventListener('kk-toast', handler);
    return () => window.removeEventListener('kk-toast', handler);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[60] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(toast => {
        const c = COLORS[toast.type];
        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 px-4 py-3 rounded-2xl max-w-xs pointer-events-auto"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              animationName: toast.leaving ? 'toast-out' : 'toast-in',
              animationDuration: '0.28s',
              animationFillMode: 'both',
              animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
              style={{ background: `${c.icon}18`, color: c.icon, border: `1px solid ${c.icon}40` }}
            >
              {ICONS[toast.type]}
            </span>
            <p className="text-xs leading-relaxed flex-1" style={{ color: c.text }}>{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-xs shrink-0 mt-0.5 transition-opacity hover:opacity-100"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function toast(type: ToastType, message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('kk-toast', { detail: { type, message } }));
}
