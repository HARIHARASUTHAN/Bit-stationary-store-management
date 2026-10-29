import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { UserPlus, Power, Trash2, KeyRound } from 'lucide-react';

export default function AccountTable({
  accounts = [],
  onCreateAccount,
  onToggleStatus,
  onDeleteAccount,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shopName: '',
    department: 'Stationery Store Desk',
    password: 'tempPassword123',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let finalEmail = formData.email.trim();
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@shopadmin.ac.in`;
    }

    try {
      await onCreateAccount({
        name: formData.name.trim(),
        email: finalEmail,
        shopName: formData.shopName.trim() || formData.name.trim(),
        department: formData.department.trim(),
        password: formData.password,
        role: 'shopadmin',
        active: true,
      });
      setFormData({
        name: '',
        email: '',
        shopName: '',
        department: 'Stationery Store Desk',
        password: 'tempPassword123',
      });
      setModalOpen(false);
    } catch (_) {
      // Error notifications are handled by parent component toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Shop Admin Accounts</h3>
          <p className="text-xs text-gray-500">Manage store operators and store dispatch staff credentials</p>
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
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Assigned Store</th>
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
                <td className="px-4 py-3 text-xs">
                  <span className="font-semibold text-gray-900 block">{acc.shopName || acc.name}</span>
                  <span className="text-gray-500 text-[11px]">{acc.department || 'Main Store'}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={acc.active !== false ? 'success' : 'danger'} size="sm" dot>
                    {acc.active !== false ? 'Active' : 'Deactivated'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(acc.id)}
                      className={acc.active !== false ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                      title={acc.active !== false ? 'Deactivate Account' : 'Activate Account'}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      {acc.active !== false ? 'Deactivate' : 'Activate'}
                    </Button>
                    {onDeleteAccount && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAccountToDelete(acc)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Shop Admin Account"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
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
            label="Shop Name / Store Designation"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            placeholder="e.g. RASE MECH or BIT Central Stationery Store"
            required
          />
          <Input
            label="Assigned Store Location"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g. Ground Floor (Main Block)"
          />
          <Input
            label="Temporary Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={async () => {
          if (!accountToDelete || !onDeleteAccount) return;
          setDeleting(true);
          try {
            await onDeleteAccount(accountToDelete.id);
            setAccountToDelete(null);
          } catch (_) {
            // Error toast handled in parent
          } finally {
            setDeleting(false);
          }
        }}
        title="Delete Shop Admin Account"
        message={`Are you sure you want to permanently delete the shop admin account for "${accountToDelete?.name}" (${accountToDelete?.email})? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Account'}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
