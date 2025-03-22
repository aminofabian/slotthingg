'use client';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

type MotionDivProps = HTMLMotionProps<"div"> & {
  children?: React.ReactNode;
  className?: string;
};

const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

export default function CheckEmail() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#002222]">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00ffff05_1px,transparent_1px),linear-gradient(135deg,#00ffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <MotionDiv 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="text-center space-y-8">
            {/* Email icon with animated dots */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-[#002222] rounded-full flex items-center justify-center border border-[#00ffff]/20">
                <div className="w-14 h-14">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#00ffff" 
                    strokeWidth="2" 
                    className="w-full h-full"
                  >
                    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2m20 0l-10 7L2 6m20 0v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-4">
              <h3 className="text-[#00ffff] text-3xl font-medium">
                Check your email
              </h3>
              <p className="text-white/60 text-lg">
                We have sent password reset instructions to your email address.
              </p>
            </div>

            {/* Back to login button */}
            <a
              href="/login"
              className="inline-block w-full max-w-xs mx-auto px-8 py-4 text-lg font-medium text-[#00ffff]
                bg-[#00ffff]/10 rounded-xl border border-[#00ffff]/20
                hover:bg-[#00ffff]/20 transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50
                tracking-wider uppercase"
            >
              Back to Login
            </a>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
} 