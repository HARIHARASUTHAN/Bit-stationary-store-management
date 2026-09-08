import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import useCartStore from '@/hooks/useCart';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { ShoppingBag, LogOut, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ navLinks = [], showCart = false }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartStore((s) => s.cartCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadges = {
    student: { variant: 'peach', label: 'STUDENT' },
    faculty: { variant: 'lavender', label: 'FACULTY' },
    shopadmin: { variant: 'ochre', label: 'SHOP ADMIN' },
    admin: { variant: 'teal', label: 'CAMPUS ADMIN' },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fffaf0]/95 backdrop-blur-md border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to={`/${role}/dashboard`} className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-[12px] bg-[#0a0a0a] flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <span className="font-bold text-base tracking-tighter">B·S</span>
              </div>
              <div>
                <span className="font-medium text-[#0a0a0a] text-base tracking-[-0.5px] block leading-tight">
                  BIT Stationery
                </span>
                <span className="text-[10px] text-[#6a6a6a] uppercase tracking-[1.5px] block font-semibold">
                  Pre-Ordering Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation pills */}
            {navLinks.length > 0 && (
              <nav className="hidden md:flex items-center gap-1.5 ml-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.startsWith(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-all ${
                        isActive
                          ? 'bg-[#f5f0e0] text-[#0a0a0a] font-semibold border border-[#e5e5e5]'
                          : 'text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#faf5e8]'
                      }`}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {/* Cart Icon for Student/Faculty */}
            {showCart && (
              <Link
                to={`/${role}/cart`}
                className="relative p-2 rounded-[12px] text-[#0a0a0a] hover:bg-[#f5f0e0] transition-colors border border-transparent hover:border-[#e5e5e5]"
                title="View Pre-Order Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4d8b] text-[10px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Role indicator pill badge */}
            <div className="hidden sm:block">
              <Badge variant={roleBadges[role]?.variant || 'cream'} size="sm">
                {roleBadges[role]?.label || role?.toUpperCase()}
              </Badge>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-[12px] hover:bg-[#f5f0e0] transition-colors focus:outline-none border border-transparent hover:border-[#e5e5e5]"
              >
                <div className="h-8 w-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-xs font-semibold">
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-[#0a0a0a] leading-tight">
                    {user?.displayName || user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-[#6a6a6a] leading-tight">
                    {user?.department || user?.email}
                  </p>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#fffaf0] rounded-[16px] shadow-xl border border-[#e5e5e5] py-2 z-50 animate-in fade-in"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#e5e5e5]">
                    <p className="text-xs font-semibold text-[#0a0a0a]">{user?.displayName || user?.name || 'User'}</p>
                    <p className="text-[11px] text-[#6a6a6a] truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5">
                      <Badge variant={roleBadges[role]?.variant || 'cream'} size="sm">
                        {role}
                      </Badge>
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#ff4d8b] hover:bg-[#faf5e8] transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            {navLinks.length > 0 && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-[12px] text-[#0a0a0a] hover:bg-[#f5f0e0]"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && navLinks.length > 0 && (
        <div className="md:hidden border-t border-[#e5e5e5] px-4 pt-2 pb-4 bg-[#faf5e8] space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm font-medium ${
                  isActive
                    ? 'bg-[#0a0a0a] text-white'
                    : 'text-[#3a3a3a] hover:bg-[#f5f0e0]'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
