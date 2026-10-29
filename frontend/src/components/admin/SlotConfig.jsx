import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Calendar, Plus, Clock, Trash2 } from 'lucide-react';

export default function SlotConfig({ slots = [], onAddSlot, onDeleteSlot }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '2026-09-11',
    time: '10:00 AM – 11:00 AM',
    capacity: 20,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSlot({
      ...formData,
      capacity: Number(formData.capacity),
      booked: 0,
      id: `s-${Date.now()}`,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Pickup Time Slots</h3>
          <p className="text-xs text-gray-500">Configure pickup windows and per-slot capacity limits</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
          Add Slot Window
        </Button>
      </div>

      {slots.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-200">
          <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">No pickup slots configured</p>
          <p className="text-xs text-gray-400 mt-1">Create store pickup windows to allow student booking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {slots.map((slot) => {
            const isFull = slot.booked >= slot.capacity;
            const pct = Math.round((slot.booked / slot.capacity) * 100);

            return (
              <div
                key={slot.id}
                className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1e3a5f]">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span>{slot.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isFull ? 'FULL' : `${slot.capacity - slot.booked} left`}
                    </span>
                    {onDeleteSlot && (
                      <button
                        type="button"
                        onClick={() => onDeleteSlot(slot)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete slot"
                        aria-label={`Delete slot ${slot.time} on ${slot.date}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{slot.time}</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Capacity: {slot.booked} / {slot.capacity}</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Pickup Slot"
        subtitle="Specify date, time window, and maximum order bookings"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pickup Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input
            label="Time Slot Window"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            placeholder="e.g. 10:00 AM – 11:00 AM"
            required
          />
          <Input
            label="Capacity (Max orders)"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
