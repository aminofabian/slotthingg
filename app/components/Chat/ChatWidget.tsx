'use client';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaWhatsapp, FaTelegram, FaComments } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { MotionDiv, MotionButton, MotionAnchor } from '@/app/types/motion';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="w-6 h-6" />,
      link: 'https://wa.me/1234567890',
      color: '#25D366'
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="w-6 h-6" />,
      link: 'https://t.me/yourusername',
      color: '#0088cc'
    },
    {
      name: 'Live Chat',
      icon: <FaComments className="w-6 h-6" />,
      link: '#',
      color: '#00ffff'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <MotionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#002222] text-[#00ffff] p-3 rounded-full shadow-lg border border-[#00ffff]/10
          hover:bg-[#003333] transition-colors duration-300"
      >
        {isOpen ? (
          <IoMdClose className="w-6 h-6" />
        ) : (
          <FaComments className="w-6 h-6" />
        )}
      </MotionButton>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-4 bg-[#002222] rounded-2xl p-4 shadow-xl border border-[#00ffff]/10 z-50"
          >
            <div className="space-y-2">
              {contactOptions.map((option) => (
                <MotionAnchor
                  key={option.name}
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl relative group overflow-hidden"
                  style={{
                    background: `linear-gradient(45deg, ${option.color}10, ${option.color}20)`,
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
                    className="w-10 h-10 flex items-center justify-center rounded-lg relative z-10"
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
    </div>
  );
};

export default ChatWidget;