import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FacultyLayout from '@/components/layout/FacultyLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import QuantitySelector from '@/components/catalog/QuantitySelector';
import ProductSelector from '@/components/checkout/ProductSelector';
import useCartStore from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/services/orderService';
import { getSlots } from '@/services/slotService';
import { mockSlots } from '@/mocks/slots';
import { formatINR } from '@/utils/currency';
import { useToast } from '@/components/ui/ToastProvider';
import { Clock, ArrowLeft, Building2, Zap, Trash2, ShoppingBag, Info } from 'lucide-react';

export default function FacultyCheckoutPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItems, cartTotal, clearCart, addItem, updateQty, removeItem, cartShopId, cartShopName } = useCartStore();

  const [liveSlots, setLiveSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [isBulkOrder, setIsBulkOrder] = useState(true);
  const [departmentNote, setDepartmentNote] = useState('Department Examination & Laboratory Consumables');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddMore, setShowAddMore] = useState(cartItems.length === 0);

  useEffect(() => {
    let isMounted = true;
    getSlots()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveSlots(data);
          setSelectedSlotId(data[0].id);
        }
      })
      .catch((err) => {
        console.warn('Could not load slots for faculty checkout:', err);
      });
    return () => { isMounted = false; };
  }, []);

  const displaySlots = liveSlots;

  const effectiveTotal = cartTotal || cartItems.reduce((sum, ci) => sum + (Number(ci.price) || 0) * (Number(ci.quantity) || 1), 0);

  const selectedSlot = useMemo(() => displaySlots.find((s) => s.id === selectedSlotId) || displaySlots[0], [displaySlots, selectedSlotId]);

  const handleSelectProduct = (product, quantity = 1) => {
    addItem(product, quantity);
    toast.success('Product Added to Indent', `${quantity}x ${product.name} selected.`);
  };

  const handleConfirmOrder = async (e) => {
    if (e) e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('No Product Selected', 'Please select at least one stationery item before placing your indent order.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.uid || 'u3',
        userName: user?.displayName || user?.name || 'Faculty Member',
        userEmail: user?.email,
        userDepartment: user?.department || 'Department Indent',
        role: 'faculty',
        shopId: cartShopId || (cartItems[0]?.shopId) || 'main-store',
        shopName: cartShopName || (cartItems[0]?.shopName) || (typeof window !== 'undefined' ? localStorage.getItem('bsp_custom_shop_name') : '') || 'BIT Central Stationery Store',
        counterLocation: 'Main Store (Main Academic Block)',
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
        total: effectiveTotal,
        isBulkOrder,
        bulkNote: isBulkOrder ? departmentNote : null,
        remarks,
      };

      const created = await placeOrder(orderPayload);
      clearCart();
      toast.success('Department Indent Placed Directly', `Order #${created.id} forwarded to store.`);
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
              to={`/${role}/catalog`}
              className="inline-flex items-center text-caption text-action-blue hover:underline mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Return to Catalog
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-display-md sm:text-display-lg font-semibold tracking-tight text-ink">
                  Faculty Indent & Direct Checkout
                </h1>
                <p className="text-body text-ink-muted-80">
                  Select stationery supplies below and place your institutional indent directly.
                </p>
              </div>

              {cartItems.length > 0 && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleConfirmOrder}
                  loading={submitting}
                  icon={Zap}
                >
                  Place Indent Directly ({formatINR(cartTotal)})
                </Button>
              )}
            </div>
          </div>

          {/* Banner if empty */}
          {cartItems.length === 0 && (
            <div className="bg-white border border-hairline shadow-card rounded-lg p-5 flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-full bg-action-blue/10 flex items-center justify-center flex-shrink-0 text-action-blue">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-body font-semibold text-ink">Direct Indent Ordering Active</h4>
                <p className="text-caption text-ink-muted-80">
                  Select stationery supplies from the catalog picker below to create and place your department pre-order directly.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Selected Items Card */}
              {cartItems.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-lg border border-hairline shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-action-blue" />
                      <h3 className="text-tagline font-semibold text-ink">
                        Selected Supplies ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddMore(!showAddMore)}
                        className="text-caption font-semibold text-action-blue hover:underline"
                      >
                        {showAddMore ? 'Hide Product Picker' : '+ Select More Supplies'}
                      </button>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-caption text-[#ff4d8b] hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-hairline">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover border border-hairline flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-body text-ink block truncate">
                              {item.name}
                            </span>
                            <span className="text-caption text-ink-muted-80">
                              {formatINR(item.price)} per unit
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <QuantitySelector
                            quantity={item.quantity}
                            onChange={(newQty) => updateQty(item.id, newQty)}
                            min={1}
                            max={Math.min(500, item.stock || 500)}
                            size="sm"
                          />
                          <span className="text-body font-semibold text-ink w-16 text-right">
                            {formatINR(item.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-ink-muted-80 hover:text-[#ff4d8b] transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Selector Section */}
              {(showAddMore || cartItems.length === 0) && (
                <ProductSelector onSelectProduct={handleSelectProduct} />
              )}

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
                <h3 className="text-tagline font-semibold text-ink">Priority Desk #2 Windows</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displaySlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-5 rounded-lg border transition-all cursor-pointer ${isSelected
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
                <h3 className="text-tagline font-semibold text-ink border-b border-hairline pb-4 flex items-center justify-between">
                  <span>Indent Summary</span>
                  <span className="text-caption text-ink-muted-80 font-normal">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto text-caption text-ink-muted-80 divide-y divide-hairline">
                  {cartItems.length === 0 ? (
                    <p className="text-caption text-ink-muted-80 py-2 text-center italic">
                      Select items above to place order directly.
                    </p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-ink truncate">{item.name}</p>
                          <p className="text-ink-muted-80 text-fine-print">Qty: {item.quantity} × {formatINR(item.price)}</p>
                        </div>
                        <span className="font-semibold text-ink flex-shrink-0">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2.5 text-caption text-ink-muted-80 pt-2 border-t border-hairline">
                  <div className="flex justify-between">
                    <span>Pickup Desk</span>
                    <span className="font-semibold text-ink">Desk #2 (Priority)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pickup Window</span>
                    <span className="font-semibold text-action-blue">{selectedSlot.time}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-hairline flex justify-between items-baseline">
                  <span className="text-body font-semibold text-ink">Total Allocation</span>
                  <span className="text-display-md font-semibold text-ink">{formatINR(effectiveTotal)}</span>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full font-semibold"
                  disabled={cartItems.length === 0}
                  loading={submitting}
                  onClick={handleConfirmOrder}
                  icon={Zap}
                >
                  {cartItems.length === 0
                    ? 'Select Supplies Above'
                    : `Place Order Directly (${formatINR(effectiveTotal)})`}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FacultyLayout>
  );
}

