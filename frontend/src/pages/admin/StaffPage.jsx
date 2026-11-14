import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { metaService } from '../../services/metaService';
import { Users, Mail, Building2, Shield, FileText, UserPlus } from 'lucide-react';

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await metaService.getStaffList();
        if (res.success) setStaffList(res.staff || []);
      } catch (err) {
        console.error('Failed to load staff list:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty & Department Staff Directory</h1>
          <p className="text-xs text-slate-500">Authorized personnel managing departmental complaint queues and resolutions</p>
        </div>
        {/* Admin can add staff from Users page */}
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff / Admin
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading staff roster...
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No staff members found.</p>
            <p className="text-xs text-slate-500 mt-1">Use the "Add Staff / Admin" button to create staff accounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Staff ID</th>
                  <th className="px-6 py-3">Staff Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-right">Assigned Complaints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((s) => {
                  // MongoDB: _id is ObjectId, dept_id is populated object
                  const deptName = s.dept_id?.dept_name || s.dept_name || '—';
                  const shortId = String(s._id).slice(-6).toUpperCase();

                  return (
                    <tr key={String(s._id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        #{shortId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-black">
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{s.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Building2 className="w-3 h-3" />
                          {deptName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {s.role === 'admin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {s.role === 'admin' ? 'Administrator' : 'Staff'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                        {s.assigned_complaints ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPage;
