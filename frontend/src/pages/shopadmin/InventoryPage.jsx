import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import InventoryTable from '@/components/admin/InventoryTable';
import ItemFormModal from '@/components/admin/ItemFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/ToastProvider';
import { mockItems, categories_list } from '@/mocks/items';
import { getActiveCampusShops, getShopForUser } from '@/mocks/shops';
import { useAuth } from '@/context/AuthContext';
import { getItems, addItem, updateItem, deleteItem } from '@/services/inventoryService';
import { Plus, Download, Filter, X } from 'lucide-react';

export default function ShopAdminInventoryPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStock = searchParams.get('stock') || searchParams.get('filter') || '';
  const initialSearch = searchParams.get('search') || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('');
  const [stockFilter, setStockFilter] = useState(initialStock);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const toast = useToast();

  const adminShop = useMemo(() => getShopForUser(user), [user]);
  const adminShopId = adminShop?.id || user?.shopId || 'main-store';

  const fetchItems = () => {
    setLoading(true);
    getItems()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load live inventory:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Map each item to reflect this specific shop's stock
  const shopScopedItems = useMemo(() => {
    return items.map((item) => {
      const shopStock = (item.shopStocks && typeof item.shopStocks[adminShopId] === 'number')
        ? item.shopStocks[adminShopId]
        : (typeof item.stock === 'number' ? item.stock : 0);
      return {
        ...item,
        stock: shopStock,
      };
    });
  }, [items, adminShopId]);

  // Synchronize URL parameters (e.g. from Low-Stock Warnings redirect)
  useEffect(() => {
    const s = searchParams.get('stock') || searchParams.get('filter');
    if (s !== null) {
      setStockFilter(s);
    }
    const q = searchParams.get('search');
    if (q !== null) {
      setSearch(q);
    }
    const editId = searchParams.get('edit') || searchParams.get('itemId');
    if (editId && shopScopedItems.length > 0) {
      const target = shopScopedItems.find((i) => i.id === editId);
      if (target) {
        setEditingItem(target);
        setModalOpen(true);
      }
    }
  }, [searchParams, shopScopedItems]);

  const filteredItems = useMemo(() => {
    return shopScopedItems.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category ? item.category === category : true;
      let matchesStock = true;
      if (stockFilter === 'low') matchesStock = item.stock <= item.lowStockThreshold;
      if (stockFilter === 'out') matchesStock = item.stock <= 0;
      if (stockFilter === 'in') matchesStock = item.stock > item.lowStockThreshold;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [shopScopedItems, search, category, stockFilter]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    if (searchParams.get('edit') || searchParams.get('itemId')) {
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      next.delete('itemId');
      setSearchParams(next, { replace: true });
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      const newStockVal = Number(itemData.stock) || 0;
      if (editingItem) {
        const origItem = items.find((i) => i.id === editingItem.id) || editingItem;
        const updatedShopStocks = {
          ...(origItem.shopStocks || {}),
          [adminShopId]: newStockVal,
        };
        const payload = {
          ...itemData,
          shopStocks: updatedShopStocks,
        };
        const updated = await updateItem(editingItem.id, payload);
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...updated, shopStocks: updatedShopStocks } : i))
        );
        toast.success('Item Updated', `${itemData.name} stock saved for ${adminShop.name}.`);
      } else {
        const payload = {
          ...itemData,
          shopStocks: {
            [adminShopId]: newStockVal,
          },
        };
        const newItem = await addItem(payload);
        setItems((prev) => [newItem, ...prev]);
        toast.success('Item Added', `${itemData.name} added to catalog.`);
      }
    } catch (err) {
      toast.error('Save Failed', err.message || 'Could not save item.');
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteItem = async () => {
    try {
      await deleteItem(deleteConfirmId);
      setItems((prev) => prev.filter((i) => i.id !== deleteConfirmId));
      toast.info('Item Removed', 'Stationery item removed from inventory.');
    } catch (err) {
      toast.error('Delete Failed', err.message || 'Could not remove item.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleQuickStockChange = async (itemId, newStock) => {
    try {
      const origItem = items.find((i) => i.id === itemId);
      const updatedShopStocks = {
        ...(origItem?.shopStocks || {}),
        [adminShopId]: newStock,
      };
      await updateItem(itemId, { stock: newStock, shopStocks: updatedShopStocks });
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, stock: newStock, shopStocks: updatedShopStocks } : i))
      );
    } catch (err) {
      toast.error('Stock Update Failed', err.message);
    }
  };

  return (
    <ShopAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Stationery Inventory Management
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1e3a5f] text-white">
                {adminShop.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Maintain shelf stock, pricing, threshold parameters, and SKU tracking for {adminShop.name}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            Add New Item
          </Button>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              const next = new URLSearchParams(searchParams);
              if (val) next.set('search', val);
              else next.delete('search');
              setSearchParams(next, { replace: true });
            }}
            placeholder="Search items by name or SKU..."
            className="w-full sm:w-80"
          />

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-48">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categories_list.map((c) => ({ value: c, label: c }))}
                placeholder="All Categories"
              />
            </div>
            <div className="w-44">
              <Select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set('stock', e.target.value);
                  else next.delete('stock');
                  setSearchParams(next, { replace: true });
                }}
                options={[
                  { value: 'in', label: 'In Stock' },
                  { value: 'low', label: 'Low Stock (<15)' },
                  { value: 'out', label: 'Out of Stock' },
                ]}
                placeholder="All Stock Levels"
              />
            </div>
            {(stockFilter || search || category) && (
              <button
                type="button"
                onClick={() => {
                  setStockFilter('');
                  setSearch('');
                  setCategory('');
                  setSearchParams({}, { replace: true });
                }}
                className="text-xs text-[#ff4d8b] hover:underline flex items-center gap-1 flex-shrink-0"
                title="Clear all filters"
              >
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Low Stock Active Notification Banner */}
        {stockFilter === 'low' && (
          <div className="bg-[#ffb084]/20 border border-[#ffb084]/40 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-[#0a0a0a]">
            <div>
              <span className="font-semibold text-[#0a0a0a]">Filtered by Low-Stock Category:</span> Showing items with shelf count at or below alert thresholds for <strong>{adminShop.name}</strong>.
            </div>
            <button
              type="button"
              onClick={() => {
                setStockFilter('');
                const next = new URLSearchParams(searchParams);
                next.delete('stock');
                setSearchParams(next, { replace: true });
              }}
              className="text-[#ff4d8b] hover:underline font-semibold text-xs ml-4 flex-shrink-0"
            >
              Show all stock levels
            </button>
          </div>
        )}

        {/* Inventory Table */}
        <InventoryTable
          items={filteredItems}
          onEdit={(item) => {
            setEditingItem(item);
            setModalOpen(true);
          }}
          onDelete={(id) => setDeleteConfirmId(id)}
          onQuickStockChange={handleQuickStockChange}
        />

        {/* Modal for Add / Edit */}
        <ItemFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveItem}
          initialData={editingItem}
        />

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={handleDeleteItem}
          title="Delete Stationery Item"
          message="Are you sure you wish to remove this stationery item from the campus store inventory? This cannot be undone."
          confirmText="Delete Item"
        />
      </div>
    </ShopAdminLayout>
  );
}
