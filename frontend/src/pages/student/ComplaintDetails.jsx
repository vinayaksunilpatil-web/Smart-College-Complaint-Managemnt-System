import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import {
  ArrowLeft, Building2, Calendar, Clock, User,
  CheckCircle2, AlertCircle, Tag, FileText
} from 'lucide-react';

// Helper: show last 6 chars of MongoDB ObjectId as short ticket number
const shortId = (id) => id ? String(id).slice(-6).toUpperCase() : '---';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        const res = await complaintService.getComplaintById(id);
        if (res.success) {
          setComplaint(res.complaint);
          setTimeline(res.timeline || res.complaint?.status_log || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load complaint details.');
      } finally {
        setLoading(false);
      }
    };
    loadComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading complaint record...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'Unable to retrieve complaint record.'}</p>
        <Link
          to="/student/my-complaints"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Complaints
        </Link>
      </div>
    );
  }

  // MongoDB populated fields
  const deptName     = complaint.dept_id?.dept_name     || complaint.dept_name     || '—';
  const deptLocation = complaint.dept_id?.location      || complaint.dept_location || '';
  const catName      = complaint.category_id?.category_name || complaint.category_name || '—';
  const slaHours     = complaint.category_id?.sla_hours ?? complaint.sla_hours ?? 24;
  const staffName    = complaint.staff_id?.name         || complaint.staff_name    || null;
  const staffEmail   = complaint.staff_id?.email        || complaint.staff_email   || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/my-complaints"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Complaints
        </Link>
        <span className="text-xs font-mono font-bold text-slate-500">
          TICKET #{shortId(complaint._id)}
        </span>
      </div>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Raised on {new Date(complaint.createdAt || complaint.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mt-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {complaint.title}
          </h1>
          <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            {complaint.description}
          </p>
        </div>

        {/* Relational Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              Assigned Department
            </div>
            <p className="font-bold text-slate-800 text-sm">{deptName}</p>
            <p className="text-[11px] text-slate-500">{deptLocation}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              Facility Category
            </div>
            <p className="font-bold text-slate-800 text-sm">{catName}</p>
            <p className="text-[11px] text-slate-500">SLA: {slaHours} Hours</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-brand-600" />
              Handling Officer
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {staffName || 'Under Review (Department Pool)'}
            </p>
            <p className="text-[11px] text-slate-500">{staffEmail || 'Awaiting assignment'}</p>
          </div>
        </div>
      </div>

      {/* Audit Timeline Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Resolution History & Audit Log</h2>
            <p className="text-xs text-slate-500">Chronological lifecycle updates</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {timeline.length} {timeline.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>
        <Timeline events={timeline} />
      </div>
    </div>
  );
};

export default ComplaintDetails;
