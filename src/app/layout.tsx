import type { Metadata, Viewport } from 'next';
import { Geist, Dancing_Script } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const dancing = Dancing_Script({
  variable: '--font-dancing-script',
  subsets: ['latin'],
  weight: ['600', '700'],
});

export const metadata: Metadata = {
  title: 'Mint — Waitlist',
  description: 'Join the waitlist at Mint.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${dancing.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
