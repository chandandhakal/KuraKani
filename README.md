# VibeLink

Anonymous mood-based random chat app. No login. No database. Just pick a mood and start talking.

## Quick Start

### 1. Start the server
```bash
cd server
npm install
npm run dev
```
Server runs on http://localhost:3001

### 2. Start the frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### 3. Test it
Open http://localhost:5173 in **two browser tabs**.
Pick the same mood in both tabs — they will match and you can chat.

## Project Structure
```
vibelink/
├── server/
│   ├── index.js      ← Express + Socket.IO server
│   ├── socket.js     ← All socket event handlers
│   └── package.json
│
└── client/
    ├── src/
    │   ├── pages/
    │   │   ├── MoodSelect.jsx   ← Pick your mood
    │   │   ├── Waiting.jsx      ← Searching for match
    │   │   └── Chat.jsx         ← Chat room
    │   ├── App.jsx              ← Screen switcher
    │   └── socket.js            ← Socket.IO client
    └── package.json
```

## Features
- 7 moods: Happy, Sad, Lonely, Romantic, Bored, Gaming, Study
- Instant matching with same-mood users
- Real-time chat via Socket.IO
- Typing indicator
- Skip to find a new person
- Auto-cleanup on disconnect
