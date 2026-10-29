import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import { LayoutDashboard, ShoppingBag, Clock, User, Building2 } from 'lucide-react';

export default function StudentLayout({ children }) {
  const { role } = useAuth();
  const location = useLocation();
  const isFaculty = role === 'faculty' || location.pathname.startsWith('/faculty');
  const basePath = isFaculty ? '/faculty' : '/student';

  const navLinks = [
    { to: `${basePath}/dashboard`, label: isFaculty ? 'Faculty Portal' : 'Dashboard', icon: LayoutDashboard },
    { to: `${basePath}/catalog`, label: 'Stationery Catalog', icon: ShoppingBag },
    { to: `${basePath}/orders`, label: isFaculty ? 'Orders' : 'My Orders', icon: Clock },
    { to: `${basePath}/profile`, label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] flex flex-col">
      <Navbar navLinks={navLinks} showCart={true} />
      {isFaculty && (
        <div className="bg-[#ffb084]/20 border-b border-[#ffb084]/40 text-[#0a0a0a] px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4 text-[#0a0a0a]" />
              Faculty Requisition Desk: Orders & express store dispatch enabled
            </span>
            <span className="hidden sm:inline font-semibold text-[#0a0a0a] bg-[#ffb084]/40 px-2 py-0.5 rounded-full text-[10px]">
              Priority Desk #2
            </span>
          </div>
        </div>
      )}
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
            Pre-Ordering Store: Mon–Sat 8:30 AM to 6:00 PM • Desk Inquiries: stationery@bit.ac.in
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
