import React from 'react';
import ItemCard from './ItemCard';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { PackageSearch } from 'lucide-react';

export default function CatalogGrid({ items = [], loading = false, onResetFilters }) {
  if (loading) {
    return <SkeletonLoader count={8} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No stationery items found"
        description="Try adjusting your search query or selecting a different category filter."
        actionText={onResetFilters ? 'Clear Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
