import { BiMoney } from 'react-icons/bi';

interface PurchaseButtonProps {
  onClick: () => void;
  variant?: 'desktop' | 'mobile';
}

const PurchaseButton = ({ onClick, variant = 'desktop' }: PurchaseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl
        bg-gradient-to-r from-[#00ffff]/20 to-[#00ffff]/10
        border border-[#00ffff]/30 hover:border-[#00ffff]/50
        text-[#00ffff] font-medium tracking-wide
        transition-all duration-200
        hover:from-[#00ffff]/30 hover:to-[#00ffff]/20
        flex items-center justify-center gap-2
        ${variant === 'desktop' ? 'py-3.5' : 'py-3 mb-3'}`}
    >
      <BiMoney className="w-5 h-5" />
      Purchase Credits
    </button>
  );
};

export default PurchaseButton; 