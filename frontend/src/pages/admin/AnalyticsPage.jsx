import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, CheckCircle2, Clock, ShieldCheck, Tag } from 'lucide-react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await complaintService.getFullAnalytics();
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Aggregating parallel analytical reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Advanced Grievance Analytics & SLA Metrics</h1>
        <p className="text-xs text-slate-500">Comprehensive parallel query aggregation across all college departments</p>
      </div>

      {/* Department Resolution Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">Department Resolution Scorecard</h2>
        <p className="text-xs text-slate-500 mb-4">Parallel departmental aggregation metrics</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Open</th>
                <th className="px-4 py-3">In Progress</th>
                <th className="px-4 py-3">Resolved</th>
                <th className="px-4 py-3">Closed</th>
                <th className="px-4 py-3 text-right">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.departmentStats?.map((dept) => {
                const total = dept.total || 0;
                const resolved = (dept.resolved_count || 0) + (dept.closed_count || 0);
                const rate = total > 0 ? ((resolved / total) * 100).toFixed(0) : '0';

                return (
                  <tr key={dept.dept_id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {dept.dept_name}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700 font-mono">{dept.total}</td>
                    <td className="px-4 py-3 text-blue-600 font-mono">{dept.open_count}</td>
                    <td className="px-4 py-3 text-amber-600 font-mono">{dept.in_progress_count}</td>
                    <td className="px-4 py-3 text-emerald-600 font-mono">{dept.resolved_count}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{dept.closed_count}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        Number(rate) >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Complaints by Facility Category</h2>
              <p className="text-xs text-slate-500">Distribution across campus service areas</p>
            </div>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={analytics?.categoryStats || []}
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category_name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="total_complaints" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Inflow & Resolution Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Monthly Volume Trends</h2>
              <p className="text-xs text-slate-500">Intra-query parallel aggregation across time</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics?.monthlyStats || []}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month_name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="total_raised" name="Complaints Raised" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="total_resolved" name="Complaints Resolved" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
