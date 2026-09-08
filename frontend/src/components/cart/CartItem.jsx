import React from 'react';
import { Trash2 } from 'lucide-react';
import QuantitySelector from '@/components/catalog/QuantitySelector';
import { formatINR } from '@/utils/currency';

export default function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#e5e5e5] last:border-0">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded-[12px] object-cover bg-[#f5f0e0] flex-shrink-0 border border-[#e5e5e5]"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#0a0a0a] truncate">{item.name}</h4>
        <p className="text-xs text-[#6a6a6a] mt-0.5">{item.category}</p>
        <p className="text-xs font-medium text-[#0a0a0a] mt-1">{formatINR(item.price)} each</p>
      </div>

      <div className="flex items-center gap-4">
        <QuantitySelector
          quantity={item.quantity}
          onChange={(newQty) => onUpdateQty(item.id, newQty)}
          max={item.stock || 99}
          size="sm"
        />
        <div className="text-right min-w-[70px]">
          <span className="text-sm font-bold text-[#0a0a0a]">
            {formatINR(item.price * item.quantity)}
          </span>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-[#9a9a9a] hover:text-[#ff4d8b] hover:bg-[#ff4d8b]/10 rounded-[10px] transition-colors"
          title="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
