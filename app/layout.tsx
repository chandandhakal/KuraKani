import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kurakani — Mood-based Anonymous Chat',
  description: 'Pick your mood. Get matched. Start talking.',
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body
        suppressHydrationWarning
        style={{ fontFamily: 'var(--font-space), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
