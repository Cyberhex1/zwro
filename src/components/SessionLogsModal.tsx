import React from 'react';
import { X, Calendar, Download, Trash2, Award, Zap } from 'lucide-react';
import { SessionLog } from '../types';

interface SessionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SessionLog[];
  onClearLogs: () => void;
}

export const SessionLogsModal: React.FC<SessionLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  const totalAnnotationsAllTime = logs.reduce((acc, curr) => acc + curr.tasksCompleted, 0);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zawe_shift_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Historical Shift Logs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-medium">Total Shifts Logged</span>
              <span className="text-xl font-bold text-slate-100">{logs.length}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-medium">Total Annotations</span>
              <span className="text-xl font-bold text-cyan-400">{totalAnnotationsAllTime}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400 block font-medium">Protocol</span>
              <span className="text-xs font-bold text-emerald-400 block mt-1">Zero-Adrenaline</span>
            </div>
          </div>

          {/* Logs List */}
          {logs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400">No shift logs saved yet. Complete a session and click "Save Today's Shift Log" in Tab 4.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-slate-200">{log.date}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      Rating: {log.effortRating.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300 font-medium">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Award className="w-3.5 h-3.5" />
                      {log.tasksCompleted} Tasks
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Zap className="w-3.5 h-3.5" />
                      {log.energyEnd}% Battery
                    </span>
                  </div>

                  {log.notes && (
                    <p className="text-slate-400 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Logs</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
