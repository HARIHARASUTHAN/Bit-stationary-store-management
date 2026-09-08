import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
}) {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-[44px] w-9 text-sm',
    lg: 'h-[48px] w-10 text-base',
  };

  return (
    <div className="inline-flex items-center rounded-[12px] border border-[#e5e5e5] bg-[#fffaf0] overflow-hidden">
      <button
        type="button"
        disabled={disabled || quantity <= min}
        onClick={handleDecrement}
        className={`${sizes[size]} flex items-center justify-center text-[#0a0a0a] hover:bg-[#f5f0e0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-8 text-center text-xs font-semibold text-[#0a0a0a] select-none">
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled || quantity >= max}
        onClick={handleIncrement}
        className={`${sizes[size]} flex items-center justify-center text-[#0a0a0a] hover:bg-[#f5f0e0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
