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
  IndianRupee,
  Download,
  Printer,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

export default function RevenueDetailModal({ isOpen, onClose, orders = [] }) {
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all' | 'daily' | 'weekly' | 'monthly'
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'breakdown'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All' | 'student' | 'faculty'
  const toast = useToast();

  const periodStats = useMemo(() => getOrderPeriodStats(orders), [orders]);

  const activePeriodOrders = useMemo(() => {
    if (periodFilter === 'daily') return periodStats.daily.orders;
    if (periodFilter === 'weekly') return periodStats.weekly.orders;
    if (periodFilter === 'monthly') return periodStats.monthly.orders;
    return orders;
  }, [orders, periodFilter, periodStats]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => (o.status || '').toLowerCase() !== 'cancelled');
    const totalGross = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const collectedOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'collected');
    const collectedTotal = collectedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const inPipelineOrders = orders.filter((o) => {
      const s = (o.status || '').toLowerCase();
      return s === 'ready' || s === 'approved';
    });
    const inPipelineTotal = inPipelineOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const pendingOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'pending');
    const pendingTotal = pendingOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const facultyOrders = validOrders.filter((o) => o.role === 'faculty' || o.isBulkOrder);
    const facultyTotal = facultyOrders.reduce((sum, o) => sum + o.total, 0);

    const studentOrders = validOrders.filter((o) => o.role === 'student' && !o.isBulkOrder);
    const studentTotal = studentOrders.reduce((sum, o) => sum + o.total, 0);

    const aov = validOrders.length > 0 ? Math.round(totalGross / validOrders.length) : 0;

    return {
      totalGross,
      collectedTotal,
      collectedCount: collectedOrders.length,
      inPipelineTotal,
      inPipelineCount: inPipelineOrders.length,
      pendingTotal,
      pendingCount: pendingOrders.length,
      facultyTotal,
      studentTotal,
      aov,
      orderCount: validOrders.length,
    };
  }, [orders]);

  // Category Revenue Map
  const categoryData = useMemo(() => {
    const map = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((order) => {
        order.items?.forEach((item) => {
          let cat = 'General Stationery';
          const name = item.name.toLowerCase();
          if (name.includes('notebook') || name.includes('paper') || name.includes('drawing')) {
            cat = 'Notebooks & Paper';
          } else if (name.includes('pen') || name.includes('pencil') || name.includes('marker') || name.includes('eraser') || name.includes('highlighter')) {
            cat = 'Writing Instruments';
          } else if (name.includes('geometry') || name.includes('scale') || name.includes('clip')) {
            cat = 'Geometry & Drafting';
          } else if (name.includes('lab') || name.includes('graph')) {
            cat = 'Lab Supplies';
          } else if (name.includes('calculator') || name.includes('staple') || name.includes('usb') || name.includes('tab') || name.includes('post-it')) {
            cat = 'Office Supplies';
          } else if (name.includes('color') || name.includes('paint') || name.includes('brush')) {
            cat = 'Art Supplies';
          }

          if (!map[cat]) map[cat] = { category: cat, revenue: 0, itemsSold: 0 };
          map[cat].revenue += item.price * item.quantity;
          map[cat].itemsSold += item.quantity;
        });
      });

    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    const maxRev = list[0]?.revenue || 1;
    return list.map((c) => ({
      ...c,
      percentOfTotal: metrics.totalGross > 0 ? Math.round((c.revenue / metrics.totalGross) * 100) : 0,
      relativeWidth: Math.max(10, Math.round((c.revenue / maxRev) * 100)),
    }));
  }, [orders, metrics.totalGross]);

  // Department Revenue Map
  const departmentData = useMemo(() => {
    const map = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((order) => {
        const dept = order.userDepartment || 'General Campus';
        if (!map[dept]) map[dept] = { department: dept, revenue: 0, count: 0 };
        map[dept].revenue += order.total;
        map[dept].count += 1;
      });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);


  // Filtered Orders for the Ledger
  const filteredOrders = useMemo(() => {
    return activePeriodOrders.filter((o) => {
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
  }, [activePeriodOrders, statusFilter, roleFilter, search]);

  const filteredTotal = filteredOrders
    .filter((o) => (o.status || '').toLowerCase().trim() !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Export CSV handler
  const handleExportCSV = () => {
    try {
      const headers = ['Order ID', 'Placed Date', 'Customer Name', 'Role', 'Department', 'Items Description', 'Status', 'Order Total (INR)'];
      const rows = filteredOrders.map((o) => [
        o.id,
        new Date(o.placedAt).toLocaleDateString('en-IN'),
        `"${o.userName.replace(/"/g, '""')}"`,
        o.isBulkOrder ? 'Faculty Bulk' : o.role,
        `"${(o.userDepartment || '').replace(/"/g, '""')}"`,
        `"${o.items?.map((i) => `${i.name} (x${i.quantity})`).join('; ') || ''}"`,
        o.status,
        o.total,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BIT_Stationery_Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV Exported', `${filteredOrders.length} transaction rows downloaded.`);
    } catch (err) {
      toast.error('Export Failed', 'Could not generate CSV file.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Store Revenue & Earnings Audit"
      subtitle="Comprehensive breakdown of campus store collections, faculty requisitions, and pending realization"
      maxWidth="max-w-5xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#6a6a6a]">
            Showing <span className="font-semibold text-[#0a0a0a]">{filteredOrders.length}</span> matching entries • Filtered Volume: <span className="font-bold text-[#0a0a0a]">{formatINR(filteredTotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportCSV}>
              Export Ledger CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-1">
        {/* Daily, Weekly & Monthly Revenue Earned Section */}
        <div className="space-y-3 bg-[#faf5e8] p-4 rounded-[20px] border border-[#e5e5e5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#ff4d8b]" />
              <span className="text-xs font-semibold uppercase tracking-[1px] text-[#0a0a0a]">
                Revenue Earned Breakdown (Daily • Weekly • Monthly)
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#fffaf0] p-1 rounded-[10px] border border-[#e5e5e5] text-xs">
              <span className="text-[10px] font-semibold text-[#6a6a6a] px-1.5">Period:</span>
              {[
                { id: 'all', label: 'All Time' },
                { id: 'daily', label: 'Daily (Today)' },
                { id: 'weekly', label: 'Weekly (7 Days)' },
                { id: 'monthly', label: 'Monthly (30 Days)' },
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
            {/* Daily Revenue Card */}
            <div
              onClick={() => setPeriodFilter(periodFilter === 'daily' ? 'all' : 'daily')}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all ${
                periodFilter === 'daily'
                  ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                  : 'bg-[#fffaf0] border-[#e5e5e5] hover:border-[#0a0a0a]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Daily Revenue (Today)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    periodFilter === 'daily' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {periodStats.daily.count} orders
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight mt-1.5">
                {formatINR(periodStats.daily.collectedRevenue)}
              </div>
              <div className={`text-[11px] mt-1.5 flex items-center justify-between ${periodFilter === 'daily' ? 'text-white/80' : 'text-[#6a6a6a]'}`}>
                <span>Booked: {formatINR(periodStats.daily.grossRevenue)}</span>
                <span className="font-semibold">{periodStats.daily.collectedCount} collected</span>
              </div>
            </div>

            {/* Weekly Revenue Card */}
            <div
              onClick={() => setPeriodFilter(periodFilter === 'weekly' ? 'all' : 'weekly')}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all ${
                periodFilter === 'weekly'
                  ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                  : 'bg-[#fffaf0] border-[#e5e5e5] hover:border-[#0a0a0a]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Weekly Revenue (7 Days)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    periodFilter === 'weekly' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {periodStats.weekly.count} orders
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight mt-1.5">
                {formatINR(periodStats.weekly.collectedRevenue)}
              </div>
              <div className={`text-[11px] mt-1.5 flex items-center justify-between ${periodFilter === 'weekly' ? 'text-white/80' : 'text-[#6a6a6a]'}`}>
                <span>Booked: {formatINR(periodStats.weekly.grossRevenue)}</span>
                <span className="font-semibold">{periodStats.weekly.collectedCount} collected</span>
              </div>
            </div>

            {/* Monthly Revenue Card */}
            <div
              onClick={() => setPeriodFilter(periodFilter === 'monthly' ? 'all' : 'monthly')}
              className={`p-4 rounded-[16px] border cursor-pointer transition-all ${
                periodFilter === 'monthly'
                  ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                  : 'bg-[#fffaf0] border-[#e5e5e5] hover:border-[#0a0a0a]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Monthly Revenue (30 Days)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    periodFilter === 'monthly' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {periodStats.monthly.count} orders
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight mt-1.5">
                {formatINR(periodStats.monthly.collectedRevenue)}
              </div>
              <div className={`text-[11px] mt-1.5 flex items-center justify-between ${periodFilter === 'monthly' ? 'text-white/80' : 'text-[#6a6a6a]'}`}>
                <span>Booked: {formatINR(periodStats.monthly.grossRevenue)}</span>
                <span className="font-semibold">{periodStats.monthly.collectedCount} collected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Gross Revenue */}
          <div className="p-4 bg-[#ffb084]/20 rounded-[16px] border border-[#ffb084]/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#0a0a0a]">
                Gross Booked
              </span>
              <IndianRupee className="h-4 w-4 text-[#0a0a0a]" />
            </div>
            <div className="text-2xl font-medium tracking-tight text-[#0a0a0a] mt-1.5">
              {formatINR(metrics.totalGross)}
            </div>
            <div className="text-[11px] text-[#6a6a6a] mt-1 flex items-center justify-between">
              <span>{metrics.orderCount} active orders</span>
              <span className="text-emerald-700 font-semibold">100% volume</span>
            </div>
          </div>

          {/* Realized / Collected */}
          <div className="p-4 bg-[#a4d4c5]/25 rounded-[16px] border border-[#a4d4c5]/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#1a3a3a]">
                Collected at Store
              </span>
              <CheckCircle2 className="h-4 w-4 text-[#1a3a3a]" />
            </div>
            <div className="text-2xl font-medium tracking-tight text-[#1a3a3a] mt-1.5">
              {formatINR(metrics.collectedTotal)}
            </div>
            <div className="text-[11px] text-[#6a6a6a] mt-1 flex items-center justify-between">
              <span>{metrics.collectedCount} orders paid & collected</span>
              <span className="font-semibold text-[#1a3a3a]">
                {metrics.totalGross > 0 ? Math.round((metrics.collectedTotal / metrics.totalGross) * 100) : 0}% realized
              </span>
            </div>
          </div>

          {/* Pipeline / Ready */}
          <div className="p-4 bg-[#b8a4ed]/20 rounded-[16px] border border-[#b8a4ed]/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#0a0a0a]">
                Ready / In Queue
              </span>
              <Clock className="h-4 w-4 text-[#0a0a0a]" />
            </div>
            <div className="text-2xl font-medium tracking-tight text-[#0a0a0a] mt-1.5">
              {formatINR(metrics.inPipelineTotal + metrics.pendingTotal)}
            </div>
            <div className="text-[11px] text-[#6a6a6a] mt-1 flex items-center justify-between">
              <span>{metrics.inPipelineCount + metrics.pendingCount} orders pending collection</span>
              <span className="text-amber-700 font-semibold">Awaiting pickup</span>
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="p-4 bg-[#faf5e8] rounded-[16px] border border-[#e5e5e5]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#6a6a6a]">
                Average Order Value
              </span>
              <TrendingUp className="h-4 w-4 text-[#6a6a6a]" />
            </div>
            <div className="text-2xl font-medium tracking-tight text-[#0a0a0a] mt-1.5">
              {formatINR(metrics.aov)}
            </div>
            <div className="text-[11px] text-[#6a6a6a] mt-1 flex items-center justify-between">
              <span>Student: {formatINR(metrics.studentTotal)}</span>
              <span className="font-medium text-[#0a0a0a]">Faculty: {formatINR(metrics.facultyTotal)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-[#0a0a0a] text-white shadow-xs'
                  : 'bg-[#faf5e8] text-[#6a6a6a] hover:text-[#0a0a0a]'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Itemized Revenue Ledger ({filteredOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'breakdown'
                  ? 'bg-[#0a0a0a] text-white shadow-xs'
                  : 'bg-[#faf5e8] text-[#6a6a6a] hover:text-[#0a0a0a]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Category & Department Share
            </button>
          </div>

          <div className="hidden sm:block text-[11px] text-[#6a6a6a]">
            Stationery Store POS
          </div>
        </div>

        {/* TAB 1: ITEMIZED REVENUE LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#faf5e8] p-3 rounded-[16px] border border-[#e5e5e5]">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search order #, customer, department, or stationery..."
                className="w-full sm:w-72"
              />

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Role / Customer Filter */}
                <div className="flex items-center gap-1 bg-[#fffaf0] p-1 rounded-[10px] border border-[#e5e5e5] text-xs">
                  <span className="text-[10px] font-semibold text-[#6a6a6a] px-1.5">Role:</span>
                  {[
                    { id: 'All', label: 'All' },
                    { id: 'student', label: 'Students' },
                    { id: 'faculty', label: 'Faculty' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoleFilter(r.id)}
                      className={`px-2 py-0.5 rounded-[6px] text-xs font-medium transition-colors ${
                        roleFilter === r.id
                          ? 'bg-[#0a0a0a] text-white'
                          : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-[#fffaf0] p-1 rounded-[10px] border border-[#e5e5e5] text-xs">
                  <span className="text-[10px] font-semibold text-[#6a6a6a] px-1.5">Status:</span>
                  {['All', 'Collected', 'Ready', 'Approved', 'Pending'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2 py-0.5 rounded-[6px] text-xs font-medium transition-colors ${
                        statusFilter === st
                          ? 'bg-[#0a0a0a] text-white'
                          : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-[16px] border border-[#e5e5e5] overflow-hidden bg-[#fffaf0]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf5e8] border-b border-[#e5e5e5] text-[10px] font-bold uppercase tracking-[1px] text-[#6a6a6a]">
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Items Reserved</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Revenue Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#6a6a6a]">
                          No orders matched your search or status filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#faf5e8]/60 transition-colors"
                        >
                          {/* Order ID & Date */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-xs text-[#0a0a0a] block">
                              #{order.id}
                            </span>
                            <span className="text-[10px] text-[#6a6a6a]">
                              {formatDateTime(order.placedAt)}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-xs text-[#0a0a0a]">
                                {order.userName}
                              </span>
                              {order.isBulkOrder ? (
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#b8a4ed]/30 text-[#0a0a0a] border border-[#b8a4ed]/50">
                                  Bulk
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded-full bg-[#f5f0e0] text-[#6a6a6a] border border-[#e5e5e5]">
                                  {order.role}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#6a6a6a] block truncate max-w-[140px]">
                              {order.userEmail}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="py-3 px-4 whitespace-nowrap text-[#0a0a0a]">
                            {order.userDepartment || '—'}
                          </td>

                          {/* Items */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="text-[11px] text-[#0a0a0a] line-clamp-1 font-medium">
                              {order.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                            </div>
                            <span className="text-[10px] text-[#6a6a6a]">
                              {order.items?.reduce((s, i) => s + i.quantity, 0)} total units
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <OrderStatusBadge status={order.status} />
                          </td>

                          {/* Total */}
                          <td className="py-3 px-4 text-right whitespace-nowrap font-medium text-sm text-[#0a0a0a]">
                            {formatINR(order.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredOrders.length > 0 && (
                    <tfoot>
                      <tr className="bg-[#faf5e8] border-t-2 border-[#e5e5e5] font-semibold text-xs">
                        <td colSpan={5} className="py-3 px-4 text-right text-[#0a0a0a]">
                          Total Filtered Revenue:
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-[#0a0a0a]">
                          {formatINR(filteredTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY & DEPARTMENT BREAKDOWN */}
        {activeTab === 'breakdown' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stationery Category Breakdown */}
            <div className="bg-[#faf5e8] rounded-[20px] p-5 border border-[#e5e5e5] space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2.5">
                <div>
                  <h4 className="text-sm font-medium tracking-tight text-[#0a0a0a]">
                    Revenue by Stationery Category
                  </h4>
                  <p className="text-[11px] text-[#6a6a6a]">Top product lines driving store revenue</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff4d8b]">
                  Categories
                </span>
              </div>

              <div className="space-y-3.5">
                {categoryData.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#0a0a0a]">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#6a6a6a] text-[11px]">
                          {cat.itemsSold} units
                        </span>
                        <span className="font-bold text-[#0a0a0a]">
                          {formatINR(cat.revenue)}
                        </span>
                        <span className="text-[10px] font-semibold text-[#1a3a3a] w-8 text-right">
                          {cat.percentOfTotal}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 bg-[#f5f0e0] rounded-full overflow-hidden border border-[#e5e5e5]">
                      <div
                        className="h-full bg-[#1a3a3a] rounded-full transition-all duration-500"
                        style={{ width: `${cat.relativeWidth}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department-wise Billing Contribution */}
            <div className="bg-[#faf5e8] rounded-[20px] p-5 border border-[#e5e5e5] space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2.5">
                <div>
                  <h4 className="text-sm font-medium tracking-tight text-[#0a0a0a]">
                    Department Requisition Share
                  </h4>
                  <p className="text-[11px] text-[#6a6a6a]">
                    Cumulative stationery intake across campus programs
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b8a4ed]">
                  Academic
                </span>
              </div>

              <div className="space-y-3">
                {departmentData.map((dept) => {
                  const pct = metrics.totalGross > 0 ? Math.round((dept.revenue / metrics.totalGross) * 100) : 0;
                  return (
                    <div
                      key={dept.department}
                      className="p-3 bg-[#fffaf0] rounded-[12px] border border-[#e5e5e5] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-xs text-[#0a0a0a]">{dept.department}</p>
                        <p className="text-[10px] text-[#6a6a6a] mt-0.5">
                          {dept.count} order{dept.count > 1 ? 's' : ''} placed
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-xs text-[#0a0a0a] block">
                          {formatINR(dept.revenue)}
                        </span>
                        <span className="text-[10px] font-semibold text-[#ff4d8b]">
                          {pct}% of store total
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
