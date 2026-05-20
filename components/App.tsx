'use client';

import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, listenForPendingRequests, acceptFriendRequest, rejectFriendRequest } from '@/lib/firestore';
import NicknameSetup from './NicknameSetup';
import MoodSelect from './MoodSelect';
import Waiting from './Waiting';
import Chat from './Chat';
import Friends from './Friends';
import DMChat from './DMChat';
import FriendRequestNotification from './FriendRequestNotification';

type Screen = 'loading' | 'nickname' | 'mood' | 'waiting' | 'chat' | 'friends' | 'dm';

interface DmPartner {
  id: string;
  nickname: string;
}

const CACHE_KEY = 'kk_profile';

function readCache(): { uid: string; nickname: string } | null {
  try {
    const v = localStorage.getItem(CACHE_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

function writeCache(uid: string, nickname: string) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ uid, nickname })); } catch {}
}

export default function App() {
  const [screen, setScreen]                   = useState<Screen>('loading');
  const [userId, setUserId]                   = useState('');
  const [nickname, setNickname]               = useState('');
  const [selectedMood, setSelectedMood]       = useState('');
  const [roomId, setRoomId]                   = useState('');
  const [partnerId, setPartnerId]             = useState('');
  const [partnerNickname, setPartnerNickname] = useState('');
  const [dmPartner, setDmPartner]             = useState<DmPartner | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; nickname: string }>>([]);

  useEffect(() => {
    // Step 1 — restore from localStorage instantly (zero network wait)
    const cached = readCache();
    if (cached) {
      setUserId(cached.uid);
      setNickname(cached.nickname);
      setScreen('mood');
    }

    // Step 2 — Firebase auth runs in background to stay fresh
    signInAnonymously(auth).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // If cache already matched, just ensure userId is current and bail
      const fresh = readCache();
      if (fresh && fresh.uid === user.uid) {
        setUserId(user.uid);
        return;
      }

      // New device / cleared storage — fetch profile from DB
      setUserId(user.uid);
      const profile = await getUserProfile(user.uid);
      if (profile?.nickname) {
        setNickname(profile.nickname);
        writeCache(user.uid, profile.nickname);
        setScreen('mood');
      } else {
        setScreen('nickname');
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for incoming friend requests
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = listenForPendingRequests(userId, setPendingRequests);
    return unsubscribe;
  }, [userId]);

  async function handleAcceptRequest(req: { id: string; nickname: string }) {
    await acceptFriendRequest(userId, nickname, req.id, req.nickname);
  }

  async function handleRejectRequest(req: { id: string; nickname: string }) {
    await rejectFriendRequest(userId, req.id);
  }

  function handleNicknameDone(nick: string) {
    setNickname(nick);
    writeCache(userId, nick);
    setScreen('mood');
  }

  function goToWaiting(mood: string) {
    setSelectedMood(mood);
    setScreen('waiting');
  }

  function goToChat(newRoomId: string, newPartnerId: string, newPartnerNickname: string) {
    setRoomId(newRoomId);
    setPartnerId(newPartnerId);
    setPartnerNickname(newPartnerNickname);
    setScreen('chat');
  }

  function goToMoodSelect() {
    setSelectedMood('');
    setRoomId('');
    setPartnerId('');
    setPartnerNickname('');
    setScreen('mood');
  }

  function openDM(partner: DmPartner) {
    setDmPartner(partner);
    setScreen('dm');
  }

  // Show the first pending request as notification (overlay)
  const activeRequest = pendingRequests[0] ?? null;

  if (screen === 'loading') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#050508' }}
      >
        <div
          className="text-4xl select-none"
          style={{
            animationName: 'mood-breathe',
            animationDuration: '2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        >
          ✨
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'rgba(124,58,237,0.7)',
                animationName: 'typing-bounce',
                animationDuration: '1.2s',
                animationDelay: `${i * 0.2}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Friend request notification — shows on any screen */}
      {activeRequest && (
        <FriendRequestNotification
          request={activeRequest}
          onAccept={() => handleAcceptRequest(activeRequest)}
          onReject={() => handleRejectRequest(activeRequest)}
        />
      )}

      {screen === 'nickname' && (
        <NicknameSetup userId={userId} onDone={handleNicknameDone} />
      )}

      {screen === 'mood' && (
        <MoodSelect
          userId={userId}
          nickname={nickname}
          onMoodSelect={goToWaiting}
          onOpenFriends={() => setScreen('friends')}
        />
      )}

      {screen === 'friends' && (
        <Friends userId={userId} onBack={goToMoodSelect} onOpenDM={openDM} />
      )}

      {screen === 'dm' && dmPartner && (
        <DMChat
          userId={userId}
          nickname={nickname}
          partnerId={dmPartner.id}
          partnerNickname={dmPartner.nickname}
          onBack={() => setScreen('friends')}
        />
      )}

      {screen === 'waiting' && (
        <Waiting
          userId={userId}
          mood={selectedMood}
          onMatchFound={goToChat}
          onCancel={goToMoodSelect}
        />
      )}

      {screen === 'chat' && (
        <Chat
          userId={userId}
          nickname={nickname}
          roomId={roomId}
          mood={selectedMood}
          partnerId={partnerId}
          partnerNickname={partnerNickname}
          onLeave={goToMoodSelect}
        />
      )}
    </>
  );
}
