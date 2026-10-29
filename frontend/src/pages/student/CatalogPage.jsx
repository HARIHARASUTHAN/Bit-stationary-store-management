import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import CatalogGrid from '@/components/catalog/CatalogGrid';
import CategoryFilter from '@/components/catalog/CategoryFilter';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { mockItems, categories_list } from '@/mocks/items';
import { getItems } from '@/services/inventoryService';
import { getShopInfo } from '@/services/authService';
import { campusShops, getActiveCampusShops, getShopForItem, isItemAvailableAtShop } from '@/mocks/shops';
import useDebounce from '@/hooks/useDebounce';
import useCartStore from '@/hooks/useCart';
import { Store, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

function resolveShopId(query, shops) {
  if (!query || query === 'all') return shops[0]?.id || 'main-store';
  const clean = String(query).toLowerCase().trim();
  const found = shops.find(
    (s) =>
      s.id.toLowerCase() === clean ||
      s.name.toLowerCase() === clean ||
      s.name.toLowerCase().includes(clean) ||
      clean.includes(s.name.toLowerCase()) ||
      clean.includes(s.id.toLowerCase())
  );
  return found ? found.id : (shops[0]?.id || 'main-store');
}

export default function StudentCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [inStockOnly, setInStockOnly] = useState(false);
  const setCartShop = useCartStore((state) => state.setCartShop);

  const [liveShops, setLiveShops] = useState(() => {
    try {
      const cached = localStorage.getItem('bsp_live_campus_shops');
      return cached ? JSON.parse(cached) : null;
    } catch (_) { return null; }
  });

  const availableShops = useMemo(() => getActiveCampusShops(liveShops), [liveShops]);

  const [selectedShopId, setSelectedShopId] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const initial = sp.get('shop') || sp.get('shopId') || sp.get('shopName');
      if (initial && initial !== 'all') {
        return initial;
      }
    } catch (_) {}
    return 'main-store';
  });

  // Sync with URL query param whenever searchParams or availableShops change
  useEffect(() => {
    const rawShop =
      searchParams.get('shop') ||
      searchParams.get('shopId') ||
      searchParams.get('shopName') ||
      location.state?.shopId ||
      location.state?.shopName;

    if (rawShop && rawShop !== 'all') {
      const resolved = resolveShopId(rawShop, availableShops);
      setSelectedShopId(resolved);
      const targetShop = availableShops.find((s) => s.id === resolved);
      if (targetShop) {
        setCartShop(targetShop.id, targetShop.name, targetShop.counter);
      }
    } else if (availableShops.length > 0) {
      const isValid = availableShops.some((s) => s.id === selectedShopId);
      if (!isValid) {
        const fallback = availableShops[0];
        setSelectedShopId(fallback.id);
        setCartShop(fallback.id, fallback.name, fallback.counter);
      }
    }
  }, [searchParams, location.state, availableShops, setCartShop, selectedShopId]);

  useEffect(() => {
    let isMounted = true;
    getShopInfo()
      .then((data) => {
        if (isMounted && data && data.shops && Array.isArray(data.shops) && data.shops.length > 0) {
          setLiveShops(data.shops);
          localStorage.setItem('bsp_live_campus_shops', JSON.stringify(data.shops));
        }
      })
      .catch(() => {});

    setLoading(true);
    getItems()
      .then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch live inventory:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleShopSelect = (shopId) => {
    if (!shopId) return;
    setSelectedShopId(shopId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('shop', shopId);
    setSearchParams(nextParams, { replace: true });
    const target = availableShops.find((s) => s.id === shopId);
    if (target) {
      setCartShop(target.id, target.name, target.counter);
    }
  };

  const selectedShopObj = useMemo(() => {
    return availableShops.find((s) => s.id === selectedShopId) || availableShops[0] || null;
  }, [selectedShopId, availableShops]);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesShop = isItemAvailableAtShop(item, selectedShopId);
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        const matchesSearch = debouncedSearch
          ? item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (item.sku && item.sku.toLowerCase().includes(debouncedSearch.toLowerCase()))
          : true;
        const currentShopStock = (selectedShopId && item.shopStocks && typeof item.shopStocks[selectedShopId] === 'number')
          ? item.shopStocks[selectedShopId]
          : (typeof item.stock === 'number' ? item.stock : 0);
        const matchesStock = inStockOnly ? currentShopStock > 0 : true;
        return matchesShop && matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        const stockA = (selectedShopId && a.shopStocks && typeof a.shopStocks[selectedShopId] === 'number') ? a.shopStocks[selectedShopId] : (a.stock || 0);
        const stockB = (selectedShopId && b.shopStocks && typeof b.shopStocks[selectedShopId] === 'number') ? b.shopStocks[selectedShopId] : (b.stock || 0);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-desc') return stockB - stockA;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [items, debouncedSearch, selectedShopId, selectedCategory, sortBy, inStockOnly]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name-asc');
    setInStockOnly(false);
  };

  return (
    <StudentLayout>
      <div className="bg-parchment min-h-screen py-12 px-6">
        <div className="max-w-[1440px] mx-auto space-y-10">
          {/* Header */}
          <div className="max-w-[980px] space-y-2">
            <h1 className="text-display-md sm:text-display-lg font-semibold tracking-tight text-ink">
              Store. <span className="text-ink-muted-48">The best way to buy the stationery you need.</span>
            </h1>
            <p className="text-body text-ink-muted-80 font-normal">
              Select items, check campus inventory in real time, and reserve for pickup.
            </p>
          </div>

          {/* Shop Selector Tabs */}
          <div className="bg-[#fffaf0] p-4 sm:p-5 rounded-[20px] border border-[#e5e5e5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-[#ff4d8b]" />
                <span className="text-xs font-semibold uppercase tracking-[1px] text-[#0a0a0a]">
                  Filter by Campus Shop
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {availableShops.map((shop) => {
                const isSelected = selectedShopId === shop.id;
                const count = items.filter((it) => isItemAvailableAtShop(it, shop.id)).length;
                return (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => handleShopSelect(shop.id)}
                    className={`p-3 rounded-[14px] text-left border transition-all text-xs font-medium ${
                      isSelected
                        ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                        : 'bg-white text-[#0a0a0a] border-[#e5e5e5] hover:border-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate pr-1">{shop.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-[#faf5e8] text-[#6a6a6a]'}`}>
                        {count}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 truncate ${isSelected ? 'text-white/70' : 'text-[#6a6a6a]'}`}>
                      {shop.counter || shop.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apple Filter & Search Row */}
          <div className="bg-white p-6 rounded-lg border border-hairline shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search stationery, manuals, drafting tools, SKU..."
                className="w-full sm:w-96"
              />

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <label className="flex items-center gap-2 text-caption text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded-sm border-hairline text-action-blue focus:ring-action-blue h-4 w-4"
                  />
                  In Stock Only
                </label>

                <div className="w-48">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    placeholder=""
                    options={[
                      { value: 'name-asc', label: 'Name (A to Z)' },
                      { value: 'price-asc', label: 'Price: Low to High' },
                      { value: 'price-desc', label: 'Price: High to Low' },
                      { value: 'stock-desc', label: 'Highest Stock' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <CategoryFilter
              categories={categories_list}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Results bar */}
          <div className="flex items-center justify-between text-caption text-ink-muted-48">
            <span>
              Showing <strong className="text-ink font-semibold">{filteredItems.length}</strong> stationery products
              {selectedShopObj && (
                <> for <strong className="text-ink font-semibold">{selectedShopObj.name}</strong></>
              )}
            </span>
            {(selectedCategory || searchTerm || inStockOnly) && (
              <button
                onClick={handleResetFilters}
                className="text-action-blue hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <CatalogGrid items={filteredItems} onResetFilters={handleResetFilters} activeShop={selectedShopObj} />
        </div>
      </div>
    </StudentLayout>
  );
}
