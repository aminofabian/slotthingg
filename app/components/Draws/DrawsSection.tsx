'use client';
import { useEffect, useState } from 'react';
import DrawCard from './DrawCard';
import { BiQuestionMark, BiTime } from 'react-icons/bi';
import { FaTicketAlt, FaGift } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FaDiamond } from 'react-icons/fa6';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

const DrawsSection = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [time, setTime] = useState({
    weekly: {
      days: 4,
      hours: 3,
      minutes: 53,
      seconds: 58
    },
    monthly: {
      days: 16,
      hours: 9,
      minutes: 53,
      seconds: 58
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => {
        const updateTimeBlock = (time: typeof prevTime.weekly) => {
          let { days, hours, minutes, seconds } = time;
          seconds--;
          
          if (seconds < 0) {
            seconds = 59;
            minutes--;
          }
          if (minutes < 0) {
            minutes = 59;
            hours--;
          }
          if (hours < 0) {
            hours = 23;
            days--;
          }
          if (days < 0) {
            days = 0;
            hours = 0;
            minutes = 0;
            seconds = 0;
          }
          
          return { days, hours, minutes, seconds };
        };

        return {
          weekly: updateTimeBlock(prevTime.weekly),
          monthly: updateTimeBlock(prevTime.monthly)
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FaTicketAlt className="w-6 h-6" />,
      title: "Earn Tickets",
      description: "Level up your account to earn free draw tickets. Higher levels mean more tickets!"
    },
    {
      icon: <FaDiamond className="w-6 h-6" />,
      title: "Buy Extra Tickets",
      description: "Purchase additional tickets using diamonds to increase your winning chances."
    },
    {
      icon: <FaGift className="w-6 h-6" />,
      title: "Win Prizes",
      description: "Win exclusive rewards, diamonds, and special items in weekly and monthly draws."
    },
    {
      icon: <BiTime className="w-6 h-6" />,
      title: "Regular Draws",
      description: "Participate in weekly draws for regular rewards and monthly draws for bigger prizes."
    }
  ];

  return (
    <div className="min-h-screen bg-[#002222] pt-20 pb-24">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-lg border-b border-[#00ffff]/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[#00ffff] hover:text-[#00ffff]/80 
                  transition-colors p-2 rounded-lg hover:bg-[#00ffff]/5"
              >
                <IoArrowBack className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="text-white/60 text-sm">
              Draw System
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Draws</h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/20
                hover:bg-[#00ffff]/20 transition-all duration-300"
            >
              <BiQuestionMark className="w-5 h-5" />
              How it Works
            </button>
          </div>

          {/* How it Works Section */}
          <motion.div
            initial={false}
            animate={{ height: showInfo ? 'auto' : 0, opacity: showInfo ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-[#00ffff]/5 to-transparent 
              rounded-2xl border border-[#00ffff]/10 p-6 mb-8">
              <div className="max-w-3xl mx-auto">
                {/* Introduction */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Welcome to Our Draw System
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Participate in our exciting draw events for a chance to win amazing prizes! 
                    Our draw system rewards active players with opportunities to win big.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex gap-4 p-4 rounded-xl bg-[#00ffff]/5 
                        border border-[#00ffff]/10 hover:border-[#00ffff]/30
                        transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg 
                        bg-[#00ffff]/10 flex items-center justify-center
                        text-[#00ffff]">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 rounded-xl bg-[#00ffff]/5 border border-[#00ffff]/10">
                  <h4 className="text-white font-medium mb-2">Important Notes:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff] mt-2" />
                      <span>Minimum account level 5 required to participate in draws</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff] mt-2" />
                      <span>Weekly draws reset every Monday at 00:00 UTC</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff] mt-2" />
                      <span>Monthly draws occur on the first day of each month</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Draw Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <DrawCard type="Weekly" {...time.weekly} />
          <DrawCard type="Monthly" {...time.monthly} />
        </div>
      </div>
    </div>
  );
};

export default DrawsSection; 