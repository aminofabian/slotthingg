'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaTelegram, FaComments } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-16 right-0 bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 w-72 border border-gray-800"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Contact Us
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <IoMdClose className="w-6 h-6" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {chatOptions.map((option, index) => (
                <motion.a
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
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(45deg, ${option.color}15, ${option.color}30)`,
                    }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10"
                    style={{ color: option.color }}
                  >
                    {option.icon}
                  </motion.div>
                  <span className="font-medium text-gray-200 relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                    {option.name}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaComments className="w-7 h-7" />
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
