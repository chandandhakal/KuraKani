import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VibeLink',
  description: 'Pick your mood. Get matched. Start talking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
