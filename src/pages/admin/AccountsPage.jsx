import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AccountTable from '@/components/admin/AccountTable';
import mockUsers from '@/mocks/users';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState(
    mockUsers.filter((u) => u.role === 'shopadmin')
  );
  const toast = useToast();

  const handleCreateAccount = (newAcc) => {
    setAccounts((prev) => [newAcc, ...prev]);
    toast.success('Account Created', `Shop admin account created for ${newAcc.name}.`);
  };

  const handleToggleStatus = (accountId) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, active: acc.active === false } : acc
      )
    );
    toast.info('Account Status Changed', 'Account status was updated.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Shop Admin Account Governance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Provision, manage, and toggle operational permissions for campus stationery store personnel
          </p>
        </div>

        <AccountTable
          accounts={accounts}
          onCreateAccount={handleCreateAccount}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </AdminLayout>
  );
}
