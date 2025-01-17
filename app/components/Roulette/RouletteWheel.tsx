'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { IoInformationCircleOutline, IoReloadCircle, IoArrowBack } from 'react-icons/io5';
import Link from 'next/link';

const prizes = [
  { name: '500 XP', color: '#00ffff', weight: 15 },
  { name: 'ONE MORE SPIN\nTRY AGAIN', color: '#FF3366', weight: 20 },
  { name: 'DIAMONDS X\n250', color: '#33FF99', weight: 10 },
  { name: 'WEEKLY DRAW\nTICKET X3', color: '#FF9933', weight: 8 },
  { name: '100 XP', color: '#3366FF', weight: 25 },
  { name: 'CLOSED BUT\nNO DONUT', color: '#FF33FF', weight: 30 },
  { name: 'DIAMONDS X\n500', color: '#FFFF33', weight: 5 },
  { name: 'MONTHLY\nTICKET DRAW', color: '#33FFFF', weight: 3 },
  { name: 'DIAMONDS X\n1000', color: '#FF3333', weight: 2 },
  { name: '2500 XP', color: '#33FF33', weight: 4 },
  { name: 'MONTHLY DRAW\nX3', color: '#9933FF', weight: 3 },
  { name: '5000 XP', color: '#FF99FF', weight: 1 }
];

