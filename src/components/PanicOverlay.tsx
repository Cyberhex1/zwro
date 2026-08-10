import React, { useState } from 'react';
import { ShieldAlert, Volume2, X, Plus } from 'lucide-react';

interface PanicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onLogTask: () => void;
  totalLogged: number;
}

export const PanicOverlay: React.FC<PanicOverlayProps> = ({
  isOpen,
  onClose,
  onLogTask,
  totalLogged,
}) => {
  const [clickAnimation, setClickAnimation] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClick = () => {
    onLogTask();
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-2xl animate-fadeIn">
      {/* Top Exit */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        title="Exit Panic Mode"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Minimal Box */}
      <div className="text-center max-w-sm space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Panic / De-Escalation Mode</span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">Zero-Load Mode Active</h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual clutter and time pressure disabled. Click the button once for every annotation you complete. Stop whenever you want.
          </p>
        </div>

        {/* Giant Clicker Button */}
        <div className="my-8 flex justify-center">
          <button
            onClick={handleClick}
            className={`w-44 h-44 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-5xl shadow-[0_0_50px_rgba(52,211,153,0.4)] flex flex-col items-center justify-center cursor-pointer transition-transform ${
              clickAnimation ? 'scale-90 shadow-[0_0_80px_rgba(52,211,153,0.7)]' : 'hover:scale-105'
            }`}
          >
            <span>{totalLogged}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900/80 mt-1 flex items-center gap-0.5">
              <Plus className="w-3.5 h-3.5" /> Log Task
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          No timers. No quotas. Just click when done.
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer"
        >
          Return to Full Dashboard
        </button>
      </div>
    </div>
  );
};
