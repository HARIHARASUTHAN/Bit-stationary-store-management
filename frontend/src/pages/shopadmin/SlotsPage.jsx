import React, { useState } from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import SlotConfig from '@/components/admin/SlotConfig';
import { mockSlots } from '@/mocks/slots';
import { useToast } from '@/components/ui/ToastProvider';

export default function ShopAdminSlotsPage() {
  const [slots, setSlots] = useState(mockSlots);
  const toast = useToast();

  const handleAddSlot = (newSlot) => {
    setSlots((prev) => [...prev, newSlot]);
    toast.success('Pickup Slot Added', `${newSlot.date} (${newSlot.time}) enabled.`);
  };

  return (
    <ShopAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Pickup Slot & Counter Window Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure hourly capacity, break windows, and academic calendar pickup schedules
          </p>
        </div>

        <SlotConfig slots={slots} onAddSlot={handleAddSlot} />
      </div>
    </ShopAdminLayout>
  );
}
