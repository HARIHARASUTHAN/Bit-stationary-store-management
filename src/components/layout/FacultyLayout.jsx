import React from 'react';
import Navbar from './Navbar';
import { LayoutDashboard, ShoppingBag, Clock, Building2 } from 'lucide-react';

export default function FacultyLayout({ children }) {
  const navLinks = [
    { to: '/faculty/dashboard', label: 'Faculty Portal', icon: LayoutDashboard },
    { to: '/faculty/catalog', label: 'Stationery Catalog', icon: ShoppingBag },
    { to: '/faculty/orders', label: 'Department Orders', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] flex flex-col">
      <Navbar navLinks={navLinks} showCart={true} />
      {/* Clay Peach/Ochre announcement ribbon */}
      <div className="bg-[#ffb084]/20 border-b border-[#ffb084]/40 text-[#0a0a0a] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <Building2 className="h-4 w-4 text-[#0a0a0a]" />
            Faculty Requisition Desk: Bulk department orders & express counter dispatch enabled
          </span>
          <span className="hidden sm:inline font-semibold text-[#0a0a0a] bg-[#ffb084]/40 px-2 py-0.5 rounded-full text-[10px]">
            Priority Counter #2
          </span>
        </div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-[#faf5e8] border-t border-[#e5e5e5] py-10 text-center text-xs text-[#6a6a6a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="font-semibold text-[#0a0a0a] block">BIT Campus Stationery Store (Faculty Portal)</span>
            <span className="text-[11px] text-[#9a9a9a]">Academic Indents & Laboratory Consumables</span>
          </div>
          <p className="text-xs text-[#6a6a6a]">
            Special requisition forms processed within 2 hours.
          </p>
        </div>
      </footer>
    </div>
  );
}
