import React, { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/formatDate';
import { getOrderPeriodStats } from '@/utils/orderPeriodStats';
import { useToast } from '@/components/ui/ToastProvider';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Search,
  Filter,
  FileSpreadsheet,
  User,
  ShoppingBag,
} from 'lucide-react';

export default function TotalOrdersDetailModal({
  isOpen,
  onClose,
  orders = [],
  shopName = 'Campus Store',
}) {
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all' | 'daily' | 'weekly' | 'monthly'
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const periodStats = useMemo(() => getOrderPeriodStats(orders), [orders]);

  // Determine current active orders based on period filter
  const periodOrders = useMemo(() => {
    if (periodFilter === 'daily') return periodStats.daily.orders;
    if (periodFilter === 'weekly') return periodStats.weekly.orders;
    if (periodFilter === 'monthly') return periodStats.monthly.orders;
    return orders;
  }, [orders, periodFilter, periodStats]);

  // Filtered orders for table
  const filteredOrders = useMemo(() => {
    return periodOrders.filter((o) => {
      const matchStatus = statusFilter === 'All' ? true : (o.status || '').toLowerCase() === statusFilter.toLowerCase();
      const matchRole =
        roleFilter === 'All'
          ? true
          : roleFilter === 'faculty'
          ? o.role === 'faculty' || o.isBulkOrder
          : o.role === 'student' && !o.isBulkOrder;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.userName && o.userName.toLowerCase().includes(q)) ||
        (o.userDepartment && o.userDepartment.toLowerCase().includes(q)) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q));

      return matchStatus && matchRole && matchSearch;
    });
  }, [periodOrders, statusFilter, roleFilter, search]);

  const filteredTotalValue = filteredOrders
    .filter((o) => (o.status || '').toLowerCase().trim() !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Export CSV Handler
  const handleExportCSV = () => {
    try {
      const headers = ['Order ID', 'Placed Date', 'Customer Name', 'Role', 'Department', 'Slot Date', 'Slot Time', 'Items', 'Status', 'Total (INR)'];
      const rows = filteredOrders.map((o) => [
        o.id,
        new Date(o.placedAt).toLocaleDateString('en-IN'),
        `"${(o.userName || '').replace(/"/g, '""')}"`,
        o.isBulkOrder ? 'Faculty Bulk' : o.role || 'Student',
        `"${(o.userDepartment || '').replace(/"/g, '""')}"`,
        o.pickupSlot?.date || '—',
        o.pickupSlot?.time || '—',
        `"${o.items?.map((i) => `${i.name} (x${i.quantity})`).join('; ') || ''}"`,
        o.status,
        o.total,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BIT_Stationery_Total_Orders_${periodFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV Exported', `${filteredOrders.length} order records downloaded.`);
    } catch (err) {
      toast.error('Export Failed', 'Could not export orders CSV.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Total Orders & Dispatch Analytics"
      subtitle={`Daily, weekly, and monthly order count detail for ${shopName}`}
      maxWidth="max-w-5xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#6a6a6a]">
            Showing <span className="font-semibold text-[#0a0a0a]">{filteredOrders.length}</span> orders • Volume:{' '}
            <span className="font-bold text-[#0a0a0a]">{formatINR(filteredTotalValue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print List
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportCSV}>
              Export Orders CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-1">
        {/* Daily, Weekly & Monthly Order Count Breakdown Cards */}
        <div className="space-y-3 bg-[#faf5e8] p-4 rounded-[20px] border border-[#e5e5e5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#1a3a3a]" />
              <span className="text-xs font-semibold uppercase tracking-[1px] text-[#0a0a0a]">
                Order Count Detail Breakdown
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#fffaf0] p-1 rounded-[10px] border border-[#e5e5e5] text-xs">
              <span className="text-[10px] font-semibold text-[#6a6a6a] px-1.5">Period:</span>
              {[
                { id: 'all', label: `All Orders (${periodStats.allTime.count})` },
                { id: 'daily', label: `Daily (${periodStats.daily.count})` },
                { id: 'weekly', label: `Weekly (${periodStats.weekly.count})` },
                { id: 'monthly', label: `Monthly (${periodStats.monthly.count})` },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriodFilter(p.id)}
                  className={`px-2.5 py-1 rounded-[8px] text-xs font-medium transition-all ${
                    periodFilter === p.id
                      ? 'bg-[#0a0a0a] text-white shadow-xs'
                      : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Daily Order Count Card */}
            <div
              onClick={() => setPeriodFilter(periodFilter === 'daily' ? 'all' : 'daily')}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all ${
                periodFilter === 'daily'
                  ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                  : 'bg-[#fffaf0] border-[#e5e5e5] hover:border-[#0a0a0a]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Daily Orders (Today)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    periodFilter === 'daily' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {periodStats.daily.count} Today
                </span>
              </div>
              <div className="text-3xl font-bold tracking-tight mt-1.5">
                {periodStats.daily.count} <span className="text-sm font-normal">orders</span>
              </div>
              <div className={`text-[11px] mt-1.5 flex items-center justify-between ${periodFilter === 'daily' ? 'text-white/80' : 'text-[#6a6a6a]'}`}>
                <span>{periodStats.daily.pendingCount} pending • {periodStats.daily.readyCount} ready</span>
                <span className="font-semibold">{periodStats.daily.collectedCount} collected</span>
              </div>
            </div>

            {/* Weekly Order Count Card */}
            <div
              onClick={() => setPeriodFilter(periodFilter === 'weekly' ? 'all' : 'weekly')}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all ${
                periodFilter === 'weekly'
                  ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                  : 'bg-[#fffaf0] border-[#e5e5e5] hover:border-[#0a0a0a]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Weekly Orders (7 Days)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    periodFilter === 'weekly' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {periodStats.weekly.count} This Week
                </span>
              </div>
              <div className="text-3xl font-bold tracking-tight mt-1.5">
                {periodStats.weekly.count} <span className="text-sm font-normal">orders</span>
              </div>
              <div className={`text-[11px] mt-1.5 flex items-center justify-between ${periodFilter === 'weekly' ? 'text-white/80' : 'text-[#6a6a6a]'}`}>
                <span>{periodStats.weekly.pendingCount} pending • {periodStats.weekly.readyCount} ready</span>
                <span className="font-semibold">{periodStats.weekly.collectedCount} collected</span>
              </div>
            </div>

            {/* Monthly Order Count Card */}
            <div
              onClick={() => setPeriodFilter(periodFilter === 'monthly' ? 'all' : 'monthly')}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all ${
                periodFilter === 'monthly'
                  ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                  : 'bg-[#fffaf0] border-[#e5e5e5] hover:border-[#0a0a0a]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Monthly Orders (30 Days)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    periodFilter === 'monthly' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {periodStats.monthly.count} This Month
                </span>
              </div>
              <div className="text-3xl font-bold tracking-tight mt-1.5">
                {periodStats.monthly.count} <span className="text-sm font-normal">orders</span>
              </div>
              <div className={`text-[11px] mt-1.5 flex items-center justify-between ${periodFilter === 'monthly' ? 'text-white/80' : 'text-[#6a6a6a]'}`}>
                <span>{periodStats.monthly.pendingCount} pending • {periodStats.monthly.readyCount} ready</span>
                <span className="font-semibold">{periodStats.monthly.collectedCount} collected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#faf5e8] p-3 rounded-[16px] border border-[#e5e5e5]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search order #, customer, department, or product..."
            className="w-full sm:w-72"
          />

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-[#fffaf0] p-1 rounded-[10px] border border-[#e5e5e5] text-xs">
              <span className="text-[10px] font-semibold text-[#6a6a6a] px-1.5">Customer:</span>
              {[
                { id: 'All', label: 'All' },
                { id: 'student', label: 'Students' },
                { id: 'faculty', label: 'Faculty' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-2 py-0.5 rounded-[6px] text-xs font-medium transition-colors ${
                    roleFilter === r.id ? 'bg-[#0a0a0a] text-white' : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#fffaf0] p-1 rounded-[10px] border border-[#e5e5e5] text-xs">
              <span className="text-[10px] font-semibold text-[#6a6a6a] px-1.5">Status:</span>
              {['All', 'Pending', 'Ready', 'Collected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-[6px] text-xs font-medium transition-colors ${
                    statusFilter === st ? 'bg-[#0a0a0a] text-white' : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Detail Table */}
        <div className="rounded-[16px] border border-[#e5e5e5] overflow-hidden bg-[#fffaf0]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf5e8] border-b border-[#e5e5e5] text-[10px] font-bold uppercase tracking-[1px] text-[#6a6a6a]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Pickup Window</th>
                  <th className="py-3 px-4">Items Reserved</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Order Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6a6a6a]">
                      No orders matched the selected period ({periodFilter}) and filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#faf5e8]/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-xs text-[#0a0a0a] block">#{order.id}</span>
                        <span className="text-[10px] text-[#6a6a6a]">{formatDateTime(order.placedAt)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#0a0a0a] block">{order.userName}</span>
                        <span className="text-[10px] text-[#6a6a6a]">{order.userEmail}</span>
                      </td>
                      <td className="py-3 px-4 text-[#0a0a0a]">
                        {order.userDepartment || 'General'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-[#0a0a0a] block">{order.pickupSlot?.date || 'Today'}</span>
                        <span className="text-[10px] text-[#6a6a6a]">{order.pickupSlot?.time}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="line-clamp-2">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="inline-block mr-1 text-[11px] text-[#0a0a0a]">
                              {item.name} <strong className="text-[#6a6a6a]">×{item.quantity}</strong>
                              {idx < (order.items.length - 1) ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-semibold text-[#0a0a0a]">
                        {formatINR(order.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

