import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

const TYPE_COLORS = {
  status_update:    'bg-emerald-100 text-emerald-700',
  new_complaint:    'bg-blue-100 text-blue-700',
  comment:          'bg-purple-100 text-purple-700',
  feedback_request: 'bg-amber-100 text-amber-700',
  system:           'bg-slate-100 text-slate-600'
};

const TYPE_ICONS = {
  status_update:    '🔄',
  new_complaint:    '📋',
  comment:          '💬',
  feedback_request: '⭐',
  system:           '🔔'
};

const NotificationBell = ({ userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }
    } catch (_) {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    load();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
    load();
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      await notificationService.markAsRead([notif._id]);
    }
    setOpen(false);
    if (notif.complaint_id) {
      // Navigate based on role
      const basePath = userRole === 'student'
        ? `/student/complaints/${notif.complaint_id}`
        : userRole === 'staff'
        ? `/staff/complaints/${notif.complaint_id}`
        : `/admin/complaints`;
      navigate(basePath);
    }
    load();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 hover:bg-slate-100 rounded-xl transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : notifications.map(notif => (
              <div
                key={notif._id}
                onClick={() => handleNotifClick(notif)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                  !notif.is_read ? 'bg-purple-50/60' : ''
                }`}
              >
                <span className="text-base mt-0.5">{TYPE_ICONS[notif.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <button
                      onClick={(e) => handleDelete(e, notif._id)}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
