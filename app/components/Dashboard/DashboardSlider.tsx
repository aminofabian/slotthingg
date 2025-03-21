'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Righteous } from 'next/font/google';
import { FaGamepad, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiTakeMyMoney, GiStarsStack } from 'react-icons/gi';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const righteous = Righteous({ 
  weight: ['400'],
  subsets: ['latin']
});

const slides = [
  {
    id: 1,
    image: '/14.jpg',
    title: ['Welcome to', 'Slot Games'],
    subtitle: 'WHERE WINNING BEGINS',
    description: 'Experience the thrill of gaming with our exclusive collection',
    icon: FaGamepad,
    gradient: 'from-[#00ffff]/20 to-[#009999]/20',
    cta: 'Play Now'
  },
  {
    id: 2,
    image: '/111.png',
    title: ['Daily', 'Rewards'],
    subtitle: 'CLAIM YOUR FORTUNE',
    description: 'Login daily to unlock amazing bonuses and special prizes',
    icon: GiTakeMyMoney,
    gradient: 'from-[#ffff00]/20 to-[#ffa500]/20',
    cta: 'Claim Now'
  },
  {
    id: 3,
    image: '/12.jpg',
    title: ['New Games', 'Available'],
    subtitle: 'FRESH EXCITEMENT',
    description: 'Discover our latest additions to your gaming collection',
    icon: GiStarsStack,
    gradient: 'from-[#ff00ff]/20 to-[#800080]/20',
    cta: 'Explore'
  }
];

export default function DashboardSlider() {
  return (
    <div className="relative w-full overflow-hidden mb-8 px-4">
      <div className="max-w-none mx-auto">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            renderBullet: function(index: number, className: string) {
              return `<span class="${className} !w-3 !h-3 !bg-white/20 hover:!bg-[#00ffff]/50 !opacity-100 !mx-2 transition-all duration-300 hover:!scale-125 hover:!shadow-[0_0_10px_rgba(0,255,255,0.5)]"></span>`;
            }
          }}
          navigation={{
            nextEl: '.custom-swiper-next',
            prevEl: '.custom-swiper-prev',
          }}
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px] rounded-2xl
            [&_.swiper-pagination]:!bottom-6
            [&_.swiper-pagination-bullet-active]:!bg-[#00ffff]
            [&_.swiper-pagination-bullet-active]:!scale-125
            [&_.swiper-pagination-bullet-active]:!shadow-[0_0_10px_rgba(0,255,255,0.5)]
            shadow-[0_0_30px_rgba(0,255,255,0.1)]
            before:content-[''] before:absolute before:inset-0 before:z-[-1]
            before:bg-gradient-to-r before:from-[#00ffff]/5 before:via-transparent before:to-[#00ffff]/5"
        >
          {/* Custom Navigation Buttons */}
          <button className="custom-swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-10
            w-12 h-12 bg-black/30 rounded-full backdrop-blur-sm
            border border-white/10 text-white/70 hover:text-[#00ffff] hover:border-[#00ffff]/30
            hover:bg-black/50 transition-all duration-300 flex items-center justify-center group">
            <FaChevronLeft className="w-5 h-5" />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
              transition-opacity duration-300 bg-[#00ffff]/10" />
          </button>
          <button className="custom-swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-10
            w-12 h-12 bg-black/30 rounded-full backdrop-blur-sm
            border border-white/10 text-white/70 hover:text-[#00ffff] hover:border-[#00ffff]/30
            hover:bg-black/50 transition-all duration-300 flex items-center justify-center group">
            <FaChevronRight className="w-5 h-5" />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
              transition-opacity duration-300 bg-[#00ffff]/10" />
          </button>

          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              <div className="relative w-full h-full group">
                {/* Background Image with Enhanced Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700
                    group-hover:scale-105"
                  style={{ 
                    backgroundImage: `url(${slide.image})`,
                    filter: 'brightness(0.4) contrast(1.2)',
                  }}
                />
                
                {/* Animated Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} 
                  mix-blend-overlay opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`${righteous.className} relative flex flex-col items-center`}
                  >
                    {/* Icon with Glow Effect */}
                    <div className="mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-500">
                      <div className="relative">
                        <slide.icon className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-90" />
                        <div className="absolute inset-0 blur-lg bg-white/30 scale-150" />
                      </div>
                    </div>
                    
                    {/* Subtitle */}
                    <div className="text-xs sm:text-sm tracking-[0.3em] text-[#00ffff]/80 mb-2">
                      {slide.subtitle}
                    </div>
                    
                    {/* Split Title with Animation */}
                    <div className="text-center mb-2 sm:mb-4">
                      {slide.title.map((part, index) => (
                        <h2 key={index} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold 
                          text-white tracking-wider [text-shadow:_0_0_10px_rgba(255,255,255,0.5)]
                          group-hover:tracking-widest transition-all duration-500">
                          {part}
                        </h2>
                      ))}
                    </div>
                    
                    {/* Animated Decorative Line */}
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent 
                      mb-4 group-hover:w-32 transition-all duration-500" />
                    
                    {/* Description with Glass Effect */}
                    <div className="relative backdrop-blur-sm bg-white/10 rounded-xl p-3 sm:p-4 
                      transform group-hover:scale-105 transition-all duration-500
                      border border-white/10 group-hover:border-white/20">
                      <p className="text-sm sm:text-base md:text-lg text-white/90 text-center max-w-2xl">
                        {slide.description}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <button className="mt-6 px-6 py-2 bg-[#00ffff]/20 text-[#00ffff] rounded-lg
                      border border-[#00ffff]/30 hover:bg-[#00ffff]/30 
                      transition-all duration-300 text-sm sm:text-base
                      transform hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                      {slide.cta}
                    </button>
                  </motion.div>
                </div>

                {/* Enhanced Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-40 
                  bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Enhanced Side Decorations */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 w-0.5 h-32 
          bg-gradient-to-b from-transparent via-[#00ffff]/30 to-transparent hidden lg:block
          group-hover:h-40 transition-all duration-500" />
        <div className="absolute top-1/2 -translate-y-1/2 right-4 w-0.5 h-32 
          bg-gradient-to-b from-transparent via-[#00ffff]/30 to-transparent hidden lg:block
          group-hover:h-40 transition-all duration-500" />
      </div>
    </div>
  );
}
