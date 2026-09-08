import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no records matching your criteria right now.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center bg-[#faf5e8] rounded-[24px] border border-[#e5e5e5] ${className}`}>
      <div className="p-4 bg-[#f5f0e0] rounded-full text-[#0a0a0a] mb-3 border border-[#e5e5e5]">
        <Icon className="h-7 w-7" />
      </div>
      <h4 className="text-lg font-medium tracking-[-0.5px] text-[#0a0a0a]">{title}</h4>
      <p className="text-xs text-[#6a6a6a] mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
