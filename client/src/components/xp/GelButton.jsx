import React from 'react';
import { sounds } from '../../utils/soundManager';

export default function GelButton({
  children,
  variant = 'green', // 'green', 'blue', 'silver', 'red'
  onClick,
  disabled = false,
  className = '',
  icon,
  type = 'button'
}) {
  const handleClick = (e) => {
    if (disabled) return;
    sounds.playClick();
    if (onClick) onClick(e);
  };

  const getVariantStyles = () => {
    if (disabled) {
      return 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60';
    }
    switch (variant) {
      case 'green':
        return 'flat-btn-green text-white';
      case 'blue':
        return 'flat-btn-primary text-white';
      case 'red':
        return 'flat-btn-red text-white';
      case 'silver':
      default:
        return 'flat-btn-secondary';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-bold px-4 py-2 rounded-lg text-xs tracking-wide transition-colors duration-150 cursor-pointer select-none active:scale-[0.99] ${getVariantStyles()} ${className}`}
    >
      {icon && <span className="mr-1.5 flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
