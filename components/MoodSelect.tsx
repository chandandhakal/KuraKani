'use client';

const MOODS = [
  { name: 'Happy',    slug: 'happy',    emoji: '😊', bg: 'bg-yellow-500',  ring: 'hover:ring-yellow-400'  },
  { name: 'Sad',      slug: 'sad',      emoji: '😢', bg: 'bg-blue-500',    ring: 'hover:ring-blue-400'    },
  { name: 'Lonely',   slug: 'lonely',   emoji: '🌙', bg: 'bg-purple-600',  ring: 'hover:ring-purple-400'  },
  { name: 'Romantic', slug: 'romantic', emoji: '💗', bg: 'bg-pink-500',    ring: 'hover:ring-pink-400'    },
  { name: 'Bored',    slug: 'bored',    emoji: '😑', bg: 'bg-slate-500',   ring: 'hover:ring-slate-400'   },
  { name: 'Gaming',   slug: 'gaming',   emoji: '🎮', bg: 'bg-green-600',   ring: 'hover:ring-green-400'   },
  { name: 'Study',    slug: 'study',    emoji: '📚', bg: 'bg-orange-500',  ring: 'hover:ring-orange-400'  },
];

interface Props {
  userId: string;
  onMoodSelect: (mood: string) => void;
}

export default function MoodSelect({ userId, onMoodSelect }: Props) {
  async function handleClick(slug: string) {
    // Transition immediately; Waiting screen handles the queue response
    onMoodSelect(slug);
    await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mood: slug }),
    });
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 py-12">

      <div className="mb-2 text-5xl">✨</div>
      <h1 className="text-4xl font-bold text-white tracking-tight mb-1">VibeLink</h1>
      <p className="text-gray-400 text-sm mb-10 text-center">
        Pick your mood. Get matched. Start talking.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-sm sm:max-w-md">
        {MOODS.map((mood) => (
          <button
            key={mood.slug}
            onClick={() => handleClick(mood.slug)}
            className={`
              ${mood.bg} ${mood.ring}
              rounded-2xl p-5
              flex flex-col items-center gap-2
              text-white font-semibold text-sm
              ring-2 ring-transparent
              transition-all duration-150
              active:scale-95 hover:brightness-110
              shadow-lg
            `}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span>{mood.name}</span>
          </button>
        ))}
      </div>

      <p className="text-gray-700 text-xs mt-12 text-center">
        Anonymous · No sign up · No data stored
      </p>
    </div>
  );
}
