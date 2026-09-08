import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { UserPlus, Power, KeyRound } from 'lucide-react';

export default function AccountTable({
  accounts = [],
  onCreateAccount,
  onToggleStatus,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Stationery Store Desk',
    password: 'tempPassword123',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateAccount({
      ...formData,
      id: `u-${Date.now()}`,
      role: 'shopadmin',
      active: true,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Shop Admin Accounts</h3>
          <p className="text-xs text-gray-500">Manage store operators and counter dispatch staff credentials</p>
        </div>
        <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setModalOpen(true)}>
          Create Shop Admin
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Operator</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Email Domain</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Assigned Counter</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={acc.name} size="sm" />
                    <span className="font-semibold text-gray-900">{acc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{acc.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="warning" size="sm">Shop Admin</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{acc.department || 'Central Store'}</td>
                <td className="px-4 py-3">
                  <Badge variant={acc.active !== false ? 'success' : 'danger'} size="sm" dot>
                    {acc.active !== false ? 'Active' : 'Deactivated'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(acc.id)}
                    className={acc.active !== false ? 'text-red-600' : 'text-green-600'}
                  >
                    <Power className="h-4 w-4 mr-1" />
                    {acc.active !== false ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Shop Admin Account"
        subtitle="New accounts require an @shopadmin.ac.in institutional email"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ramesh Babu"
            required
          />
          <Input
            label="Institutional Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@shopadmin.ac.in"
            helperText="Must strictly end with @shopadmin.ac.in"
            required
          />
          <Input
            label="Assigned Counter / Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g. Counter #1 (Main Block)"
          />
          <Input
            label="Temporary Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
