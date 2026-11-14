import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getStyles = () => {
    switch ((priority || '').toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyles()}`}>
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
