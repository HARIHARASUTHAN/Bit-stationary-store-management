import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import StatCard from '@/components/ui/StatCard';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import RevenueDetailModal from '@/components/shopadmin/RevenueDetailModal';
import TotalOrdersDetailModal from '@/components/shopadmin/TotalOrdersDetailModal';
import { mockItems } from '@/mocks/items';
import mockOrders from '@/mocks/orders';
import { getOrders } from '@/services/orderService';
import { getItems } from '@/services/inventoryService';
import { getShopForUser, doesOrderMatchShop, getShopForItem, isItemAvailableAtShop } from '@/mocks/shops';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/utils/currency';
import {
  ClipboardList,
  AlertTriangle,
  Package,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Store,
  MapPin,
} from 'lucide-react';

export default function ShopAdminDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const myShop = useMemo(() => getShopForUser(user), [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = () => {
      getOrders({ shopId: myShop.id })
        .then((data) => {
          if (isMounted) {
            setOrders(Array.isArray(data) ? data : []);
          }
        })
        .catch((e) => {
          console.warn('Orders fetch error:', e);
          if (isMounted) setOrders([]);
        });
    };

    fetchOrders();

    // Re-fetch when shop admin returns to the tab or focus changes
    const handleFocus = () => fetchOrders();
    window.addEventListener('focus', handleFocus);

    // Periodic auto-sync every 8 seconds so collected revenue updates live
    const interval = setInterval(fetchOrders, 8000);

    getItems()
      .then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((e) => console.warn('Items fetch error:', e));

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [myShop.id]);

  // Strictly isolate orders received for this operator's designated shop
  const scopedOrders = useMemo(() => {
    return orders.filter((o) => doesOrderMatchShop(o, myShop));
  }, [orders, myShop]);

  // Incoming active pre-orders (strictly exclude collected and cancelled orders)
  const incomingOrders = useMemo(() => {
    return scopedOrders.filter((o) => {
      const s = (o.status || '').toLowerCase().trim();
      return s !== 'collected' && s !== 'cancelled';
    });
  }, [scopedOrders]);

  const scopedItems = useMemo(() => {
    return items
      .filter((i) => isItemAvailableAtShop(i, myShop.id, myShop.name))
      .map((item) => {
        const shopStock = (item.shopStocks && typeof item.shopStocks[myShop.id] === 'number')
          ? item.shopStocks[myShop.id]
          : (typeof item.stock === 'number' ? item.stock : 0);
        return {
          ...item,
          stock: shopStock,
        };
      });
  }, [items, myShop.id, myShop.name]);

  const pendingOrders = scopedOrders.filter((o) => (o.status || '').toLowerCase() === 'pending');
  const readyOrders = scopedOrders.filter((o) => (o.status || '').toLowerCase() === 'ready');
  const lowStockItems = scopedItems.filter((i) => i.stock <= i.lowStockThreshold);

  // Revenue Calculations: Revenue Earned tracks collected orders
  const validOrders = scopedOrders.filter((o) => (o.status || '').toLowerCase() !== 'cancelled');
  const totalGross = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const collectedOrders = scopedOrders.filter(
    (o) => (o.status || '').toLowerCase() === 'collected'
  );
  const collectedRevenue = collectedOrders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );
  const pendingRevenue = scopedOrders
    .filter((o) => {
      const s = (o.status || '').toLowerCase();
      return s === 'pending' || s === 'approved' || s === 'ready';
    })
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <ShopAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
            Store Operations
          </h1>
          <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
            Manage incoming pre-order queues, revenue earned, stock replenishment, and store dispatch
          </p>
        </div>

        {/* Dedicated Store Header Banner */}
        <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-[18px] bg-[#ff4d8b]/15 text-[#ff4d8b]">
            <Store className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-[#0a0a0a]">{myShop.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {myShop.badge || 'Store Active'}
              </span>
            </div>
            <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5 mt-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-[#ff4d8b]" />
              {myShop.counter || myShop.tagline} • Operating Hours: {myShop.operatingHours || '8:30 AM – 6:00 PM'}
            </p>
          </div>
        </div>

        {/* 5 Stat Cards in Clay palette with Revenue Earned & Total Orders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Revenue Earned"
            value={formatINR(collectedRevenue)}
            subtitle={`${collectedOrders.length} collected`}
            trend={{ positive: true, text: 'Realized' }}
            icon={IndianRupee}
            color="peach"
            onClick={() => setShowRevenueModal(true)}
          />
          <StatCard
            title="Pending Approval"
            value={pendingOrders.length}
            subtitle="Requires staff verification"
            icon={ClipboardList}
            color="rose"
          />
          <StatCard
            title="Total Orders"
            value={scopedOrders.length}
            subtitle="All campus reservations"
            icon={Package}
            color="lavender"
            onClick={() => setShowOrdersModal(true)}
          />
          <StatCard
            title="Low-Stock Alerts"
            value={lowStockItems.length}
            subtitle="Needs warehouse refill"
            icon={AlertTriangle}
            color="peach"
          />
          <StatCard
            title="Total Stock Items"
            value={scopedItems.length}
            subtitle="In stationery catalog"
            icon={Package}
            color="navy"
          />
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incoming Orders Queue */}
          <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <div>
                <h3 className="text-lg font-medium tracking-[-0.5px] text-[#0a0a0a]">
                  Incoming Pre-Orders
                </h3>
                <p className="text-xs text-[#6a6a6a]">Active reservations destined for {myShop.name}</p>
              </div>
              <Link
                to="/shopadmin/orders"
                className="text-xs font-semibold text-[#0a0a0a] hover:underline inline-flex items-center"
              >
                View all ({incomingOrders.length}) <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {incomingOrders.length === 0 ? (
                <div className="p-8 text-center bg-[#faf5e8] rounded-[16px] border border-dashed border-[#e5e5e5] text-xs text-[#6a6a6a]">
                  No active incoming pre-orders for {myShop.name}.
                </div>
              ) : (
                incomingOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-[#faf5e8] rounded-[16px] border border-[#e5e5e5] flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs text-[#0a0a0a]">#{order.id}</span>
                        <OrderStatusBadge status={order.status} />
                        <span className="text-[10px] bg-white text-[#0a0a0a] font-medium px-2 py-0.5 rounded-full border border-[#e5e5e5]">
                          {order.shopName || myShop.name}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#0a0a0a]">
                        {order.userName} ({order.userDepartment})
                      </p>
                      <p className="text-[11px] text-[#6a6a6a]">
                        Slot: {order.pickupSlot?.date} at {order.pickupSlot?.time} • {order.counterLocation || myShop.counter}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-sm text-[#0a0a0a] block">
                        {formatINR(order.total)}
                      </span>
                      <Link
                        to="/shopadmin/orders"
                        className="text-xs font-semibold text-[#0a0a0a] hover:underline"
                      >
                        Process →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Items Alert Box */}
          <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <div>
                <h3 className="text-lg font-medium tracking-[-0.5px] text-[#0a0a0a]">
                  Low-Stock Warnings
                </h3>
                <p className="text-xs text-[#6a6a6a]">Items requiring warehouse replenishment</p>
              </div>
              <Link
                to="/shopadmin/inventory?stock=low"
                className="text-xs font-semibold text-[#0a0a0a] hover:underline inline-flex items-center"
              >
                Update Stock <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="p-8 text-center bg-[#faf5e8] rounded-[16px] border border-dashed border-[#e5e5e5] text-xs text-[#6a6a6a]">
                  All inventory stocks are healthy above alert thresholds.
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#ffb084]/15 rounded-[16px] border border-[#ffb084]/30 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-[10px] object-cover bg-[#f5f0e0] flex-shrink-0 border border-[#e5e5e5]"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/shopadmin/inventory?stock=low&search=${encodeURIComponent(item.name)}&edit=${item.id}`}
                          className="text-xs font-semibold text-[#0a0a0a] hover:text-[#ff4d8b] hover:underline transition-colors block truncate cursor-pointer"
                          title={`Click to update stock for ${item.name}`}
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-[#6a6a6a]">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-[#ff4d8b] block">
                        {item.stock} left in shelf
                      </span>
                      <Link
                        to={`/shopadmin/inventory?stock=low&search=${encodeURIComponent(item.name)}&edit=${item.id}`}
                        className="text-[11px] font-semibold text-[#1a3a3a] hover:underline block mt-0.5"
                      >
                        Update Stock →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Revenue Audit Modal */}
      <RevenueDetailModal
        isOpen={showRevenueModal}
        onClose={() => setShowRevenueModal(false)}
        orders={scopedOrders}
      />

      {/* Detailed Total Orders Audit Modal (Daily, Weekly, Monthly) */}
      <TotalOrdersDetailModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        orders={scopedOrders}
        shopName={myShop.name}
      />
    </ShopAdminLayout>
  );
}
