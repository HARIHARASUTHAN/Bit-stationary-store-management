import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { mockOrders } from '@/mocks/orders';
import { formatINR } from '@/utils/currency';
import { formatDateTime } from '@/utils/formatDate';
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('orders');
  const [dateFrom, setDateFrom] = useState('2026-09-01');
  const [dateTo, setDateTo] = useState('2026-09-10');
  const toast = useToast();

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Order ID,User,Department,Role,Total,Status,Placed At\n' +
      mockOrders
        .map(
          (o) =>
            `${o.id},"${o.userName}","${o.userDepartment}",${o.role},${o.total},${o.status},${o.placedAt}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BIT_Stationery_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report Downloaded', 'CSV report file generated.');
  };

  const handleExportPDF = () => {
    toast.success('PDF Generation Triggered', 'Compiling PDF document for download.');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Reports & Ledger Export
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Generate audited accounts of pre-orders, inventory valuation, and departmental allocation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" icon={FileSpreadsheet} onClick={handleExportCSV}>
              Download CSV
            </Button>
            <Button variant="primary" size="sm" icon={FileText} onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        </div>

        {/* Config box */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'orders', label: 'All Pre-Orders Summary' },
              { value: 'inventory', label: 'Inventory Stock Valuation' },
              { value: 'departments', label: 'Departmental Requisitions' },
            ]}
          />
          <Input
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Preview Table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden space-y-2">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Generated Ledger Preview</h3>
            <span className="text-xs text-gray-500">{mockOrders.length} records in range</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Beneficiary</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Department</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-[#1e3a5f]">#{ord.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{ord.userName}</td>
                    <td className="px-4 py-3 text-gray-600">{ord.userDepartment}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{ord.role}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatINR(ord.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 font-semibold text-gray-700">
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDateTime(ord.placedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
