import React, { useState } from 'react';
import StockBadge from '@/components/catalog/StockBadge';
import Button from '@/components/ui/Button';
import { formatINR } from '@/utils/currency';
import { Edit2, Trash2, Plus, Minus } from 'lucide-react';

export default function InventoryTable({
  items = [],
  onEdit,
  onDelete,
  onQuickStockChange,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Item</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">SKU</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Price</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Stock Level</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No items match the current filters.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{item.category}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                    {item.sku || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatINR(item.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onQuickStockChange(item.id, Math.max(0, item.stock - 1))}
                      className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                      title="Quick decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">{item.stock}</span>
                    <button
                      onClick={() => onQuickStockChange(item.id, item.stock + 1)}
                      className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                      title="Quick increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StockBadge stock={item.stock} lowStockThreshold={item.lowStockThreshold} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
