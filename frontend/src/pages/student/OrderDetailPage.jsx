import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import Button from '@/components/ui/Button';
import { mockOrders } from '@/mocks/orders';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/formatDate';
import { ArrowLeft, Calendar, User, Printer } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StudentOrderDetailPage() {
  const { orderId } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();

  const order = mockOrders.find((o) => o.id === orderId);

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
            Print Counter Voucher
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
              <span className="text-[10px] text-[#9a9a9a] uppercase tracking-wider block">Total Due at Counter</span>
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

        {/* Pickup Details & User Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#faf5e8] p-6 rounded-[24px] border border-[#e5e5e5] space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6a6a6a] flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#0a0a0a]" />
              Counter Pickup Window
            </h3>
            <p className="text-lg font-medium text-[#0a0a0a]">{order.pickupSlot?.date}</p>
            <p className="text-sm font-semibold text-[#0a0a0a]">{order.pickupSlot?.time}</p>
            <p className="text-xs text-[#6a6a6a] pt-1">
              Counter: <strong>BIT Stationery Desk #1 (Ground Floor Academic Block)</strong>
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
