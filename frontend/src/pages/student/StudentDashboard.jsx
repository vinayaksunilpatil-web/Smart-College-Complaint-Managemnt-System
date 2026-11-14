import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ListOrdered
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await complaintService.getMyComplaints();
        if (res.success) {
          setStats(res.stats);
          setRecentComplaints(res.complaints.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold mb-3">
            Student Redressal Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-brand-100 text-sm leading-relaxed">
            Report any issue regarding college classrooms, labs, Wi-Fi, electrical, or hostel facilities.
            Your complaints are automatically routed to the concerned department.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/student/submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 font-bold rounded-xl shadow transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Submit New Complaint
            </Link>
            <Link
              to="/student/my-complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all text-sm"
            >
              <ListOrdered className="w-4 h-4" />
              View All Complaints
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Raised"
          value={stats.total}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Open"
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
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Closed"
          value={stats.closed}
          icon={CheckCircle2}
          color="slate"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Complaints</h2>
            <p className="text-xs text-slate-500">Live status of your recent submissions</p>
          </div>
          <Link
            to="/student/my-complaints"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading your complaints...
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium">You have not submitted any complaints yet.</p>
            <Link
              to="/student/submit"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              Submit your first complaint →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Title & Category</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
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
                      <div className="text-xs text-slate-500">{c.category_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {c.dept_name}
                      </span>
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
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/student/complaints/${c._id}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
