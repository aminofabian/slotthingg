'use client';
import React, { useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";
import Link from "next/link";
import { MotionDiv } from '@/app/types/motion';

const imgs = [
  "/11.jpeg",
  "/1.jpg",
  "/11.jpeg",
  "/14.jpg",
  "/188.jpg",
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
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="relative h-full w-full">
        <MotionDiv
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
          className="flex items-center cursor-grab active:cursor-grabbing h-full"
        >
          <Images imgIndex={imgIndex} />
        </MotionDiv>
      </div>

      <GradientEdges />
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
          <MotionDiv
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

const GradientEdges = () => {
  return (
    <div className="pointer-events-none absolute inset-0 flex [mask-image:linear-gradient(to_right,black_0%,transparent_10%,transparent_90%,black_100%)]">
      <div className="h-full w-1/2 bg-gradient-to-r from-black" />
      <div className="h-full w-1/2 bg-gradient-to-l from-black" />
    </div>
  );
};

interface DotsProps {
  imgIndex: number;
  setImgIndex: (index: number) => void;
}

const Dots = ({ imgIndex, setImgIndex }: DotsProps) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute bottom-12 flex w-full justify-center gap-2"
    >
      {imgs.map((_, idx) => {
        return (
          <button
            key={idx}
            onClick={() => setImgIndex(idx)}
            className={`h-3 w-3 rounded-full transition-colors ${
              idx === imgIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        );
      })}
    </MotionDiv>
  );
};

export default HeroSection;
