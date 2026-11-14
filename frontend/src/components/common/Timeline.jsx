import React from 'react';
import StatusBadge from './StatusBadge';
import { Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';

const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        No status history records found.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
      {events.map((event, idx) => (
        <div key={event.log_id || idx} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-brand-600 group-hover:scale-110 transition-transform" />

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {event.old_status && (
                  <>
                    <StatusBadge status={event.old_status} />
                    <span className="text-slate-400 text-xs">→</span>
                  </>
                )}
                <StatusBadge status={event.new_status} />
              </div>
              
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(event.updated_at).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {event.remarks && (
              <p className="text-sm text-slate-700 bg-white p-2.5 rounded border border-slate-200 my-2">
                "{event.remarks}"
              </p>
            )}

            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <User className="w-3.5 h-3.5" />
              <span>
                Updated by: <strong className="text-slate-700">{event.updated_by_name || 'System'}</strong> ({event.updater_role || 'Staff'})
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
