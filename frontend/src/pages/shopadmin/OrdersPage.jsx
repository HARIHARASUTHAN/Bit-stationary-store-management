import React, { useState, useEffect, useMemo } from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import OrderQueue from '@/components/admin/OrderQueue';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { mockOrders } from '@/mocks/orders';
import { getOrders, updateOrderStatus, verifyPickupCode } from '@/services/orderService';
import { getShopForUser, doesOrderMatchShop } from '@/mocks/shops';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import { Store, MapPin } from 'lucide-react';

export default function ShopAdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const toast = useToast();

  const myShop = useMemo(() => getShopForUser(user), [user]);

  const fetchOrders = () => {
    setLoading(true);
    getOrders({ shopId: myShop.id })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn('Failed to load shop admin orders:', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [myShop.id]);

  const statuses = ['All', 'Pending', 'Approved', 'Ready', 'Collected', 'Cancelled'];

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
              ...o,
              status: newStatus,
              timeline: [
                ...(o.timeline || []),
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: `Status updated to ${newStatus} by shop admin`,
                },
              ],
            }
            : o
        )
      );
      toast.success('Order Updated', `Order #${orderId} marked as ${newStatus}.`);
    } catch (err) {
      toast.error('Update Failed', err.message || 'Could not update order status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyPickup = async (orderId, code) => {
    setActionLoadingId(orderId);
    try {
      const res = await verifyPickupCode(orderId, code);
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
              ...o,
              status: 'Collected',
              isPickedUp: true,
              pickedUpAt: now,
              timeline: [
                ...(o.timeline || []),
                {
                  status: 'Collected',
                  timestamp: now,
                  note: 'Pickup verified with 6-digit code by shop admin',
                },
              ],
            }
            : o
        )
      );
      toast.success('Pickup Verified', `Order #${orderId} successfully verified & collected.`);
      return res;
    } catch (err) {
      toast.error('Verification Failed', err.message || 'Invalid pickup code.');
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  // Strictly isolate orders to this operator's designated shop counter
  const scopedOrders = useMemo(() => {
    return orders.filter((o) => doesOrderMatchShop(o, myShop));
  }, [orders, myShop]);

  const departments = Array.from(new Set(scopedOrders.map((o) => o.userDepartment)));

  const filtered = scopedOrders.filter((o) => {
    const matchesStatus = filterStatus === 'All' ? true : o.status === filterStatus;
    const matchesDept = filterDept ? o.userDepartment === filterDept : true;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (o.shopName && o.shopName.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesDept && matchesSearch;
  });

  return (
    <ShopAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Incoming Orders & Dispatch Queue
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Verify student reservations, approve incoming faculty indents, pack stationery, and record order collection
          </p>
        </div>

        {/* Dedicated Store Header Banner */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#ff4d8b]/10 text-[#ff4d8b]">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{myShop.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {myShop.badge || 'Active Store'}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {myShop.counter || myShop.tagline} • Operating Hours: {myShop.operatingHours || '8:30 AM – 6:00 PM'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right sm:border-l sm:border-gray-100 sm:pl-6">
            <span className="text-xs text-gray-500 font-medium">Orders For This Shop</span>
            <p className="text-2xl font-bold text-gray-900">{scopedOrders.length}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by Order #, student name, or roll no..."
              className="w-full sm:w-80"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {departments.length > 0 && (
                <Select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  options={[
                    { value: '', label: 'All Departments' },
                    ...departments.map((d) => ({ value: d, label: d })),
                  ]}
                  className="w-44"
                />
              )}
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pt-2 border-t border-gray-100">
            {statuses.map((st) => {
              const count =
                st === 'All'
                  ? scopedOrders.length
                  : scopedOrders.filter((o) => o.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterStatus === st
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {st}
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      filterStatus === st
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Order queue */}
        <OrderQueue
          orders={filtered}
          onUpdateStatus={handleUpdateStatus}
          onVerifyPickup={handleVerifyPickup}
          actionLoadingId={actionLoadingId}
        />
      </div>
    </ShopAdminLayout>
  );
}
