import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FacultyLayout from '@/components/layout/FacultyLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import useCartStore from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/services/orderService';
import { mockSlots } from '@/mocks/slots';
import { formatINR } from '@/utils/currency';
import { useToast } from '@/components/ui/ToastProvider';
import { Clock, ArrowLeft, Building2 } from 'lucide-react';

export default function FacultyCheckoutPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItems, cartTotal, clearCart } = useCartStore();

  const [selectedSlotId, setSelectedSlotId] = useState(mockSlots[0]?.id || '');
  const [isBulkOrder, setIsBulkOrder] = useState(true);
  const [departmentNote, setDepartmentNote] = useState('Department Examination & Laboratory Consumables');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <FacultyLayout>
        <div className="py-20 text-center max-w-[980px] mx-auto px-6 space-y-4">
          <h2 className="text-display-md font-semibold text-ink">Your bag is empty.</h2>
          <p className="text-body text-ink-muted-80">Add supplies before proceeding to checkout.</p>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={() => navigate(`/${role}/catalog`)}>
              Browse Store
            </Button>
          </div>
        </div>
      </FacultyLayout>
    );
  }

  const selectedSlot = mockSlots.find((s) => s.id === selectedSlotId) || mockSlots[0];

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.uid || 'u3',
        userName: user?.displayName || user?.name || 'Faculty Member',
        userEmail: user?.email,
        userDepartment: user?.department || 'Department Indent',
        role: 'faculty',
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
        isBulkOrder,
        bulkNote: isBulkOrder ? departmentNote : null,
        remarks,
      };

      const created = await placeOrder(orderPayload);
      clearCart();
      toast.success('Department Indent Confirmed', `Order #${created.id} forwarded to store.`);
      navigate(`/${role}/orders/${created.id}`);
    } catch (err) {
      toast.error('Indent Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FacultyLayout>
      <div className="bg-parchment min-h-screen py-12 px-6">
        <div className="max-w-[1440px] mx-auto space-y-8">
          <div className="max-w-[980px] space-y-2">
            <Link
              to={`/${role}/cart`}
              className="inline-flex items-center text-caption text-action-blue hover:underline mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Return to Bag
            </Link>
            <h1 className="text-display-md sm:text-display-lg font-semibold tracking-tight text-ink">
              Faculty Indent Confirmation.
            </h1>
            <p className="text-body text-ink-muted-80">
              Confirm departmental billing allocation and scheduled collection at Priority Counter #2.
            </p>
          </div>

          <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Department Mode Toggle */}
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-hairline shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-parchment flex items-center justify-center text-ink">
                      <Building2 className="h-5 w-5 text-action-blue" />
                    </div>
                    <div>
                      <h3 className="text-tagline font-semibold text-ink">Department Bulk Allocation</h3>
                      <p className="text-caption text-ink-muted-80">
                        Tag this pre-order for official institutional billing
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBulkOrder}
                      onChange={(e) => setIsBulkOrder(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-parchment border border-hairline peer-focus:outline-none rounded-pill peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ink after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {isBulkOrder && (
                  <div className="pt-4 border-t border-hairline space-y-3">
                    <Input
                      label="Department / Course Purpose"
                      value={departmentNote}
                      onChange={(e) => setDepartmentNote(e.target.value)}
                      placeholder="e.g. 1st Year CSE Orientation & Lab Supplies"
                      required={isBulkOrder}
                    />
                  </div>
                )}
              </div>

              {/* Pickup Window Selection */}
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-hairline shadow-card space-y-4">
                <h3 className="text-tagline font-semibold text-ink">Priority Counter #2 Windows</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-action-blue outline outline-2 outline-focus-blue bg-white shadow-card'
                            : 'border-hairline hover:border-ink/40 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-body font-semibold">
                          <span className="text-ink">{slot.date}</span>
                          <span className="text-fine-print text-action-blue bg-action-blue/10 px-2.5 py-0.5 rounded-pill">
                            Priority
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-caption text-ink-muted-80 mt-2">
                          <Clock className="h-4 w-4 text-action-blue" />
                          <span>{slot.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-lg border border-hairline shadow-card space-y-3">
                <h3 className="text-tagline font-semibold text-ink">Additional Notes</h3>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Special lab kit packaging or student volunteer collection notes..."
                  rows={2}
                />
              </div>
            </div>

            {/* Side Card */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-hairline shadow-card space-y-5 sticky top-24">
                <h3 className="text-tagline font-semibold text-ink border-b border-hairline pb-4">
                  Indent Summary
                </h3>

                <div className="space-y-3 text-body text-ink-muted-80">
                  <div className="flex justify-between">
                    <span>Counter Desk</span>
                    <span className="font-semibold text-ink">Counter #2 (Faculty Priority)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pickup Window</span>
                    <span className="font-semibold text-action-blue">{selectedSlot.time}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-hairline flex justify-between items-baseline">
                  <span className="text-body font-semibold text-ink">Total Allocation</span>
                  <span className="text-display-md font-semibold text-ink">{formatINR(cartTotal)}</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-normal"
                  loading={submitting}
                >
                  Submit Indent
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FacultyLayout>
  );
}
