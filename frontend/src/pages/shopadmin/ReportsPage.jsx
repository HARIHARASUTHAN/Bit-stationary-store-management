import React, { useState, useEffect, useMemo } from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { getOrders } from '@/services/orderService';
import { getItems } from '@/services/inventoryService';
import { getShopForUser, doesOrderMatchShop, isItemAvailableAtShop } from '@/mocks/shops';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/formatDate';
import { useToast } from '@/components/ui/ToastProvider';
import {
  FileText,
  FileSpreadsheet,
  Store,
  MapPin,
  Clock,
  IndianRupee,
  Package,
  ClipboardList,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export default function ShopAdminReportsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();

  const myShop = useMemo(() => getShopForUser(user), [user]);

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getOrders({ shopId: myShop.id }).catch(() => []),
      getItems().catch(() => []),
    ]).then(([ordersData, itemsData]) => {
      if (isMounted) {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setItems(Array.isArray(itemsData) ? itemsData : []);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [myShop.id]);

  // Strictly isolate orders belonging to this shop
  const scopedOrders = useMemo(() => {
    return orders.filter((o) => doesOrderMatchShop(o, myShop));
  }, [orders, myShop]);

  // Filter orders by date range and status
  const filteredOrders = useMemo(() => {
    return scopedOrders.filter((ord) => {
      if (statusFilter !== 'all' && (ord.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (ord.placedAt || ord.createdAt) {
        const d = new Date(ord.placedAt || ord.createdAt);
        if (dateFrom) {
          const from = new Date(dateFrom + 'T00:00:00');
          if (d < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo + 'T23:59:59');
          if (d > to) return false;
        }
      }
      return true;
    });
  }, [scopedOrders, statusFilter, dateFrom, dateTo]);

  // Scoped items with shop stock
  const scopedItems = useMemo(() => {
    return items
      .filter((i) => isItemAvailableAtShop(i, myShop.id, myShop.name))
      .map((item) => {
        const shopStock =
          item.shopStocks && typeof item.shopStocks[myShop.id] === 'number'
            ? item.shopStocks[myShop.id]
            : typeof item.stock === 'number'
            ? item.stock
            : 0;
        return {
          ...item,
          stock: shopStock,
          valuation: shopStock * (Number(item.price) || 0),
        };
      });
  }, [items, myShop.id, myShop.name]);

  // Department Aggregates for this shop
  const departmentAggregates = useMemo(() => {
    const map = {};
    filteredOrders
      .filter((o) => (o.status || '').toLowerCase().trim() !== 'cancelled')
      .forEach((o) => {
        const dept = o.userDepartment || 'General Requisition';
        if (!map[dept]) {
          map[dept] = { department: dept, count: 0, revenue: 0, bulkCount: 0 };
        }
        map[dept].count += 1;
        map[dept].revenue += Number(o.total) || 0;
        if (o.isBulkOrder) map[dept].bulkCount += 1;
      });
    return Object.values(map);
  }, [filteredOrders]);

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = '';

    if (reportType === 'orders') {
      const headers = ['Order ID', 'Beneficiary', 'Department', 'Role', 'Counter', 'Total (INR)', 'Status', 'Placed Date'];
      const rows = filteredOrders.map((o) => [
        `#${o.id}`,
        `"${(o.userName || '').replace(/"/g, '""')}"`,
        `"${(o.userDepartment || '').replace(/"/g, '""')}"`,
        `"${o.role || 'student'}"`,
        `"${(o.counterLocation || myShop.counter || '').replace(/"/g, '""')}"`,
        Number(o.total) || 0,
        `"${o.status || 'Pending'}"`,
        `"${formatDateTime(o.placedAt || o.createdAt)}"`,
      ]);
      csvContent += [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = `${myShop.id || 'store'}_Orders_Ledger_${Date.now()}.csv`;
    } else if (reportType === 'inventory') {
      const headers = ['SKU ID', 'Item Name', 'Category', 'Unit Price (INR)', 'Store Stock', 'Valuation (INR)', 'Status'];
      const rows = scopedItems.map((item) => [
        `#${item.id}`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${item.category || 'General'}"`,
        Number(item.price) || 0,
        item.stock,
        item.valuation,
        `"${item.stock === 0 ? 'Out of Stock' : item.stock <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'}"`,
      ]);
      csvContent += [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = `${myShop.id || 'store'}_Inventory_Valuation_${Date.now()}.csv`;
    } else {
      const headers = ['Department', 'Total Orders', 'Bulk Indents', 'Total Billing Value (INR)', 'Average Order Value (INR)'];
      const rows = departmentAggregates.map((d) => [
        `"${d.department.replace(/"/g, '""')}"`,
        d.count,
        d.bulkCount,
        d.revenue,
        d.count > 0 ? (d.revenue / d.count).toFixed(2) : 0,
      ]);
      csvContent += [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = `${myShop.id || 'store'}_Department_Summary_${Date.now()}.csv`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Report Downloaded', `CSV ledger for ${myShop.name} generated successfully.`);
  };

  const handleExportPDF = () => {
    toast.success('PDF Generation Triggered', `Preparing printable ledger preview for ${myShop.name}.`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Metrics summary
  const totalFilteredRevenue = filteredOrders
    .filter((o) => (o.status || '').toLowerCase().trim() !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const collectedRevenue = filteredOrders
    .filter((o) => (o.status || '').toLowerCase().trim() === 'collected')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalInventoryValuation = scopedItems.reduce((sum, i) => sum + i.valuation, 0);
  const lowStockCount = scopedItems.filter((i) => i.stock <= i.lowStockThreshold).length;

  return (
    <ShopAdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
              Reports & Ledger Export
            </h1>
            <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
              Generate audited accounts of pre-orders, inventory valuation, and departmental allocation for {myShop.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={FileSpreadsheet}
              onClick={handleExportCSV}
            >
              Download CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={FileText}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Dedicated Store Header Banner */}
        <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-[#6a6a6a] font-medium block">Branch Ledger Status</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Audited & Connected
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Cards depending on selected Report Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {reportType === 'orders' && (
            <>
              <StatCard
                title="Filtered Pre-Orders"
                value={filteredOrders.length}
                subtitle="In selected date window"
                icon={ClipboardList}
                color="lavender"
              />
              <StatCard
                title="Realized Revenue"
                value={formatINR(collectedRevenue)}
                subtitle="Collected orders"
                trend={{ positive: true, text: 'Realized' }}
                icon={IndianRupee}
                color="peach"
              />
              <StatCard
                title="Gross Billing Value"
                value={formatINR(totalFilteredRevenue)}
                subtitle="All status totals"
                icon={IndianRupee}
                color="teal"
              />
            </>
          )}

          {reportType === 'inventory' && (
            <>
              <StatCard
                title="Active Catalog SKUs"
                value={scopedItems.length}
                subtitle="Stocked in this store"
                icon={Package}
                color="teal"
              />
              <StatCard
                title="Inventory Valuation"
                value={formatINR(totalInventoryValuation)}
                subtitle="Stock at selling price"
                icon={IndianRupee}
                color="peach"
              />
              <StatCard
                title="Low-Stock Alerts"
                value={lowStockCount}
                subtitle="Needs warehouse refill"
                icon={AlertTriangle}
                color="rose"
              />
            </>
          )}

          {reportType === 'departments' && (
            <>
              <StatCard
                title="Active Departments"
                value={departmentAggregates.length}
                subtitle="Requisitioning units"
                icon={Building2}
                color="lavender"
              />
              <StatCard
                title="Total Requisitions"
                value={filteredOrders.length}
                subtitle="Departmental orders"
                icon={ClipboardList}
                color="peach"
              />
              <StatCard
                title="Department Billing"
                value={formatINR(totalFilteredRevenue)}
                subtitle="Gross volume allocated"
                icon={IndianRupee}
                color="teal"
              />
            </>
          )}
        </div>

        {/* Configuration & Filter Controls */}
        <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5] shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'orders', label: 'All Pre-Orders Summary' },
              { value: 'inventory', label: 'Inventory Stock Valuation' },
              { value: 'departments', label: 'Departmental Requisitions' },
            ]}
          />

          <Input
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          <Input
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />

          {reportType === 'orders' ? (
            <Select
              label="Order Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending Approval' },
                { value: 'approved', label: 'Approved' },
                { value: 'ready', label: 'Ready for Pickup' },
                { value: 'collected', label: 'Collected' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs text-[#6a6a6a] pb-3">
                Scope: <strong>{myShop.name}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Preview Table */}
        <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 sm:p-7 space-y-4 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5e5] pb-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-[#0a0a0a]">
                Generated Ledger Preview ({myShop.name})
              </h3>
              <p className="text-xs text-[#6a6a6a] mt-0.5">
                {reportType === 'orders' && 'Itemized record of store pre-orders within selected date window'}
                {reportType === 'inventory' && 'Current live store inventory stock valuation and threshold status'}
                {reportType === 'departments' && 'Aggregated campus department expenditure and bulk indent volume'}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-[#e5e5e5] text-[#0a0a0a]">
              {reportType === 'orders' && `${filteredOrders.length} records`}
              {reportType === 'inventory' && `${scopedItems.length} SKUs`}
              {reportType === 'departments' && `${departmentAggregates.length} departments`}
            </span>
          </div>

          <div className="overflow-x-auto">
            {reportType === 'orders' && (
              <table className="min-w-full divide-y divide-[#e5e5e5] text-left text-xs">
                <thead>
                  <tr className="bg-[#faf5e8] text-[#6a6a6a] font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">Beneficiary</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Counter / Slot</th>
                    <th className="px-4 py-3.5 text-right">Amount</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] bg-white">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-xs text-[#6a6a6a]">
                        No pre-orders recorded for {myShop.name} in this date range.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#fffaf0] transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#1a3a3a]">#{ord.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-[#0a0a0a]">{ord.userName}</td>
                        <td className="px-4 py-3.5 text-[#6a6a6a]">{ord.userDepartment}</td>
                        <td className="px-4 py-3.5 capitalize text-[#0a0a0a]">{ord.role || 'student'}</td>
                        <td className="px-4 py-3.5 text-[#6a6a6a]">
                          {ord.pickupSlot?.time ? `${ord.pickupSlot.date} • ${ord.pickupSlot.time}` : (ord.counterLocation || myShop.counter)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#0a0a0a]">
                          {formatINR(ord.total)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <OrderStatusBadge status={ord.status} />
                        </td>
                        <td className="px-4 py-3.5 text-[#6a6a6a] whitespace-nowrap">
                          {formatDateTime(ord.placedAt || ord.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === 'inventory' && (
              <table className="min-w-full divide-y divide-[#e5e5e5] text-left text-xs">
                <thead>
                  <tr className="bg-[#faf5e8] text-[#6a6a6a] font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3.5">SKU ID</th>
                    <th className="px-4 py-3.5">Item Name</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5 text-right">Unit Price</th>
                    <th className="px-4 py-3.5 text-center">Store Stock</th>
                    <th className="px-4 py-3.5 text-right">Stock Valuation</th>
                    <th className="px-4 py-3.5 text-center">Threshold Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] bg-white">
                  {scopedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#6a6a6a]">
                        No stationery catalog items found for {myShop.name}.
                      </td>
                    </tr>
                  ) : (
                    scopedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fffaf0] transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#1a3a3a]">#{item.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-[#0a0a0a]">{item.name}</td>
                        <td className="px-4 py-3.5 text-[#6a6a6a]">{item.category}</td>
                        <td className="px-4 py-3.5 text-right font-medium text-[#0a0a0a]">{formatINR(item.price)}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-[#0a0a0a]">{item.stock}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#1a3a3a]">{formatINR(item.valuation)}</td>
                        <td className="px-4 py-3.5 text-center">
                          {item.stock === 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Out of Stock
                            </span>
                          ) : item.stock <= item.lowStockThreshold ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Low Stock ({item.stock})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Adequate Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === 'departments' && (
              <table className="min-w-full divide-y divide-[#e5e5e5] text-left text-xs">
                <thead>
                  <tr className="bg-[#faf5e8] text-[#6a6a6a] font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5 text-center">Total Orders</th>
                    <th className="px-4 py-3.5 text-center">Bulk Indents</th>
                    <th className="px-4 py-3.5 text-right">Total Billing Value</th>
                    <th className="px-4 py-3.5 text-right">Average Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] bg-white">
                  {departmentAggregates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-xs text-[#6a6a6a]">
                        No departmental transactions recorded for {myShop.name}.
                      </td>
                    </tr>
                  ) : (
                    departmentAggregates.map((dept) => (
                      <tr key={dept.department} className="hover:bg-[#fffaf0] transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-[#0a0a0a]">{dept.department}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-[#0a0a0a]">{dept.count}</td>
                        <td className="px-4 py-3.5 text-center font-semibold text-[#1a3a3a]">{dept.bulkCount}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#0a0a0a]">{formatINR(dept.revenue)}</td>
                        <td className="px-4 py-3.5 text-right font-medium text-[#6a6a6a]">
                          {formatINR(dept.count > 0 ? dept.revenue / dept.count : 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ShopAdminLayout>
  );
}
