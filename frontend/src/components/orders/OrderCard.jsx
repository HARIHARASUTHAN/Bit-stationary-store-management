import React from 'react';
import { Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/formatDate';
import { Calendar, ChevronRight, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function OrderCard({ order }) {
  const { role } = useAuth();
  const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <div className="bg-[#fffaf0] rounded-[16px] border border-[#e5e5e5] p-6 hover:border-[#0a0a0a] transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#0a0a0a]">#{order.id}</span>
            {order.isBulkOrder && (
              <span className="text-[10px] bg-[#b8a4ed]/30 text-[#0a0a0a] font-bold px-2 py-0.5 rounded-full border border-[#b8a4ed]/50">
                Department Bulk Order
              </span>
            )}
          </div>
          <span className="text-xs text-[#9a9a9a] block mt-0.5">
            Placed on {formatDateTime(order.placedAt)}
          </span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#6a6a6a]">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#0a0a0a] flex-shrink-0" />
          <span>
            <strong className="text-[#0a0a0a]">Pickup Slot:</strong> {order.pickupSlot?.date} ({order.pickupSlot?.time})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[#0a0a0a] flex-shrink-0" />
          <span>
            <strong className="text-[#0a0a0a]">{itemCount} items:</strong>{' '}
            {order.items?.map((i) => `${i.name} (x${i.quantity})`).slice(0, 2).join(', ')}
            {order.items?.length > 2 ? ' ...' : ''}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-[#e5e5e5] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#9a9a9a] uppercase tracking-wider block">Total Due</span>
          <span className="text-lg font-medium tracking-tight text-[#0a0a0a]">{formatINR(order.total)}</span>
        </div>
        <Link
          to={`/${role}/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a0a0a] hover:text-[#ff4d8b] transition-colors"
        >
          View Order Slip
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
