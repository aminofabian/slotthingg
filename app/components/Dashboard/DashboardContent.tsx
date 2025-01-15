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

      {/* Games Grid */}
      <div className="w-full px-6">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-8">
          {games.map((game) => (
            <div key={game.id} 
              className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 
                rounded-2xl overflow-hidden shadow-lg border border-[#7ffdfd]/20
                hover:border-[#7ffdfd]/40 transition-all duration-300
                [box-shadow:0_0_10px_rgba(127,253,253,0.1)]
                hover:[box-shadow:0_0_15px_rgba(127,253,253,0.2)]">
              {/* Game Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
                  priority
                />
              </div>

              {/* Game Info */}
              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {game.name}
                    </h3>
                    <p className="text-[#7ffdfd] font-medium text-lg">
                      $ {game.balance}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#7ffdfd] rounded-full animate-pulse"></div>
                    <span className="text-[#7ffdfd] text-sm">Active</span>
                  </div>
                </div>

                {/* Game ID */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-sm text-white/60">Game ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/90">{game.gameId}</span>
                    <button className="text-[#7ffdfd]/70 hover:text-[#7ffdfd] transition-colors">
                      {/* Game Controller Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 0a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2m0-4v4m6-4v4m4-6-2-2m0 0L15 8m2 2 2-2m-2 2-2-2M7 8h.01M7 12h.01M11 8h.01M11 12h.01" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Password Notice */}
                <p className="text-xs text-white/50 italic mb-6">
                  (Password will only be sent or visualized on your email)
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 
                    bg-[#6f42c1] text-white rounded-lg font-medium
                    hover:bg-[#6f42c1]/80 transition-all duration-300
                    border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40">
                    {/* Coins Stack Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <circle cx="8" cy="8" r="7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v6m-3-3h6" />
                      <circle cx="16" cy="16" r="7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 13v6m-3-3h6" />
                    </svg>
                    Add Credits
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5
                    bg-[#fd7e14] text-white rounded-lg font-medium
                    hover:bg-[#fd7e14]/80 transition-all duration-300
                    border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40">
                    {/* Trophy Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l2 4h-4l-2 10H10L8 8H4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8v8M16 8v8" />
                    </svg>
                    Withdraw
                  </button>
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button className="flex items-center justify-center gap-1.5 py-2.5 
                    text-[#7ffdfd]/70 hover:text-[#7ffdfd] text-sm font-medium transition-colors">
                    {/* Dice Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <circle cx="8" cy="8" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="16" cy="16" r="1" />
                    </svg>
                    Refresh Balance
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2.5
                    text-[#7ffdfd]/70 hover:text-[#7ffdfd] text-sm font-medium transition-colors">
                    {/* Shield Lock Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L4 7v6c0 5.5 3.5 9.5 8 11 4.5-1.5 8-5.5 8-11V7l-8-4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 0v4m0-4h4m-4 0H8" />
                    </svg>
                    Reset Password
                  </button>
                </div>

                {/* Play Button */}
                <button className="w-full mt-5 py-3.5 bg-gradient-to-r from-[#7ffdfd]/20 to-[#7ffdfd]/10
                  text-[#7ffdfd] rounded-lg font-bold border border-[#7ffdfd]/30
                  hover:border-[#7ffdfd]/60 hover:from-[#7ffdfd]/30 hover:to-[#7ffdfd]/20
                  transition-all duration-300 flex items-center justify-center gap-3">
                  <SiNintendogamecube className="w-7 h-7" />
                  Play Now
                </button>
              </div>
            </div>
          ))}
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
