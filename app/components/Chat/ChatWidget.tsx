'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { FaWhatsapp, FaTelegram, FaComments } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

type MotionButtonProps = HTMLMotionProps<"button"> & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children?: React.ReactNode;
};

type MotionAnchorProps = HTMLMotionProps<"a"> & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  className?: string;
  children?: React.ReactNode;
};

const MotionDiv = motion.div as React.FC<MotionDivProps>;
const MotionButton = motion.button as React.FC<MotionButtonProps>;
const MotionAnchor = motion.a as React.FC<MotionAnchorProps>;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Create a pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 120) % 360);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chatOptions = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="w-7 h-7" />,
      color: '#25D366',
      link: 'https://wa.me/your-number-here'
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="w-7 h-7" />,
      color: '#0088cc',
      link: 'https://t.me/your-username'
    },
    {
      name: 'Message',
      icon: <FaComments className="w-7 h-7" />,
      color: '#007AFF',
      link: 'sms:your-number-here'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    })
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-20 right-0 bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 w-72 border border-gray-800"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                Contact Us
              </h3>
              <MotionButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <IoMdClose className="w-6 h-6" />
              </MotionButton>
            </div>
            <div className="space-y-3">
              {chatOptions.map((option, index) => (
                <MotionAnchor
                  key={option.name}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden"
                  style={{
                    backgroundColor: `${option.color}15`,
                  }}
                >
                  <MotionDiv
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(45deg, ${option.color}15, ${option.color}30)`,
                    }}
                  />
                  <MotionDiv
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10"
                    style={{ color: option.color }}
                  >
                    {option.icon}
                  </MotionDiv>
                  <span className="font-medium text-gray-200 relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                    {option.name}
                  </span>
                </MotionAnchor>
              ))}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group w-16 h-16"
        >
          {/* Orbital rings */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-primary/30 animate-spin"
            style={{ animationDuration: '15s' }}
          />
          <div 
            className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin"
            style={{ animationDuration: '10s', animationDirection: 'reverse' }}
          />
          
          {/* Glowing background effects */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-indigo-600 blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 to-indigo-600/50 blur-md animate-pulse" />
          
          {/* Main button background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 rounded-full shadow-lg transform transition-transform duration-500 group-hover:scale-110">
            {/* Sparkles */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${20 + i * 25}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Icon container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative transform transition-transform duration-500 group-hover:scale-110">
              {/* Rotating outer icon */}
              <FaComments 
                className="w-8 h-8 text-white/30 absolute"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              {/* Static center icon */}
              <FaComments className="w-8 h-8 text-white transform group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;