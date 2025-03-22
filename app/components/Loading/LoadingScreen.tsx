import React from 'react';
import Logo from '../Logo/Logo';
import { MotionDiv } from '@/app/types/motion';

const LoadingScreen = () => {
  return (
    <MotionDiv
      className="fixed inset-0 bg-[#002222] flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="relative">
        {/* Logo with pulsing animation */}
        <MotionDiv
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 2,
            ease: 'easeOut',
          }}
          className="relative z-10 scale-150 md:scale-[2]"
        >
          <Logo />
        </MotionDiv>

        {/* Glowing effect behind logo */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00ffff]/5 rounded-full blur-[100px]" />
      </div>

      {/* Welcome message with fade-in animation */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-12 text-center"
      >
        <h2 className="text-[#00ffff] text-2xl md:text-3xl font-light tracking-[0.3em] uppercase mb-4">
          Welcome
        </h2>
        <p className="text-white/50 text-sm md:text-base tracking-wider">
          Experience the thrill of gaming
        </p>
      </MotionDiv>

      {/* Loading indicator */}
      <MotionDiv
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ duration: 4, ease: 'easeInOut' }}
        className="mt-12 h-[2px] bg-[#00ffff]/30 relative overflow-hidden rounded-full"
      >
        <MotionDiv
          className="absolute top-0 left-0 h-full bg-[#00ffff]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        />
      </MotionDiv>
    </MotionDiv>
  );
};

export default LoadingScreen;
