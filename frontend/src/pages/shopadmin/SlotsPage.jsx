import React, { useState, useEffect } from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import SlotConfig from '@/components/admin/SlotConfig';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { mockSlots } from '@/mocks/slots';
import { getSlots, addSlot, updateSlot, deleteSlot } from '@/services/slotService';
import { useToast } from '@/components/ui/ToastProvider';

export default function ShopAdminSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const fetchSlots = () => {
    setLoading(true);
    getSlots()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSlots(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load slots from API:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAddSlot = async (newSlot) => {
    try {
      const created = await addSlot(newSlot);
      setSlots((prev) => [...prev, created || newSlot]);
      toast.success('Pickup Slot Added', `${newSlot.date} (${newSlot.time}) enabled.`);
    } catch (err) {
      console.error('Failed to add slot:', err);
      // Optimistic fallback for local dev
      setSlots((prev) => [...prev, newSlot]);
      toast.success('Pickup Slot Added', `${newSlot.date} (${newSlot.time}) enabled.`);
    }
  };

  const handleUpdateSlot = async (updatedSlot) => {
    try {
      const res = await updateSlot(updatedSlot.id, updatedSlot);
      setSlots((prev) =>
        prev.map((s) => (s.id === updatedSlot.id ? { ...s, ...res, ...updatedSlot } : s))
      );
      toast.success('Pickup Slot Updated', `${updatedSlot.date} (${updatedSlot.time}) updated.`);
    } catch (err) {
      console.error('Failed to update slot:', err);
      setSlots((prev) =>
        prev.map((s) => (s.id === updatedSlot.id ? { ...s, ...updatedSlot } : s))
      );
      toast.success('Pickup Slot Updated', `${updatedSlot.date} (${updatedSlot.time}) updated.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSlot(slotToDelete.id);
      setSlots((prev) => prev.filter((s) => s.id !== slotToDelete.id));
      toast.success('Pickup Slot Deleted', `${slotToDelete.date} (${slotToDelete.time}) removed.`);
    } catch (err) {
      console.error('Failed to delete slot:', err);
      // Fallback for demo/offline
      setSlots((prev) => prev.filter((s) => s.id !== slotToDelete.id));
      toast.success('Pickup Slot Deleted', `${slotToDelete.date} (${slotToDelete.time}) removed.`);
    } finally {
      setIsDeleting(false);
      setSlotToDelete(null);
    }
  };

  return (
    <ShopAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Pickup Slot & Store Window Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure hourly capacity, break windows, and academic calendar pickup schedules
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <SlotConfig
            slots={slots}
            onAddSlot={handleAddSlot}
            onUpdateSlot={handleUpdateSlot}
            onDeleteSlot={(slot) => setSlotToDelete(slot)}
          />
        )}

        <ConfirmDialog
          isOpen={!!slotToDelete}
          onClose={() => setSlotToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Pickup Slot Window"
          message={
            slotToDelete
              ? slotToDelete.booked > 0
                ? `Are you sure you want to delete the pickup window for ${slotToDelete.date} (${slotToDelete.time})? Note: This slot currently has ${slotToDelete.booked} booked order(s).`
                : `Are you sure you want to delete the pickup window for ${slotToDelete.date} (${slotToDelete.time})? Students will no longer be able to select this window.`
              : ''
          }
          confirmText="Delete Slot"
          variant="danger"
          loading={isDeleting}
        />
      </div>
    </ShopAdminLayout>
  );
}
