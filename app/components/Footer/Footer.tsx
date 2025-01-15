import React from 'react';
import Link from 'next/link';
import Logo from '../Logo/Logo';

const Footer = () => {
  return (
    <footer className="bg-[#002222] relative overflow-hidden">
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Links */}
          <nav className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-y-4 mb-12 sm:mb-16 md:mb-20">
            <div className="col-span-2 sm:col-auto flex justify-center items-center sm:hidden mb-4">
              <span className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00ffff]/20 to-transparent" />
            </div>
            
            <Link href="/terms" className="text-white/70 hover:text-[#00ffff] transition-colors text-center text-sm sm:text-base md:text-lg">
              Terms
            </Link>
            <span className="hidden sm:inline text-white/30 mx-6 md:mx-8">•</span>
            <Link href="/privacy" className="text-white/70 hover:text-[#00ffff] transition-colors text-center text-sm sm:text-base md:text-lg">
              Privacy
            </Link>
            <span className="hidden sm:inline text-white/30 mx-6 md:mx-8">•</span>
            <Link href="/responsible" className="text-white/70 hover:text-[#00ffff] transition-colors text-center text-sm sm:text-base md:text-lg">
              Responsible Gaming
            </Link>
            <span className="hidden sm:inline text-white/30 mx-6 md:mx-8">•</span>
            <Link href="/contact" className="text-white/70 hover:text-[#00ffff] transition-colors text-center text-sm sm:text-base md:text-lg">
              Contact
            </Link>

            <div className="col-span-2 sm:col-auto flex justify-center items-center sm:hidden mt-4">
              <span className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00ffff]/20 to-transparent" />
            </div>
          </nav>

          {/* Middle Section - Logo */}
          <div className="relative mb-12 sm:mb-16 md:mb-20">
            <div className="flex flex-col items-center">
              {/* Logo with scaling based on screen size */}
              <div className="relative scale-100 sm:scale-150 md:scale-[2] mb-6 sm:mb-8 md:mb-10 transition-transform duration-300">
                <Logo />
                {/* Decorative glow behind logo */}
                <div className="absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 bg-[#00ffff]/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
              </div>
              
              {/* Platform text with responsive spacing and size */}
              <div className="mt-8 sm:mt-10 md:mt-12 text-white/50 text-xs sm:text-sm md:text-base tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] uppercase relative z-10">
                Slot Game Platform
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright */}
          <div className="text-center space-y-3 sm:space-y-4">
            <p className="text-white/50 text-xs sm:text-sm md:text-base tracking-wider">
              {new Date().getFullYear()} All rights reserved
            </p>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm max-w-sm sm:max-w-md md:max-w-xl mx-auto leading-relaxed px-4">
              This platform is operated by Slot Gaming Ltd. Please play responsibly and only play with money you can afford to lose.
            </p>
          </div>
        </div>
      </div>

      {/* Top Border */}
      <div className="absolute left-0 right-0 top-0 h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-[#00ffff]/20 to-transparent" />
      
      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 sm:w-42 md:w-48 h-36 sm:h-42 md:h-48 bg-[#00ffff]/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
    </footer>
  );
};

export default Footer;
