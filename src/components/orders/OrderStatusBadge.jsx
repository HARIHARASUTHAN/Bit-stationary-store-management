import React from 'react';
import Badge from '@/components/ui/Badge';

export default function OrderStatusBadge({ status }) {
  const config = {
    Pending: { variant: 'ochre', label: 'Pending Approval' },
    Approved: { variant: 'teal', label: 'Approved / In Queue' },
    Ready: { variant: 'lavender', label: 'Ready for Counter Pickup' },
    Collected: { variant: 'cream', label: 'Collected' },
    Cancelled: { variant: 'pink', label: 'Cancelled' },
  };

  const current = config[status] || { variant: 'neutral', label: status };

  return (
    <Badge variant={current.variant} size="sm" dot>
      {current.label}
    </Badge>
  );
}
