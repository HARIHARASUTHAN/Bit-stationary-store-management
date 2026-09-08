import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import RevenueDetailModal from '@/components/shopadmin/RevenueDetailModal';
import { mockItems } from '@/mocks/items';
import mockOrders from '@/mocks/orders';
import { formatINR } from '@/utils/currency';
import {
  ClipboardList,
  AlertTriangle,
  Package,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
} from 'lucide-react';

export default function ShopAdminDashboardPage() {
  const [orders] = useState(mockOrders);
  const [items] = useState(mockItems);
  const [showRevenueModal, setShowRevenueModal] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const readyOrders = orders.filter((o) => o.status === 'Ready');
  const lowStockItems = items.filter((i) => i.stock <= i.lowStockThreshold);

  // Revenue Calculations
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const collectedRevenue = orders
    .filter((o) => o.status === 'Collected')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingRevenue = orders
    .filter((o) => o.status === 'Pending' || o.status === 'Approved' || o.status === 'Ready')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <ShopAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
              Counter Operations
            </h1>
            <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
              Manage incoming pre-order queues, revenue earned, stock replenishment, and counter dispatch
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={IndianRupee}
              onClick={() => setShowRevenueModal(true)}
            >
              Revenue Audit
            </Button>
            <Link to="/shopadmin/inventory">
              <Button variant="secondary" size="md" icon={Package}>
                Inventory Catalog
              </Button>
            </Link>
            <Link to="/shopadmin/orders">
              <Button variant="primary" size="md" icon={ClipboardList}>
                Order Queue ({pendingOrders.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 Stat Cards in Clay palette with Revenue Earned */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Revenue Earned"
            value={formatINR(totalRevenue)}
            subtitle={`${formatINR(collectedRevenue)} collected • View details`}
            trend={{ positive: true, text: 'Audit' }}
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
            title="Ready for Pickup"
            value={readyOrders.length}
            subtitle="Packed at dispatch desk"
            icon={CheckCircle2}
            color="lavender"
          />
          <StatCard
            title="Low-Stock Alerts"
            value={lowStockItems.length}
            subtitle="Below threshold limit"
            icon={AlertTriangle}
            color="ochre"
          />
          <StatCard
            title="Catalog SKUs"
            value={items.length}
            subtitle="Total registered items"
            icon={Package}
            color="teal"
          />
        </div>

        {/* Quick Revenue Intelligence Banner */}
        <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#0a0a0a] transition-all">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full bg-[#ffb084]/30 text-[#0a0a0a] border border-[#ffb084]/50">
                Revenue Intelligence
              </span>
              <span className="text-xs text-[#6a6a6a]">Academic Term 2026</span>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-[#0a0a0a]">
              Total Campus Billing: <span className="font-semibold">{formatINR(totalRevenue)}</span>
            </h3>
            <p className="text-xs text-[#6a6a6a] leading-relaxed">
              Realized <span className="font-semibold text-emerald-800">{formatINR(collectedRevenue)}</span> in verified counter settlements. Remaining <span className="font-semibold text-[#0a0a0a]">{formatINR(pendingRevenue)}</span> active in counter dispatch pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-[#faf5e8] px-4 py-2 rounded-[14px] border border-[#e5e5e5] text-left">
              <span className="text-[10px] text-[#6a6a6a] uppercase font-bold tracking-wider block">
                Pending Realization
              </span>
              <span className="text-sm font-semibold text-[#0a0a0a]">
                {formatINR(pendingRevenue)}
              </span>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={TrendingUp}
              onClick={() => setShowRevenueModal(true)}
            >
              View Revenue in Detail →
            </Button>
          </div>
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
                <p className="text-xs text-[#6a6a6a]">Most recent student & faculty reservations</p>
              </div>
              <Link
                to="/shopadmin/orders"
                className="text-xs font-semibold text-[#0a0a0a] hover:underline inline-flex items-center"
              >
                View all ({orders.length}) <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-[#faf5e8] rounded-[16px] border border-[#e5e5e5] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#0a0a0a]">#{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs font-medium text-[#0a0a0a]">
                      {order.userName} ({order.userDepartment})
                    </p>
                    <p className="text-[11px] text-[#6a6a6a]">
                      Slot: {order.pickupSlot?.date} at {order.pickupSlot?.time}
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
              ))}
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
                to="/shopadmin/inventory"
                className="text-xs font-semibold text-[#0a0a0a] hover:underline inline-flex items-center"
              >
                Update Stock <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#ffb084]/15 rounded-[16px] border border-[#ffb084]/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-[10px] object-cover bg-[#f5f0e0] flex-shrink-0 border border-[#e5e5e5]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#0a0a0a]">{item.name}</p>
                      <p className="text-[11px] text-[#6a6a6a]">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#ff4d8b] block">
                      {item.stock} left in shelf
                    </span>
                    <span className="text-[10px] text-[#6a6a6a]">
                      Alert threshold: {item.lowStockThreshold}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Revenue Audit Modal */}
      <RevenueDetailModal
        isOpen={showRevenueModal}
        onClose={() => setShowRevenueModal(false)}
        orders={orders}
      />
    </ShopAdminLayout>
  );
}
