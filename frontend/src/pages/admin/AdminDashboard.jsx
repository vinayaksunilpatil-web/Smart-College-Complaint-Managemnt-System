import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatCard from '../../components/common/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  Building,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ListOrdered
} from 'lucide-react';

const STATUS_COLORS = {
  'Open': '#3b82f6',
  'In Progress': '#f59e0b',
  'Resolved': '#10b981',
  'Closed': '#64748b'
};

const PRIORITY_COLORS = {
  'Critical': '#e11d48',
  'High': '#f97316',
  'Medium': '#f59e0b',
  'Low': '#10b981'
};

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load independently so one failure doesn't block the other
        const [overviewRes, analyticsRes] = await Promise.allSettled([
          complaintService.getDashboardOverview(),
          complaintService.getFullAnalytics()
        ]);

        if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
          setOverview(overviewRes.value.data);
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.success) {
          setAnalytics(analyticsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading institutional analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-3 border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Central Administrator Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Institutional Redressal & Analytics Dashboard
          </h1>
          <p className="mt-2 text-purple-200/90 text-sm leading-relaxed">
            Monitor real-time grievance redressal across Computer, IT, Civil, and E&TC departments.
            Track complaint resolution metrics, departmental performance, and category trends.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all text-sm"
            >
              <ListOrdered className="w-4 h-4" />
              Manage All Complaints
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              View Full Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Raised"
          value={overview?.totalComplaints || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Open"
          value={overview?.openComplaints || 0}
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="In Progress"
          value={overview?.inProgressComplaints || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved"
          value={overview?.resolvedComplaints || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Resolution Rate"
          value={overview?.resolutionRate || '0%'}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Active Students"
          value={overview?.totalStudents || 0}
          icon={Users}
          color="slate"
        />
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Complaints by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">1. Complaints by Department</h2>
              <p className="text-xs text-slate-500">Distribution across college departments</p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-100 px-2 py-1 rounded text-emerald-700 font-semibold">
              🍃 Live MongoDB
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.departmentStats || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept_name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="open_count" name="Open" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="in_progress_count" name="In Progress" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved_count" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed_count" name="Closed" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaints by Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">2. Complaints by Status</h2>
              <p className="text-xs text-slate-500">Overall redressal lifecycle status</p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">
              Donut Chart
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.statusStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {(analytics?.statusStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Complaints by Priority */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">3. Complaints by Urgency / Priority</h2>
              <p className="text-xs text-slate-500">Breakdown from Low to Critical tickets</p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">
              Priority Mix
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.priorityStats || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Total Complaints" radius={[6, 6, 0, 0]}>
                  {(analytics?.priorityStats || []).map((entry, index) => (
                    <Cell key={`cell-pri-${index}`} fill={PRIORITY_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Complaints Over Time (Academic Years) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">4. Monthly Grievance Timeline</h2>
              <p className="text-xs text-slate-500">Volume across Academic Years (2025, 2026, 2027)</p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">
              Time Series
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.monthlyStats || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRaised" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month_name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="total_raised"
                  name="Raised"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRaised)"
                />
                <Area
                  type="monotone"
                  dataKey="total_resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
