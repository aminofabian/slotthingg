'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '../Logo/Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#004d4d] px-2 sm:px-8 py-4 sm:py-6 w-full font-montserrat">
      <div className="flex justify-between items-center max-w-7xl mx-auto relative">
        {/* Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/login"
            className="border-2 border-[#00ffff] text-[#00ffff] px-8 py-3 rounded-md
                     text-xl uppercase font-bold hover:bg-[#00ffff] hover:text-[#004d4d] 
                     transition-colors duration-300 tracking-wider"
          >
            Play Now
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-1.5">
          <Link 
            href="/dashboard"
            className="border-2 border-[#00ffff] text-[#00ffff] px-3 py-1.5 rounded-md
                     text-sm uppercase font-bold hover:bg-[#00ffff] hover:text-[#004d4d] 
                     transition-colors duration-300 tracking-wider whitespace-nowrap"
          >
            Play Now
          </Link>
          
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="border-2 border-[#00ffff] p-1.5 rounded-md w-8 h-8 flex flex-col 
                     justify-center items-center gap-1 group hover:border-white 
                     transition-colors duration-300"
            aria-label="Menu"
          >
            <span className={`w-5 h-0.5 bg-[#00ffff] transition-all duration-300 
                          group-hover:bg-white ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-5 h-0.5 bg-[#00ffff] transition-all duration-300 
                          group-hover:bg-white ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-[#00ffff] transition-all duration-300 
                          group-hover:bg-white ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`${isOpen ? 'flex' : 'hidden'} md:hidden flex-col items-center py-6 space-y-4 border-t border-[#00ffff]/20 mt-6`}>
        <Link 
          href="/about" 
          className="text-[#00ffff] text-lg font-semibold hover:text-white transition-colors duration-300"
        >
          About
        </Link>
        <Link 
          href="/games" 
          className="text-[#00ffff] text-lg font-semibold hover:text-white transition-colors duration-300"
        >
          Games
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;