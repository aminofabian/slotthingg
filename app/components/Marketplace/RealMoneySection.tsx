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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, index) => (
          <div key={index} className="relative bg-black/20 rounded-3xl overflow-hidden group
            hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] transition-all duration-300">
            {/* Popular Tag */}
            {pkg.popular && (
              <div className="absolute top-4 left-4 px-4 py-1 bg-[#00ffff]/20 rounded-full">
                <span className="text-xs font-medium text-[#00ffff]">Popular</span>
              </div>
            )}
            
            {/* Discount Tag */}
            {pkg.discount && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg
                font-bold text-sm flex items-center gap-1 z-10">
                {pkg.discount}% Off
              </div>
            )}

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Amount */}
              <div className="text-center">
                <h2 className="text-5xl font-bold text-white mb-2">
                  ${pkg.amount}
                </h2>
                <p className="text-sm text-white/60">Credits</p>
                <p className="text-xs text-white/40">(Real Money)</p>
              </div>

              {/* Money Image */}
              <div className="relative h-32 w-full my-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={pkg.image}
                    alt={`${pkg.amount} credits`}
                    width={120}
                    height={120}
                    className="object-contain transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>

              {/* Diamonds */}
              <div className="relative">
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                  {pkg.diamonds}
                  <BiDiamond className="w-8 h-8 text-[#00ffff]" />
                </div>
                {pkg.originalDiamonds && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1
                    text-sm text-white/40 line-through">
                    {pkg.originalDiamonds}
                    <BiDiamond className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Buy Button */}
              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00ffff]/20 to-[#00ffff]/10
                border border-[#00ffff]/30 text-[#00ffff] font-bold tracking-wide text-lg
                hover:from-[#00ffff]/30 hover:to-[#00ffff]/20 
                transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                BUY NOW
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 