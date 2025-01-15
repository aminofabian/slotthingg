'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaHome } from 'react-icons/fa';
import {GiDiamonds, GiCrownCoin, GiCherry } from 'react-icons/gi';
import Logo from './components/Logo/Logo';
import { useEffect, useState } from 'react';

interface SlotReelProps {
  symbols: React.ComponentType[];
  delay?: number;
}

const SlotReel = ({ symbols, delay = 0 }: SlotReelProps) => {
  const [spinning, setSpinning] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpinning(false);
    }, 2000 + delay);

    const interval = setInterval(() => {
      if (spinning) {
        setCurrentIndex(prev => (prev + 1) % symbols.length);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [spinning, symbols.length, delay]);

  return (
    <div className="relative w-24 h-24 bg-gradient-to-b from-[#00ffff]/20 to-[#009999]/20 
      rounded-lg border border-[#00ffff]/30 overflow-hidden">
      <motion.div
        animate={{
          y: spinning ? [0, -100] : 0
        }}
        transition={{
          y: {
            repeat: spinning ? Infinity : 0,
            duration: 0.5,
            ease: "linear"
          }
        }}
        className="flex flex-col items-center"
      >
        {spinning ? (
         symbols.map((Symbol, index) => (
          <div key={index} className="w-24 h-24 flex items-center justify-center">
            <Symbol 
             />
          </div>
        ))
        ) : (
          <div className="w-24 h-24 flex items-center justify-center">
            <motion.div
              initial={{ scale: 2, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <span className="text-5xl">4</span>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function NotFound() {
  const symbols = [GiDiamonds, GiCrownCoin, GiCherry];

  return (
    <div className="min-h-screen bg-[#002222] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00ffff]/5 via-[#00dddd]/5 to-[#009999]/5" />
      <div className="absolute w-[500px] h-[500px] bg-[#00ffff]/5 rounded-full blur-[100px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center">
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="w-48 h-16 mx-auto">
            <Logo />
          </div>
        </motion.div>

        {/* Slot Machine */}
        <div className="mb-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <SlotReel symbols={symbols} delay={0} />
            <SlotReel symbols={symbols} delay={200} />
            <SlotReel symbols={symbols} delay={400} />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Bad Luck! Page Not Found
            </h2>
            <p className="text-white/70 text-lg">
              Looks like this spin didn't hit the jackpot. Try another round!
            </p>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ffff]/20 to-[#009999]/20
              border border-[#00ffff]/30 rounded-lg text-white hover:bg-[#00ffff]/20 transition-all duration-300"
          >
            <FaHome className="w-5 h-5 text-[#00ffff] group-hover:scale-110 transition-transform duration-300" />
            <span>Back to Lobby</span>
          </Link>
          
          <Link 
            href="/games"
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ffff]/10 to-[#009999]/10
              border border-[#00ffff]/20 rounded-lg text-white hover:bg-[#00ffff]/20 transition-all duration-300"
          >
            <GiDiamonds className="w-5 h-5 text-[#00ffff] group-hover:scale-110 transition-transform duration-300" />
            <span>Play Now</span>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
    </div>
  );
}
