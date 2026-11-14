import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Database, Server, HardDrive, BarChart3, List,
  RefreshCw, ChevronLeft, ChevronRight, Search,
  Layers, GitBranch, Eye, Hash, Zap, Table
} from 'lucide-react';

const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#e11d48','#06b6d4'];

const AGGREGATION_TYPES = [
  { key: 'complaints_per_dept',   label: 'Complaints per Department',  icon: '🏢', chartType: 'bar' },
  { key: 'status_pipeline',       label: 'Status Distribution',         icon: '📊', chartType: 'pie' },
  { key: 'priority_pipeline',     label: 'Priority Distribution',       icon: '⚡', chartType: 'bar' },
  { key: 'monthly_inflow',        label: 'Monthly Inflow Trend',         icon: '📅', chartType: 'bar' },
  { key: 'student_activity',      label: 'Top 10 Active Students',      icon: '👤', chartType: 'bar' },
  { key: 'resolution_rate_dept',  label: 'Resolution Rate by Dept',     icon: '✅', chartType: 'bar' }
];

const COLLECTIONS = ['users','complaints','departments','categories','notifications'];

// ─── Collection Stats Card ────────────────────────────────────────────────────
const CollectionCard = ({ stat, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
      selected
        ? 'border-purple-500 bg-purple-50'
        : 'border-slate-200 bg-white hover:border-purple-300'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-bold text-slate-700 capitalize">{stat.collection}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
        selected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
      }`}>{stat.documents.toLocaleString()}</span>
    </div>
    <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
      <span>Indexes: {stat.indexes}</span>
      <span>Avg size: {stat.avg_obj_size}B</span>
    </div>
  </button>
);

// ─── Pipeline Viewer ──────────────────────────────────────────────────────────
const PipelineViewer = ({ pipeline }) => (
  <div className="mt-3 bg-slate-900 rounded-xl p-4 overflow-x-auto">
    <div className="flex items-center gap-2 mb-2">
      <GitBranch className="w-4 h-4 text-purple-400" />
      <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Aggregation Pipeline (MongoDB)</span>
    </div>
    <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
      {pipeline}
    </pre>
  </div>
);

// ─── Document Browser ─────────────────────────────────────────────────────────
const DocumentBrowser = ({ collection }) => {
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const limit = 5;

  useEffect(() => {
    if (!collection) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await complaintService.browseCollection(collection, { page, limit });
        // api.js already unwraps response.data
        if (res.success) {
          setDocs(res.documents);
          setTotal(res.total);
          setTotalPages(res.total_pages);
        }
      } catch (err) {
        console.error('Browse collection error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [collection, page]);

  if (!collection) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-purple-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            Document Browser — <span className="text-purple-600 font-mono">{collection}</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">({total} documents)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-600 font-mono">pg {page}/{totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedDoc(expandedDoc === i ? null : i)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-600 truncate max-w-xs">{doc._id}</span>
                  {doc.name && <span className="text-xs text-slate-800 font-semibold">{doc.name}</span>}
                  {doc.title && <span className="text-xs text-slate-800 font-semibold truncate max-w-[200px]">{doc.title}</span>}
                  {doc.dept_name && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{doc.dept_name}</span>}
                </div>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {expandedDoc === i && (
                <div className="bg-slate-900 p-4 overflow-x-auto">
                  <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                    {JSON.stringify(doc, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main DB Visualization Page ───────────────────────────────────────────────
const DbVizPage = () => {
  const [dbStats, setDbStats] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState('complaints');
  const [activeAgg, setActiveAgg] = useState('complaints_per_dept');
  const [aggData, setAggData] = useState(null);
  const [aggPipeline, setAggPipeline] = useState('');
  const [indexes, setIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aggLoading, setAggLoading] = useState(false);
  const [tab, setTab] = useState('overview'); // overview | browser | aggregations | indexes

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getDbStats();
      // api.js interceptor already returns response.data, so res IS the response body
      if (res.success) setDbStats(res);
    } catch (err) {
      console.error('DbStats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAggregation = async (type) => {
    setAggLoading(true);
    try {
      const res = await complaintService.runAggregation(type);
      if (res.success) {
        setAggData(res.result);
        setAggPipeline(res.pipeline);
      }
    } catch (err) {
      console.error('Aggregation error:', err);
    } finally {
      setAggLoading(false);
    }
  };

  const loadIndexes = async (coll) => {
    try {
      const res = await complaintService.getIndexes(coll);
      if (res.success) setIndexes(res.indexes);
    } catch (err) {
      console.error('Indexes error:', err);
    }
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'aggregations') loadAggregation(activeAgg); }, [tab]);
  useEffect(() => { if (tab === 'indexes') loadIndexes(selectedCollection); }, [tab, selectedCollection]);

  const currentAggType = AGGREGATION_TYPES.find(a => a.key === activeAgg);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Connecting to MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 via-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-400/30">
              <Database className="w-3.5 h-3.5" />
              Live MongoDB Database Visualization
            </div>
            <h1 className="text-2xl font-bold">MongoDB Database Inspector</h1>
            <p className="mt-1 text-emerald-200/90 text-sm">
              Real-time collection stats, document browser, aggregation pipelines & index analysis
            </p>
          </div>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* DB Info Bar */}
        {dbStats && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Server, label: 'Database', value: dbStats.database.name },
              { icon: Database, label: 'Connection', value: dbStats.database.state },
              { icon: HardDrive, label: 'Data Size', value: formatBytes(dbStats.database.data_size_bytes) },
              { icon: Layers, label: 'Total Docs', value: dbStats.database.total_documents.toLocaleString() }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-xs text-emerald-200">{label}</span>
                </div>
                <p className="text-sm font-bold font-mono truncate">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'overview',      label: 'Overview',      icon: BarChart3 },
          { id: 'browser',       label: 'Doc Browser',   icon: Table },
          { id: 'aggregations',  label: 'Pipelines',     icon: GitBranch },
          { id: 'indexes',       label: 'Indexes',       icon: Zap }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              tab === id
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && dbStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Collection Stats Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Collection Overview
            </h2>
            <p className="text-xs text-slate-500 mb-4">Select a collection to browse documents</p>
            <div className="space-y-3">
              {dbStats.collections.map(stat => (
                <CollectionCard
                  key={stat.collection}
                  stat={stat}
                  selected={selectedCollection === stat.collection}
                  onClick={() => { setSelectedCollection(stat.collection); setTab('browser'); }}
                />
              ))}
            </div>
          </div>

          {/* Document Distribution Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Document Distribution
            </h2>
            <p className="text-xs text-slate-500 mb-4">Total documents per MongoDB collection</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dbStats.collections} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="collection" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="documents" name="Documents" radius={[6, 6, 0, 0]}>
                    {dbStats.collections.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie: Docs per collection */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Collection Share (Donut)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dbStats.collections.map(c => ({ name: c.collection, value: c.documents }))}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {dbStats.collections.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DB Details Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-600" />
              Database Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-3 py-2">Collection</th>
                    <th className="px-3 py-2">Docs</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Indexes</th>
                    <th className="px-3 py-2">Avg Doc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbStats.collections.map(c => (
                    <tr key={c.collection} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono font-semibold text-purple-700 capitalize">{c.collection}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-700">{c.documents.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs">{formatBytes(c.size_bytes)}</td>
                      <td className="px-3 py-2.5 text-slate-500">{c.indexes}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs">{c.avg_obj_size}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENT BROWSER TAB ── */}
      {tab === 'browser' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COLLECTIONS.map(coll => (
              <button
                key={coll}
                onClick={() => setSelectedCollection(coll)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  selectedCollection === coll
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                }`}
              >
                {coll}
              </button>
            ))}
          </div>
          <DocumentBrowser collection={selectedCollection} />
        </div>
      )}

      {/* ── AGGREGATION PIPELINES TAB ── */}
      {tab === 'aggregations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600" />
              Pipeline Templates
            </h2>
            <div className="space-y-2">
              {AGGREGATION_TYPES.map(agg => (
                <button
                  key={agg.key}
                  onClick={async () => {
                    setActiveAgg(agg.key);
                    await loadAggregation(agg.key);
                  }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activeAgg === agg.key
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{agg.icon}</span>
                  <span>{agg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aggregation Result */}
          <div className="lg:col-span-2 space-y-4">
            {aggLoading ? (
              <div className="bg-white rounded-2xl border p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : aggData ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-slate-800">
                    {currentAggType?.icon} {currentAggType?.label}
                  </h2>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-semibold">
                    {aggData.length} results
                  </span>
                </div>

                {/* Pipeline code display */}
                <PipelineViewer pipeline={aggPipeline} />

                {/* Chart */}
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {currentAggType?.chartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={aggData.map(d => ({ name: d.status || d.priority || d.name, value: d.count || d.total || d.value || 0 }))}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {aggData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    ) : (
                      <BarChart data={aggData} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey={
                            aggData[0]?.dept_name ? 'dept_name' :
                            aggData[0]?.name ? 'name' :
                            aggData[0]?.label ? 'label' :
                            aggData[0]?.roll_no ? 'roll_no' : 'dept_name'
                          }
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          angle={-20}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Bar
                          dataKey={aggData[0]?.total !== undefined ? 'total' : aggData[0]?.count !== undefined ? 'count' : 'rate'}
                          radius={[6, 6, 0, 0]}
                        >
                          {aggData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Raw Result Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b">
                      <tr>
                        {Object.keys(aggData[0] || {}).map(k => (
                          <th key={k} className="px-3 py-2 font-semibold">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aggData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-3 py-2 font-mono text-slate-700">
                              {typeof val === 'number' ? val : String(val || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── INDEXES TAB ── */}
      {tab === 'indexes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COLLECTIONS.map(coll => (
              <button
                key={coll}
                onClick={() => { setSelectedCollection(coll); loadIndexes(coll); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  selectedCollection === coll
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                }`}
              >
                {coll}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Indexes on <span className="text-purple-700 font-mono ml-1">{selectedCollection}</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">Mongoose-created indexes for query optimization</p>

            <div className="space-y-3">
              {indexes.map((idx, i) => (
                <div key={i} className="bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-emerald-300 font-mono">{idx.name}</span>
                    <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full">
                      {idx.unique ? '🔒 unique' : '📑 standard'}
                    </span>
                  </div>
                  <pre className="text-xs text-blue-300 font-mono">
                    {JSON.stringify(idx.key, null, 2)}
                  </pre>
                  {idx.sparse && <span className="text-xs text-amber-400 mt-1 block">⚡ sparse index</span>}
                </div>
              ))}
              {indexes.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">No indexes found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DbVizPage;
