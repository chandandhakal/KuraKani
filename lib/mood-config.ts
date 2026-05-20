export interface MoodTheme {
  name: string;
  emoji: string;
  tagline: string;
  primary: string;
  rgb: string;
  glow: string;
  glowDim: string;
  bgFrom: string;
  bgTo: string;
  sliceBg: string;
  ambientColor: string;
  particleChar: string;
  bubbleMe: string;
  bubbleMeText: string;
  accentGradient: string;
}

export const MOOD_CONFIG: Record<string, MoodTheme> = {
  bored: {
    name: 'Bored',    emoji: '😑', tagline: 'Break the void',
    primary: '#7EB3D8', rgb: '126,179,216',
    glow: 'rgba(126,179,216,0.5)',  glowDim: 'rgba(126,179,216,0.1)',
    bgFrom: '#0b1020',  bgTo: '#060810',
    sliceBg: 'linear-gradient(180deg,#0e1528 0%,#060810 100%)',
    ambientColor: 'rgba(100,140,200,0.06)',
    particleChar: '⬡',
    bubbleMe: 'rgba(44,62,90,0.98)', bubbleMeText: '#dbe8f5',
    accentGradient: 'linear-gradient(90deg,#7EB3D8,#4A85B8,#7EB3D8)',
  },
  happy: {
    name: 'Happy',    emoji: '😊', tagline: 'Golden hour energy',
    primary: '#FFD60A', rgb: '255,214,10',
    glow: 'rgba(255,214,10,0.6)',   glowDim: 'rgba(255,214,10,0.12)',
    bgFrom: '#1c1000',  bgTo: '#080500',
    sliceBg: 'linear-gradient(180deg,#1c1000 0%,#080500 100%)',
    ambientColor: 'rgba(255,200,0,0.07)',
    particleChar: '✦',
    bubbleMe: 'rgba(161,95,0,0.98)', bubbleMeText: '#fff9e6',
    accentGradient: 'linear-gradient(90deg,#FFD60A,#FF9500,#FFD60A)',
  },
  romantic: {
    name: 'Romantic', emoji: '❤️', tagline: 'Open your heart',
    primary: '#FF3C7D', rgb: '255,60,125',
    glow: 'rgba(255,60,125,0.6)',   glowDim: 'rgba(255,60,125,0.12)',
    bgFrom: '#1c0012',  bgTo: '#0a0008',
    sliceBg: 'linear-gradient(180deg,#1c0012 0%,#0a0008 100%)',
    ambientColor: 'rgba(255,60,125,0.06)',
    particleChar: '♥',
    bubbleMe: 'rgba(157,23,77,0.98)', bubbleMeText: '#ffe4ef',
    accentGradient: 'linear-gradient(90deg,#FF3C7D,#C2185B,#FF3C7D)',
  },
  study: {
    name: 'Study',    emoji: '📚', tagline: 'Focus together',
    primary: '#00D4FF', rgb: '0,212,255',
    glow: 'rgba(0,212,255,0.55)',   glowDim: 'rgba(0,212,255,0.1)',
    bgFrom: '#001018',  bgTo: '#00080d',
    sliceBg: 'linear-gradient(180deg,#001a28 0%,#00080d 100%)',
    ambientColor: 'rgba(0,200,255,0.05)',
    particleChar: '◆',
    bubbleMe: 'rgba(7,58,90,0.98)', bubbleMeText: '#e0f7ff',
    accentGradient: 'linear-gradient(90deg,#00D4FF,#0091EA,#00D4FF)',
  },
  gaming: {
    name: 'Gaming',   emoji: '🎮', tagline: 'Level up together',
    primary: '#00FF87', rgb: '0,255,135',
    glow: 'rgba(0,255,135,0.55)',   glowDim: 'rgba(0,255,135,0.1)',
    bgFrom: '#001508',  bgTo: '#000a04',
    sliceBg: 'linear-gradient(180deg,#001a0a 0%,#000a04 100%)',
    ambientColor: 'rgba(0,255,135,0.04)',
    particleChar: '▲',
    bubbleMe: 'rgba(5,80,40,0.98)', bubbleMeText: '#d4ffe8',
    accentGradient: 'linear-gradient(90deg,#00FF87,#00CC6A,#00FF87)',
  },
  /* Legacy support — Chat still renders if mood arrives from backend */
  sad: {
    name: 'Sad', emoji: '😔', tagline: "You're not alone",
    primary: '#60A5FA', rgb: '96,165,250',
    glow: 'rgba(96,165,250,0.5)',   glowDim: 'rgba(96,165,250,0.1)',
    bgFrom: '#001229',  bgTo: '#000510',
    sliceBg: 'linear-gradient(180deg,#001229 0%,#000510 100%)',
    ambientColor: 'rgba(96,165,250,0.05)',
    particleChar: '·',
    bubbleMe: 'rgba(29,78,216,0.95)', bubbleMeText: '#fff',
    accentGradient: 'linear-gradient(90deg,#60A5FA,#3B82F6,#60A5FA)',
  },
  lonely: {
    name: 'Lonely', emoji: '🌙', tagline: 'Find your star',
    primary: '#A78BFA', rgb: '167,139,250',
    glow: 'rgba(167,139,250,0.5)',  glowDim: 'rgba(167,139,250,0.1)',
    bgFrom: '#0d0033',  bgTo: '#050010',
    sliceBg: 'linear-gradient(180deg,#0d0033 0%,#050010 100%)',
    ambientColor: 'rgba(167,139,250,0.05)',
    particleChar: '★',
    bubbleMe: 'rgba(109,40,217,0.95)', bubbleMeText: '#fff',
    accentGradient: 'linear-gradient(90deg,#A78BFA,#7C3AED,#A78BFA)',
  },
};

/* Only these 4 are shown in the mood picker */
export const MOOD_KEYS = ['gaming', 'study', 'lonely', 'bored'] as const;
export type MoodKey = typeof MOOD_KEYS[number];
