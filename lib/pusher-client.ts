import PusherJS from 'pusher-js';

// Module-level singleton — same pattern as the old socket.js
const pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export default pusherClient;
