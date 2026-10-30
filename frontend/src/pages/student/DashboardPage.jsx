import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { mockItems } from '@/mocks/items';
import mockOrders from '@/mocks/orders';
import { getActiveCampusShops, getShopForItem, isItemAvailableAtShop } from '@/mocks/shops';
import { getOrders } from '@/services/orderService';
import { getItems } from '@/services/inventoryService';
import { getShopInfo } from '@/services/authService';
import useCartStore from '@/hooks/useCart';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Store,
  MapPin,
  ChevronRight,
  Boxes,
  User,
} from 'lucide-react';

const SHOP_COLOR_THEMES = [
  {
    // RASE MECH / Primary Store - Deep Emerald Green (Academic Engineering Depot)
    idMatch: 'main-store',
    nameMatch: 'rase',
    hoverCard: 'hover:bg-[#065f46] hover:border-[#065f46] hover:text-white',
    selectedCard: 'bg-[#065f46] text-white border-[#065f46]',
    badge: 'group-hover:bg-white/20 group-hover:text-white',
    dot: 'group-hover:bg-[#a4d4c5]',
    text: 'group-hover:text-white',
    subtext: 'group-hover:text-white/90',
    description: 'group-hover:text-white/85',
    divider: 'group-hover:border-white/20',
  },
  {
    // SIS BIT / Secondary Store - Deep Academic Navy Blue
    idMatch: 'sis-bit',
    nameMatch: 'sis',
    hoverCard: 'hover:bg-[#1e3a5f] hover:border-[#1e3a5f] hover:text-white',
    selectedCard: 'bg-[#1e3a5f] text-white border-[#1e3a5f]',
    badge: 'group-hover:bg-white/20 group-hover:text-white',
    dot: 'group-hover:bg-[#a4d4c5]',
    text: 'group-hover:text-white',
    subtext: 'group-hover:text-white/90',
    description: 'group-hover:text-white/85',
    divider: 'group-hover:border-white/20',
  },
  {
    // 3rd Campus Outlet - Deep Forest Teal
    idMatch: 'teal',
    hoverCard: 'hover:bg-[#1a3a3a] hover:border-[#1a3a3a] hover:text-white',
    selectedCard: 'bg-[#1a3a3a] text-white border-[#1a3a3a]',
    badge: 'group-hover:bg-white/20 group-hover:text-white',
    dot: 'group-hover:bg-[#ffb084]',
    text: 'group-hover:text-white',
    subtext: 'group-hover:text-white/90',
    description: 'group-hover:text-white/85',
    divider: 'group-hover:border-white/20',
  },
  {
    // 4th Campus Branch - Warm Ochre
    idMatch: 'ochre',
    hoverCard: 'hover:bg-[#e8b94a] hover:border-[#e8b94a] hover:text-[#0a0a0a]',
    selectedCard: 'bg-[#e8b94a] text-[#0a0a0a] border-[#e8b94a]',
    badge: 'group-hover:bg-black/15 group-hover:text-[#0a0a0a]',
    dot: 'group-hover:bg-[#0a0a0a]',
    text: 'group-hover:text-[#0a0a0a]',
    subtext: 'group-hover:text-[#0a0a0a]/90',
    description: 'group-hover:text-[#0a0a0a]/85',
    divider: 'group-hover:border-black/15',
  },
];

