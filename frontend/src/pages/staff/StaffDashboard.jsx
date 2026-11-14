import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
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
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ListOrdered,
  Edit3,
  BarChart3,
  TrendingUp,
  Sparkles,
  Layers,
  Star,
  Zap,
  Tag,
  ShieldCheck,
  RefreshCw
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

const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'analytics' | 'queue'

  // Status update modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueRes, analyticsRes] = await Promise.allSettled([
        complaintService.getDepartmentComplaints(),
        complaintService.getStaffAnalytics()
      ]);

      if (queueRes.status === 'fulfilled' && queueRes.value?.success) {
        setStats(queueRes.value.stats);
        setRecentComplaints(queueRes.value.complaints.slice(0, 6));
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.success) {
        setAnalytics(analyticsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenUpdate = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status === 'Open' ? 'In Progress' : complaint.status === 'In Progress' ? 'Resolved' : 'Closed');
    setRemarks('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setModalLoading(true);

    try {
      await complaintService.updateStatus(selectedComplaint._id, {
        new_status: newStatus,
        remarks
      });
      setSelectedComplaint(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update complaint status.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-100 text-xs font-semibold mb-3 border border-white/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>{user?.dept_name || 'Department'} Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-amber-100 text-sm leading-relaxed">
            Real-time department redressal center for <strong>{user?.dept_name}</strong>.
            Analyze incoming complaint trends, monitor SLA performance, and update resolution lifecycle stages.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/staff/complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold rounded-xl shadow-lg transition-all text-sm"
            >
              <ListOrdered className="w-4 h-4" />
              <span>Department Queue ({stats.open + stats.inProgress} Actionable)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Assigned to Dept"
          value={stats.total}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Action Required (Open)"
          value={stats.open}
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved & Closed"
          value={stats.resolved + stats.closed}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Resolution Rate"
          value={analytics?.kpis?.resolutionRate || '0%'}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Student Rating"
          value={analytics?.kpis?.avgRating !== 'N/A' ? `⭐ ${analytics?.kpis?.avgRating}` : 'N/A'}
          icon={Star}
          color="amber"
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All-in-One Dashboard', icon: Layers },
            { id: 'analytics', label: 'Department Analytics & Charts', icon: BarChart3 },
            { id: 'queue', label: 'Live Action Queue', icon: ListOrdered }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Department Telemetry</span>
        </span>
      </div>

      {/* Visualizations Grid (Charts) */}
      {(activeTab === 'all' || activeTab === 'analytics') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Lifecycle / Status Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-amber-600" />
                    1. Redressal Lifecycle Distribution
                  </h3>
                  <p className="text-xs text-slate-500">Live ticket stages in {user?.dept_name}</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-amber-50 px-2 py-0.5 rounded text-amber-700 font-bold border border-amber-200">
                  Status Mix
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {analytics?.statusStats && analytics.statusStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {analytics.statusStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    No complaints registered in this department yet.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Category Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    2. Department Issue Categories
                  </h3>
                  <p className="text-xs text-slate-500">Frequency by technical facility area</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-purple-50 px-2 py-0.5 rounded text-purple-700 font-bold border border-purple-200">
                  Category Volume
                </span>
              </div>

              <div className="h-64 w-full">
                {analytics?.categoryStats && analytics.categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.categoryStats}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="category_name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="count" name="Complaints" radius={[4, 4, 0, 0]}>
                        {analytics.categoryStats.map((_, idx) => (
                          <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                    No category data available.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 3: Urgency / Priority Matrix */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-600" />
                    3. Urgency & Priority Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">Critical to Low ticket urgency allocation</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-rose-50 px-2 py-0.5 rounded text-rose-700 font-bold border border-rose-200">
                  Urgency Mix
                </span>
              </div>

              <div className="h-64 w-full">
                {analytics?.priorityStats && analytics.priorityStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.priorityStats}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="value" name="Total Tickets" radius={[6, 6, 0, 0]}>
                        {analytics.priorityStats.map((entry, index) => (
                          <Cell key={`cell-pri-${index}`} fill={PRIORITY_COLORS[entry.name] || '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                    No priority data available.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 4: Monthly Redressal Velocity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    4. Monthly Redressal Timeline
                  </h3>
                  <p className="text-xs text-slate-500">Inflow vs Resolved velocity over time</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 font-bold border border-emerald-200">
                  Timeline
                </span>
              </div>

              <div className="h-64 w-full">
                {analytics?.monthlyStats && analytics.monthlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.monthlyStats}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorStaffRaised" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorStaffResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month_name" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Area
                        type="monotone"
                        dataKey="total_raised"
                        name="Raised"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorStaffRaised)"
                      />
                      <Area
                        type="monotone"
                        dataKey="total_resolved"
                        name="Resolved"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorStaffResolved)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                    No monthly time-series data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Action Queue Section */}
      {(activeTab === 'all' || activeTab === 'queue') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-amber-600" />
                Pending Department Action Queue
              </h2>
              <p className="text-xs text-slate-500">Live incoming grievances for {user?.dept_name}</p>
            </div>
            <Link
              to="/staff/complaints"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all"
            >
              <span>View Full Queue & Filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading department telemetry...
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No pending complaints currently waiting in your queue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Ticket ID</th>
                    <th className="px-6 py-3">Title & Issue Category</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentComplaints.map((c) => (
                    <tr key={String(c._id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        #{String(c._id).slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{c.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.category_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">{c.student_name}</div>
                        <div className="text-xs text-slate-500 font-mono">Roll: {c.student_roll_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(c.createdAt || c.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenUpdate(c)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Update
                        </button>
                        <Link
                          to={`/staff/complaints/${c._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quick Status Update Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Update Complaint #${selectedComplaint ? String(selectedComplaint._id).slice(-6).toUpperCase() : ''}`}
      >
        {selectedComplaint && (
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint Subject</p>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.title}</h4>
              <p className="text-xs text-slate-600 mt-1">
                Student: <strong>{selectedComplaint.student_name}</strong> (Roll: {selectedComplaint.student_roll_no})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Resolution Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress (Under Technical Review)</option>
                <option value="Resolved">Resolved (Facility Fixed / Work Done)</option>
                <option value="Closed">Closed (Resolution Confirmed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Technical Remarks / Action Taken <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Detail the technical investigation or resolution actions taken..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-70 flex items-center gap-1.5"
              >
                {modalLoading ? 'Updating...' : 'Save & Log Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StaffDashboard;
