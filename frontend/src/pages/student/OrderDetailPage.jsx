import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { mockOrders } from '@/mocks/orders';
import { getOrderById } from '@/services/orderService';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/formatDate';
import { ArrowLeft, Calendar, User, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StudentOrderDetailPage() {
  const { orderId } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getOrderById(orderId)
      .then((data) => {
        if (isMounted) {
          setOrder(data || null);
        }
      })
      .catch((err) => {
        console.warn('Failed to load order from API:', err);
        if (isMounted) {
          setOrder(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [orderId]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  if (!order) {
    return (
      <StudentLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">Order Slip Not Found</h2>
          <p className="text-xs text-[#6a6a6a] mt-2">Could not locate pre-order #{orderId}.</p>
          <div className="mt-5">
            <Link to={`/${role}/orders`}>
              <Button variant="primary" size="sm" icon={ArrowLeft}>
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Orders
          </button>
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Pickup Voucher
          </Button>
        </div>

        {/* Header summary */}
        <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">Pre-Order #{order.id}</h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-[#9a9a9a] mt-1">Placed on {formatDateTime(order.placedAt)}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#9a9a9a] uppercase tracking-wider block">Total Due upon Pickup</span>
              <span className="text-2xl font-medium tracking-tight text-[#0a0a0a]">{formatINR(order.total)}</span>
            </div>
          </div>

          {/* Timeline tracker */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6a6a6a] mb-4">
              Fulfillment Timeline
            </h3>
            <OrderTimeline status={order.status} timeline={order.timeline} />
          </div>
        </div>

        {/* Counter Pickup Verification Code (Active only when Ready & Uncollected) */}
        {order.status === 'Ready' && !order.isPickedUp && order.pickupCode && (
          <div className="bg-[#1a3a3a] text-white rounded-[24px] p-6 sm:p-8 shadow-soft border border-[#2b5555] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#a4d4c5]/20 flex items-center justify-center text-[#a4d4c5]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium tracking-tight text-white">
                    Pickup Verification Code
                  </h3>
                  <p className="text-xs text-[#a4d4c5]">
                    Read this 6-digit code to the store staff at the pickup desk to collect your order
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[1.5px] bg-[#a4d4c5]/20 text-[#a4d4c5] px-3.5 py-1.5 rounded-full border border-[#a4d4c5]/30">
                Ready For Collection
              </span>
            </div>

            <div className="py-3 text-center space-y-3">
              <div className="inline-flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/10 rounded-[20px] border border-white/15 shadow-inner">
                {String(order.pickupCode).split('').map((digit, idx) => (
                  <span
                    key={idx}
                    className="h-12 w-10 sm:h-14 sm:w-12 rounded-[14px] bg-[#0a0a0a] text-white font-mono text-2xl sm:text-3xl font-bold flex items-center justify-center shadow-lg border border-white/20 select-all"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/70 max-w-md mx-auto">
                Assigned exclusively to <strong>Pre-Order #{order.id}</strong>. Expired & invalidated immediately once verified upon pickup.
              </p>
            </div>
          </div>
        )}

        {/* Order Collected Confirmation Banner */}
        {order.isPickedUp && (
          <div className="bg-[#f0f7f4] border border-[#3b7a57]/30 text-[#1e4d34] rounded-[24px] p-5 flex items-center gap-3.5 shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-[#3b7a57] flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold">Order Successfully Collected</h4>
              <p className="text-xs text-[#1e4d34]/80">
                Order pickup was verified with the 6-digit security code on {formatDateTime(order.pickedUpAt || order.updatedAt)}.
              </p>
            </div>
          </div>
        )}

        {/* Pickup Details & User Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#faf5e8] p-6 rounded-[24px] border border-[#e5e5e5] space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6a6a6a] flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#0a0a0a]" />
              Pickup Window
            </h3>
            <p className="text-lg font-medium text-[#0a0a0a]">{order.pickupSlot?.date}</p>
            <p className="text-sm font-semibold text-[#0a0a0a]">{order.pickupSlot?.time}</p>
            <p className="text-xs text-[#6a6a6a] pt-1">
              Shop: <strong>{order.shopName || 'BIT Central Stationery Store'}</strong>
            </p>
            <p className="text-xs text-[#6a6a6a]">
              Location: <strong>{order.counterLocation || 'Main Store (Main Academic Block)'}</strong>
            </p>
          </div>

          <div className="bg-[#faf5e8] p-6 rounded-[24px] border border-[#e5e5e5] space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6a6a6a] flex items-center gap-1.5">
              <User className="h-4 w-4 text-[#0a0a0a]" />
              Beneficiary Details
            </h3>
            <p className="text-lg font-medium text-[#0a0a0a]">{order.userName}</p>
            <p className="text-xs text-[#6a6a6a]">{order.userEmail}</p>
            <p className="text-xs text-[#6a6a6a]">Department: {order.userDepartment}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a]">Itemized Supplies Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e5e5e5] text-left text-xs">
              <thead className="bg-[#faf5e8]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#0a0a0a]">Item Description</th>
                  <th className="px-4 py-3 font-semibold text-[#0a0a0a] text-center">Qty</th>
                  <th className="px-4 py-3 font-semibold text-[#0a0a0a] text-right">Unit Price</th>
                  <th className="px-4 py-3 font-semibold text-[#0a0a0a] text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3.5 font-medium text-[#0a0a0a]">{item.name}</td>
                    <td className="px-4 py-3.5 text-center text-[#6a6a6a]">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right text-[#6a6a6a]">{formatINR(item.price)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-[#0a0a0a]">
                      {formatINR(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#faf5e8] font-semibold text-[#0a0a0a]">
                <tr>
                  <td colSpan={3} className="px-4 py-3.5 text-right">Grand Total:</td>
                  <td className="px-4 py-3.5 text-right font-medium text-base text-[#0a0a0a]">
                    {formatINR(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
