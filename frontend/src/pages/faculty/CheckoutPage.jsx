import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
import { getShopInfo } from '@/services/authService';
import { getActiveCampusShops } from '@/mocks/shops';
import { formatINR } from '@/utils/currency';
import { useToast } from '@/components/ui/ToastProvider';
import {
  Clock,
  ArrowLeft,
  Building2,
  Zap,
  Trash2,
  ShoppingBag,
  Store,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function FacultyCheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    setCartShop,
  } = useCartStore();

  const [liveSlots, setLiveSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [isBulkOrder, setIsBulkOrder] = useState(true);
  const [departmentNote, setDepartmentNote] = useState('Department Examination & Laboratory Consumables');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddMore, setShowAddMore] = useState(cartItems.length === 0);

  const [liveShops, setLiveShops] = useState(() => {
    try {
      const cached = localStorage.getItem('bsp_live_campus_shops');
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });

  const availableShops = useMemo(() => getActiveCampusShops(liveShops), [liveShops]);

  // Determine active shop (from query param, cart state, cart items, or fallback to first shop)
  const activeShop = useMemo(() => {
    const queryShop = searchParams.get('shop');
    const targetId =
      queryShop ||
      cartShopId ||
      (cartItems.length > 0 ? cartItems[0]?.shopId : null) ||
      localStorage.getItem('bsp_selected_shop_id') ||
      'main-store';

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
  }, [availableShops, searchParams, cartShopId, cartItems]);

  useEffect(() => {
    let isMounted = true;

    getShopInfo()
      .then((data) => {
        if (isMounted && data && Array.isArray(data.shops) && data.shops.length > 0) {
          setLiveShops(data.shops);
          localStorage.setItem('bsp_live_campus_shops', JSON.stringify(data.shops));
        }
      })
      .catch(() => {});

    getSlots()
      .then((slotsData) => {
        if (isMounted && Array.isArray(slotsData) && slotsData.length > 0) {
          setLiveSlots(slotsData);
          setSelectedSlotId(slotsData[0].id);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live slots for faculty checkout:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displaySlots = liveSlots;

  const selectedSlot = useMemo(() => {
    if (!displaySlots || displaySlots.length === 0) return null;
    return displaySlots.find((s) => s.id === selectedSlotId) || displaySlots[0];
  }, [displaySlots, selectedSlotId]);

  const effectiveTotal =
    cartTotal ||
    cartItems.reduce(
      (sum, ci) => sum + (Number(ci.price) || 0) * (Number(ci.quantity) || 1),
      0
    );

  const handleSelectProduct = (product, quantity = 1) => {
    addItem(product, quantity, activeShop);
    toast.success('Product Added to Indent', `${quantity}x ${product.name} selected for ${activeShop.name}.`);
  };

  const handleConfirmOrder = async (e) => {
    if (e) e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('No Product Selected', 'Please select at least one stationery item before placing your indent order.');
      return;
    }

    if (!selectedSlot) {
      toast.error('Select Pickup Window', 'Please select a pickup window time slot for collecting your items.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.uid || 'faculty-user',
        userName: user?.displayName || user?.name || (user?.email ? user.email.split('@')[0] : 'Faculty Member'),
        userEmail: user?.email || 'faculty@faculty.ac.in',
        userDepartment: user?.department || 'Academic Department Indent',
        role: 'faculty',
        shopId: activeShop.id,
        shopName: activeShop.name,
        counterLocation: activeShop.counter || activeShop.tagline || 'Main Store (Ground Floor)',
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
        isBulkOrder: Boolean(isBulkOrder),
        bulkNote: isBulkOrder ? departmentNote : null,
        remarks: remarks || '',
      };

      const created = await placeOrder(orderPayload);
      clearCart();
      toast.success(
        'Department Indent Placed Successfully!',
        `Order #${created.id} was forwarded directly to ${activeShop.name}.`
      );
      navigate(`/faculty/orders/${created.id}`);
    } catch (err) {
      console.error('Order placement error:', err);
      toast.error('Indent Placement Failed', err.message || 'Could not place indent order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FacultyLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate('/faculty/catalog')}
            className="inline-flex items-center text-xs font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Catalog
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a] flex items-center gap-2.5">
                Faculty Indent & Direct Checkout
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ffb084]/20 border border-[#ffb084]/40 text-[#0a0a0a]">
                  Priority Desk #2
                </span>
              </h1>
              <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
                Select teaching & laboratory consumables below and place your department pre-order directly.
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
                Place Indent Directly ({formatINR(effectiveTotal)})
              </Button>
            )}
          </div>
        </div>

        {/* Dedicated Store Header Banner */}
        <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-[18px] bg-[#1a3a3a] text-white">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
                  Target Store
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activeShop.badge || 'Store Active'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#0a0a0a] tracking-tight">{activeShop.name}</h2>
              <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-[#ff4d8b]" />
                {activeShop.counter || activeShop.tagline} • Hours: {activeShop.operatingHours || '8:30 AM – 6:00 PM'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6a6a6a]">Need another shop?</span>
            <Link
              to="/faculty/dashboard"
              className="font-semibold text-[#0a0a0a] hover:underline"
            >
              Switch Shop
            </Link>
          </div>
        </div>

        <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Selected Items Card */}
            {cartItems.length > 0 && (
              <div className="bg-[#fffaf0] p-6 sm:p-7 rounded-[24px] border border-[#e5e5e5] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#1a3a3a]" />
                    <h3 className="text-base font-medium tracking-tight text-[#0a0a0a]">
                      Selected Supplies ({cartItems.reduce((s, i) => s + i.quantity, 0)} units)
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddMore(!showAddMore)}
                      className="text-xs font-semibold text-[#0a0a0a] hover:underline"
                    >
                      {showAddMore ? 'Hide Product Picker' : '+ Select More Supplies'}
                    </button>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs text-[#ff4d8b] font-medium hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-[#e5e5e5]">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-[12px] object-cover border border-[#e5e5e5] flex-shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-xs text-[#0a0a0a] block truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-[#6a6a6a]">
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
                        <span className="text-xs font-semibold text-[#0a0a0a] w-16 text-right">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#6a6a6a] hover:text-[#ff4d8b] transition-colors p-1"
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

            {/* Direct Product Picker */}
            {(showAddMore || cartItems.length === 0) && (
              <ProductSelector
                onSelectProduct={handleSelectProduct}
                activeShop={activeShop}
              />
            )}

            {/* Department Indent Allocation Section */}
            <div className="bg-[#fffaf0] p-6 sm:p-7 rounded-[24px] border border-[#e5e5e5] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[12px] bg-[#ffb084]/20 flex items-center justify-center text-[#0a0a0a]">
                    <Building2 className="h-5 w-5 text-[#ff4d8b]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium tracking-tight text-[#0a0a0a]">
                      Department Indent Allocation
                    </h3>
                    <p className="text-xs text-[#6a6a6a]">
                      Tag this pre-order for official institutional billing & priority clearance
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
                  <div className="w-11 h-6 bg-[#e5e5e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a0a0a]"></div>
                </label>
              </div>

              {isBulkOrder && (
                <div className="pt-4 border-t border-[#e5e5e5] space-y-3">
                  <Input
                    label="Department / Course Purpose"
                    value={departmentNote}
                    onChange={(e) => setDepartmentNote(e.target.value)}
                    placeholder="e.g. 1st Year CSE Orientation & Lab Exam Supplies"
                    required={isBulkOrder}
                  />
                </div>
              )}
            </div>

            {/* Priority Pickup Slot Windows */}
            <div className="bg-[#fffaf0] p-6 sm:p-7 rounded-[24px] border border-[#e5e5e5] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#1a3a3a]" />
                  <h3 className="text-base font-medium tracking-tight text-[#0a0a0a]">
                    Priority Desk #2 Collection Windows
                  </h3>
                </div>
                <span className="text-xs text-[#6a6a6a]">
                  Guaranteed express store dispatch
                </span>
              </div>

              {displaySlots.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6a6a6a] bg-white rounded-[16px] border border-dashed border-[#e5e5e5]">
                  Loading available pickup slots...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {displaySlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-4 rounded-[16px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0a0a0a] bg-white ring-2 ring-[#0a0a0a] shadow-xs'
                            : 'border-[#e5e5e5] bg-white hover:border-[#0a0a0a]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#0a0a0a]">{slot.date}</span>
                          <span className="text-[10px] text-[#065f46] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Priority Window
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6a6a6a] mt-2">
                          <Clock className="h-3.5 w-3.5 text-[#ff4d8b]" />
                          <span className="font-medium text-[#0a0a0a]">{slot.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional Indent Notes */}
            <div className="bg-[#fffaf0] p-6 sm:p-7 rounded-[24px] border border-[#e5e5e5] shadow-sm space-y-3">
              <h3 className="text-base font-medium tracking-tight text-[#0a0a0a]">
                Additional Requisition Notes
              </h3>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Special lab packaging instructions, laboratory kit batch requirements, or staff volunteer collection details..."
                rows={2}
              />
            </div>
          </div>

          {/* Sticky Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-[#fffaf0] p-6 sm:p-7 rounded-[24px] border border-[#e5e5e5] shadow-sm space-y-5 sticky top-24">
              <h3 className="text-base font-medium tracking-tight text-[#0a0a0a] border-b border-[#e5e5e5] pb-3 flex items-center justify-between">
                <span>Indent Allocation</span>
                <span className="text-xs text-[#6a6a6a] font-normal">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </h3>

              <div className="space-y-2.5 max-h-48 overflow-y-auto text-xs text-[#6a6a6a] divide-y divide-[#e5e5e5]">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-[#6a6a6a] py-3 text-center italic">
                    Select supplies above to place order directly.
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-xs text-[#0a0a0a] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#6a6a6a]">
                          Qty: {item.quantity} × {formatINR(item.price)}
                        </p>
                      </div>
                      <span className="font-semibold text-xs text-[#0a0a0a] flex-shrink-0">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2.5 text-xs text-[#6a6a6a] pt-3 border-t border-[#e5e5e5]">
                <div className="flex justify-between items-center">
                  <span>Selected Store</span>
                  <span className="font-semibold text-[#0a0a0a] truncate max-w-[150px]">
                    {activeShop.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pickup Desk</span>
                  <span className="font-semibold text-[#0a0a0a]">Priority Desk #2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Collection Window</span>
                  <span className="font-semibold text-[#1a3a3a]">
                    {selectedSlot?.time || 'Loading slot...'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5e5e5] flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[#0a0a0a]">Total Allocation</span>
                <span className="text-2xl font-bold tracking-tight text-[#0a0a0a]">
                  {formatINR(effectiveTotal)}
                </span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full font-semibold"
                disabled={cartItems.length === 0 || submitting}
                loading={submitting}
                onClick={handleConfirmOrder}
                icon={Zap}
              >
                {cartItems.length === 0
                  ? 'Select Supplies Above'
                  : `Place Indent Order (${formatINR(effectiveTotal)})`}
              </Button>

              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#1a3a3a] font-medium justify-center">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Express collection guaranteed for online slots</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </FacultyLayout>
  );
}
