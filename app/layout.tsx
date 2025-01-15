import './globals.css';
import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import { Metadata } from 'next';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Slot Game Platform',
  description: 'Experience the thrill of gaming with our premium slot games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className={`${montserrat.className} antialiased`}>{children}</body>
    </html>
  );
}
