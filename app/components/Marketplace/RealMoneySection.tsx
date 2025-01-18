'use client';
import { BiMoney, BiDiamond } from 'react-icons/bi';
import Image from 'next/image';
import { SiNintendogamecube } from 'react-icons/si';

const packages = [
  {
    amount: 10,
    diamonds: 250,
    popular: true,
    discount: null,
    image: '/note.jpg'
  },
  {
    amount: 25,
    diamonds: 563,
    popular: true,
    discount: 10,
    originalDiamonds: 626,
    image: '/note.jpg'
  },
  {
    amount: 50,
    diamonds: 1063,
    popular: false,
    discount: 15,
    originalDiamonds: 1251,
    image: '/note.jpg'
  },
  {
    amount: 100,
    diamonds: 2000,
    popular: false,
    discount: 20,
    originalDiamonds: 2500,
    image: '/note.jpg'
  },
  {
    amount: 200,
    diamonds: 4200,
    popular: false,
    discount: 25,
    originalDiamonds: 5600,
    image: '/note.jpg'
  },
  {
    amount: 500,
    diamonds: 11000,
    popular: false,
    discount: 30,
    originalDiamonds: 15714,
    image: '/note.jpg'
  },
  {
    amount: 700,
    diamonds: 15750,
    popular: false,
    discount: 35,
    originalDiamonds: 24231,
    image: '/note.jpg'
  },
  {
    amount: 1000,
    diamonds: 23000,
    popular: false,
    discount: 40,
    originalDiamonds: 38333,
    image: '/note.jpg'
  }
];

export default function RealMoneySection() {
  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header with adjusted spacing */}
        <div className="space-y-3 mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#00ffff]/10 border border-[#00ffff]/20">
              <BiMoney className="w-8 h-8 text-[#00ffff]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Exchange for Real Money Credits</h1>
              <p className="text-white/60">Play and obtain awesome rewards</p>
            </div>
          </div>
        </div>

        {/* Updated Packages Grid - Two columns on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-8">
          {packages.map((pkg, index) => (
            <div key={index} className="relative group">
              {/* Card Container - Adjusted padding for mobile */}
              <div className="relative bg-gradient-to-b from-black/40 to-black/20 
                rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-sm
                before:absolute before:inset-0 
                before:bg-gradient-to-b before:from-[#00ffff]/10 before:to-transparent
                before:opacity-0 before:group-hover:opacity-100 before:transition-opacity
                hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500
                border border-white/5 group-hover:border-[#00ffff]/20">

                {/* Rainbow Border Effect */}
                <div className="absolute inset-[-1px] bg-gradient-to-r from-[#00ffff]/30 via-purple-500/30 to-[#00ffff]/30 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px] -z-10" />

                {/* Popular Tag - Adjusted Position */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-1.5 
                    bg-gradient-to-r from-[#00ffff] via-[#00ffff]/80 to-[#00ffff]
                    rounded-full shadow-lg shadow-[#00ffff]/10 z-10
                    border border-[#00ffff]/20">
                    <span className="text-xs font-bold text-black tracking-wider">
                      POPULAR
                    </span>
                  </div>
                )}
                
                {/* Discount Tag - Moved to top right corner */}
                {pkg.discount && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="relative bg-gradient-to-r from-red-500 to-red-600 
                      text-white px-4 py-1.5 rounded-lg
                      font-bold text-sm flex items-center gap-1 
                      shadow-lg transform hover:scale-105 
                      transition-all duration-300">
                      {pkg.discount}% OFF
                    </div>
                  </div>
                )}

                {/* Content - Adjusted spacing for mobile */}
                <div className="p-4 md:p-8 space-y-4 md:space-y-8">
                  {/* Amount - Adjusted text size for mobile */}
                  <div className="text-center relative">
                    <div className="absolute inset-0 flex items-center justify-center 
                      opacity-10 text-4xl md:text-7xl font-bold bg-gradient-to-r from-[#00ffff] via-purple-500 to-[#00ffff] 
                      bg-clip-text text-transparent blur-sm">
                      ${pkg.amount}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#00ffff] to-white
                      bg-clip-text text-transparent mb-2 md:mb-3 relative">
                      ${pkg.amount}
                    </h2>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-xs md:text-sm font-medium text-[#00ffff]/80">Credits</p>
                      <p className="text-[10px] md:text-xs text-white/40">(Real Money)</p>
                    </div>
                  </div>

                  {/* Money Image - Adjusted size for mobile */}
                  <div className="relative h-20 md:h-32 w-full my-4 md:my-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative group-hover:scale-110 transition-transform 
                        duration-500 p-4">
                        <div className="absolute inset-0 bg-[#00ffff]/5 rounded-full 
                          blur-xl group-hover:bg-[#00ffff]/10 transition-colors" />
                        <Image
                          src={pkg.image}
                          alt={`${pkg.amount} credits`}
                          width={120}
                          height={120}
                          className="relative z-10 drop-shadow-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diamonds - Adjusted size for mobile */}
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 md:gap-3 text-xl md:text-3xl font-bold">
                      <span className="relative bg-gradient-to-r from-white via-[#00ffff] to-white 
                        bg-clip-text text-transparent">
                        {pkg.diamonds}
                        {pkg.originalDiamonds && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 
                            text-sm text-white/40 line-through flex items-center gap-1">
                            {pkg.originalDiamonds}
                            <BiDiamond className="w-4 h-4" />
                          </span>
                        )}
                      </span>
                      <BiDiamond className="w-8 h-8 text-[#00ffff] animate-pulse" />
                    </div>
                  </div>

                  {/* Buy Button - Adjusted padding for mobile */}
                  <button className="w-full py-3 md:py-4 rounded-xl relative overflow-hidden group/btn
                    bg-gradient-to-r from-[#00ffff]/20 to-[#00ffff]/10
                    hover:from-[#00ffff]/30 hover:to-[#00ffff]/20 
                    border border-[#00ffff]/30 group-hover:border-[#00ffff]/50
                    transition-all duration-300">
                    <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100
                      bg-gradient-to-r from-[#00ffff]/10 via-purple-500/10 to-[#00ffff]/10
                      transition-opacity duration-500" />
                    <span className="relative text-lg font-bold tracking-wider text-[#00ffff]
                      group-hover/btn:text-white transition-colors duration-300">
                      BUY NOW
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 