import type { Metadata } from "next";
import { Montserrat, Righteous, Playfair_Display, Poppins } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
  display: "swap"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap"
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
    <html lang="en" className={`${montserrat.variable} ${righteous.variable} ${playfair.variable} ${poppins.variable}`}>
      <body className="font-montserrat">{children}</body>
    </html>
  );
}
