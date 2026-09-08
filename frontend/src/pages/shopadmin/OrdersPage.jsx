import React, { useState } from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import OrderQueue from '@/components/admin/OrderQueue';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { mockOrders } from '@/mocks/orders';
import { useToast } from '@/components/ui/ToastProvider';

export default function ShopAdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const toast = useToast();

  const statuses = ['All', 'Pending', 'Approved', 'Ready', 'Collected', 'Cancelled'];

  const handleUpdateStatus = (orderId, newStatus) => {
    setActionLoadingId(orderId);
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                timeline: [
                  ...o.timeline,
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
      setActionLoadingId(null);
      toast.success('Order Updated', `Order #${orderId} marked as ${newStatus}.`);
    }, 400);
  };

  const departments = Array.from(new Set(orders.map((o) => o.userDepartment)));

  const filtered = orders.filter((o) => {
    const matchesStatus = filterStatus === 'All' ? true : o.status === filterStatus;
    const matchesDept = filterDept ? o.userDepartment === filterDept : true;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesDept && matchesSearch;
  });

  return (
    <ShopAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Incoming Orders & Counter Dispatch Queue
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Verify student reservations, approve incoming faculty indents, pack stationery, and record counter collection
          </p>
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
            <div className="w-full sm:w-60">
              <Select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                options={departments.map((d) => ({ value: d, label: d }))}
                placeholder="All Academic Departments"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-gray-100">
            {statuses.map((st) => {
              const count =
                st === 'All'
                  ? orders.length
                  : orders.filter((o) => o.status === st).length;

              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    filterStatus === st
                      ? 'bg-[#1e3a5f] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      filterStatus === st ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Queue Component */}
        <OrderQueue
          orders={filtered}
          onUpdateStatus={handleUpdateStatus}
          actionLoadingId={actionLoadingId}
        />
      </div>
    </ShopAdminLayout>
  );
}
