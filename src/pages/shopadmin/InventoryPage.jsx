import React, { useState, useMemo } from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import InventoryTable from '@/components/admin/InventoryTable';
import ItemFormModal from '@/components/admin/ItemFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/ToastProvider';
import { mockItems, categories_list } from '@/mocks/items';
import { Plus, Download, Filter } from 'lucide-react';

export default function ShopAdminInventoryPage() {
  const [items, setItems] = useState(mockItems);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const toast = useToast();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category ? item.category === category : true;
      let matchesStock = true;
      if (stockFilter === 'low') matchesStock = item.stock <= item.lowStockThreshold && item.stock > 0;
      if (stockFilter === 'out') matchesStock = item.stock <= 0;
      if (stockFilter === 'in') matchesStock = item.stock > item.lowStockThreshold;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, search, category, stockFilter]);

  const handleSaveItem = (itemData) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...itemData } : i))
      );
      toast.success('Item Updated', `${itemData.name} details saved.`);
    } else {
      const newItem = {
        ...itemData,
        id: `i-${Date.now()}`,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success('Item Added', `${itemData.name} added to catalog.`);
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = () => {
    setItems((prev) => prev.filter((i) => i.id !== deleteConfirmId));
    toast.info('Item Removed', 'Stationery item removed from inventory.');
    setDeleteConfirmId(null);
  };

  const handleQuickStockChange = (itemId, newStock) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: newStock } : i))
    );
  };

  return (
    <ShopAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Stationery Inventory Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Maintain shelf stock, pricing, threshold parameters, and SKU tracking
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
            onChange={setSearch}
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
                onChange={(e) => setStockFilter(e.target.value)}
                options={[
                  { value: 'in', label: 'In Stock' },
                  { value: 'low', label: 'Low Stock (<15)' },
                  { value: 'out', label: 'Out of Stock' },
                ]}
                placeholder="All Stock Levels"
              />
            </div>
          </div>
        </div>

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
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
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
