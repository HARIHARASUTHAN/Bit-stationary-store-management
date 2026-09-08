import React from 'react';
import Navbar from './Navbar';
import { LayoutDashboard, ShoppingBag, Clock } from 'lucide-react';

export default function StudentLayout({ children }) {
  const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/catalog', label: 'Stationery Catalog', icon: ShoppingBag },
    { to: '/student/orders', label: 'My Orders', icon: Clock },
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
            <span className="font-semibold text-[#0a0a0a] block">BIT Campus Stationery Store</span>
            <span className="text-[11px] text-[#9a9a9a]">Bannari Amman Institute of Technology</span>
          </div>
          <p className="text-xs text-[#6a6a6a]">
            Pre-Ordering Counter: Mon–Sat 8:30 AM to 6:00 PM • Desk Inquiries: stationery@bit.ac.in
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1a3a3a]"></span>
            <span className="text-[11px] font-medium text-[#1a3a3a]">Fulfillment Status: Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
