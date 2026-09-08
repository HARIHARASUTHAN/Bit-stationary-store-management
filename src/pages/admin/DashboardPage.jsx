import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StatCard from '@/components/ui/StatCard';
import {
  OrderVolumeChart,
  TopItemsChart,
  DepartmentComparisonChart,
  StockTurnoverChart,
} from '@/components/admin/AnalyticsCharts';
import { mockOrders } from '@/mocks/orders';
import { mockItems } from '@/mocks/items';
import { formatINR } from '@/utils/currency';
import {
  ShoppingBag,
  Package,
  Building2,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = mockOrders.reduce(
    (sum, o) => sum + (o.items?.reduce((isum, i) => isum + i.quantity, 0) || 0),
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
            Store Governance & Analytics
          </h1>
          <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
            Store turnover trends, inventory health, academic department requisitions, and governance logs
          </p>
        </div>

        {/* 4 Clay Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={formatINR(totalRevenue)}
            trend={{ positive: true, text: '+14% vs last month' }}
            icon={DollarSign}
            color="peach"
          />
          <StatCard
            title="Pre-Orders Placed"
            value={mockOrders.length}
            trend={{ positive: true, text: '+8% this week' }}
            icon={ShoppingBag}
            color="lavender"
          />
          <StatCard
            title="Units Dispatched"
            value={totalItemsSold}
            subtitle="Campus stationery distributed"
            icon={Package}
            color="teal"
          />
          <StatCard
            title="Active SKUs"
            value={mockItems.length}
            subtitle="Catalog inventory registered"
            icon={Building2}
            color="ochre"
          />
        </div>

        {/* 4 Recharts Visualizations in Clay layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrderVolumeChart />
          <TopItemsChart />
          <DepartmentComparisonChart />
          <StockTurnoverChart />
        </div>
      </div>
    </AdminLayout>
  );
}
