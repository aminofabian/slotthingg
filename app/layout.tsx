import type { Metadata } from "next";
import { Montserrat, Righteous } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
});

export const metadata: Metadata = {
  title: "Slotthing - Play Now",
  description: "Experience the thrill of slots gaming",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${righteous.variable}`}>
      <body className="font-montserrat">{children}</body>
    </html>
  );
}
