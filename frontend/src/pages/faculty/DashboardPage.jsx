import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FacultyLayout from '@/components/layout/FacultyLayout';
import Button from '@/components/ui/Button';
import ItemCard from '@/components/catalog/ItemCard';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '@/services/orderService';
import { getItems } from '@/services/inventoryService';
import { getShopInfo } from '@/services/authService';
import { getActiveCampusShops, isItemAvailableAtShop } from '@/mocks/shops';
import useCartStore from '@/hooks/useCart';
import {
  ShoppingBag,
  Clock,
  Building2,
  ArrowRight,
  Store,
  MapPin,
  Boxes,
  User,
} from 'lucide-react';

export default function FacultyDashboardPage() {
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
    } catch (_) {
      return null;
    }
  });
  const [selectedShopId, setSelectedShopId] = useState(null);
  const setCartShop = useCartStore((state) => state.setCartShop);

  const handleSelectShop = (shop) => {
    if (!shop) return;
    setSelectedShopId(shop.id);
    setCartShop(shop.id, shop.name, shop.counter);
    navigate(`/faculty/catalog?shop=${encodeURIComponent(shop.id)}`);
  };

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
      .catch(() => {});

    getOrders({ email: user?.email })
      .then((data) => {
        if (isMounted) setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    getItems()
      .then((data) => {
        if (isMounted && Array.isArray(data)) setItems(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const myOrders = orders;
  const bulkOrders = myOrders.filter((o) => o.isBulkOrder);
  const activeOrdersCount = myOrders.filter((o) => ['Pending', 'Approved', 'Ready'].includes(o.status)).length;

  const availableShops = useMemo(
    () => getActiveCampusShops(liveShops || customShopName),
    [liveShops, customShopName]
  );

  const selectedShop = useMemo(
    () => (selectedShopId ? availableShops.find((s) => s.id === selectedShopId) : null),
    [availableShops, selectedShopId]
  );

  const shopItems = useMemo(() => {
    if (!selectedShopId) return items;
    return items.filter((item) => {
      return isItemAvailableAtShop(item, selectedShopId, customShopName);
    });
  }, [items, selectedShopId, customShopName]);

  // Featured Teaching & Examination items (exclude Interview File, prioritize Whiteboard Marker)
  const featuredItems = useMemo(() => {
    const nonInterview = shopItems.filter(
      (item) => !(item.name && item.name.toLowerCase().includes('interview file'))
    );

    const whiteboardMarker = shopItems.find(
      (item) =>
        item.name &&
        (item.name.toLowerCase().includes('white board marker') ||
          item.name.toLowerCase().includes('whiteboard marker'))
    );

    if (whiteboardMarker) {
      const rest = nonInterview.filter((item) => item.id !== whiteboardMarker.id);
      return [whiteboardMarker, ...rest].slice(0, 4);
    }

    return nonInterview.slice(0, 4);
  }, [shopItems]);

  return (
    <FacultyLayout>
      <div className="space-y-12">
        {/* Clay Hero Section with 7-5 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-xs font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">
              <Building2 className="h-3.5 w-3.5 text-[#ff4d8b]" />
              Academic Department Desk
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-2px] text-[#0a0a0a] leading-[1.05]">
              Hello, {user?.displayName || user?.name || 'Professor'}
            </h1>

            <p className="text-base text-[#6a6a6a] max-w-xl font-normal leading-relaxed">
              Order classroom chalk, dry-erase markers, test booklets, graph sheets, and laboratory consumables with priority store dispatch and departmental billing.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/faculty/catalog">
                <Button variant="primary" size="md" icon={ShoppingBag}>
                  Requisition Supplies
                </Button>
              </Link>
              <Link to="/faculty/orders">
                <Button variant="secondary" size="md" icon={Clock}>
                  Orders ({activeOrdersCount})
                </Button>
              </Link>
              <Link to="/faculty/profile">
                <Button
                  variant="ghost"
                  size="md"
                  icon={User}
                  className="border border-[#e5e5e5] hover:bg-[#f5f0e0] text-[#0a0a0a]"
                >
                  My Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column: Clay Deep Teal Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#1a3a3a] text-white p-8 rounded-[24px] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#ffb084]">
                  {selectedShop ? 'Assigned Branch Desk' : 'Academic Express Dispatch'}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffb084]"></span>
              </div>
              <h3 className="text-2xl font-medium tracking-[-1px] text-white">
                {selectedShop ? selectedShop.name : 'Express Store Dispatch'}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                {selectedShop
                  ? `${selectedShop.counter || selectedShop.tagline} • Operating: ${selectedShop.operatingHours || '8:30 AM – 6:00 PM'}`
                  : 'Faculty indents are prepared by dedicated dispatch operators for express handover.'}
              </p>

              <div className="bg-white/10 rounded-[16px] p-4 text-xs space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Assigned Department</span>
                  <span className="font-semibold text-white">{user?.department || 'Computer Science'}</span>
                </div>
              </div>

              {selectedShop ? (
                <button
                  type="button"
                  onClick={() => handleSelectShop(selectedShop)}
                  className="w-full py-2.5 px-4 rounded-[16px] bg-white text-[#0a0a0a] hover:bg-white/90 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Browse {selectedShop.name} Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link to="/faculty/catalog" className="block w-full">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-[16px] bg-white text-[#0a0a0a] hover:bg-white/90 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>Browse All Stationery Supplies</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* CAMPUS SHOPS SECTION (Select Shop Name to View Items) */}
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-[11px] font-semibold uppercase tracking-[1px] text-[#0a0a0a] mb-1.5">
                <Store className="h-3 w-3 text-[#065f46]" />
                Campus Outlets & Stores
              </div>
              <h2 className="text-xl sm:text-2xl font-medium tracking-[-0.5px] text-[#0a0a0a]">
                Select Campus Shop for Requisitions
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-0.5 font-normal">
                Choose a branch location to view available academic inventory and dispatch counters.
              </p>
            </div>

            <div className="text-xs text-[#6a6a6a] font-medium hidden sm:block">
              {availableShops.length} active campus pickup locations
            </div>
          </div>

          <div
            className={`grid grid-cols-1 ${
              availableShops.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
            } gap-3.5 sm:gap-4`}
          >
            {availableShops.map((shop, idx) => {
              const isSelected = Boolean(selectedShopId && shop.id === selectedShopId);
              const countForShop = items.filter((it) =>
                isItemAvailableAtShop(it, shop.id, customShopName)
              ).length;
              const accentColor =
                shop.accentColor ||
                (idx === 0 ? '#065f46' : idx === 1 ? '#1e3a5f' : idx === 2 ? '#1a3a3a' : '#e8b94a');

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
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                    style={{ backgroundColor: accentColor }}
                  />

                  <div className="pl-1.5 space-y-2">
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

                    <p className="text-[11.5px] text-[#6a6a6a] line-clamp-2 leading-relaxed pl-0.5">
                      {shop.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#e8e3d8] flex items-center justify-between text-xs pl-1.5">
                    <div className="flex items-center gap-1.5 text-[#555] font-medium text-[11px]">
                      <Boxes className="h-3 w-3 text-[#777]" />
                      <span>{countForShop} Items In Stock</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0a0a0a] text-white group-hover:bg-[#252525] group-hover:gap-1.5 transition-all shadow-xs">
                        Select Shop
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Items Grid */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                Teaching & Examination Supplies {selectedShop ? `(${selectedShop.name})` : ''}
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-1">
                Record pads, board marker sets, paper reams, and lab materials
              </p>
            </div>
            <Link
              to={selectedShop ? `/faculty/catalog?shop=${encodeURIComponent(selectedShop.id)}` : '/faculty/catalog'}
              className="text-xs font-semibold text-[#0a0a0a] hover:text-[#ff4d8b] inline-flex items-center gap-1 transition-colors"
            >
              Browse Full Catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}
