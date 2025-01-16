'use client';
import { BiMoney, BiDiamond } from 'react-icons/bi';
import Image from 'next/image';

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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BiMoney className="w-8 h-8 text-[#00ffff]" />
          <h1 className="text-2xl font-bold text-white">Exchange for Real Money Credits</h1>
        </div>
        <p className="text-white/60">Play and obtain awesome rewards</p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        {packages.map((pkg, index) => (
          <div key={index} className="relative group">
            {/* Card Container with Glow Effect */}
            <div className="relative bg-gradient-to-b from-black/40 to-black/20 
              rounded-3xl overflow-hidden backdrop-blur-sm
              before:absolute before:inset-0 
              before:bg-gradient-to-b before:from-[#00ffff]/10 before:to-transparent
              before:opacity-0 before:group-hover:opacity-100 before:transition-opacity
              hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500
              border border-white/5 group-hover:border-[#00ffff]/20">

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent 
                  via-white/5 to-transparent group-hover:translate-x-full duration-1500 
                  transform -skew-x-12 transition-transform" />
              </div>

              {/* Popular Tag with Enhanced Style */}
              {pkg.popular && (
                <div className="absolute -top-3 left-6 px-4 py-1.5 
                  bg-gradient-to-r from-[#00ffff]/30 to-[#00ffff]/10
                  rounded-full shadow-lg shadow-[#00ffff]/10 z-10
                  border border-[#00ffff]/20">
                  <span className="text-xs font-bold text-[#00ffff] tracking-wider">
                    POPULAR
                  </span>
                </div>
              )}
              
              {/* Enhanced Discount Tag */}
              {pkg.discount && (
                <div className="absolute -top-3 right-6 z-10">
                  <div className="relative bg-red-500 text-white px-4 py-1.5
                    font-bold text-sm flex items-center gap-1 
                    shadow-lg transform -rotate-3 group-hover:rotate-0 
                    transition-transform duration-300">
                    {pkg.discount}% OFF
                    <div className="absolute -bottom-1.5 right-0 border-t-[6px] 
                      border-r-[6px] border-t-red-700 border-r-transparent" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Amount with Enhanced Style */}
                <div className="text-center relative">
                  <div className="absolute inset-0 flex items-center justify-center 
                    opacity-10 text-7xl font-bold text-[#00ffff] blur-sm">
                    ${pkg.amount}
                  </div>
                  <h2 className="text-5xl font-bold text-white mb-3 relative">
                    ${pkg.amount}
                  </h2>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#00ffff]/80">Credits</p>
                    <p className="text-xs text-white/40">(Real Money)</p>
                  </div>
                </div>

                {/* Money Image with Enhanced Effects */}
                <div className="relative h-32 w-full my-8">
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

                {/* Diamonds with Enhanced Style */}
                <div className="relative">
                  <div className="flex items-center justify-center gap-3 text-3xl 
                    font-bold text-white">
                    <span className="relative">
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

                {/* Enhanced Buy Button */}
                <button className="w-full py-4 rounded-xl relative overflow-hidden
                  bg-gradient-to-r from-[#00ffff]/20 to-[#00ffff]/10
                  hover:from-[#00ffff]/30 hover:to-[#00ffff]/20 
                  border border-[#00ffff]/30 group-hover:border-[#00ffff]/50
                  transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                    via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-full 
                    transition-transform duration-1000" />
                  <span className="relative text-lg font-bold tracking-wider text-[#00ffff]">
                    BUY NOW
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 