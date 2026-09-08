import React from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import ItemCard from '@/components/catalog/ItemCard';
import useCartStore from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { mockItems } from '@/mocks/items';
import mockOrders from '@/mocks/orders';
import { ShoppingBag, Clock, PackageCheck, ArrowRight, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const cartCount = useCartStore((s) => s.cartCount);

  // Student's active orders
  const myOrders = mockOrders.filter((o) => o.userId === user?.uid || o.userEmail === user?.email);
  const activeOrdersCount = myOrders.filter((o) => ['Pending', 'Approved', 'Ready'].includes(o.status)).length;
  const readyOrdersCount = myOrders.filter((o) => o.status === 'Ready').length;

  const featuredItems = mockItems.slice(0, 4);

  return (
    <StudentLayout>
      <div className="space-y-12">
        {/* Clay Hero Section with 7-5 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-xs font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">
              <Sparkles className="h-3.5 w-3.5 text-[#ff4d8b]" />
              Welcome to the Store Portal
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-2px] text-[#0a0a0a] leading-[1.05]">
              Hello, {user?.displayName || user?.name || 'Student'}.
            </h1>

            <p className="text-base text-[#6a6a6a] max-w-xl font-normal leading-relaxed">
              Your campus pre-ordering tray is active. Reserve notebooks, record sheets, geometry drafting kits, and electronics lab manuals for express counter pickup.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/student/catalog">
                <Button variant="primary" size="md" icon={ShoppingBag}>
                  Browse Stationery Catalog
                </Button>
              </Link>
              <Link to="/student/orders">
                <Button variant="secondary" size="md" icon={Clock}>
                  Track Pre-Orders ({activeOrdersCount})
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column: Clay Saturated Hero Feature Card (Lavender) */}
          <div className="lg:col-span-5">
            <div className="bg-[#b8a4ed] text-[#0a0a0a] p-8 rounded-[24px] space-y-4 border border-[#b8a4ed]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#0a0a0a]">
                  Live Counter Status
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#0a0a0a]"></span>
              </div>
              <h3 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                Counter #1 Dispatch Active
              </h3>
              <p className="text-xs text-[#0a0a0a]/80 leading-relaxed font-normal">
                Pre-orders scheduled for today are currently being assembled by store staff.
              </p>

              {/* Embedded UI Fragment */}
              <div className="bg-[#fffaf0] rounded-[16px] p-4 border border-[#e5e5e5] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#6a6a6a]">
                  <span>Average Pack Time</span>
                  <span className="font-semibold text-[#0a0a0a]">~4 minutes</span>
                </div>
                <div className="flex justify-between items-center text-[#6a6a6a]">
                  <span>Next Pickup Window</span>
                  <span className="font-semibold text-[#0a0a0a]">2:00 PM – 3:00 PM</span>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[#1a3a3a] font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Queue-bypass guaranteed for online slots</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ready for Pickup Banner if any - Saturated Peach Card */}
        {readyOrdersCount > 0 && (
          <div className="bg-[#ffb084] text-[#0a0a0a] p-6 sm:p-8 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#0a0a0a]/70">
                Action Required
              </span>
              <h3 className="text-xl font-medium tracking-[-0.8px] text-[#0a0a0a]">
                You have {readyOrdersCount} order ready for counter pickup!
              </h3>
              <p className="text-xs text-[#0a0a0a]/80">
                Present your student ID at Counter #1 to collect your reserved supplies.
              </p>
            </div>
            <Link to="/student/orders">
              <Button variant="on-color" size="md">
                View Pickup Slip
              </Button>
            </Link>
          </div>
        )}

        {/* Clay 3-Card Saturated Section: Pink, Teal, Ochre */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
              Pre-Ordering Workflow
            </h2>
            <span className="text-xs text-[#6a6a6a]">Three-step campus fulfillment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pink Card */}
            <div className="bg-[#ff4d8b] text-white p-8 rounded-[24px] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/80">
                  Step 01
                </span>
                <h3 className="text-2xl font-medium tracking-[-1px] text-white">
                  Select Stationery
                </h3>
                <p className="text-xs text-white/90 leading-relaxed font-normal">
                  Browse verified stock across 8 categories. Reserve genuine calculators, spiral notebooks, and record books.
                </p>
              </div>
              <div className="bg-white/10 rounded-[16px] p-3 text-[11px] text-white font-medium">
                30+ campus SKUs in stock
              </div>
            </div>

            {/* Deep Teal Card */}
            <div className="bg-[#1a3a3a] text-white p-8 rounded-[24px] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#a4d4c5]">
                  Step 02
                </span>
                <h3 className="text-2xl font-medium tracking-[-1px] text-white">
                  Pick Time Window
                </h3>
                <p className="text-xs text-white/80 leading-relaxed font-normal">
                  Lock in an hourly pickup slot so your items are boxed and waiting before you reach the counter.
                </p>
              </div>
              <div className="bg-white/10 rounded-[16px] p-3 text-[11px] text-[#a4d4c5] font-medium">
                Daily slots 9:00 AM – 5:00 PM
              </div>
            </div>

            {/* Ochre Card */}
            <div className="bg-[#e8b94a] text-[#0a0a0a] p-8 rounded-[24px] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#0a0a0a]/70">
                  Step 03
                </span>
                <h3 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                  Counter Pickup
                </h3>
                <p className="text-xs text-[#0a0a0a]/80 leading-relaxed font-normal">
                  Show your confirmation number or printable voucher at Counter #1. No advance fee needed.
                </p>
              </div>
              <div className="bg-black/10 rounded-[16px] p-3 text-[11px] text-[#0a0a0a] font-medium">
                Direct hand-off in seconds
              </div>
            </div>
          </div>
        </div>

        {/* Featured Items Grid */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                Popular Campus Materials
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
                Most requested engineering lab manuals, drawing instruments, and ruled notebooks
              </p>
            </div>
            <Link
              to="/student/catalog"
              className="text-xs font-semibold text-[#0a0a0a] hover:text-[#ff4d8b] inline-flex items-center gap-1 transition-colors"
            >
              Explore Full Catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
