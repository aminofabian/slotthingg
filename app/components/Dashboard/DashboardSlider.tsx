'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Righteous } from 'next/font/google';
import { FaGamepad, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiTakeMyMoney, GiStarsStack } from 'react-icons/gi';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { MotionDiv } from '@/app/types/motion';

const righteous = Righteous({ 
  weight: ['400'],
  subsets: ['latin']
});

const slides = [
  {
    id: 1,
    image: '/14.jpg',
    title: 'Stay Untamed',
    subtitle: 'Sign Up & Get',
    amount: 'UP TO $20,000.00',
    description: 'in Casino or Sports',
    gradient: 'from-[#00ff00]/20 via-[#00ff80]/20 to-[#0080ff]/20',
    cta: 'Join Now',
    crownImage: '/1.jpg',
    logoImage: '/11.jpeg'
  },
  {
    id: 2,
    image: '/15.jpg',
    title: 'Epic Rewards',
    subtitle: 'Daily Bonuses',
    amount: 'WIN UP TO $50,000',
    description: 'Exclusive VIP Benefits',
    gradient: 'from-[#FFD700]/20 via-[#FFA500]/20 to-[#FF8C00]/20',
    cta: 'Claim Now',
    crownImage: '/11.png',
    logoImage: '/12.png'
  },
  {
    id: 3,
    image: '/16.jpg',
    title: 'Premium Games',
    subtitle: 'New Release',
    amount: '500% BONUS',
    description: 'On Your First Deposit',
    gradient: 'from-[#FF1493]/20 via-[#FF69B4]/20 to-[#FFB6C1]/20',
    cta: 'Play Now',
    crownImage: '/13.png',
    logoImage: '/111.png'
  },
  {
    id: 4,
    image: '/17.jpeg',
    title: 'VIP Access',
    subtitle: 'Exclusive Member',
    amount: 'UNLIMITED REWARDS',
    description: 'Join Our Elite Club',
    gradient: 'from-[#4B0082]/20 via-[#8A2BE2]/20 to-[#9400D3]/20',
    cta: 'Join VIP',
    crownImage: '/11.webp',
    logoImage: '/12.jpg'
  },
  {
    id: 5,
    image: '/18.jpg',
    title: 'Tournament Time',
    subtitle: 'Compete Now',
    amount: '$100,000 PRIZE POOL',
    description: 'Weekly Championships',
    gradient: 'from-[#008000]/20 via-[#32CD32]/20 to-[#00FF00]/20',
    cta: 'Enter Now',
    crownImage: '/1.jpg',
    logoImage: '/11.png'
  }
];

export default function DashboardSlider() {
  return (
    <div className="relative w-full overflow-hidden mb-4 mt-0 sm:mb-8 sm:mt-6 lg:mt-16">
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
              return `<span class="${className} !w-2 !h-2 sm:!w-4 sm:!h-4 !bg-white/20 !opacity-100 !mx-1 sm:!mx-2 transition-all duration-300 
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
          className="w-full h-[120px] sm:h-[200px] md:h-[250px] lg:h-[300px] xl:h-[350px] 2xl:h-[400px] rounded-lg sm:rounded-2xl
            [&_.swiper-pagination]:!bottom-4 sm:[&_.swiper-pagination]:!bottom-8
            [&_.swiper-pagination-bullet-active]:!bg-white
            [&_.swiper-pagination-bullet-active]:!scale-100
            shadow-none overflow-hidden bg-[#1a1a1a]"
        >
          {/* Custom Navigation Buttons */}
          <button className="custom-swiper-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10
            w-8 h-8 sm:w-10 sm:h-10 bg-black/40 rounded-full
            border border-white/20 text-white/70
            flex items-center justify-center">
            <FaChevronLeft className="w-4 h-4" />
          </button>
          <button className="custom-swiper-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10
            w-8 h-8 sm:w-10 sm:h-10 bg-black/40 rounded-full
            border border-white/20 text-white/70
            flex items-center justify-center">
            <FaChevronRight className="w-4 h-4" />
          </button>

          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              <div className="relative w-full h-full">
                {/* Background Image with Enhanced Effects */}
                <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden">
                  <div 
                    className="absolute inset-0 transition-transform duration-700"
                    style={{ 
                      backgroundImage: `url(${slide.image})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'brightness(0.85)',
                    }}
                  />
                </div>
                
                {/* Dark Gradient for Left Side */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/95 to-[#1a1a1a]/20" />
                
                {/* Accent Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r from-[#00ff80]/10 to-transparent opacity-60`} />
                
                {/* Content Container */}
                <div className="absolute inset-0 flex items-center justify-between">
                  {/* Left Side Content */}
                  <MotionDiv 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative flex flex-col items-start w-[45%] z-10 px-4 sm:px-6 md:px-8 lg:px-12"
                  >
                    {/* Crown Icon */}
                    <div className="mb-2 sm:mb-3 md:mb-4 transform hover:scale-110 transition-transform duration-300">
                      <img 
                        src={slide.crownImage} 
                        alt="Crown" 
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain drop-shadow-[0_0_8px_rgba(0,255,128,0.5)]" 
                      />
                    </div>
                    
                    {/* Main Title */}
                    <h2 className={`${righteous.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold 
                      text-white mb-1 sm:mb-2 md:mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                      tracking-wide leading-tight`}>
                      {slide.title}
                    </h2>
                    
                    {/* Subtitle and Amount */}
                    <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
                      <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg font-medium tracking-wide">
                        {slide.subtitle}
                      </p>
                      <p className="text-[#00ff80] text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold
                        drop-shadow-[0_0_10px_rgba(0,255,128,0.3)] tracking-tight leading-tight">
                        {slide.amount}
                      </p>
                      <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg font-medium tracking-wide">
                        {slide.description}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <button className="mt-3 sm:mt-4 md:mt-6 px-6 sm:px-8 md:px-10 py-1.5 sm:py-2 md:py-3
                      bg-[#00ff80] text-black rounded-full
                      font-bold text-xs sm:text-sm md:text-base lg:text-lg
                      hover:bg-white transition-all duration-300
                      hover:transform hover:scale-105
                      shadow-[0_0_20px_rgba(0,255,128,0.3)]">
                      {slide.cta}
                    </button>
                  </MotionDiv>

                  {/* Right Side Logos */}
                  <div className="hidden lg:flex flex-col items-end space-y-4 pr-4 sm:pr-6 md:pr-8 z-10">
                    <img 
                      src={slide.logoImage} 
                      alt="Logo" 
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain rounded-xl
                        shadow-[0_0_20px_rgba(255,255,255,0.2)]
                        hover:transform hover:scale-110 transition-transform duration-300
                        bg-white/10 p-2" 
                    />
                  </div>
                </div>
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