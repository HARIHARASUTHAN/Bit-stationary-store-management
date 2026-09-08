import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { categories_list } from '@/mocks/items';

export default function ItemFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: categories_list[0] || 'Writing Instruments',
    sku: '',
    price: '',
    stock: '',
    lowStockThreshold: 15,
    description: '',
    image: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || categories_list[0],
        sku: initialData.sku || '',
        price: initialData.price || '',
        stock: initialData.stock ?? '',
        lowStockThreshold: initialData.lowStockThreshold ?? 15,
        description: initialData.description || '',
        image: initialData.image || '',
      });
    } else {
      setFormData({
        name: '',
        category: categories_list[0] || 'Writing Instruments',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        price: '',
        stock: '',
        lowStockThreshold: 15,
        description: '',
        image: `https://picsum.photos/seed/${Date.now()}/400/300`,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.stock === '' || Number(formData.stock) < 0) newErrors.stock = 'Stock must be 0 or higher';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold || 15),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Stationery Item' : 'Add New Stationery Item'}
      subtitle="Configure item details, stock parameters, and pricing"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Item Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Spiral Bound Notebook A4"
            error={errors.name}
            required
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categories_list.map((c) => ({ value: c, label: c }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="SKU Code"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g. NB-001"
          />

          <Input
            label="Price (₹)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 65"
            error={errors.price}
            required
          />

          <Input
            label="Current Stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="e.g. 100"
            error={errors.stock}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Low-Stock Alert Threshold"
            name="lowStockThreshold"
            type="number"
            value={formData.lowStockThreshold}
            onChange={handleChange}
            placeholder="e.g. 15"
            helperText="Notifies shop admin when stock reaches this limit"
          />

          <Input
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://..."
            helperText="Preview image for student & faculty catalog"
          />
        </div>

        <Textarea
          label="Item Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Detailed specs, brand, page count, color, etc."
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
