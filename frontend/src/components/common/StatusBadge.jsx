import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Open' ? 'bg-blue-500' :
        status === 'In Progress' ? 'bg-amber-500' :
        status === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-400'
      }`} />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
