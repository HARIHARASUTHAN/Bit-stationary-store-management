import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import useCartStore from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/services/orderService';
import { mockSlots } from '@/mocks/slots';
import { formatINR } from '@/utils/currency';
import { useToast } from '@/components/ui/ToastProvider';
import { Calendar, Clock, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function StudentCheckoutPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItems, cartTotal, clearCart } = useCartStore();

  const [selectedSlotId, setSelectedSlotId] = useState(mockSlots[0]?.id || '');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <StudentLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">Your tray is empty</h2>
          <p className="text-xs text-[#6a6a6a] mt-2">Add stationery items before proceeding to checkout.</p>
          <div className="mt-5">
            <Button variant="primary" size="sm" onClick={() => navigate(`/${role}/catalog`)}>
              Return to Catalog
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const selectedSlot = mockSlots.find((s) => s.id === selectedSlotId) || mockSlots[0];

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.uid || 'u1',
        userName: user?.displayName || user?.name || 'Student',
        userEmail: user?.email,
        userDepartment: user?.department || 'Student Body',
        role: 'student',
        pickupSlot: {
          date: selectedSlot.date,
          time: selectedSlot.time,
        },
        items: cartItems.map((ci) => ({
          itemId: ci.id,
          name: ci.name,
          quantity: ci.quantity,
          price: ci.price,
        })),
        total: cartTotal,
        isBulkOrder: false,
        remarks,
      };

      const created = await placeOrder(orderPayload);
      clearCart();
      toast.success('Pre-Order Placed!', `Your reservation #${created.id} is confirmed.`);
      navigate(`/${role}/orders/${created.id}`);
    } catch (err) {
      toast.error('Pre-Order Failed', err.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <button
            onClick={() => navigate(`/${role}/cart`)}
            className="inline-flex items-center text-xs font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Tray
          </button>
          <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
            Pickup Slot & Confirmation
          </h1>
          <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
            Choose a counter window so store staff can box your items before you arrive
          </p>
        </div>

        <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Pickup Window */}
            <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] space-y-4">
              <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#1a3a3a]" />
                Select Available Pickup Window
              </h3>
              <p className="text-xs text-[#6a6a6a]">
                Arriving during your selected window guarantees instant queue-free counter clearance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {mockSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isFull = slot.booked >= slot.capacity;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => !isFull && setSelectedSlotId(slot.id)}
                      className={`p-4 rounded-[16px] border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0a0a0a] bg-[#faf5e8] ring-1 ring-[#0a0a0a]'
                          : isFull
                          ? 'opacity-40 cursor-not-allowed bg-[#faf5e8] border-[#e5e5e5]'
                          : 'border-[#e5e5e5] hover:border-[#0a0a0a] bg-[#fffaf0]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#0a0a0a]">{slot.date}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isFull
                              ? 'bg-[#ff4d8b]/15 text-[#ff4d8b]'
                              : 'bg-[#a4d4c5]/40 text-[#1a3a3a]'
                          }`}
                        >
                          {isFull ? 'FULL' : `${slot.capacity - slot.booked} spots`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6a6a6a] mt-2">
                        <Clock className="h-3.5 w-3.5 text-[#0a0a0a]" />
                        <span>{slot.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] space-y-3">
              <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a]">
                Special Instructions (Optional)
              </h3>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Please supply ruled notebook covers or specific pen refills..."
                rows={2}
              />
            </div>
          </div>

          {/* Side Summary */}
          <div className="space-y-4">
            <div className="bg-[#faf5e8] p-6 rounded-[24px] border border-[#e5e5e5] space-y-4">
              <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a] border-b border-[#e5e5e5] pb-3">
                Pre-Order Slip Summary
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto text-xs text-[#6a6a6a] divide-y divide-[#e5e5e5]">
                {cartItems.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                    <div>
                      <p className="font-semibold text-[#0a0a0a]">{item.name}</p>
                      <p className="text-[#9a9a9a]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-[#0a0a0a]">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#e5e5e5] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6a6a6a]">
                  <span>Pickup Date</span>
                  <span className="font-semibold text-[#0a0a0a]">{selectedSlot.date}</span>
                </div>
                <div className="flex justify-between text-[#6a6a6a]">
                  <span>Window</span>
                  <span className="font-semibold text-[#0a0a0a]">{selectedSlot.time}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e5e5e5] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#0a0a0a]">Total Due</span>
                <span className="text-2xl font-medium tracking-tight text-[#0a0a0a]">
                  {formatINR(cartTotal)}
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                loading={submitting}
                icon={CheckCircle2}
              >
                Confirm Reservation
              </Button>

              <p className="text-[11px] text-[#6a6a6a] text-center flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1a3a3a]" />
                No advance fees. Counter verification on arrival.
              </p>
            </div>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
