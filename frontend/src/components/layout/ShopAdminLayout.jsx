import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { LayoutDashboard, Package, ClipboardList, Calendar, BarChart3 } from 'lucide-react';

export default function ShopAdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: '/shopadmin/dashboard', label: 'Counter Dashboard', icon: LayoutDashboard },
    { to: '/shopadmin/inventory', label: 'Stationery Inventory', icon: Package },
    { to: '/shopadmin/orders', label: 'Order Dispatch Queue', icon: ClipboardList },
    { to: '/shopadmin/slots', label: 'Pickup Slot Windows', icon: Calendar },
    { to: '/shopadmin/reports', label: 'Department Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] flex">
      <Sidebar
        links={links}
        title="Store Operations"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
