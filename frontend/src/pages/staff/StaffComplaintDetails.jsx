import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import {
  ArrowLeft, Building2, Calendar, User,
  CheckCircle2, AlertCircle, Tag, Edit3
} from 'lucide-react';

const shortId = (id) => id ? String(id).slice(-6).toUpperCase() : '---';

const StaffComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadComplaint = async () => {
    try {
      const res = await complaintService.getComplaintById(id);
      if (res.success) {
        setComplaint(res.complaint);
        setTimeline(res.timeline || res.complaint?.status_log || []);
        setNewStatus(res.complaint.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaint(); }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    try {
      // Use id from useParams (MongoDB _id string) — NOT complaint_id
      const res = await complaintService.updateStatus(id, { new_status: newStatus, remarks });
      if (res.success) {
        setSuccessMsg(res.message || 'Status updated successfully.');
        setRemarks('');
        loadComplaint();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
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
        <Link to="/staff/complaints" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
        </Link>
      </div>
    );
  }

  // Extract from MongoDB populated fields with fallbacks
  const studentName  = complaint.student_id?.name     || complaint.student_name  || '—';
  const studentRoll  = complaint.student_id?.roll_no   || complaint.student_roll_no || '—';
  const studentEmail = complaint.student_id?.email     || complaint.student_email || '';
  const catName      = complaint.category_id?.category_name || complaint.category_name || '—';
  const slaHours     = complaint.category_id?.sla_hours ?? complaint.sla_hours ?? 24;
  const deptName     = complaint.dept_id?.dept_name    || complaint.dept_name    || '—';
  const staffName    = complaint.staff_id?.name        || complaint.staff_name   || null;
  const staffEmail   = complaint.staff_id?.email       || complaint.staff_email  || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/staff/complaints" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Department Queue
        </Link>
        <span className="text-xs font-mono font-bold text-slate-500">COMPLAINT #{shortId(complaint._id)}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Raised on {new Date(complaint.createdAt || complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{complaint.title}</h1>
          <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">{complaint.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-600" /> Complainant Student
            </div>
            <p className="font-bold text-slate-800 text-sm">{studentName}</p>
            <p className="text-[11px] text-slate-500 font-mono">Roll: {studentRoll}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{studentEmail}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-600" /> Facility Category
            </div>
            <p className="font-bold text-slate-800 text-sm">{catName}</p>
            <p className="text-[11px] text-slate-500">SLA: {slaHours} Hours</p>
            <p className="text-[11px] text-slate-500">Dept: {deptName}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-600" /> Assigned Staff Lead
            </div>
            <p className="font-bold text-slate-800 text-sm">{staffName || 'Department Pool'}</p>
            <p className="text-[11px] text-slate-500">{staffEmail || 'Awaiting assignment'}</p>
          </div>
        </div>
      </div>

      {/* Staff Status Action Panel */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Edit3 className="w-5 h-5 text-amber-700" />
          <h2 className="text-base font-bold text-slate-800">Update Resolution State</h2>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status Transition</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Action Taken & Technical Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea required rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Electrician visited Hall B, replaced fan regulator and verified current draw."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={updating}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center gap-2">
              {updating ? 'Saving...' : 'Apply Status Update & Insert Log'}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Timeline */}
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

export default StaffComplaintDetails;
