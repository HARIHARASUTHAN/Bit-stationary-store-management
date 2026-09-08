import React from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import Button from '@/components/ui/Button';
import { DepartmentComparisonChart } from '@/components/admin/AnalyticsCharts';
import { mockOrders } from '@/mocks/orders';
import { formatINR } from '@/utils/currency';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function ShopAdminReportsPage() {
  const toast = useToast();

  // Aggregate department data
  const deptMap = {};
  mockOrders.forEach((o) => {
    const dept = o.userDepartment || 'General';
    if (!deptMap[dept]) {
      deptMap[dept] = { count: 0, revenue: 0, bulkCount: 0 };
    }
    deptMap[dept].count += 1;
    deptMap[dept].revenue += o.total;
    if (o.isBulkOrder) deptMap[dept].bulkCount += 1;
  });

  const handleExportCSV = () => {
    toast.success('Report Export Dispatched', 'Department order summary CSV downloaded.');
  };

  return (
    <ShopAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Department-Wise Order Summaries
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Breakdown of stationery usage, indents, and billing across academic departments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportCSV}>
              Export Department CSV
            </Button>
          </div>
        </div>

        {/* Chart */}
        <DepartmentComparisonChart />

        {/* Table summary */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Department Summary Table</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Department</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">Total Orders</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">Bulk Indents</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Total Billing Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(deptMap).map(([dept, data]) => (
                <tr key={dept} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{dept}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{data.count}</td>
                  <td className="px-4 py-3 text-center text-teal-700 font-semibold">{data.bulkCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#1e3a5f]">
                    {formatINR(data.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ShopAdminLayout>
  );
}
