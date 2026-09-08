import React from 'react';
import Badge from '@/components/ui/Badge';

export default function StockBadge({ stock, lowStockThreshold = 15 }) {
  if (stock <= 0) {
    return (
      <Badge variant="pink" size="sm" dot>
        Out of Stock
      </Badge>
    );
  }
  if (stock <= lowStockThreshold) {
    return (
      <Badge variant="warning" size="sm" dot>
        Low Stock ({stock} left)
      </Badge>
    );
  }
  return (
    <Badge variant="cream" size="sm" dot>
      In Stock ({stock})
    </Badge>
  );
}
