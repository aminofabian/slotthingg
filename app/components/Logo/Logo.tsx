'use client';
import Link from 'next/link';
import {GiCardKingDiamonds, GiCoins } from 'react-icons/gi';
import { FaDollarSign } from 'react-icons/fa';

const Logo = () => {
  return (
    <Link href="/" className="group">
      <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2">
        <div className="relative">
          <GiCardKingDiamonds className="text-2xl sm:text-4xl text-primary transition-all duration-300 group-hover:text-primary-light group-hover:animate-spin-slow" />
          <GiCoins className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 text-lg sm:text-xl text-primary-dark transition-all duration-300 group-hover:text-primary animate-bounce" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl sm:text-3xl font-black relative flex items-center gap-1">
            <span className="text-primary tracking-wider transition-all duration-300 group-hover:text-primary-light group-hover:translate-x-1">
              SLOT
            </span>
            <span className="text-white tracking-wider transition-all duration-300 group-hover:text-primary group-hover:-translate-x-1">
              THING
            </span>
          </span>
          <span className="text-[10px] sm:text-xs text-primary-dark tracking-widest uppercase transition-all duration-300 group-hover:text-primary/80">Fortune Awaits</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
