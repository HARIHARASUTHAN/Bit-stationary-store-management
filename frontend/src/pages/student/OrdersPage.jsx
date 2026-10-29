import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import OrderCard from '@/components/orders/OrderCard';
import EmptyState from '@/components/ui/EmptyState';
import { mockOrders } from '@/mocks/orders';
import { getOrders } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { Clock } from 'lucide-react';

export default function StudentOrdersPage() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getOrders({ userId: user?.uid, email: user?.email })
      .then((data) => {
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load orders:', err);
        if (isMounted) {
          setOrders([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [user?.uid, user?.email]);

  const statuses = ['All', 'Pending', 'Approved', 'Ready', 'Collected', 'Cancelled'];

  const filtered = orders.filter((order) =>
    filterStatus === 'All' ? true : order.status === filterStatus
  );

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
              {role === 'faculty' ? 'Orders' : 'My Pre-Orders'}
            </h1>
            <p className="text-xs text-[#6a6a6a] mt-1">
              Track status, pickup windows, and printable vouchers for campus store collection
            </p>
          </div>
          <Link
            to={`/${role}/catalog`}
            className="inline-flex items-center text-xs font-semibold text-[#0a0a0a] hover:underline"
          >
            + Place New Pre-Order
          </Link>
        </div>

        {/* Status Filters - Clay pill tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                filterStatus === st
                  ? 'bg-[#0a0a0a] text-white shadow-none'
                  : 'bg-transparent text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#faf5e8]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No pre-orders found"
            description={
              filterStatus === 'All'
                ? "You haven't placed any stationery pre-orders yet."
                : `No orders currently matching status "${filterStatus}".`
            }
            actionText={filterStatus === 'All' ? 'Browse Stationery Catalog' : undefined}
            onAction={filterStatus === 'All' ? () => window.location.assign(`/${role}/catalog`) : undefined}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
