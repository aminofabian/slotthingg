'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from "./components/Homepage/Navbar";
import HeroSection from "./components/Homepage/HeroSection";
import GamesSection from "./components/Games/GamesSection";
import LicenseSection from "./components/License/LicenseSection";
import Footer from "./components/Footer/Footer";
import LoadingScreen from "./components/Loading/LoadingScreen";
import ChatWidget from "./components/Chat/ChatWidget";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <>
            <Navbar />
            <HeroSection />
            <GamesSection />
            <LicenseSection />
            <Footer />
            <ChatWidget />
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
