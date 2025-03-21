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
    title: ['EPIC', 'SLOTS'],
    subtitle: 'LEVEL UP YOUR GAME',
    description: '🎮 Join thousands of players in the ultimate gaming experience',
    icon: FaGamepad,
    gradient: 'from-[#00ffff]/30 via-[#4d4dff]/30 to-[#0000ff]/30',
    cta: '▶ PLAY NOW',
    glowColor: '#00ffff'
  },
  {
    id: 2,
    image: '/111.png',
    title: ['DAILY', 'LOOT'],
    subtitle: 'CLAIM YOUR REWARDS',
    description: '💎 Epic rewards and treasures await brave players',
    icon: GiTakeMyMoney,
    gradient: 'from-[#ffd700]/30 via-[#ffa500]/30 to-[#ff8c00]/30',
    cta: '🎁 CLAIM NOW',
    glowColor: '#ffd700'
  },
  {
    id: 3,
    image: '/12.jpg',
    title: ['NEW', 'QUESTS'],
    subtitle: 'UNLOCK ACHIEVEMENTS',
    description: '⚔️ Embark on new adventures with exclusive games',
    icon: GiStarsStack,
    gradient: 'from-[#ff00ff]/30 via-[#ff1493]/30 to-[#ff69b4]/30',
    cta: '🎲 EXPLORE',
    glowColor: '#ff00ff'
  }
];

export default function DashboardSlider() {
  return (
    <div className="relative w-full overflow-hidden mb-8">
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
              const colors = ['#00ffff', '#ffd700', '#ff00ff'];
              return `<span class="${className} !w-4 !h-4 !bg-white/20 !opacity-100 !mx-2 transition-all duration-300 
                hover:!scale-150 hover:!shadow-[0_0_15px_${colors[index]}] cursor-pointer
                before:content-[''] before:absolute before:inset-0 before:rounded-full before:animate-ping 
                before:bg-${colors[index]}/30"></span>`;
            }
          }}
          navigation={{
            nextEl: '.custom-swiper-next',
            prevEl: '.custom-swiper-prev',
          }}
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px] rounded-2xl
            [&_.swiper-pagination]:!bottom-8
            [&_.swiper-pagination-bullet-active]:!bg-[#00ffff]
            [&_.swiper-pagination-bullet-active]:!scale-150
            [&_.swiper-pagination-bullet-active]:!shadow-[0_0_20px_rgba(0,255,255,0.7)]
            shadow-[0_0_50px_rgba(0,255,255,0.2)]
            before:content-[''] before:absolute before:inset-0 before:z-[-1]
            before:bg-[radial-gradient(circle,rgba(0,255,255,0.1)_0%,transparent_70%)]"
        >
          {/* Custom Navigation Buttons */}
          <button className="custom-swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-10
            w-14 h-14 bg-black/40 rounded-full backdrop-blur-md
            border-2 border-white/20 text-white hover:text-[#00ffff] hover:border-[#00ffff]
            hover:bg-black/60 transition-all duration-300 flex items-center justify-center group
            hover:scale-110 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]">
            <FaChevronLeft className="w-6 h-6" />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
              transition-opacity duration-300 bg-[#00ffff]/20 animate-pulse" />
          </button>
          <button className="custom-swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-10
            w-14 h-14 bg-black/40 rounded-full backdrop-blur-md
            border-2 border-white/20 text-white hover:text-[#00ffff] hover:border-[#00ffff]
            hover:bg-black/60 transition-all duration-300 flex items-center justify-center group
            hover:scale-110 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]">
            <FaChevronRight className="w-6 h-6" />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
              transition-opacity duration-300 bg-[#00ffff]/20 animate-pulse" />
          </button>

          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              <div className="relative w-full h-full group cursor-pointer">
                {/* Background Image with Enhanced Effects */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000
                    group-hover:scale-105"
                  style={{ 
                    backgroundImage: `url(${slide.image})`,
                    filter: 'brightness(0.7) contrast(1.1) saturate(1.3)',
                  }}
                />
                
                {/* Dynamic Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} 
                  mix-blend-overlay opacity-40 group-hover:opacity-60 transition-all duration-700`} />
                
                {/* Content Container with Strategic Positioning */}
                <div className="absolute inset-0 flex items-end justify-start p-8 sm:p-12 md:p-16 lg:p-20">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={`${righteous.className} relative flex flex-col items-start max-w-[600px]`}
                  >
                    {/* Enhanced Icon with Pulse Effect */}
                    <div className="mb-4 sm:mb-6 transform group-hover:scale-125 transition-transform duration-700">
                      <div className="relative">
                        <slide.icon className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-90
                          animate-float" />
                        <div className="absolute inset-0 blur-xl bg-white/20 scale-150
                          animate-pulse-slow" style={{ boxShadow: `0 0 40px ${slide.glowColor}` }} />
                      </div>
                    </div>
                    
                    {/* Enhanced Subtitle */}
                    <div className="text-sm sm:text-base tracking-[0.4em] text-white mb-2
                      animate-pulse-text font-bold" style={{ textShadow: `0 0 10px ${slide.glowColor}` }}>
                      {slide.subtitle}
                    </div>
                    
                    {/* Enhanced Split Title with Animation */}
                    <div className="mb-3 sm:mb-4">
                      {slide.title.map((part, index) => (
                        <h2 key={index} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black 
                          text-white tracking-wider leading-tight
                          group-hover:tracking-widest transition-all duration-700" 
                          style={{ textShadow: `0 0 30px rgba(0,0,0,0.8), 0 0 20px ${slide.glowColor}` }}>
                          {part}
                        </h2>
                      ))}
                    </div>
                    
                    {/* Enhanced Decorative Line */}
                    <div className="w-32 h-1 bg-gradient-to-r from-white via-white to-transparent 
                      mb-4 group-hover:w-48 transition-all duration-700" />
                    
                    {/* Enhanced Description with Minimal Glass Effect */}
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 
                      transform group-hover:translate-x-4 transition-all duration-700
                      border border-white/20 max-w-lg">
                      <p className="text-base sm:text-lg text-white text-left font-medium">
                        {slide.description}
                      </p>
                    </div>

                    {/* Enhanced CTA Button */}
                    <button className="mt-6 px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl
                      border border-white/40 hover:border-white/80 
                      transition-all duration-500 text-base sm:text-lg font-bold
                      transform hover:translate-x-4 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]
                      relative overflow-hidden">
                      <span className="relative z-10">{slide.cta}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>
                  </motion.div>
                </div>

                {/* Subtle Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 
                  bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Minimal Side Decorations */}
        <div className="absolute top-1/2 -translate-y-1/2 left-8 w-px h-32 
          bg-gradient-to-b from-transparent via-white/30 to-transparent hidden lg:block
          group-hover:h-48 transition-all duration-700" />
        <div className="absolute top-1/2 -translate-y-1/2 right-8 w-px h-32 
          bg-gradient-to-b from-transparent via-white/30 to-transparent hidden lg:block
          group-hover:h-48 transition-all duration-700" />
      </div>
    </div>
  );
}