import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { LayoutDashboard, Users, Settings, FileText } from 'lucide-react';

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: '/admin/dashboard', label: 'System Analytics', icon: LayoutDashboard },
    { to: '/admin/accounts', label: 'Shop Admins', icon: Users },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
    { to: '/admin/audit-log', label: 'Audit Trail', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] flex">
      <Sidebar
        links={links}
        title="Campus Admin"
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
