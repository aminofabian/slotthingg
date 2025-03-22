'use client';
import { useState } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { BiTime, BiInfoCircle } from 'react-icons/bi';
import { FaTicketAlt } from 'react-icons/fa';

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  children?: React.ReactNode;
};

type MotionSpanProps = HTMLMotionProps<"span"> & {
  className?: string;
  children?: React.ReactNode;
};

const MotionDiv = motion.div as React.FC<MotionDivProps>;
const MotionSpan = motion.span as React.FC<MotionSpanProps>;

interface DrawCardProps {
  type: 'Weekly' | 'Monthly';
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DrawCard = ({ type, days, hours, minutes, seconds }: DrawCardProps) => {
  const [showInfo, setShowInfo] = useState(false);

  const timeBlocks = [
    { value: days, label: 'DAYS' },
    { value: hours, label: 'HOURS' },
    { value: minutes, label: 'MINS' },
    { value: seconds, label: 'SECS' },
  ];

  const getDrawInfo = (type: 'Weekly' | 'Monthly') => {
    if (type === 'Weekly') {
      return {
        title: 'Weekly Draw',
        description: 'Join the Weekly Draw and Win Big! Level up with every purchase to earn more tickets for weekly and monthly draws.',
        additionalInfo: 'Want even more chances? Purchase additional tickets in the marketplace and boost your odds of winning!',
        ticketCost: 100,
      };
    }
    return {
      title: 'Monthly Draw',
      description: 'Participate in our biggest monthly draw event! Accumulate tickets throughout the month for bigger prizes.',
      additionalInfo: 'Monthly draws feature exclusive rewards and higher winning chances!',
      ticketCost: 250,
    };
  };

  const drawInfo = getDrawInfo(type);

  return (
    <div className="relative bg-gradient-to-br from-[#002222] to-black 
      rounded-2xl border border-[#00ffff]/10 overflow-hidden group">
      {/* Header */}
      <div className="p-6 border-b border-[#00ffff]/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FaTicketAlt className="w-5 h-5 text-[#00ffff]" />
            <h3 className="text-lg font-bold text-white">{type} Ticket</h3>
          </div>
          <BiTime className="w-6 h-6 text-[#00ffff]/70" />
        </div>
        <p className="text-xl font-bold text-[#00ffff]">{type} Draw</p>
      </div>

      {/* Countdown */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-3">
          {timeBlocks.map((block, index) => (
            <div key={index} className="text-center">
              <div className="bg-[#00ffff]/10 rounded-xl p-3 backdrop-blur-sm
                border border-[#00ffff]/20 group-hover:border-[#00ffff]/30 
                transition-all duration-300">
                <MotionSpan 
                  key={block.value}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="block text-2xl font-bold text-white mb-1"
                >
                  {block.value.toString().padStart(2, '0')}
                </MotionSpan>
                <span className="text-xs text-[#00ffff]/70">{block.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Button */}
      <div className="p-6 pt-0">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full flex items-center justify-center gap-2 py-3 
            rounded-xl border border-[#00ffff]/20 
            text-[#00ffff] text-sm font-medium
            hover:bg-[#00ffff]/10 transition-all duration-300"
        >
          <BiInfoCircle className="w-5 h-5" />
          {showInfo ? 'Hide info' : 'Show more info'}
        </button>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-4">
              <div className="p-4 rounded-xl bg-[#00ffff]/5 border border-[#00ffff]/10">
                <h4 className="text-white font-medium mb-3">How it works</h4>
                <div className="space-y-4">
                  <p className="text-white/70 text-sm leading-relaxed">
                    {drawInfo.description}
                  </p>
                  
                  <p className="text-[#00ffff]/70 text-sm italic">
                    {drawInfo.additionalInfo}
                  </p>

                  <div className="space-y-2 mt-4">
                    <h5 className="text-white/90 text-sm font-medium">Rules & Requirements:</h5>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#00ffff]" />
                        Each ticket costs {drawInfo.ticketCost} diamonds
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#00ffff]" />
                        Multiple tickets increase winning chances
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#00ffff]" />
                        Winners announced after countdown
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#00ffff]" />
                        Minimum level 5 required to participate
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 rounded-xl bg-[#00ffff]/10 
                  text-[#00ffff] font-medium border border-[#00ffff]/20
                  hover:bg-[#00ffff]/20 transition-all duration-300
                  flex items-center justify-center gap-2"
                >
                  <FaTicketAlt className="w-4 h-4" />
                  Buy Tickets
                </button>
                <button className="py-3 rounded-xl bg-white/5
                  text-white font-medium border border-white/10
                  hover:bg-white/10 transition-all duration-300
                  flex items-center justify-center gap-2"
                >
                  View Marketplace
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawCard; 