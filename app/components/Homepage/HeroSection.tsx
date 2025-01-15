'use client';
import React, { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link";

const imgs = [
  "/11.png",
  "/imgs/slots/slot2.jpg",
  "/imgs/slots/slot3.jpg",
  "/imgs/slots/slot4.jpg",
  "/imgs/slots/slot5.jpg",
];

const ONE_SECOND = 1000;
const AUTO_DELAY = ONE_SECOND * 10;
const DRAG_BUFFER = 50;

const SPRING_OPTIONS = {
  type: "spring",
  mass: 3,
  stiffness: 400,
  damping: 50,
};

const HeroSection = () => {
  const [imgIndex, setImgIndex] = useState(0);
  const dragX = useMotionValue(0);

  useEffect(() => {
    const intervalRef = setInterval(() => {
      const x = dragX.get();

      if (x === 0) {
        setImgIndex((pv) => {
          if (pv === imgs.length - 1) {
            return 0;
          }
          return pv + 1;
        });
      }
    }, AUTO_DELAY);

    return () => clearInterval(intervalRef);
  }, []);

  const onDragEnd = () => {
    const x = dragX.get();

    if (x <= -DRAG_BUFFER && imgIndex < imgs.length - 1) {
      setImgIndex((pv) => pv + 1);
    } else if (x >= DRAG_BUFFER && imgIndex > 0) {
      setImgIndex((pv) => pv - 1);
    }
  };

  return (
    <div className="relative min-h-[85vh] bg-[#004d4d]">
      {/* Carousel */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#004d4d]/40 z-[5]" />
        <motion.div
          drag="x"
          dragConstraints={{
            left: 0,
            right: 0,
          }}
          style={{
            x: dragX,
          }}
          animate={{
            translateX: `-${imgIndex * 100}%`,
          }}
          transition={SPRING_OPTIONS}
          onDragEnd={onDragEnd}
          className="flex h-full cursor-grab items-center active:cursor-grabbing"
        >
          <Images imgIndex={imgIndex} />
        </motion.div>

        <GradientEdges />
      </div>

      {/* Bottom Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#004d4d] to-transparent pt-32 pb-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="font-righteous text-4xl md:text-5xl text-white mb-6">
                Ready to Play?
              </h1>
              <Link 
                href="/play"
                className="inline-block bg-[#00ffff] text-[#004d4d] px-8 py-3 rounded-md
                         text-lg font-medium hover:bg-white transition-colors duration-200"
              >
                Start Now
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <Dots imgIndex={imgIndex} setImgIndex={setImgIndex} />
    </div>
  );
};

interface ImagesProps {
  imgIndex: number;
}

const Images = ({ imgIndex }: ImagesProps) => {
  return (
    <>
      {imgs.map((imgSrc, idx) => {
        return (
          <motion.div
            key={idx}
            style={{
              backgroundImage: `url(${imgSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            animate={{
              scale: imgIndex === idx ? 0.95 : 0.85,
              opacity: imgIndex === idx ? 1 : 0.5,
            }}
            transition={SPRING_OPTIONS}
            className="h-full w-screen shrink-0 bg-[#004d4d]"
          />
        );
      })}
    </>
  );
};

interface DotsProps {
  imgIndex: number;
  setImgIndex: (index: number) => void;
}

const Dots = ({ imgIndex, setImgIndex }: DotsProps) => {
  return (
    <div className="absolute bottom-8 flex w-full justify-center gap-2 z-20">
      {imgs.map((_, idx) => {
        return (
          <button
            key={idx}
            onClick={() => setImgIndex(idx)}
            className={`h-3 w-3 rounded-full transition-colors ${
              idx === imgIndex ? "bg-[#00ffff]" : "bg-white/30"
            }`}
          />
        );
      })}
    </div>
  );
};

const GradientEdges = () => {
  return (
    <>
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-[10vw] max-w-[100px] bg-gradient-to-r from-[#004d4d] to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[10vw] max-w-[100px] bg-gradient-to-l from-[#004d4d] to-transparent" />
    </>
  );
};

export default HeroSection;
