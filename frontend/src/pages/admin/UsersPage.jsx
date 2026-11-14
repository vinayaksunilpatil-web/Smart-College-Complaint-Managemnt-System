import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { metaService } from '../../services/metaService';
import {
  Users, Plus, Pencil, Trash2, Search, Shield, User, X, Check, RefreshCw
} from 'lucide-react';

const ROLE_BADGE = {
  student: 'bg-blue-100 text-blue-800',
  staff:   'bg-amber-100 text-amber-800',
  admin:   'bg-red-100 text-red-800'
};

const UserModal = ({ user, departments, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:     user?.name || '',
    email:    user?.email || '',
    password: '',
    role:     user?.role || 'staff',
    dept_id:  user?.dept_id?._id || user?.dept_id || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
              placeholder="Dr. John Smith"
            />
          </div>
          {!user && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                placeholder="john@college.edu"
              />
            </div>
          )}
          {!user && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                placeholder="Min. 6 characters"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={form.dept_id}
              onChange={e => setForm({ ...form, dept_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Select Department --</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.dept_name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modalUser, setModalUser] = useState(undefined); // undefined = closed, null = new
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, deptRes, statsRes] = await Promise.all([
        complaintService.getAllUsers({ search, role: roleFilter }),
        metaService.getDepartments(),
        complaintService.getUserStats()
      ]);
      // api.js interceptor already unwraps response.data
      if (usersRes.success) setUsers(usersRes.users || []);
      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (statsRes.success) setStats(statsRes.stats || null);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleSave = async (data) => {
    if (modalUser?._id) {
      await complaintService.updateUser(modalUser._id, data);
    } else {
      await complaintService.createUser(data);
    }
    load();
  };

  const handleDelete = async (id) => {
    await complaintService.deleteUser(id);
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
              <Shield className="w-3.5 h-3.5" />
              User Management
            </div>
            <h1 className="text-2xl font-bold">Manage Users & Staff</h1>
            <p className="mt-1 text-indigo-200/90 text-sm">Create, update, and manage all system accounts</p>
          </div>
          <button
            onClick={() => setModalUser(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-800 font-bold rounded-xl text-sm hover:bg-purple-50 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { label: 'Total',    value: stats.total,    color: 'bg-white/20' },
              { label: 'Students', value: stats.students, color: 'bg-blue-500/30' },
              { label: 'Staff',    value: stats.staff,    color: 'bg-amber-500/30' },
              { label: 'Admins',   value: stats.admins,   color: 'bg-red-500/30' }
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-xl p-3`}>
                <p className="text-xs text-white/70">{label}</p>
                <p className="text-xl font-bold font-mono">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or roll no..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
        >
          {['All','student','staff','admin'].map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Roll No</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading users...
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No users found.</td></tr>
              ) : users.map(user => (
                <tr key={user._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-semibold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs font-mono">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_BADGE[user.role] || 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-sm">
                    {user.dept_id?.dept_name || user.dept_id || '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{user.roll_no || '—'}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {user.role !== 'student' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalUser(user)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(user._id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          departments={departments}
          onClose={() => setModalUser(undefined)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-600 mb-5">This action cannot be undone. The user will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
