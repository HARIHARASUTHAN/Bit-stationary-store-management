import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { formatINR } from '@/utils/currency';
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CartSummary({
  total,
  itemCount,
  onProceed,
  showCheckoutButton = true,
}) {
  const { role } = useAuth();

  return (
    <div className="bg-[#faf5e8] rounded-[24px] border border-[#e5e5e5] p-6 space-y-5">
      <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a] border-b border-[#e5e5e5] pb-3">
        Pre-Order Summary
      </h3>

      <div className="space-y-2 text-xs text-[#6a6a6a]">
        <div className="flex justify-between">
          <span>Reserved Quantity</span>
          <span className="font-semibold text-[#0a0a0a]">{itemCount} items</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Total</span>
          <span className="font-semibold text-[#0a0a0a]">{formatINR(total)}</span>
        </div>
        <div className="flex justify-between text-[#1a3a3a] font-medium">
          <span>Pre-Order Reservation Fee</span>
          <span>FREE (Campus Service)</span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#e5e5e5] flex justify-between items-baseline">
        <span className="text-sm font-semibold text-[#0a0a0a]">Total Payable at Counter</span>
        <span className="text-2xl font-medium tracking-tight text-[#0a0a0a]">{formatINR(total)}</span>
      </div>

      {/* Clay Peach Info Box */}
      <div className="bg-[#ffb084]/20 border border-[#ffb084]/40 rounded-[16px] p-3.5 text-xs text-[#0a0a0a] flex items-start gap-2.5">
        <Clock className="h-4 w-4 text-[#0a0a0a] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block font-semibold">Scheduled Counter Pickup</strong>
          Your items are packed before your selected slot. Pay directly at Counter #1 upon collection.
        </div>
      </div>

      {showCheckoutButton && (
        <Link to={`/${role}/checkout`} className="block w-full">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            disabled={itemCount === 0}
            onClick={onProceed}
          >
            Select Pickup Window
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6a6a6a]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#1a3a3a]" />
        <span>Official Bannari Amman Institute Campus Counter</span>
      </div>
    </div>
  );
}
