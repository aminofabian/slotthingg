'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Righteous } from 'next/font/google';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const righteous = Righteous({ 
  weight: ['400'],
  subsets: ['latin']
});

const DashboardContent = () => {
  const slides = [
    {
      id: 1,
      image: '/14.jpg',
      title: 'Welcome to Slot Games',
      description: 'Experience the thrill of gaming'
    },
    {
      id: 2,
      image: '/111.png',
      title: 'Daily Rewards',
      description: 'Claim your daily bonuses'
    },
    {
      id: 3,
      image: '/12.jpg',
      title: 'New Games Available',
      description: 'Check out our latest additions'
    }
  ];

  return (
    <div className="relative w-full h-[33vh] max-w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div className="relative w-full h-full">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  filter: 'brightness(0.8) contrast(1.1)',
                  clipPath: 'inset(0)'
                }}
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`${righteous.className} relative flex flex-col items-center
                  px-8 py-5 mx-4
                  bg-gradient-to-r from-black/40 via-black/60 to-black/40
                  backdrop-blur-sm rounded-2xl border border-[#7ffdfd]/20
                  animate-[bounce_4s_ease-in-out_infinite]`}>
                  
                  <div className="relative group">
                    <h2 className="text-[2.75rem] text-center leading-tight">
                      <span className="relative inline-block px-3 py-1">
                        {/* Playful background shapes */}
                        <span className="absolute inset-0 bg-gradient-to-r from-[#7ffdfd]/5 via-[#7ffdfd]/10 to-[#7ffdfd]/5
                          rounded-xl -rotate-1 scale-105 group-hover:rotate-1 transition-transform duration-300" />
                        
                        {/* Main text */}
                        <span className="relative block text-[#7ffdfd]/90
                          group-hover:scale-105 transition-transform duration-300
                          [text-shadow:_2px_2px_2px_rgba(0,0,0,0.5)]">
                          {slide.title}
                        </span>
                        
                        {/* Bouncing stars */}
                        <span className="absolute -top-4 -right-4 text-[#7ffdfd]/70 text-2xl
                          animate-[bounce_1s_ease-in-out_infinite]">★</span>
                        <span className="absolute -bottom-4 -left-4 text-[#7ffdfd]/70 text-2xl
                          animate-[bounce_1s_ease-in-out_infinite_0.5s]">★</span>
                      </span>
                    </h2>
                  </div>
                  
                  <p className="mt-3 text-xl text-center font-light text-[#7ffdfd]/80
                    group-hover:-translate-y-1 transition-transform duration-300
                    [text-shadow:_1px_1px_1px_rgba(0,0,0,0.5)]">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default DashboardContent;
