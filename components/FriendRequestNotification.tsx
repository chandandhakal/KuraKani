'use client';

interface Props {
  request: { id: string; nickname: string };
  onAccept: () => void;
  onReject: () => void;
}

export default function FriendRequestNotification({ request, onAccept, onReject }: Props) {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 w-72 rounded-2xl flex flex-col gap-4 px-5 py-4"
      style={{
        background: 'rgba(10,8,20,0.92)',
        border: '1px solid rgba(124,58,237,0.35)',
        backdropFilter: 'blur(28px)',
        boxShadow: '0 0 40px rgba(124,58,237,0.2), 0 20px 60px rgba(0,0,0,0.6)',
        animationName: 'enter-up',
        animationDuration: '0.35s',
        animationFillMode: 'both',
        animationTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed)', backgroundSize: '200% auto', animationName: 'shimmer-text', animationDuration: '3s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
      />

      <div className="flex items-center gap-3 pt-1">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{
            background: 'radial-gradient(circle at 35% 30%,rgba(124,58,237,0.5),rgba(79,70,229,0.2))',
            border: '1px solid rgba(124,58,237,0.5)',
            boxShadow: '0 0 16px rgba(124,58,237,0.4)',
            animationName: 'mood-breathe', animationDuration: '2.5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
          }}
        >
          {request.nickname[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">{request.nickname}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(167,139,250,0.8)' }}>wants to be your friend</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            border: '1px solid rgba(124,58,237,0.5)',
            boxShadow: '0 0 16px rgba(124,58,237,0.35)',
          }}
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.55)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
