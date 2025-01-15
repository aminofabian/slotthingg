'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Righteous } from 'next/font/google';
import { FaGamepad } from 'react-icons/fa';
import { GiTakeMyMoney, GiStarsStack } from 'react-icons/gi';
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
    title: 'Welcome to Slot Games',
    description: 'Experience the thrill of gaming',
    icon: FaGamepad,
    gradient: 'from-[#00ffff]/20 to-[#009999]/20'
  },
  {
    id: 2,
    image: '/111.png',
    title: 'Daily Rewards',
    description: 'Claim your daily bonuses',
    icon: GiTakeMyMoney,
    gradient: 'from-[#ffff00]/20 to-[#ffa500]/20'
  },
  {
    id: 3,
    image: '/12.jpg',
    title: 'New Games Available',
    description: 'Check out our latest additions',
    icon: GiStarsStack,
    gradient: 'from-[#ff00ff]/20 to-[#800080]/20'
  }
];

export default function DashboardSlider() {
  return (
    <div className="relative w-full overflow-hidden mb-8">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] rounded-2xl"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div className="relative w-full h-full">
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  filter: 'brightness(0.5) contrast(1.2)',
                }}
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} mix-blend-overlay`} />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                <div className={`${righteous.className} relative flex flex-col items-center transform transition-all duration-700`}>
                  {/* Icon */}
                  <div className="mb-4 sm:mb-6">
                    <slide.icon className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-90" />
                  </div>
                  
                  {/* Title with Glowing Effect */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 text-center
                    relative z-10 tracking-wider [text-shadow:_0_0_10px_rgba(255,255,255,0.5)]">
                    {slide.title}
                  </h2>
                  
                  {/* Decorative Line */}
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mb-4 opacity-70" />
                  
                  {/* Description with Glass Effect */}
                  <div className="relative backdrop-blur-sm bg-white/10 rounded-xl p-3 sm:p-4 transform hover:scale-105 transition-transform duration-300">
                    <p className="text-sm sm:text-base md:text-lg text-white/90 text-center max-w-2xl">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Side Decorations */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
      <div className="absolute top-1/2 -translate-y-1/2 right-4 w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
    </div>
  );
}
