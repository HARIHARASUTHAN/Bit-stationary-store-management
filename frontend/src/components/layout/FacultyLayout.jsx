import React from 'react';
import Navbar from './Navbar';
import { LayoutDashboard, ShoppingBag, Clock, User } from 'lucide-react';

export default function FacultyLayout({ children }) {
  const navLinks = [
    { to: '/faculty/dashboard', label: 'Faculty Portal', icon: LayoutDashboard },
    { to: '/faculty/catalog', label: 'Stationery Catalog', icon: ShoppingBag },
    { to: '/faculty/orders', label: 'Orders', icon: Clock },
    { to: '/faculty/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] flex flex-col">
      <Navbar navLinks={navLinks} showCart={true} />
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
