import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AccountTable from '@/components/admin/AccountTable';
import {
  getAccounts,
  createShopAdminAccount,
  toggleAccountStatus,
  deleteAccount,
} from '@/services/reportService';
import { getShopInfo } from '@/services/authService';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const toast = useToast();

  const loadAccounts = () => {
    getAccounts()
      .then((users) => {
        if (users && Array.isArray(users)) {
          const shopAdmins = users.filter((u) => u.role === 'shopadmin');
          setAccounts(shopAdmins);
        }
      })
      .catch((err) => {
        console.warn('Could not load accounts from database:', err.message);
      });
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const syncShopsCache = () => {
    getShopInfo()
      .then((data) => {
        if (data && data.shops) {
          localStorage.setItem('bsp_live_campus_shops', JSON.stringify(data.shops));
          window.dispatchEvent(new StorageEvent('storage', { key: 'bsp_live_campus_shops', newValue: JSON.stringify(data.shops) }));
        }
      })
      .catch(() => {});
  };

  const handleCreateAccount = async (newAcc) => {
    try {
      const created = await createShopAdminAccount(newAcc);
      const savedAccount = created || newAcc;
      setAccounts((prev) => [
        savedAccount,
        ...prev.filter(
          (acc) => acc.id !== savedAccount.id && acc.email !== savedAccount.email
        ),
      ]);
      syncShopsCache();
      toast.success(
        'Account Created',
        `Shop admin account created for ${savedAccount.name || newAcc.name} and saved to database.`
      );
      return savedAccount;
    } catch (err) {
      toast.error('Account Creation Failed', err.message || 'Could not save account to database.');
      throw err;
    }
  };

  const handleToggleStatus = async (accountId) => {
    const target = accounts.find((acc) => acc.id === accountId);
    if (!target) return;
    const currentActive = target.active !== false;
    const nextActive = !currentActive;

    // Optimistically update
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, active: nextActive } : acc
      )
    );

    try {
      await toggleAccountStatus(accountId, nextActive);
      syncShopsCache();
      toast.info(
        'Account Status Changed',
        `${target.name || 'Account'} is now ${nextActive ? 'Active' : 'Deactivated'}.`
      );
    } catch (err) {
      // Revert optimistic update on failure
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, active: currentActive } : acc
        )
      );
      toast.error('Update Failed', err.message || 'Could not update status in database.');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    const target = accounts.find((acc) => acc.id === accountId);
    try {
      await deleteAccount(accountId);
      syncShopsCache();
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      toast.success(
        'Account Deleted',
        `Shop admin account for ${target?.name || 'user'} has been permanently removed.`
      );
    } catch (err) {
      toast.error('Deletion Failed', err.message || 'Could not delete account.');
      throw err;
    }
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
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    </AdminLayout>
  );
}
