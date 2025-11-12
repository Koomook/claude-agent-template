import { Toaster } from 'sonner';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Claude Agent Template',
  description:
    'AI Agent powered by Claude Agent SDK with custom MCP tools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <div className="fixed right-0 left-0 w-full top-0 bg-white dark:bg-zinc-950">
          <div className="flex justify-between items-center p-4">
            <Link className="flex flex-row items-center gap-3" href="/">
              <div className="jsx-e3e12cc6f9ad5a71 text-lg font-bold text-zinc-800 dark:text-zinc-100">
                Claude Agent
              </div>
            </Link>
          </div>
        </div>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
