'use client';

import { useState, useEffect } from 'react';
import MoodSelect from './MoodSelect';
import Waiting from './Waiting';
import Chat from './Chat';

type Screen = 'mood' | 'waiting' | 'chat';

export default function App() {
  const [screen, setScreen] = useState<Screen>('mood');
  const [selectedMood, setSelectedMood] = useState('');
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('vl_uid');
    if (stored) {
      setUserId(stored);
    } else {
      const id = crypto.randomUUID();
      localStorage.setItem('vl_uid', id);
      setUserId(id);
    }
  }, []);

  function goToWaiting(mood: string) {
    setSelectedMood(mood);
    setScreen('waiting');
  }

  function goToChat(newRoomId: string) {
    setRoomId(newRoomId);
    setScreen('chat');
  }

  function goToMoodSelect() {
    setSelectedMood('');
    setRoomId('');
    setScreen('mood');
  }

  // Don't render until userId is ready (avoids SSR mismatch)
  if (!userId) return null;

  if (screen === 'mood') {
    return <MoodSelect userId={userId} onMoodSelect={goToWaiting} />;
  }

  if (screen === 'waiting') {
    return (
      <Waiting
        userId={userId}
        mood={selectedMood}
        onMatchFound={goToChat}
        onCancel={goToMoodSelect}
      />
    );
  }

  return (
    <Chat
      userId={userId}
      roomId={roomId}
      mood={selectedMood}
      onLeave={goToMoodSelect}
    />
  );
}
