'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

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
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[#00ffff]/5" />
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              backgroundColor: prizes[Math.floor(Math.random() * prizes.length)].color + '80'
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto bg-black/40 backdrop-blur-xl border-[#00ffff] relative">
        <CardHeader className="pb-0 relative">
          <CardTitle className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold py-3 sm:py-4 md:py-6 text-[#00ffff]">
            Prize Wheel
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 p-2 sm:p-4 md:p-6">
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
                    <path
                      d={`M50,50 L${50 + 45 * Math.cos((rotation - 90) * Math.PI / 180)},${50 + 45 * Math.sin((rotation - 90) * Math.PI / 180)} A45,45 0 0,1 ${50 + 45 * Math.cos((rotation + sliceDegrees - 90) * Math.PI / 180)},${50 + 45 * Math.sin((rotation + sliceDegrees - 90) * Math.PI / 180)} Z`}
                      fill={prize.color}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="start"
                      transform={`rotate(${textRotation + startAngle}, ${textX}, ${textY})`}
                      style={{ fontSize: '2.5px' }}
                      fill="white"
                      stroke="black"
                      strokeWidth="0.3"
                      paintOrder="stroke"
                      className="font-bold"
                    >
                      {prize.name.split('\n').map((line, i) => (
                        <tspan 
                          key={i} 
                          x={textX} 
                          dy={i ? '2.5' : '0'}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}

              {/* Center piece */}
              <circle cx="50" cy="50" r="8" fill="#00ffff" />
              <circle cx="50" cy="50" r="7" fill="black" stroke="white" />
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

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-[90vw] max-w-md sm:max-w-lg md:max-w-xl
              bg-black p-8 rounded-2xl border-4 border-[#00ffff] z-50"
          >
            <div className="text-4xl font-bold text-[#00ffff] text-center mb-6">
              🎉 Congratulations! 🎉
            </div>
            <div className="text-3xl font-bold text-white text-center">
              You won:
              <div className="mt-4 text-4xl text-[#00ffff]">
                {result.replace('\n', ' ')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}