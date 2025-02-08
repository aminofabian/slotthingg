'use client'

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { IoInformationCircleOutline, IoReloadCircle, IoArrowBack, IoAdd, IoClose } from 'react-icons/io5';
import Link from 'next/link';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

type WheelMode = 'yesno' | 'custom';

interface Option {
  text: string;
  color: string;
}

const defaultColors = [
  '#00ffff', '#FF3366', '#33FF99', '#FF9933', '#3366FF',
  '#FF33FF', '#FFFF33', '#33FFFF', '#FF3333', '#33FF33',
  '#9933FF', '#FF99FF', '#66FF33', '#FF6633', '#3399FF'
];

const yesNoOptions: Option[] = [
  { text: 'YES', color: '#33FF99' },
  { text: 'NO', color: '#FF3366' }
];

export default function DecisionWheel() {
  const [mode, setMode] = useState<WheelMode>('yesno');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [customOptions, setCustomOptions] = useState<Option[]>([]);
  const [newOption, setNewOption] = useState('');

  const currentOptions = mode === 'yesno' ? yesNoOptions : customOptions;
  const sliceDegrees = 360 / currentOptions.length;

  const addOption = () => {
    if (newOption.trim() && customOptions.length < 15) {
      setCustomOptions([
        ...customOptions,
        {
          text: newOption.trim(),
          color: defaultColors[customOptions.length % defaultColors.length]
        }
      ]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setCustomOptions(customOptions.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addOption();
    }
  };

  const getRandomOption = () => {
    return Math.floor(Math.random() * currentOptions.length);
  };

  const spin = () => {
    if (spinning || (mode === 'custom' && customOptions.length < 2)) return;
    
    setSpinning(true);
    setResult(null);
    
    // Determine winning option first
    const winningIndex = getRandomOption();
    
    // Calculate required rotation to land on the winning option
    const baseSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
    const targetDegree = 360 - (winningIndex * sliceDegrees); // Degrees needed to land on option
    const spinDegrees = (baseSpins * 360) + targetDegree + Math.random() * (sliceDegrees * 0.8);
    
    setRotation(prevRotation => prevRotation + spinDegrees);

    // Show result after spin
    spinTimeoutRef.current = setTimeout(() => {
      setResult(currentOptions[winningIndex].text);
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
              Decision Wheel
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
                Decision Wheel
              </CardTitle>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 text-[#00ffff] hover:text-[#00ffff]/80 transition-colors group"
                >
                  <IoReloadCircle className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-sm sm:text-base">Reset</span>
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
            {/* Mode Selection */}
            <div className="flex justify-center gap-4 mb-8">
              <Button
                onClick={() => setMode('yesno')}
                className={`px-6 py-2 ${mode === 'yesno' ? 'bg-[#00ffff] text-black' : 'bg-black/40 text-[#00ffff]'} 
                  border border-[#00ffff] hover:bg-[#00ffff]/20`}
              >
                Yes/No
              </Button>
              <Button
                onClick={() => setMode('custom')}
                className={`px-6 py-2 ${mode === 'custom' ? 'bg-[#00ffff] text-black' : 'bg-black/40 text-[#00ffff]'} 
                  border border-[#00ffff] hover:bg-[#00ffff]/20`}
              >
                Custom Options
              </Button>
            </div>

            {/* Custom Options Input */}
            {mode === 'custom' && (
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter an option..."
                    className="bg-black/20 border-[#00ffff]/20 text-white placeholder:text-white/40
                      focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]"
                    maxLength={30}
                  />
                  <Button
                    onClick={addOption}
                    disabled={!newOption.trim() || customOptions.length >= 15}
                    className="bg-[#00ffff] text-black hover:bg-[#00ffff]/80 disabled:opacity-50"
                  >
                    <IoAdd className="w-5 h-5" />
                  </Button>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {customOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2
                        border border-[#00ffff]/20"
                    >
                      <span className="text-white truncate">{option.text}</span>
                      <button
                        onClick={() => removeOption(index)}
                        className="text-[#00ffff] hover:text-[#00ffff]/80 ml-2"
                      >
                        <IoClose className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {customOptions.length === 0 && (
                  <p className="text-white/60 text-center mt-4">
                    Add at least 2 options to spin the wheel
                  </p>
                )}
              </div>
            )}

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
                
                {/* Option segments */}
                {currentOptions.map((option, index) => {
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
                        fill={option.color}
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

                      {/* Text */}
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        transform={`rotate(${textRotation + startAngle + 90}, ${textX}, ${textY})`}
                        className="font-bold"
                        style={{ 
                          fontSize: mode === 'yesno' ? '6px' : '3px',
                          fill: 'white',
                          filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))'
                        }}
                      >
                        {option.text}
                      </text>

                      {/* Subtle Highlight */}
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

                {/* Center Piece */}
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
                disabled={spinning || (mode === 'custom' && customOptions.length < 2)}
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
              <span className="whitespace-nowrap">🎲 The Decision is...</span>
            </div>
            <div className="text-base sm:text-2xl md:text-3xl font-bold text-white text-center">
              <div className="mt-2 sm:mt-4 text-lg sm:text-3xl md:text-4xl text-[#00ffff] 
                break-words px-2 whitespace-normal">
                {result}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 