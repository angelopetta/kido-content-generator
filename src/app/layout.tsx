import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'KIDO Content Generator',
  description: 'AI-powered communications content generator for KIDO Government Relations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