function getShopTheme(shop, index = 0) {
  const shopId = (shop.id || '').toLowerCase();
  const shopName = (shop.name || '').toLowerCase();

  if (shopId === 'main-store' || shopName.includes('rase')) {
    return SHOP_COLOR_THEMES[0];
  }
  if (shopId === 'sis-bit' || shopName.includes('sis')) {
    return SHOP_COLOR_THEMES[1];
  }
  return SHOP_COLOR_THEMES[index % SHOP_COLOR_THEMES.length];
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [customShopName, setCustomShopName] = useState(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('bsp_custom_shop_name') : '') || 'RASE MECH';
  });
  const [liveShops, setLiveShops] = useState(() => {
    try {
      const cached = localStorage.getItem('bsp_live_campus_shops');
      return cached ? JSON.parse(cached) : null;
    } catch (_) { return null; }
  });
  const [selectedShopId, setSelectedShopId] = useState(null);
  const setCartShop = useCartStore((state) => state.setCartShop);

  const handleSelectShop = (shop) => {
    if (!shop) return;
    setSelectedShopId(shop.id);
    setCartShop(shop.id, shop.name, shop.counter);
    navigate(`/student/catalog?shop=${encodeURIComponent(shop.id)}`);
  };

  // Load live shop info & storage sync
  useEffect(() => {
    let isMounted = true;
    getShopInfo()
      .then((data) => {
        if (isMounted && data) {
          if (data.shopName) {
            setCustomShopName(data.shopName);
            localStorage.setItem('bsp_custom_shop_name', data.shopName);
          }
          if (data.shops && Array.isArray(data.shops) && data.shops.length > 0) {
            setLiveShops(data.shops);
            localStorage.setItem('bsp_live_campus_shops', JSON.stringify(data.shops));
          }
        }
      })
      .catch(() => { });

    // Listen for storage events (if edited in another tab/window)
    const handleStorage = (e) => {
      if (e.key === 'bsp_custom_shop_name' && e.newValue) {
        setCustomShopName(e.newValue);
      }
      if (e.key === 'bsp_live_campus_shops' && e.newValue) {
        try {
          setLiveShops(JSON.parse(e.newValue));
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getOrders({ userId: user?.uid, email: user?.email })
      .then((data) => {
        if (isMounted && data && Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(() => { });

    getItems()
      .then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => { });

    return () => { isMounted = false; };
  }, [user?.uid, user?.email]);

  // Student's active orders (backend getOrders already scopes to the authenticated student)
  const myOrders = orders;
  const activeOrdersCount = myOrders.filter((o) => ['Pending', 'Approved', 'Ready'].includes(o.status)).length;

  // Dynamic campus shops list with latest custom shop name or admin accounts
  const availableShops = useMemo(
    () => getActiveCampusShops(liveShops || customShopName),
    [liveShops, customShopName]
  );

  const selectedShop = useMemo(
    () => (selectedShopId ? availableShops.find((s) => s.id === selectedShopId) : null),
    [availableShops, selectedShopId]
  );

  // Filter items available at the selected campus shop (or all items if none selected)
  const shopItems = useMemo(() => {
    if (!selectedShopId) return items;
    return items.filter((item) => {
      return isItemAvailableAtShop(item, selectedShopId, customShopName);
    });
  }, [items, selectedShopId, customShopName]);

  return (
    <StudentLayout>
      <div className="space-y-12">
        {/* Clay Hero Section with 7-5 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-xs font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">
              <Sparkles className="h-3.5 w-3.5 text-[#ff4d8b]" />
              Welcome to the Store Portal
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-2px] text-[#0a0a0a] leading-[1.05]">
              Hello, {user?.displayName || user?.name || 'Student'}
            </h1>

            <p className="text-base text-[#6a6a6a] max-w-xl font-normal leading-relaxed">
              Your campus pre-ordering tray is active. Select any campus shop below to browse available stationery, lab manuals, and tools ready for instant pickup.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/student/catalog">
                <Button variant="primary" size="md" icon={ShoppingBag}>
                  Browse Full Catalog
                </Button>
              </Link>
              <Link to="/student/orders">
                <Button variant="secondary" size="md" icon={Clock}>
                  Track Pre-Orders ({activeOrdersCount})
                </Button>
              </Link>
              <Link to="/student/profile">
                <Button variant="ghost" size="md" icon={User} className="border border-[#e5e5e5] hover:bg-[#f5f0e0] text-[#0a0a0a]">
                  My Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column: Clay Saturated Hero Feature Card (Lavender) */}
          <div className="lg:col-span-5">
            <div className="bg-[#b8a4ed] text-[#0a0a0a] p-8 rounded-[24px] space-y-4 border border-[#b8a4ed]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#0a0a0a]">
                  {selectedShop ? 'Selected Pickup Desk' : 'Campus Store Network'}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#0a0a0a]"></span>
              </div>
              <h3 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                {selectedShop ? selectedShop.counter : 'Express Store Pickup'}
              </h3>
              <p className="text-xs text-[#0a0a0a]/80 leading-relaxed font-normal">
                {selectedShop
                  ? `${selectedShop.name} · ${selectedShop.tagline}`
                  : 'Select your preferred campus store below to view and pre-order stationery items.'}
              </p>

              {/* Embedded UI Fragment */}
              <div className="bg-[#fffaf0] rounded-[16px] p-4 border border-[#e5e5e5] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#6a6a6a]">
                  <span>Operational Hours</span>
                  <span className="font-semibold text-[#0a0a0a]">
                    {selectedShop ? selectedShop.operatingHours : '8:30 AM – 6:00 PM'}
                  </span>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[#1a3a3a] font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Queue-bypass guaranteed for online slots</span>
                </div>
              </div>

              {selectedShop && (
                <button
                  type="button"
                  onClick={() => handleSelectShop(selectedShop)}
                  className="w-full py-2.5 px-4 rounded-[16px] bg-[#0a0a0a] text-white hover:bg-[#252525] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
                >
                  <span>Browse {selectedShop.name} Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>


        {/* ======================================================== */}
        {/* CAMPUS SHOPS SECTION (Select Shop Name to View Items) */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-[11px] font-semibold uppercase tracking-[1px] text-[#0a0a0a] mb-1.5">
                <Store className="h-3 w-3 text-[#065f46]" />
                Campus Outlets & Stores
              </div>
              <h2 className="text-xl sm:text-2xl font-medium tracking-[-0.5px] text-[#0a0a0a]">
                Select Campus Shop
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-0.5 font-normal">
                Choose a stationery branch to view and reserve its inventory.
              </p>
            </div>

            <div className="text-xs text-[#6a6a6a] font-medium hidden sm:block">
              {availableShops.length} active campus pickup locations
            </div>
          </div>

          {/* Interactive Compact & Attractive Shop Selection Cards */}
          <div className={`grid grid-cols-1 ${availableShops.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-3.5 sm:gap-4`}>
            {availableShops.map((shop, idx) => {
              const isSelected = Boolean(selectedShopId && shop.id === selectedShopId);
              const countForShop = items.filter((it) => isItemAvailableAtShop(it, shop.id, customShopName)).length;
              const accentColor = shop.accentColor || (idx === 0 ? '#065f46' : idx === 1 ? '#1e3a5f' : idx === 2 ? '#1a3a3a' : '#e8b94a');

              return (
                <div
                  key={shop.id}
                  onClick={() => handleSelectShop(shop)}
                  className={`cursor-pointer rounded-[18px] p-3.5 sm:p-4 transition-all duration-200 border flex flex-col justify-between text-left relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? 'border-[#0a0a0a] bg-[#faf5e8] ring-2 ring-[#0a0a0a] shadow-xs'
                      : 'bg-[#fffaf0] border-[#e5e5e5] hover:border-[#0a0a0a]/30'
                  }`}
                >
                  {/* Left Edge Brand Accent Bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                    style={{ backgroundColor: accentColor }}
                  />

                  <div className="pl-1.5 space-y-2">
                    {/* Header: Shop Icon + Name + Badge + Hours */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Store className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-[#0a0a0a] transition-colors truncate">
                              {shop.name}
                            </h3>
                            <span className="text-[9.5px] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded-full bg-[#ede8dc] text-[#555]">
                              {shop.badge}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#6a6a6a] mt-0.5">
                            <MapPin className="h-2.5 w-2.5 shrink-0 text-[#888]" />
                            <span className="truncate">{shop.counter || shop.tagline}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-medium text-[#444] bg-[#f0ebd9] px-2 py-0.5 rounded-full shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{shop.operatingHours ? shop.operatingHours.split('–')[0].trim() : 'Open'}</span>
                      </div>
                    </div>

                    {/* Concise description */}
                    <p className="text-[11.5px] text-[#6a6a6a] line-clamp-2 leading-relaxed pl-0.5">
                      {shop.description}
                    </p>
                  </div>

                  {/* Compact Footer Strip */}
                  <div className="mt-2.5 pt-2 border-t border-[#e8e3d8] flex items-center justify-between text-xs pl-1.5">
                    <div className="flex items-center gap-1.5 text-[#555] font-medium text-[11px]">
                      <Boxes className="h-3 w-3 text-[#777]" />
                      <span>{countForShop} Items In Stock</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0a0a0a] text-white group-hover:bg-[#252525] group-hover:gap-1.5 transition-all shadow-xs">
                        Browse Shop
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clay 3-Card Saturated Section: Pink, Teal, Ochre */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
              Pre-Ordering Workflow
            </h2>
            <span className="text-xs text-[#6a6a6a]">Three-step campus fulfillment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 Card - Navy Blue (matching SIS BIT theme) */}
            <div className="bg-[#1e3a5f] text-white p-8 rounded-[24px] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/80">
                  Step 01
                </span>
                <h3 className="text-2xl font-medium tracking-[-1px] text-white">
                  Select Stationery
                </h3>
                <p className="text-xs text-white/90 leading-relaxed font-normal">
                  Browse verified stock across 8 categories. Reserve genuine calculators, spiral notebooks, and record books.
                </p>
              </div>
              <div className="bg-white/10 rounded-[16px] p-3 text-[11px] text-white font-medium">
                30+ campus SKUs in stock
              </div>
            </div>

            {/* Deep Teal Card */}
            <div className="bg-[#1a3a3a] text-white p-8 rounded-[24px] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#a4d4c5]">
                  Step 02
                </span>
                <h3 className="text-2xl font-medium tracking-[-1px] text-white">
                  Pick Time Window
                </h3>
                <p className="text-xs text-white/80 leading-relaxed font-normal">
                  Lock in an hourly pickup slot so your items are boxed and waiting before you reach the store.
                </p>
              </div>
              <div className="bg-white/10 rounded-[16px] p-3 text-[11px] text-[#a4d4c5] font-medium">
                Daily slots 9:00 AM – 5:00 PM
              </div>
            </div>

            {/* Ochre Card */}
            <div className="bg-[#e8b94a] text-[#0a0a0a] p-8 rounded-[24px] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#0a0a0a]/70">
                  Step 03
                </span>
                <h3 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                  Store Pickup
                </h3>
                <p className="text-xs text-[#0a0a0a]/80 leading-relaxed font-normal">
                  Show your confirmation number or printable voucher at your selected store.
                </p>
              </div>
              <div className="bg-black/10 rounded-[16px] p-3 text-[11px] text-[#0a0a0a] font-medium">
                Direct hand-off in seconds
              </div>
            </div>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