export default function RouletteWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const sliceDegrees = 360 / prizes.length;

  const getRandomPrize = () => {
    const totalWeight = prizes.reduce((acc, prize) => acc + prize.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < prizes.length; i++) {
      random -= prizes[i].weight;
      if (random <= 0) {
        return i;
      }
    }
    return 0;
  };

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);
    
    // Determine winning prize first
    const winningIndex = getRandomPrize();
    
    // Calculate required rotation to land on the winning prize
    const baseSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
    const targetDegree = 360 - (winningIndex * sliceDegrees); // Degrees needed to land on prize
    const spinDegrees = (baseSpins * 360) + targetDegree + Math.random() * (sliceDegrees * 0.8);
    
    setRotation(prevRotation => prevRotation + spinDegrees);

    // Show result after spin
    spinTimeoutRef.current = setTimeout(() => {
      setResult(prizes[winningIndex].name);
      setSpinning(false);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#002222] py-4 sm:py-6 md:py-10 px-2 sm:px-4 relative overflow-hidden">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-lg border-b border-[#00ffff]/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[#00ffff] hover:text-[#00ffff]/80 
                  transition-all duration-300 group px-4 py-2 rounded-lg
                  hover:bg-[#00ffff]/5 border border-transparent
                  hover:border-[#00ffff]/20"
              >
                <IoArrowBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="text-white/60 text-sm">
              Prize Wheel
            </div>
          </div>
        </div>
      </div>

      {/* Add top padding to account for fixed nav */}
      <div className="pt-20">
        <Card className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto bg-black/40 backdrop-blur-xl border-[#00ffff] relative">
          <CardHeader className="pb-0 relative">
            <div className="flex items-center justify-between px-4">
              <CardTitle className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold py-3 sm:py-4 md:py-6 text-[#00ffff]">
                Prize Wheel
              </CardTitle>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 text-[#00ffff] hover:text-[#00ffff]/80 transition-colors group"
                >
                  <IoReloadCircle className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-sm sm:text-base">Reload</span>
                </button>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="flex items-center gap-2 text-[#00ffff] hover:text-[#00ffff]/80 transition-colors"
                >
                  <IoInformationCircleOutline className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-sm sm:text-base">How It Works</span>
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-2 sm:p-4 md:p-6">
            {/* Collapsible How It Works Section */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h2 className="text-[#00ffff] text-2xl md:text-3xl font-bold mb-4">
                      Spins!
                    </h2>
                    <p className="text-white/80 text-sm md:text-base mb-4 leading-relaxed">
                      Spin the Roulette and Win Big! Level up with every purchase to earn more spins and unlock exclusive prizes.
                    </p>
                    <p className="text-[#00ffff]/80 text-sm md:text-base font-medium">
                      Want more chances? You can also buy additional spins in the marketplace!
                    </p>
                    
                    {/* Prize Categories */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                      <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-[#00ffff]/10">
                        <div className="text-[#00ffff] font-bold mb-1">XP Rewards</div>
                        <div className="text-white/60 text-sm">Up to 5000 XP</div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-[#00ffff]/10">
                        <div className="text-[#00ffff] font-bold mb-1">Diamonds</div>
                        <div className="text-white/60 text-sm">Up to 1000 Diamonds</div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-[#00ffff]/10">
                        <div className="text-[#00ffff] font-bold mb-1">Draw Tickets</div>
                        <div className="text-white/60 text-sm">Weekly & Monthly</div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-[#00ffff]/10">
                        <div className="text-[#00ffff] font-bold mb-1">Extra Spins</div>
                        <div className="text-white/60 text-sm">Try Your Luck Again</div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#00ffff]/20 to-transparent mb-8" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wheel Container */}
            <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] 
              mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              
              {/* Wheel SVG */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full transform relative z-10"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                }}
              >
                {/* Outer ring */}
                <circle cx="50" cy="50" r="49" fill="#00ffff" />
                <circle cx="50" cy="50" r="48" fill="black" />
                
                {/* Prize segments */}
                {prizes.map((prize, index) => {
                  const rotation = index * sliceDegrees;
                  const textRotation = rotation + (sliceDegrees / 2);
                  const textRadius = 35;
                  const startAngle = -sliceDegrees / 4;
                  const textX = 50 + textRadius * Math.cos((textRotation - 90 + startAngle) * Math.PI / 180);
                  const textY = 50 + textRadius * Math.sin((textRotation - 90 + startAngle) * Math.PI / 180);

                  return (
                    <g key={index}>
                      {/* Main Segment Path */}
                      <path
                        d={`M50,50 L${50 + 45 * Math.cos((rotation - 90) * Math.PI / 180)},${50 + 45 * Math.sin((rotation - 90) * Math.PI / 180)} A45,45 0 0,1 ${50 + 45 * Math.cos((rotation + sliceDegrees - 90) * Math.PI / 180)},${50 + 45 * Math.sin((rotation + sliceDegrees - 90) * Math.PI / 180)} Z`}
                        fill={prize.color}
                      />

                      {/* Darker Inner Section for Text Contrast */}
                      <path
                        d={`M50,50 
                          L${50 + 40 * Math.cos((rotation - 90) * Math.PI / 180)},
                          ${50 + 40 * Math.sin((rotation - 90) * Math.PI / 180)} 
                          A40,40 0 0,1 
                          ${50 + 40 * Math.cos((rotation + sliceDegrees - 90) * Math.PI / 180)},
                          ${50 + 40 * Math.sin((rotation + sliceDegrees - 90) * Math.PI / 180)} Z`}
                        fill="rgba(0,0,0,0.3)"
                      />

                      {/* Text with Enhanced Visibility */}
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        transform={`rotate(${textRotation + startAngle + 90}, ${textX}, ${textY})`}
                        className="font-bold"
                      >
                        <defs>
                          {/* Enhanced Text Shadow */}
                          <filter id={`shadow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="0" stdDeviation="0.3" floodColor="black" floodOpacity="1"/>
                            <feDropShadow dx="0" dy="0" stdDeviation="0.2" floodColor="black" floodOpacity="1"/>
                          </filter>
                        </defs>
                        
                        {prize.name.split('\n').map((line, i) => (
                          <tspan 
                            key={i} 
                            x={textX} 
                            dy={i ? '2' : '0'}
                            style={{ 
                              fontSize: '2px',
                              filter: `url(#shadow-${index})`,
                              fill: 'white',
                            }}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>

                      {/* Subtle Highlight at Top of Segment */}
                      <path
                        d={`M50,50 
                          L${50 + 45 * Math.cos((rotation - 90) * Math.PI / 180)},
                          ${50 + 45 * Math.sin((rotation - 90) * Math.PI / 180)} 
                          A45,45 0 0,1 
                          ${50 + 45 * Math.cos((rotation + sliceDegrees/4 - 90) * Math.PI / 180)},
                          ${50 + 45 * Math.sin((rotation + sliceDegrees/4 - 90) * Math.PI / 180)}`}
                        fill="white"
                        fillOpacity="0.1"
                      />
                    </g>
                  );
                })}

                {/* Enhanced Center Piece */}
                <g>
                  <circle cx="50" cy="50" r="8" fill="#00ffff" />
                  <circle cx="50" cy="50" r="7.5" fill="black" />
                  <circle cx="50" cy="50" r="7" fill="#00ffff" fillOpacity="0.1" />
                  <circle cx="50" cy="50" r="6" fill="black" stroke="#00ffff" strokeWidth="0.5" />
                </g>
              </svg>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 sm:-translate-y-5 md:-translate-y-6 z-20">
                <div className="relative">
                  <div className="w-0 h-0 
                    border-l-[12px] border-r-[12px] border-b-[24px] 
                    sm:border-l-[16px] sm:border-r-[16px] sm:border-b-[32px]
                    md:border-l-[20px] md:border-r-[20px] md:border-b-[40px]
                    border-l-transparent border-r-transparent border-b-[#00ffff]
                    relative z-10" />
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
              <button 
                onClick={spin} 
                disabled={spinning}
                className="px-12 py-4 bg-[#00ffff] text-black text-2xl font-bold rounded-xl
                  hover:bg-[#00ffff]/80 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300"
              >
                {spinning ? 'Spinning...' : 'SPIN NOW'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-[85vw] max-w-[300px] sm:max-w-lg md:max-w-xl
              bg-black p-3 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl 
              border-2 sm:border-4 border-[#00ffff] z-50
              max-h-[90vh] overflow-y-auto"
          >
            <div className="text-lg sm:text-2xl md:text-4xl font-bold text-[#00ffff] text-center mb-2 sm:mb-4">
              <span className="whitespace-nowrap">🎉 Congratulations! ��</span>
            </div>
            <div className="text-base sm:text-2xl md:text-3xl font-bold text-white text-center">
              You won:
              <div className="mt-2 sm:mt-4 text-lg sm:text-3xl md:text-4xl text-[#00ffff] 
                break-words px-2 whitespace-normal">
                {result.replace('\n', ' ')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}