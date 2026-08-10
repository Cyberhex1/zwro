import React from 'react';
import { BatteryCharging, BatteryWarning, BatteryMedium, Zap, RefreshCw } from 'lucide-react';

interface EnergyBatteryProps {
  battery: number; // 0 - 100
  onRecharge: () => void;
  onDrain: (amount: number) => void;
}

export const EnergyBattery: React.FC<EnergyBatteryProps> = ({ battery, onRecharge, onDrain }) => {
  const getBatteryColor = () => {
    if (battery <= 25) return 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
    if (battery <= 55) return 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]';
    return 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]';
  };

  const getBatteryIcon = () => {
    if (battery <= 25) return <BatteryWarning className="w-4 h-4 text-rose-400 animate-pulse" />;
    if (battery <= 55) return <BatteryMedium className="w-4 h-4 text-amber-300" />;
    return <BatteryCharging className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-slate-300">
      <div className="flex items-center gap-1.5">
        {getBatteryIcon()}
        <span>Battery:</span>
      </div>

      <div className="w-12 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBatteryColor()}`}
          style={{ width: `${Math.max(5, battery)}%` }}
        />
      </div>

      <span className="font-bold text-slate-200 min-w-[32px] text-right">{battery}%</span>

      <div className="flex gap-1 ml-1 border-l border-slate-700/60 pl-1.5">
        <button
          onClick={onRecharge}
          title="Somatic Recharge (+25%)"
          className="p-1 hover:bg-slate-800 rounded-full text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDrain(10)}
          title="Manual Drain Task (-10%)"
          className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
