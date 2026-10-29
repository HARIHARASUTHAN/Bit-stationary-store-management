import React, { useState } from 'react';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import Button from '@/components/ui/Button';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/formatDate';
import { Check, Clock, User, CheckCheck, X, ShieldCheck, Store } from 'lucide-react';

export default function OrderQueue({
  orders = [],
  onUpdateStatus,
  onVerifyPickup,
  actionLoadingId = null,
}) {
  const [inputCodes, setInputCodes] = useState({});
  const [verificationErrors, setVerificationErrors] = useState({});

  const handleCodeChange = (orderId, value) => {
    // Only accept numeric digits, maximum 6 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setInputCodes((prev) => ({ ...prev, [orderId]: numericValue }));
    if (verificationErrors[orderId]) {
      setVerificationErrors((prev) => ({ ...prev, [orderId]: '' }));
    }
  };

  const handleVerify = async (orderId) => {
    const code = inputCodes[orderId] || '';
    if (code.length !== 6) {
      setVerificationErrors((prev) => ({
        ...prev,
        [orderId]: 'Please enter a complete 6-digit code.',
      }));
      return;
    }

    if (onVerifyPickup) {
      try {
        await onVerifyPickup(orderId, code);
        setInputCodes((prev) => ({ ...prev, [orderId]: '' }));
        setVerificationErrors((prev) => ({ ...prev, [orderId]: '' }));
      } catch (err) {
        setVerificationErrors((prev) => ({
          ...prev,
          [orderId]: err.message || 'Verification failed.',
        }));
      }
    }
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-500">
          No orders in this queue.
        </div>
      ) : (
        orders.map((order) => {
          const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-base text-[#1e3a5f]">#{order.id}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Store className="h-3 w-3 text-amber-700" />
                    {order.shopName || 'BIT Central Stationery Store'} • {order.counterLocation || 'Main Store'}
                  </span>
                  {order.isBulkOrder && (
                    <span className="text-[11px] bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                      Faculty Bulk Order
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  Placed: {formatDateTime(order.placedAt)}
                </span>
              </div>

              {/* Order User Info & Slot */}
              <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50/60 -mx-5 px-5 my-2 border-y border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">{order.userName}</p>
                    <p className="text-gray-500">{order.userEmail} ({order.userDepartment})</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Designated Pickup Slot</p>
                  <p className="font-semibold text-gray-900">
                    {order.pickupSlot?.date} ({order.pickupSlot?.time})
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Total Payable</p>
                  <p className="font-bold text-sm text-[#1e3a5f]">{formatINR(order.total)}</p>
                </div>
              </div>

              {/* Items breakdown */}
              <div className="py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Reserved Items ({itemCount})
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-teal-700 font-bold">x{item.quantity}</span>
                      <span className="text-gray-500">({formatINR(item.price * item.quantity)})</span>
                    </span>
                  ))}
                </div>
                {order.bulkNote && (
                  <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded-lg mt-2">
                    <strong>Department Remark:</strong> {order.bulkNote}
                  </p>
                )}
              </div>

              {/* Action Buttons & Status Progression */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  Status Workflow: Pending → Approved → Ready → Collected
                </span>

                <div className="flex items-center gap-2">
                  {order.status === 'Pending' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={X}
                        loading={actionLoadingId === order.id}
                        onClick={() => onUpdateStatus(order.id, 'Cancelled')}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Check}
                        loading={actionLoadingId === order.id}
                        onClick={() => onUpdateStatus(order.id, 'Approved')}
                      >
                        Approve Order
                      </Button>
                    </>
                  )}

                  {order.status === 'Approved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Clock}
                      loading={actionLoadingId === order.id}
                      onClick={() => onUpdateStatus(order.id, 'Ready')}
                    >
                      Mark Ready for Pickup
                    </Button>
                  )}

                  {(order.status === 'Collected' || order.status === 'Cancelled') && (
                    <span className="text-xs font-semibold text-gray-400 italic">
                      Order finalized ({order.status})
                    </span>
                  )}
                </div>
              </div>

              {/* Pickup Verification Section (when Ready for Counter Pickup) */}
              {order.status === 'Ready' && (
                <div className="p-4 bg-gradient-to-r from-teal-50/70 to-blue-50/60 rounded-xl border border-teal-200/80 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-teal-600/10 flex items-center justify-center text-teal-700">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-900 tracking-tight">
                        Pickup Verification
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-600">
                      Request the 6-digit voucher code from the student
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={inputCodes[order.id] || ''}
                      onChange={(e) => handleCodeChange(order.id, e.target.value)}
                      placeholder="Enter 6-digit code"
                      disabled={actionLoadingId === order.id}
                      className="px-3.5 py-2 text-sm font-mono tracking-widest font-bold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent bg-white text-gray-900 shadow-inner w-full sm:w-56"
                    />

                    <Button
                      variant="navy"
                      size="sm"
                      icon={CheckCheck}
                      loading={actionLoadingId === order.id}
                      disabled={!inputCodes[order.id] || inputCodes[order.id].length !== 6}
                      onClick={() => handleVerify(order.id)}
                    >
                      Verify Pickup
                    </Button>
                  </div>

                  {verificationErrors[order.id] && (
                    <div className="text-xs text-red-600 font-medium flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                      <X className="h-4 w-4 flex-shrink-0" />
                      <span>{verificationErrors[order.id]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
