import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import QuantitySelector from '@/components/catalog/QuantitySelector';
import ProductSelector from '@/components/checkout/ProductSelector';
import useCartStore from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/services/orderService';
import { getShopInfo } from '@/services/authService';
import { getSlots } from '@/services/slotService';
import { mockSlots } from '@/mocks/slots';
import { campusShops, getActiveCampusShops, getShopForItem } from '@/mocks/shops';
import { formatINR } from '@/utils/currency';
import { useToast } from '@/components/ui/ToastProvider';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Trash2,
  ShoppingBag,
  Info,
  Store,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function StudentCheckoutPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    cartItems,
    cartTotal,
    clearCart,
    addItem,
    updateQty,
    removeItem,
    cartShopId,
    cartShopName,
    cartCounterLocation,
    setCartShop,
  } = useCartStore();

  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddMore, setShowAddMore] = useState(cartItems.length === 0);

  const effectiveTotal = cartTotal || cartItems.reduce((sum, ci) => sum + (Number(ci.price) || 0) * (Number(ci.quantity) || 1), 0);

  const [liveShops, setLiveShops] = useState(() => {
    try {
      const cached = localStorage.getItem('bsp_live_campus_shops');
      return cached ? JSON.parse(cached) : null;
    } catch (_) { return null; }
  });
  const [liveSlots, setLiveSlots] = useState([]);

  const availableShops = useMemo(() => getActiveCampusShops(liveShops), [liveShops]);

  useEffect(() => {
    let isMounted = true;
    getShopInfo()
      .then((data) => {
        if (isMounted && data && data.shops && Array.isArray(data.shops) && data.shops.length > 0) {
          setLiveShops(data.shops);
          localStorage.setItem('bsp_live_campus_shops', JSON.stringify(data.shops));
        }
      })
      .catch(() => {});

    getSlots()
      .then((slotsData) => {
        if (isMounted && Array.isArray(slotsData) && slotsData.length > 0) {
          setLiveSlots(slotsData);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live slots:', err);
      });

    return () => { isMounted = false; };
  }, []);

  const displaySlots = liveSlots;

  // Determine active shop automatically (inherited from catalog or cart item)
  const activeShop = useMemo(() => {
    const targetId = cartShopId || (cartItems.length > 0 ? cartItems[0]?.shopId : null) || 'main-store';
    const found = availableShops.find(
      (s) => s.id === targetId || s.name.toLowerCase() === String(targetId).toLowerCase()
    );
    return (
      found ||
      availableShops[0] || {
        id: 'main-store',
        name: 'RASE MECH',
        counter: 'Main Academic Block (Ground Floor)',
        operatingHours: '8:30 AM – 6:00 PM',
      }
    );
  }, [availableShops, cartShopId, cartItems]);

  const selectedSlot = useMemo(() => displaySlots.find((s) => s.id === selectedSlotId) || null, [displaySlots, selectedSlotId]);

  const handleSelectProduct = (product, quantity = 1) => {
    addItem(product, quantity, activeShop);
    toast.success('Product Selected!', `${quantity}x ${product.name} added to your checkout order.`);
  };

  const handleConfirmOrder = async (e) => {
    if (e) e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('No Product Selected', 'Please select at least one stationery product before placing your order.');
      return;
    }

    if (!selectedSlot) {
      toast.error('Select Pickup Window', 'Please select a pickup window time slot for collecting your items.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.uid || 'u1',
        userName: user?.displayName || user?.name || 'Student',
        userEmail: user?.email,
        userDepartment: user?.department || 'Student Body',
        role: 'student',
        shopId: activeShop.id,
        shopName: activeShop.name,
        counterLocation: activeShop.counter || activeShop.tagline,
        pickupSlot: {
          slotId: selectedSlot.id,
          id: selectedSlot.id,
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
        isBulkOrder: false,
        remarks,
      };

      const created = await placeOrder(orderPayload);
      clearCart();
      toast.success(
        'Order Received by Shop!',
        `Your pre-order #${created.id} was received by ${activeShop.name}. View it under My Orders.`
      );
      navigate(`/${role}/orders/${created.id}`);
    } catch (err) {
      toast.error('Pre-Order Failed', err.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <button
            onClick={() => navigate(`/${role}/catalog`)}
            className="inline-flex items-center text-xs font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Catalog
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a] flex items-center gap-2.5">
                Checkout & Direct Pre-Order
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ffb084]/20 border border-[#ffb084]/40 text-[#0a0a0a]">
                  Instant Reservation
                </span>
              </h1>
              <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
                Select your stationery items below and place your campus store order directly in one step.
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
                className="self-start sm:self-auto bg-[#1a3a3a] hover:bg-[#254d4d]"
              >
                Place Order Directly ({formatINR(cartTotal)})
              </Button>
            )}
          </div>
        </div>

        {/* Informational Banner if cart is empty */}
        {cartItems.length === 0 && (
          <div className="bg-[#faf5e8] border border-[#e5e5e5] rounded-[20px] p-5 flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-full bg-[#1a3a3a]/10 flex items-center justify-center flex-shrink-0 text-[#1a3a3a]">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#0a0a0a]">
                Direct Pre-Ordering Enabled
              </h4>
              <p className="text-xs text-[#6a6a6a] leading-relaxed">
                Select any stationery item below (or pick from the popular items) to add it to your order and place it directly without extra steps.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Fulfillment Campus Shop Confirmation (Auto-assigned from Stationery Catalog) */}
            <div className="bg-[#faf5e8] p-5 sm:p-6 rounded-[24px] border border-[#e5e5e5] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-[#065f46]" />
                  <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a]">
                    Receiving Campus Shop
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Selected from Catalog
                </span>
              </div>

              <div className="p-4 rounded-[16px] bg-white border border-[#e5e5e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#6a6a6a] bg-[#f0ebe0] px-2 py-0.5 rounded-full">
                      {activeShop.badge || 'Store Outlet'}
                    </span>
                    <h4 className="text-sm font-semibold text-[#0a0a0a]">
                      {activeShop.name}
                    </h4>
                  </div>
                  <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5 pt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#0a0a0a] flex-shrink-0" />
                    <span>{activeShop.counter || activeShop.tagline}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#e5e5e5]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9a9a9a] block">Pickup Timings</span>
                  <span className="text-xs font-semibold text-[#0a0a0a]">{activeShop.operatingHours || '8:30 AM – 6:00 PM'}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6a6a6a]">
                Your pre-order will automatically be prepared and dispatched for collection at <strong>{activeShop.name}</strong>.
              </p>
            </div>

            {/* Selected Items Card (if items present) */}
            {cartItems.length > 0 && (
              <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] space-y-4">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#1a3a3a]" />
                    <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a]">
                      Selected Stationery ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddMore(!showAddMore)}
                      className="text-xs font-semibold text-[#1a3a3a] hover:underline"
                    >
                      {showAddMore ? 'Hide Product Picker' : '+ Select More Products'}
                    </button>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs text-[#ff4d8b] hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-[#e5e5e5]">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-xl object-cover border border-[#e5e5e5] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/${role}/catalog/${item.id}`}
                            className="font-semibold text-xs text-[#0a0a0a] hover:underline block truncate"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[11px] text-[#6a6a6a]">
                            {formatINR(item.price)} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <QuantitySelector
                          quantity={item.quantity}
                          onChange={(newQty) => updateQty(item.id, newQty)}
                          min={1}
                          max={Math.min(30, (item.shopStocks?.[activeShop.id] ?? item.stock) || 30)}
                          size="sm"
                        />
                        <span className="text-xs font-semibold text-[#0a0a0a] w-16 text-right">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#9a9a9a] hover:text-[#ff4d8b] transition-colors p-1"
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
              <ProductSelector onSelectProduct={handleSelectProduct} activeShop={activeShop} />
            )}

            {/* Pickup Window Selection */}
            <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#1a3a3a]" />
                  Pickup Window
                </h3>
                {selectedSlot ? (
                  <span className="text-[11px] text-[#6a6a6a]">
                    Selected: <strong className="text-[#0a0a0a]">{selectedSlot.date} ({selectedSlot.time})</strong>
                  </span>
                ) : (
                  <span className="text-[11px] text-[#ff4d8b] font-medium bg-[#ff4d8b]/10 px-2.5 py-0.5 rounded-full border border-[#ff4d8b]/20">
                    Select a slot below
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6a6a6a]">
                Arriving during your selected window guarantees instant queue-free clearance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {displaySlots.map((slot) => {
                  const isSelected = Boolean(selectedSlotId && selectedSlotId === slot.id);
                  const shopBooked = (slot.shopBookings && typeof slot.shopBookings[activeShop.id] === 'number')
                    ? slot.shopBookings[activeShop.id]
                    : (slot.booked || 0);
                  const remainingSpots = Math.max(0, slot.capacity - shopBooked);
                  const isFull = remainingSpots <= 0;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => !isFull && setSelectedSlotId(slot.id)}
                      className={`p-4 rounded-[16px] border transition-all cursor-pointer ${isSelected
                          ? 'border-[#0a0a0a] bg-[#faf5e8] ring-2 ring-[#0a0a0a] shadow-xs'
                          : isFull
                            ? 'opacity-40 cursor-not-allowed bg-[#faf5e8] border-[#e5e5e5]'
                            : 'border-[#e5e5e5] hover:border-[#0a0a0a] bg-[#fffaf0]'
                        }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#0a0a0a]">{slot.date}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${isFull
                              ? 'bg-[#ff4d8b]/15 text-[#ff4d8b]'
                              : isSelected
                                ? 'bg-[#0a0a0a] text-white font-bold'
                                : 'bg-[#a4d4c5]/40 text-[#1a3a3a]'
                            }`}
                        >
                          {isFull ? 'FULL' : isSelected ? 'Selected' : `${remainingSpots} spots`}
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

          {/* Right Column: Pre-Order Summary & Direct Action */}
          <div className="space-y-4">
            <div className="bg-[#faf5e8] p-6 rounded-[24px] border border-[#e5e5e5] space-y-4 sticky top-6">
              <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a] border-b border-[#e5e5e5] pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-[#6a6a6a]">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto text-xs text-[#6a6a6a] divide-y divide-[#e5e5e5]">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-[#8a8a8a] py-3 text-center italic">
                    Select a product from the left to place order directly.
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-[#0a0a0a] truncate">{item.name}</p>
                        <p className="text-[#9a9a9a]">Qty: {item.quantity} × {formatINR(item.price)}</p>
                      </div>
                      <span className="font-semibold text-[#0a0a0a] flex-shrink-0">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-[#e5e5e5] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6a6a6a]">
                  <span>Fulfillment Shop</span>
                  <span className="font-semibold text-[#0a0a0a] truncate max-w-[150px] text-right">{activeShop.name}</span>
                </div>
                <div className="flex justify-between text-[#6a6a6a]">
                  <span>Pickup Desk</span>
                  <span className="font-semibold text-[#0a0a0a]">{activeShop.counter}</span>
                </div>
                <div className="flex justify-between text-[#6a6a6a]">
                  <span>Pickup Date</span>
                  <span className={`font-semibold ${selectedSlot ? 'text-[#0a0a0a]' : 'text-[#8a8a8a] italic'}`}>
                    {selectedSlot ? selectedSlot.date : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between text-[#6a6a6a]">
                  <span>Window</span>
                  <span className={`font-semibold ${selectedSlot ? 'text-[#0a0a0a]' : 'text-[#8a8a8a] italic'}`}>
                    {selectedSlot ? selectedSlot.time : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between text-[#1a3a3a]">
                  <span>Reservation Fee</span>
                  <span className="font-semibold">FREE (Campus Service)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e5e5e5] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#0a0a0a]">Total Payable</span>
                <span className="text-2xl font-medium tracking-tight text-[#0a0a0a]">
                  {formatINR(effectiveTotal)}
                </span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full bg-[#1a3a3a] hover:bg-[#254d4d]"
                disabled={cartItems.length === 0}
                loading={submitting}
                onClick={handleConfirmOrder}
                icon={Zap}
              >
                {cartItems.length === 0
                  ? 'Select a Product Above'
                  : `Place Order Directly (${formatINR(effectiveTotal)})`}
              </Button>

              <p className="text-[11px] text-[#6a6a6a] text-center flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1a3a3a]" />
                No advance fees. Pay upon collection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

