import React from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from '@/components/layout/FacultyLayout';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import ItemCard from '@/components/catalog/ItemCard';
import { useAuth } from '@/context/AuthContext';
import { mockItems } from '@/mocks/items';
import mockOrders from '@/mocks/orders';
import { ShoppingBag, Clock, Building2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FacultyDashboardPage() {
  const { user } = useAuth();

  const myOrders = mockOrders.filter((o) => o.userEmail === user?.email || o.role === 'faculty');
  const bulkOrders = myOrders.filter((o) => o.isBulkOrder);
  const featuredItems = [
    mockItems.find((i) => i.id === 'i20') || mockItems[0],
    mockItems.find((i) => i.id === 'i26') || mockItems[1],
    mockItems.find((i) => i.id === 'i18') || mockItems[2],
    mockItems.find((i) => i.id === 'i1') || mockItems[3],
  ];

  return (
    <FacultyLayout>
      <div className="space-y-12">
        {/* Clay Hero Section with 7-5 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-xs font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">
              <Building2 className="h-3.5 w-3.5 text-[#ff4d8b]" />
              Academic Department Desk
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-2px] text-[#0a0a0a] leading-[1.05]">
              Welcome, {user?.displayName || user?.name || 'Professor'}.
            </h1>

            <p className="text-base text-[#6a6a6a] max-w-xl font-normal leading-relaxed">
              Order classroom chalk, dry-erase markers, test booklets, graph sheets, and laboratory consumables with priority counter dispatch and bulk departmental billing.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/faculty/catalog">
                <Button variant="primary" size="md" icon={ShoppingBag}>
                  Requisition Supplies
                </Button>
              </Link>
              <Link to="/faculty/orders">
                <Button variant="secondary" size="md" icon={Clock}>
                  Department Indents ({myOrders.length})
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column: Clay Deep Teal Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#1a3a3a] text-white p-8 rounded-[24px] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#ffb084]">
                  Counter Clearance
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffb084]"></span>
              </div>
              <h3 className="text-2xl font-medium tracking-[-1px] text-white">
                Priority Counter #2 Open
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Faculty indents are prepared by dedicated dispatch operators for express handover.
              </p>

              <div className="bg-white/10 rounded-[16px] p-4 text-xs space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Assigned Department</span>
                  <span className="font-semibold text-white">{user?.department || 'Computer Science'}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Bulk Indent Support</span>
                  <span className="font-semibold text-[#a4d4c5]">Active & Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Faculty Indents"
            value={myOrders.length}
            subtitle="Department requisitions"
            icon={Building2}
            color="peach"
          />
          <StatCard
            title="Bulk Lab Orders"
            value={bulkOrders.length}
            subtitle="Consumable allocations"
            icon={Sparkles}
            color="lavender"
          />
          <StatCard
            title="Counter Desk"
            value="Desk #2"
            subtitle="Express academic pickup"
            icon={CheckCircle2}
            color="teal"
          />
        </div>

        {/* Featured Items Grid */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                Teaching & Examination Supplies
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-1">
                Record pads, board marker sets, paper reams, and lab materials
              </p>
            </div>
            <Link
              to="/faculty/catalog"
              className="text-xs font-semibold text-[#0a0a0a] hover:text-[#ff4d8b] inline-flex items-center gap-1 transition-colors"
            >
              Browse Full Catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}
