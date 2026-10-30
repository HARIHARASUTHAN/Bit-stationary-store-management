import React, { useState, useEffect, useMemo } from 'react';
import { mockItems, categories_list } from '@/mocks/items';
import { isItemAvailableAtShop } from '@/mocks/shops';
import { getItems } from '@/services/inventoryService';
import { formatINR } from '@/utils/currency';
import StockBadge from '@/components/catalog/StockBadge';
import QuantitySelector from '@/components/catalog/QuantitySelector';
import Button from '@/components/ui/Button';
import { Search, Plus, Check, ShoppingBag, Sparkles } from 'lucide-react';

export default function ProductSelector({ onSelectProduct, activeShop = null }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [justAddedId, setJustAddedId] = useState(null);

  const getItemStock = (item) => {
    if (!item) return 0;
    if (activeShop?.id && item.shopStocks && typeof item.shopStocks[activeShop.id] === 'number') {
      return item.shopStocks[activeShop.id];
    }
    return typeof item.stock === 'number' ? item.stock : 0;
  };

  useEffect(() => {
    let isMounted = true;
    getItems()
      .then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live items for product selector:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesShop = activeShop?.id
        ? isItemAvailableAtShop(item, activeShop.id, activeShop.name)
        : true;
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
      const matchesSearch = searchTerm
        ? item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesShop && matchesCategory && matchesSearch;
    });
  }, [items, activeShop, selectedCategory, searchTerm]);

  // Selected item object from dropdown/picker
  const currentItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  const currentItemStock = currentItem ? getItemStock(currentItem) : 0;

  const handleAddCurrent = () => {
    if (!currentItem) return;
    onSelectProduct(currentItem, quantity);
    setJustAddedId(currentItem.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const handleQuickAdd = (item) => {
    onSelectProduct(item, 1);
    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  // Popular items for instant 1-click select
  const popularItems = useMemo(() => {
    const popularIds = ['i1', 'i2', 'i3', 'i5', 'i9', 'i11'];
    return items.filter((item) => popularIds.includes(item.id) && getItemStock(item) > 0).slice(0, 6);
  }, [items, activeShop]);

  return (
    <div className="bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e5e5] pb-4">
        <div>
          <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a] flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#1a3a3a]" />
            Select Stationery Items Directly
          </h3>
          <p className="text-xs text-[#6a6a6a] mt-0.5">
            Choose any product from the campus store inventory to place your pre-order immediately.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1a3a3a]/10 text-[#1a3a3a] self-start sm:self-auto flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Direct Order Enabled
        </span>
      </div>

      {/* Dropdown / Interactive Selector */}
      <div className="space-y-3 bg-[#faf5e8] p-4 rounded-[18px] border border-[#e5e5e5]">
        <label className="block text-xs font-semibold text-[#0a0a0a]">
          Choose Product & Quantity:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7">
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                setQuantity(1);
              }}
              className="w-full h-[44px] px-3.5 bg-white border border-[#e5e5e5] rounded-[12px] text-xs font-medium text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] cursor-pointer"
            >
              <option value="">-- Choose a stationery item ({items.length} available) --</option>
              {items.map((item) => {
                const stock = getItemStock(item);
                return (
                  <option key={item.id} value={item.id} disabled={stock <= 0}>
                    {item.name} — {formatINR(item.price)} {stock <= 0 ? '(Out of Stock)' : `(${stock} in stock)`}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center justify-start sm:justify-center">
            <QuantitySelector
              quantity={quantity}
              onChange={setQuantity}
              min={1}
              max={currentItem ? Math.min(20, currentItemStock) : 10}
              disabled={!currentItem || currentItemStock <= 0}
              size="md"
            />
          </div>

          <div className="sm:col-span-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              disabled={!currentItem || currentItemStock <= 0}
              onClick={handleAddCurrent}
              icon={justAddedId === currentItem?.id ? Check : Plus}
            >
              {justAddedId === currentItem?.id ? 'Added' : 'Select Product'}
            </Button>
          </div>
        </div>

        {currentItem && (
          <div className="flex items-center gap-3 pt-2 border-t border-[#e5e5e5]/80 text-xs text-[#6a6a6a]">
            <img
              src={currentItem.image}
              alt={currentItem.name}
              className="h-9 w-9 rounded-lg object-cover border border-[#e5e5e5]"
            />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-[#0a0a0a] block truncate">{currentItem.name}</span>
              <span className="text-[10px] text-[#8a8a8a]">{currentItem.category} • SKU: {currentItem.sku}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-[#0a0a0a] block">{formatINR(currentItem.price * quantity)}</span>
              <StockBadge stock={currentItemStock} lowStockThreshold={currentItem.lowStockThreshold} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Select Popular Products Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#0a0a0a]">Quick Add Popular Campus Stationery:</span>
          <span className="text-[10px] text-[#8a8a8a]">1-Click to add and place order</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {popularItems.map((item) => {
            const isAdded = justAddedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleQuickAdd(item)}
                className={`p-2.5 rounded-[14px] border transition-all cursor-pointer flex items-center gap-2.5 text-left ${isAdded
                    ? 'border-[#1a3a3a] bg-[#a4d4c5]/20 ring-1 ring-[#1a3a3a]'
                    : 'border-[#e5e5e5] bg-white hover:border-[#0a0a0a] hover:bg-[#faf5e8]'
                  }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-[#e5e5e5]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#0a0a0a] truncate leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[11px] font-medium text-[#1a3a3a] mt-0.5">
                    {formatINR(item.price)}
                  </p>
                </div>
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-colors ${isAdded ? 'bg-[#1a3a3a] text-white' : 'bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5]'
                    }`}
                >
                  {isAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter / Search for more items */}
      <div className="space-y-3 pt-2 border-t border-[#e5e5e5]">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a8a8a]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search other stationery items..."
              className="w-full h-[36px] pl-9 pr-3 bg-white border border-[#e5e5e5] rounded-[10px] text-xs text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-[36px] px-3 bg-white border border-[#e5e5e5] rounded-[10px] text-xs text-[#0a0a0a] focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories_list.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {searchTerm && (
          <div className="max-h-44 overflow-y-auto space-y-1.5 divide-y divide-[#e5e5e5] bg-white rounded-[12px] border border-[#e5e5e5] p-2">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-[#8a8a8a] text-center py-2">No stationery items match &quot;{searchTerm}&quot;</p>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={item.image} alt={item.name} className="h-7 w-7 rounded object-cover" />
                    <div className="truncate">
                      <span className="font-semibold text-[#0a0a0a] block truncate">{item.name}</span>
                      <span className="text-[10px] text-[#8a8a8a]">{item.category} • {formatINR(item.price)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={item.stock <= 0}
                    onClick={() => handleQuickAdd(item)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#faf5e8] border border-[#e5e5e5] hover:bg-[#0a0a0a] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    + Add
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
