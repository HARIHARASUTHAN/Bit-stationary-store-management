import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { Settings, Plus, Trash2, Save, Clock, Building2, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const toast = useToast();

  const [departments, setDepartments] = useState([
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
    'Management Studies (MBA)',
  ]);

  const [newDept, setNewDept] = useState('');
  const [cutoffTime, setCutoffTime] = useState('17:00');
  const [maxAdvanceDays, setMaxAdvanceDays] = useState('7');
  const [lowStockNotification, setLowStockNotification] = useState(true);
  const [facultyPriorityLane, setFacultyPriorityLane] = useState(true);

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    setDepartments((prev) => [...prev, newDept.trim()]);
    setNewDept('');
    toast.success('Department Added', `${newDept} registered.`);
  };

  const handleRemoveDept = (index) => {
    setDepartments((prev) => prev.filter((_, i) => i !== index));
    toast.info('Department Removed', 'Department entry removed from active list.');
  };

  const handleSaveSettings = () => {
    toast.success('System Settings Saved', 'Campus portal parameters have been applied.');
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure academic departments, order cutoff windows, and campus store policies
            </p>
          </div>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSaveSettings}>
            Save All Changes
          </Button>
        </div>

        {/* Operating Windows */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            Store Cutoff & Ordering Windows
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Daily Pre-Order Cutoff Time"
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              helperText="Orders after this time roll over to the following day's morning slot"
            />
            <Input
              label="Maximum Advance Pre-Order Window (Days)"
              type="number"
              value={maxAdvanceDays}
              onChange={(e) => setMaxAdvanceDays(e.target.value)}
              helperText="How far ahead students/faculty can schedule store pickup"
            />
          </div>
        </div>

        {/* Operational Policies */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal-600" />
            Notifications & Dispatch Lane Policies
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-gray-900">Low-Stock Email Notifications</p>
                <p className="text-[11px] text-gray-500">Alert store managers when items drop below safety thresholds</p>
              </div>
              <input
                type="checkbox"
                checked={lowStockNotification}
                onChange={(e) => setLowStockNotification(e.target.checked)}
                className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-gray-900">Dedicated Faculty Priority Lane</p>
                <p className="text-[11px] text-gray-500">Reserve Priority Desk #2 for faculty department indents</p>
              </div>
              <input
                type="checkbox"
                checked={facultyPriorityLane}
                onChange={(e) => setFacultyPriorityLane(e.target.checked)}
                className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
              />
            </label>
          </div>
        </div>

        {/* Academic Departments Registry */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-600" />
            Registered Academic Departments
          </h3>

          <form onSubmit={handleAddDept} className="flex gap-2">
            <Input
              placeholder="Enter new academic department name..."
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" size="md" icon={Plus}>
              Add Department
            </Button>
          </form>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {departments.map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs bg-white hover:bg-gray-50">
                <span className="font-medium text-gray-800">{dept}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDept(idx)}
                  className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
