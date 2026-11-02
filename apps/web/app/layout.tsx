import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-space',
});

export const metadata: Metadata = {
  title: 'CrowdFest — AI Crowd Simulation Platform',
  description: 'Know what happens when everyone shows up.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${space.variable} antialiased`}>{children}</body>
    </html>
  );
}
