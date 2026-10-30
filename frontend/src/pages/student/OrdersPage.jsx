import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import OrderCard from '@/components/orders/OrderCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { mockOrders } from '@/mocks/orders';
import { getOrders, cancelOrder } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { Clock } from 'lucide-react';

export default function StudentOrdersPage() {
  const { user, role } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelModalOrder.id);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelModalOrder.id
            ? {
                ...o,
                status: 'Cancelled',
                timeline: [
                  ...(o.timeline || []),
                  {
                    status: 'Cancelled',
                    timestamp: new Date().toISOString(),
                    note: 'Order cancelled prior to store approval',
                  },
                ],
              }
            : o
        )
      );
      toast.success('Pre-order Cancelled', `Order #${cancelModalOrder.id} has been cancelled successfully.`);
      setCancelModalOrder(null);
    } catch (err) {
      toast.error('Cancellation Failed', err.response?.data?.message || err.message || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

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
              <OrderCard
                key={order.id}
                order={order}
                onCancel={(ord) => setCancelModalOrder(ord)}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={Boolean(cancelModalOrder)}
          onClose={() => !cancelling && setCancelModalOrder(null)}
          onConfirm={handleCancelOrder}
          title="Cancel Pre-Order"
          message={`Are you sure you want to cancel pre-order #${cancelModalOrder?.id}? Your reserved stationery supplies and pickup slot will be released back to the campus store.`}
          confirmText="Yes, Cancel Order"
          cancelText="Keep Order"
          variant="danger"
          loading={cancelling}
        />
      </div>
    </StudentLayout>
  );
}
