import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ links = [], title = 'Management', collapsed, onToggle }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-[#1a3a3a] text-white flex flex-col transition-all duration-300 border-r border-[#1a3a3a]/20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-[10px] bg-white text-[#0a0a0a] flex items-center justify-center font-bold text-sm flex-shrink-0">
            B·S
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-medium text-sm text-white tracking-[-0.3px] block">BIT Stationery</span>
              <span className="text-[10px] text-[#ffb084] uppercase tracking-[1.5px] block font-semibold">{title}</span>
            </div>
          )}
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 rounded-[8px] hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#0a0a0a] shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? link.label : undefined}
            >
              {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
              {!collapsed && <span className="truncate">{link.label}</span>}
              {!collapsed && link.badge && (
                <span className="ml-auto bg-[#ff4d8b] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-8 w-8 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.displayName || user?.name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-white/60 capitalize">{role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-white/60 hover:text-[#ff4d8b] hover:bg-white/10 rounded-[8px] transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
