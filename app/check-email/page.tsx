'use client';

import { motion } from 'framer-motion';

export default function CheckEmail() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#002222]">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00ffff05_1px,transparent_1px),linear-gradient(135deg,#00ffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div 
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
                  <img 
                    src="/email-icon.png" 
                    alt="Email"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2m20 0l-10 7L2 6m20 0v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6"/></svg>')}`;
                    }}
                  />
                </div>
              </div>
              {/* Animated dots */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="flex space-x-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 1
                      }
                    }
                  }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
                      variants={{
                        hidden: { scale: 0 },
                        visible: { scale: 1 }
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-4">
              <h3 className="text-white text-3xl font-medium">
                Check your email
              </h3>
              <p className="text-gray-400 text-lg">
                We have sent password reset link to your email address.
              </p>
            </div>

            {/* Go to home button */}
            <button
              className="w-full max-w-xs mx-auto px-8 py-4 text-lg font-medium text-white
                bg-gradient-to-r from-green-400 to-green-500 
                rounded-full hover:from-green-500 hover:to-green-600
                transition-all duration-300 transform hover:scale-105
                cursor-default"
            >
              Go to home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 