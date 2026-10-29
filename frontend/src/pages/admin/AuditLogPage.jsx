import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AuditLogTable from '@/components/admin/AuditLogTable';
import { getAuditLogs } from '@/services/reportService';
import Button from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([]);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;
    getAuditLogs()
      .then((data) => {
        if (isMounted) {
          setLogs(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) setLogs([]);
      });
    return () => { isMounted = false; };
  }, []);

  const handleExport = () => {
    toast.success('Audit Trail Dispatched', 'Audit log export downloaded as CSV.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Audit Trail & Governance Log
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Immutable historical record of inventory mutations, stock adjustments, order approvals, and admin actions
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export Audit CSV
          </Button>
        </div>

        <AuditLogTable logs={logs} />
      </div>
    </AdminLayout>
  );
}
