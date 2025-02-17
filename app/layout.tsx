import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { generateFaviconTags } from './utils/favicon';
import RootClientLayout from './RootClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Slot Games',
  description: 'Play your favorite slot games online',
  icons: generateFaviconTags(),
  manifest: '/site.webmanifest',
};

export const viewport = {
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}