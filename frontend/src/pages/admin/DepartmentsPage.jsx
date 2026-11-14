import React, { useState, useEffect } from 'react';
import { metaService } from '../../services/metaService';
import {
  Building2,
  Users,
  FileText,
  MapPin,
  Plus,
  X,
  Tag,
  Clock,
  Trash2,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(null); // department object or null
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Form for New Department
  const [deptForm, setDeptForm] = useState({
    dept_name: '',
    location: '',
    description: '',
    initialCategory: '',
    categorySla: 48
  });

  // Form for adding category to existing department
  const [catForm, setCatForm] = useState({
    category_name: '',
    sla_hours: 48,
    description: ''
  });

  const loadDepartments = async () => {
    try {
      const res = await metaService.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.dept_name.trim()) return;
    setSaving(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const payload = {
        dept_name: deptForm.dept_name.trim(),
        location: deptForm.location.trim() || 'Main Campus',
        description: deptForm.description.trim(),
        categories: []
      };

      if (deptForm.initialCategory.trim()) {
        payload.categories.push({
          category_name: deptForm.initialCategory.trim(),
          sla_hours: Number(deptForm.categorySla) || 48,
          description: `Specific issue category for ${deptForm.dept_name}`
        });
      }

      const res = await metaService.createDepartment(payload);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message || 'Department created successfully!' });
        setShowAddModal(false);
        setDeptForm({
          dept_name: '',
          location: '',
          description: '',
          initialCategory: '',
          categorySla: 48
        });
        await loadDepartments();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to create department.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!showAddCatModal || !catForm.category_name.trim()) return;
    setSaving(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const res = await metaService.addCategoryToDepartment(showAddCatModal._id, {
        category_name: catForm.category_name.trim(),
        sla_hours: Number(catForm.sla_hours) || 48,
        description: catForm.description.trim()
      });

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message || 'Category added successfully!' });
        setShowAddCatModal(null);
        setCatForm({ category_name: '', sla_hours: 48, description: '' });
        await loadDepartments();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to add issue category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDept = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete '${dept.dept_name}' Department? This will remove its categories and unlink staff.`)) {
      return;
    }

    try {
      const res = await metaService.deleteDepartment(dept._id);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message || 'Department deleted successfully.' });
        await loadDepartments();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to delete department.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-2 border border-purple-400/30">
            <Layers className="w-3.5 h-3.5" />
            Institutional Architecture
          </div>
          <h1 className="text-2xl font-bold">Academic & Facility Departments</h1>
          <p className="mt-1 text-xs text-purple-200/90">
            Manage campus departments, define facility responsibilities, and configure automated complaint routing categories
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); setFeedbackMsg({ type: '', text: '' }); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Department
        </button>
      </div>

      {/* Notification / Feedback alerts */}
      {feedbackMsg.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span className="font-semibold">{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg({ type: '', text: '' })} className="p-1 hover:bg-black/5 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Department Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading department network topology...
        </div>
      ) : departments.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No departments configured yet.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Add New Department" above to create the first department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {departments.map((dept, index) => {
            const shortId = dept._id ? String(dept._id).slice(-6).toUpperCase() : `D${index + 1}`;
            return (
              <div
                key={String(dept._id || index)}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-lg shadow-xs">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">{dept.dept_name} Department</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {dept.location || 'Main Campus'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        DEPT #{shortId}
                      </span>
                      <button
                        onClick={() => handleDeleteDept(dept)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {dept.description && (
                    <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {dept.description}
                    </p>
                  )}

                  {/* Issues / Categories Resolved by this Department */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3 text-purple-600" />
                        Resolved Issue Types ({dept.categories ? dept.categories.length : 0})
                      </span>
                      <button
                        onClick={() => { setShowAddCatModal(dept); setFeedbackMsg({ type: '', text: '' }); }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        Add Issue Type
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {dept.categories && dept.categories.length > 0 ? (
                        dept.categories.map((cat, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg text-xs font-medium"
                          >
                            <span>{cat.category_name}</span>
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                              {cat.sla_hours || 48}h SLA
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No specific categories registered</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-slate-500 flex items-center gap-1 mb-1">
                      <FileText className="w-3.5 h-3.5 text-brand-600" />
                      Complaints Handled
                    </div>
                    <p className="text-xl font-bold text-slate-800">{dept.complaint_count || 0}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-slate-500 flex items-center gap-1 mb-1">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      Assigned Staff
                    </div>
                    <p className="text-xl font-bold text-slate-800">{dept.staff_count || 0}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Department */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-800">Add New Department</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.dept_name}
                  onChange={(e) => setDeptForm({ ...deptForm, dept_name: e.target.value })}
                  placeholder="e.g. Mechanical Engineering / Hostel & Mess"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campus Location / Office
                </label>
                <input
                  type="text"
                  value={deptForm.location}
                  onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                  placeholder="e.g. Mechanical Block - Room 204"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Responsibilities, labs, machinery, or facilities managed..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Initial Issue / Grievance Category
                </div>
                <div>
                  <input
                    type="text"
                    value={deptForm.initialCategory}
                    onChange={(e) => setDeptForm({ ...deptForm, initialCategory: e.target.value })}
                    placeholder="e.g. Workshop Tool Breakdown (optional)"
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-purple-800">
                  <span>Target Resolution SLA:</span>
                  <select
                    value={deptForm.categorySla}
                    onChange={(e) => setDeptForm({ ...deptForm, categorySla: Number(e.target.value) })}
                    className="px-2 py-1 bg-white border border-purple-300 rounded text-xs font-bold"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours</option>
                    <option value={72}>72 Hours</option>
                    <option value={120}>5 Days</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category / Issue Type to Existing Department */}
      {showAddCatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-800">Add Issue Category</h2>
                <p className="text-xs text-slate-500">For {showAddCatModal.dept_name} Department</p>
              </div>
              <button
                onClick={() => setShowAddCatModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catForm.category_name}
                  onChange={(e) => setCatForm({ ...catForm, category_name: e.target.value })}
                  placeholder="e.g. Wi-Fi Router Fault / Lab Machine Failure"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution SLA (Target Hours)
                </label>
                <select
                  value={catForm.sla_hours}
                  onChange={(e) => setCatForm({ ...catForm, sla_hours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value={12}>12 Hours (Emergency)</option>
                  <option value={24}>24 Hours (Fast Track)</option>
                  <option value={48}>48 Hours (Standard)</option>
                  <option value={72}>72 Hours (Medium)</option>
                  <option value={120}>120 Hours (Extended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Guidelines for students submitting this issue..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Issue Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
