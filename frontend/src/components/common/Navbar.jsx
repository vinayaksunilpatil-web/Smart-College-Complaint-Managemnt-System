import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-200 flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
      case 'staff':
        return <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-200 flex items-center gap-1"><Building2 className="w-3 h-3" /> Staff ({user?.dept_name || 'Dept'})</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200 flex items-center gap-1"><User className="w-3 h-3" /> Student ({user?.roll_no})</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              SC
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg block leading-tight">
                Smart Complaint
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-600 block">
                College Management System
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Notifications + User Profile & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <NotificationBell userRole={user?.role} />

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
            <div className="mt-0.5">{getRoleBadge()}</div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <button
            onClick={logout}
            title="Logout"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
