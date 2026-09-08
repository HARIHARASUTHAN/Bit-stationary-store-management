import React, { useState, useMemo } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import CatalogGrid from '@/components/catalog/CatalogGrid';
import CategoryFilter from '@/components/catalog/CategoryFilter';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { mockItems, categories_list } from '@/mocks/items';
import useDebounce from '@/hooks/useDebounce';

export default function StudentCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [inStockOnly, setInStockOnly] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredItems = useMemo(() => {
    return mockItems
      .filter((item) => {
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        const matchesSearch = debouncedSearch
          ? item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(debouncedSearch.toLowerCase()))
          : true;
        const matchesStock = inStockOnly ? item.stock > 0 : true;
        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        return a.name.localeCompare(b.name);
      });
  }, [debouncedSearch, selectedCategory, sortBy, inStockOnly]);

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
            <span>Showing <strong className="text-ink font-semibold">{filteredItems.length}</strong> stationery products</span>
            {(selectedCategory || searchTerm || inStockOnly) && (
              <button
                onClick={handleResetFilters}
                className="text-action-blue hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <CatalogGrid items={filteredItems} onResetFilters={handleResetFilters} />
        </div>
      </div>
    </StudentLayout>
  );
}
