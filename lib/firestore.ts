import { db } from './firebase';
import { ref, set, get, push, onValue, remove, off, onDisconnect } from 'firebase/database';

// ─── User Profiles ───────────────────────────────────────────────────────────

export async function saveUserProfile(userId: string, nickname: string) {
  await set(ref(db, `users/${userId}/profile`), { nickname });
}

export async function getUserProfile(userId: string): Promise<{ nickname: string } | null> {
  const snap = await get(ref(db, `users/${userId}/profile`));
  return snap.exists() ? (snap.val() as { nickname: string }) : null;
}

// ─── Friend Requests ─────────────────────────────────────────────────────────

export async function sendFriendRequest(fromUserId: string, toUserId: string, fromNickname: string) {
  await set(ref(db, `users/${toUserId}/pendingRequests/${fromUserId}`), {
    nickname: fromNickname,
    sentAt: Date.now(),
  });
}

export async function acceptFriendRequest(
  myUserId: string, myNickname: string,
  fromUserId: string, fromNickname: string
) {
  await Promise.all([
    set(ref(db, `users/${myUserId}/friends/${fromUserId}`), { nickname: fromNickname, addedAt: Date.now() }),
    set(ref(db, `users/${fromUserId}/friends/${myUserId}`), { nickname: myNickname, addedAt: Date.now() }),
    remove(ref(db, `users/${myUserId}/pendingRequests/${fromUserId}`)),
  ]);
}

export async function rejectFriendRequest(myUserId: string, fromUserId: string) {
  await remove(ref(db, `users/${myUserId}/pendingRequests/${fromUserId}`));
}

export function listenForPendingRequests(
  userId: string,
  callback: (requests: Array<{ id: string; nickname: string }>) => void
): () => void {
  const r = ref(db, `users/${userId}/pendingRequests`);
  onValue(r, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val() as Record<string, { nickname: string }>;
    callback(Object.entries(data).map(([id, val]) => ({ id, nickname: val.nickname })));
  });
  return () => off(r);
}

// ─── Friends List ─────────────────────────────────────────────────────────────

export async function getFriends(userId: string): Promise<Array<{ id: string; nickname: string }>> {
  const snap = await get(ref(db, `users/${userId}/friends`));
  if (!snap.exists()) return [];
  const data = snap.val() as Record<string, { nickname: string }>;
  return Object.entries(data).map(([id, val]) => ({ id, nickname: val.nickname }));
}

// ─── Random Chat Messages (sender saves once) ────────────────────────────────

export async function saveMessage(
  roomId: string,
  msg: { senderId: string; senderNickname: string; text: string; time: string }
) {
  await push(ref(db, `conversations/${roomId}/messages`), { ...msg, createdAt: Date.now() });
}

// ─── Direct Messages ─────────────────────────────────────────────────────────

export function getDmId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('__');
}

export async function sendDmMessage(
  dmId: string,
  msg: { senderId: string; senderNickname: string; text: string; time: string }
) {
  await push(ref(db, `dms/${dmId}/messages`), { ...msg, createdAt: Date.now() });
}

// ─── Online Presence ─────────────────────────────────────────────────────────

export function setupPresence(userId: string) {
  const presRef = ref(db, `presence/${userId}`);
  const connRef = ref(db, '.info/connected');
  onValue(connRef, (snap) => {
    if (!snap.val()) return;
    onDisconnect(presRef).remove();
    set(presRef, { online: true, since: Date.now() });
  });
}

export function listenUserPresence(userId: string, cb: (online: boolean) => void): () => void {
  const r = ref(db, `presence/${userId}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (snap: any) => cb(!!snap.val()?.online);
  onValue(r, handler);
  return () => off(r, 'value', handler);
}

// ─── DM Typing Indicator ─────────────────────────────────────────────────────

export function setDmTyping(dmId: string, userId: string, typing: boolean) {
  const r = ref(db, `dms/${dmId}/typing/${userId}`);
  typing ? set(r, true) : remove(r);
}

export function listenDmTyping(dmId: string, partnerId: string, cb: (typing: boolean) => void): () => void {
  const r = ref(db, `dms/${dmId}/typing/${partnerId}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (snap: any) => cb(!!snap.val());
  onValue(r, handler);
  return () => off(r, 'value', handler);
}

// ─── DM Read Receipts ─────────────────────────────────────────────────────────

export function markDmRead(dmId: string, userId: string, lastMsgId: string) {
  set(ref(db, `dms/${dmId}/readBy/${userId}`), lastMsgId);
}

export function listenDmReadBy(dmId: string, cb: (readBy: Record<string, string>) => void): () => void {
  const r = ref(db, `dms/${dmId}/readBy`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (snap: any) => cb(snap.val() || {});
  onValue(r, handler);
  return () => off(r, 'value', handler);
}

// ─── DM Reactions ────────────────────────────────────────────────────────────

export async function toggleDmReaction(dmId: string, msgId: string, userId: string, emoji: string) {
  const r = ref(db, `dms/${dmId}/reactions/${msgId}/${userId}`);
  const snap = await get(r);
  snap.val() === emoji ? await remove(r) : await set(r, emoji);
}

export function listenDmReactions(
  dmId: string,
  cb: (reactions: Record<string, Record<string, string>>) => void
): () => void {
  const r = ref(db, `dms/${dmId}/reactions`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (snap: any) => cb(snap.val() || {});
  onValue(r, handler);
  return () => off(r, 'value', handler);
}

export function listenToDmMessages(
  dmId: string,
  callback: (messages: Array<{
    id: string; senderId: string; senderNickname: string;
    text: string; time: string; createdAt: number;
  }>) => void
): () => void {
  const r = ref(db, `dms/${dmId}/messages`);
  onValue(r, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.val() as Record<string, any>;
    const msgs = Object.entries(data)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => a.createdAt - b.createdAt);
    callback(msgs);
  });
  return () => off(r);
}
