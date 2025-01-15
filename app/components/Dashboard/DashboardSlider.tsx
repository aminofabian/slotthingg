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
        className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div className="relative w-full h-full">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  filter: 'brightness(0.7) contrast(1.1)',
                  clipPath: 'inset(0)'
                }}
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                <div className={`${righteous.className} relative flex flex-col items-center`}>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 text-center">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/90 text-center max-w-2xl px-2">
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
}
