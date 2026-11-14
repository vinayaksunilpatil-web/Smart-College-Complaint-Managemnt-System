import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  Building,
  Users,
  BarChart3,
  Database,
  UserCog,
  FileText
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  const studentLinks = [
    { to: '/student/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
    { to: '/student/submit',         label: 'Submit Complaint', icon: PlusCircle },
    { to: '/student/my-complaints',  label: 'My Complaints',    icon: ListOrdered },
  ];

  const staffLinks = [
    { to: '/staff/dashboard',   label: 'Staff Dashboard',  icon: LayoutDashboard },
    { to: '/staff/complaints',  label: 'Department Queue', icon: ListOrdered },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',    label: 'Admin Dashboard',   icon: LayoutDashboard },
    { to: '/admin/complaints',   label: 'All Complaints',    icon: ListOrdered },
    { to: '/admin/departments',  label: 'Departments',       icon: Building },
    { to: '/admin/staff',        label: 'Staff Directory',   icon: Users },
    { to: '/admin/analytics',    label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/admin/users',        label: 'User Management',   icon: UserCog },
    { to: '/admin/db-viz',       label: 'MongoDB Viewer',    icon: Database },
  ];

  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : studentLinks;

  const adminSections = {
    'Main': adminLinks.slice(0, 4),
    'Analytics': adminLinks.slice(4, 5),
    'System': adminLinks.slice(5)
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {role === 'admin' ? (
            Object.entries(adminSections).map(([section, sectionLinks]) => (
              <div key={section} className="mb-3">
                <div className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {section}
                </div>
                {sectionLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))
          ) : (
            <>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Navigation Menu
              </div>
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        {/* Portal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 mb-1">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-400 font-semibold text-[11px]">MongoDB</span>
          </div>
          <p className="font-semibold text-slate-300">Smart College Portal</p>
          <p className="text-[11px] leading-relaxed text-slate-500 mt-0.5">
            Automated grievance redressal & department management system.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
