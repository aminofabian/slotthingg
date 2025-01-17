'use client';
import Link from 'next/link';
import {GiCardKingDiamonds, GiCoins, GiDiamonds } from 'react-icons/gi';
import { FaDollarSign } from 'react-icons/fa';

const Logo = () => {
  return (
    <Link href="/" className="group">
      <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2">
        <div className="relative flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14">
          {/* Background diamond */}
          <GiDiamonds className="absolute text-3xl sm:text-5xl text-[#00ffff]/20 rotate-45 
            transform scale-125 transition-transform duration-300 group-hover:scale-150" />
          
          {/* Glow effect */}
          <div className="absolute w-full h-full rounded-full bg-[#00ffff]/5 
            filter blur-xl group-hover:blur-2xl transition-all duration-300" />
          
          {/* Main diamond */}
          <GiCardKingDiamonds 
            className="text-2xl sm:text-4xl text-[#00ffff] transition-all duration-300 
            group-hover:text-[#4dffff] group-hover:animate-spin-slow z-10
            drop-shadow-[0_0_12px_rgba(0,255,255,0.6)]
            filter brightness-110" 
          />
          
          {/* Decorative coins */}
          <GiCoins 
            className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5
            text-lg sm:text-xl text-[#00cccc] transition-all duration-300 
            group-hover:text-[#00ffff] animate-bounce z-20
            drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" 
          />
        </div>

        <div className="flex flex-col -space-y-1">
          <div className="text-xl sm:text-3xl font-black relative flex items-center">
            <span 
              className="text-[#00ffff] tracking-[0.1em] transition-all duration-300 
              group-hover:text-[#4dffff] group-hover:translate-x-1 font-extrabold
              drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]
              [text-shadow:2px_2px_0px_rgba(0,0,0,0.3)]"
            >
              SLOT
            </span>
            <span 
              className="text-white tracking-[0.08em] transition-all duration-300 ml-2
              group-hover:text-[#00ffff] group-hover:-translate-x-1 font-bold
              drop-shadow-[0_0_8px_rgba(0,255,255,0.2)]
              [text-shadow:2px_2px_0px_rgba(0,0,0,0.3)]"
            >
              THING
            </span>
          </div>
          
          <span 
            className="text-[10px] sm:text-xs text-[#00cccc] tracking-[0.15em] uppercase 
            transition-all duration-300 group-hover:text-[#00ffff]/90 pl-1
            drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]"
          >
            Fortune Awaits
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
