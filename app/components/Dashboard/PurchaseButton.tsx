import { BiMoney } from 'react-icons/bi';

interface PurchaseButtonProps {
  onClick: () => void;
  variant?: 'desktop' | 'mobile';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PurchaseButton = ({ 
  onClick, 
  variant = 'desktop', 
  size = 'md',
  className = '' 
}: PurchaseButtonProps) => {
  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: variant === 'desktop' ? 'py-3.5' : 'py-3 mb-3',
    lg: 'py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`
        rounded-xl
        bg-gradient-to-r from-[#00ffff]/20 to-[#00ffff]/10
        border border-[#00ffff]/30 hover:border-[#00ffff]/50
        text-[#00ffff] font-medium tracking-wide
        transition-all duration-200
        hover:from-[#00ffff]/30 hover:to-[#00ffff]/20
        active:scale-95
        flex items-center justify-center gap-2
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <BiMoney className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      Purchase Credits
    </button>
  );
};

export default PurchaseButton; 