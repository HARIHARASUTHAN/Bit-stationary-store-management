import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import { getShopInfo } from '@/services/authService';
import { getItems } from '@/services/inventoryService';
import { getActiveCampusShops, isItemAvailableAtShop } from '@/mocks/shops';
import {
  Store,
  Package,
  MapPin,
  Clock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [shops, setShops] = useState(() => {
    try {
      const cached = localStorage.getItem('bsp_live_campus_shops');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return getActiveCampusShops();
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getShopInfo().catch(() => ({ shops: [] })),
      getItems().catch(() => []),
    ]).then(([shopData, itemsData]) => {
      if (isMounted) {
        if (shopData && Array.isArray(shopData.shops) && shopData.shops.length > 0) {
          setShops(shopData.shops);
          localStorage.setItem('bsp_live_campus_shops', JSON.stringify(shopData.shops));
        }
        if (Array.isArray(itemsData)) {
          setItems(itemsData);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredShops = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return shops;
    return shops.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.counter?.toLowerCase().includes(q) ||
        s.tagline?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.badge?.toLowerCase().includes(q)
    );
  }, [shops, searchTerm]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
              Campus Store Governance
            </h1>
            <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
              Oversee registered stationery shop outlets, branch operators, active catalog SKUs, and campus distribution desks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/accounts">
              <Button variant="primary" size="md" icon={Plus}>
                Add Shop Operator
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards highlighting Shop Count & Active SKUs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Total Campus Shops"
            value={shops.length}
            subtitle="Active stationery branch stores"
            icon={Store}
            color="peach"
          />
          <StatCard
            title="Active Catalog SKUs"
            value={items.length}
            subtitle="Registered stationery supplies"
            icon={Package}
            color="teal"
          />
          <StatCard
            title="Authorized Operators"
            value={shops.length}
            subtitle="Governed store admin accounts"
            icon={ShieldCheck}
            color="lavender"
          />
        </div>

        {/* Campus Shop Name List Section */}
        <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#ff4d8b]" />
                <h2 className="text-lg font-semibold tracking-tight text-[#0a0a0a]">
                  Registered Campus Shops ({shops.length})
                </h2>
              </div>
              <p className="text-xs text-[#6a6a6a] mt-0.5">
                Official stationery branch locations, operator assignments, and counter schedules
              </p>
            </div>
            <div className="w-full sm:w-72">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search shop name or location..."
              />
            </div>
          </div>

          {filteredShops.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#6a6a6a]">
              No campus shops found matching &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredShops.map((shop, idx) => {
                const shopItemCount = items.filter((it) => isItemAvailableAtShop(it, shop.id)).length;
                return (
                  <div
                    key={shop.id || idx}
                    className="p-5 rounded-[20px] bg-white border border-[#e5e5e5] hover:border-[#0a0a0a] transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-[12px] bg-[#1a3a3a] text-white flex items-center justify-center font-bold">
                            <Store className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[#0a0a0a] tracking-tight group-hover:text-[#ff4d8b] transition-colors">
                              {shop.name}
                            </h3>
                            <span className="text-[11px] font-semibold text-[#065f46] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                              {shop.badge || 'Store Active'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-[#6a6a6a] pt-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#ff4d8b] shrink-0" />
                          <span className="truncate">{shop.counter || shop.tagline || 'Main Campus Store'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-[#1a3a3a] shrink-0" />
                          <span>{shop.operatingHours || '8:30 AM – 6:00 PM'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-[#6a6a6a] shrink-0" />
                          <span className="truncate">{shop.email || 'operator@shopadmin.ac.in'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-[#6a6a6a]">
                        Stocked: <strong className="text-[#0a0a0a]">{shopItemCount || items.length} SKUs</strong>
                      </span>
                      <Link
                        to={`/admin/accounts?search=${encodeURIComponent(shop.name)}`}
                        className="text-xs font-semibold text-[#0a0a0a] hover:text-[#ff4d8b] inline-flex items-center gap-1 transition-colors"
                      >
                        Manage Account <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
