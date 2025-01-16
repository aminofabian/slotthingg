'use client';

import Image from 'next/image';
import DashboardSlider from './DashboardSlider';
import { SiNintendogamecube } from 'react-icons/si';
import { FaTwitter, FaDiscord, FaTelegram, FaInstagram } from 'react-icons/fa';
import Logo from '../Logo/Logo';

const games = [
  {
    id: 1,
    name: 'Golden Dragon',
    image: '/gameimages/4ed5620e-a0c5-4301-ab32-d585dd9c651e-GOLDEN DRAGON.png',
    gameId: 'M-436-343-056',
    entries: 0,
    active: true,
    balance: 0
  },
  {
    id: 2,
    name: 'Juwa',
    image: '/gameimages/0b94c78a-13f8-4819-90b7-5d34a0d1132f-JUWA.png',
    gameId: 'FK_aminof235',
    entries: 0,
    active: true,
    balance: 0
  },
  {
    id: 3,
    name: 'Ultra Panda',
    image: '/gameimages/ba5c4494-869d-4d69-acda-758cf1169c78-ULTRA PANDA.png',
    gameId: 'aminofabUP777',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 4,
    name: 'Panda Master',
    image: '/gameimages/14570bb3-0cc5-4bef-ba1b-1d1a4821e77b-PANDA MASTER.png',
    gameId: 'PM_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 5,
    name: 'Golden Treasure',
    image: '/gameimages/1f246c12-890f-40f9-b7c6-9b1a4e077169-GOLDEN TREASURE.png',
    gameId: 'GT_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 6,
    name: 'Orion Star',
    image: '/gameimages/2a8bd502-d191-48bd-831d-531a4751050a-ORION STAR.png',
    gameId: 'OS_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 7,
    name: 'V Blink',
    image: '/gameimages/9e9a9618-c490-44fa-943d-c2322c00f266-V BLINK.png',
    gameId: 'VB_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 8,
    name: 'Milky Way',
    image: '/gameimages/21ccf352-34a8-44a3-a94d-67b8cccc0959-MILKY WAY.png',
    gameId: 'MW_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  }
];

export default function DashboardContent() {
  return (
    <div className="min-h-screen w-full mx-auto pb-20 md:pb-6">
      {/* Slider Section */}
      <DashboardSlider />
      {/* Slider Section End */}

      {/* Games Grid - Updated styling */}
      <div className="w-full px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Games</h2>
            <button className="bg-[#00ffff] hover:bg-[#7ffdfd] text-[#003333] font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-[#00ffff]/20 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Game
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game) => (
              <div key={game.id} 
                className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 
                  rounded-xl overflow-hidden shadow-lg border border-[#7ffdfd]/20
                  hover:border-[#7ffdfd]/40 transition-all duration-300
                  [box-shadow:0_0_10px_rgba(127,253,253,0.1)]
                  hover:[box-shadow:0_0_15px_rgba(127,253,253,0.2)]
                  group">
                {/* Game Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Game Info - Condensed */}
                <div className="p-3">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 truncate">
                        {game.name}
                      </h3>
                      <p className="text-[#7ffdfd] font-medium text-sm">
                        $ {game.balance}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#7ffdfd] rounded-full animate-pulse"></div>
                      <span className="text-[#7ffdfd] text-xs">Active</span>
                    </div>
                  </div>

                  {/* Game ID - Condensed */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs text-white/60">ID:</span>
                    <span className="text-xs font-medium text-white/90 truncate">{game.gameId}</span>
                  </div>

                  {/* Action Buttons - Condensed */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button className="flex items-center justify-center gap-1 px-2 py-1.5 
                      bg-[#6f42c1] text-white rounded-lg text-xs font-medium
                      hover:bg-[#6f42c1]/80 transition-all duration-300
                      border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                      </svg>
                      Add
                    </button>
                    <button className="flex items-center justify-center gap-1 px-2 py-1.5
                      bg-[#fd7e14] text-white rounded-lg text-xs font-medium
                      hover:bg-[#fd7e14]/80 transition-all duration-300
                      border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Take
                    </button>
                  </div>

                  {/* Utility Buttons - Added back */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button className="flex items-center justify-center gap-1 px-2 py-1.5
                      text-[#7ffdfd]/70 hover:text-[#7ffdfd] text-xs font-medium 
                      transition-colors rounded-lg border border-[#7ffdfd]/10 
                      hover:border-[#7ffdfd]/30 hover:bg-[#7ffdfd]/5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <button className="flex items-center justify-center gap-1 px-2 py-1.5
                      text-[#7ffdfd]/70 hover:text-[#7ffdfd] text-xs font-medium 
                      transition-colors rounded-lg border border-[#7ffdfd]/10 
                      hover:border-[#7ffdfd]/30 hover:bg-[#7ffdfd]/5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Reset
                    </button>
                  </div>

                  {/* Play Button */}
                  <button className="w-full py-2 bg-gradient-to-r from-[#7ffdfd]/20 to-[#7ffdfd]/10
                    text-[#7ffdfd] rounded-lg text-xs font-bold border border-[#7ffdfd]/30
                    hover:border-[#7ffdfd]/60 hover:from-[#7ffdfd]/30 hover:to-[#7ffdfd]/20
                    transition-all duration-300 flex items-center justify-center gap-2">
                    <SiNintendogamecube className="w-4 h-4" />
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-t from-black to-gray-900 border-t border-[#7ffdfd]/10">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex flex-col items-center gap-8">
            {/* Logo */}
            <div className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <Logo />
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="/about" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                About Us
              </a>
              <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
              <a href="/privacy" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                Privacy Policy
              </a>
              <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
              <a href="/terms" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                Terms & Conditions
              </a>
              <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
              <a href="/support" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                Support
              </a>
              <span className="text-[#7ffdfd]/30 hidden sm:inline">•</span>
              <a href="/contact" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                Contact
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                <FaDiscord className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                <FaTelegram className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#7ffdfd]/60 hover:text-[#7ffdfd] transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-[#7ffdfd]/40">
                &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
              </p>
              <p className="mt-2 text-xs text-[#7ffdfd]/30">
                This website is operated by Your Company Name Ltd.
                <br className="hidden sm:inline" />
                Licensed and regulated under license number: XXXX-XXXX-XXXX
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
