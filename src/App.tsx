import React, { useState, useEffect } from 'react';
import { Heart, Target, Timer, ShieldCheck, Sparkles, CheckCircle, Zap } from 'lucide-react';
import { Header } from './components/Header';
import { SomaticUnfreeze } from './components/SomaticUnfreeze';
import { MicroBar } from './components/MicroBar';
import { MicroSprintTimer } from './components/MicroSprintTimer';
import { BurnoutShield } from './components/BurnoutShield';
import { PanicOverlay } from './components/PanicOverlay';
import { SessionLogsModal } from './components/SessionLogsModal';
import { SessionLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'unfreeze' | 'lowbar' | 'sprint' | 'burnout'>('unfreeze');
  const [battery, setBattery] = useState<number>(() => {
    const saved = localStorage.getItem('zawe_battery');
    return saved ? parseInt(saved, 10) : 100;
  });

  const [totalTasksToday, setTotalTasksToday] = useState<number>(() => {
    const saved = localStorage.getItem('zawe_tasks_today');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('zawe_session_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPanicOpen, setIsPanicOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('zawe_battery', battery.toString());
  }, [battery]);

  useEffect(() => {
    localStorage.setItem('zawe_tasks_today', totalTasksToday.toString());
  }, [totalTasksToday]);

  useEffect(() => {
    localStorage.setItem('zawe_session_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDrainBattery = (amount: number) => {
    setBattery((prev) => {
      const next = Math.max(0, prev - amount);
      if (next <= 25 && prev > 25) {
        triggerToast('⚠️ Cognitive Battery Low! Mandatory 3-minute somatic rest recommended.');
      }
      return next;
    });
  };

  const handleRechargeBattery = () => {
    setBattery((prev) => Math.min(100, prev + 25));
    triggerToast('🔋 Somatic Recharge applied (+25% Energy)!');
  };

  const handleLogTask = () => {
    setTotalTasksToday((prev) => prev + 1);
  };

  const handleAddLog = (logData: Omit<SessionLog, 'id' | 'timestamp' | 'date'>) => {
    const newLog: SessionLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
    setSessionLogs((prev) => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setSessionLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 flex justify-center font-sans antialiased selection:bg-cyan-500/30">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <Header
          battery={battery}
          onRechargeBattery={handleRechargeBattery}
          onDrainBattery={handleDrainBattery}
          onTogglePanic={() => setIsPanicOpen(true)}
          onOpenLogs={() => setIsLogsOpen(true)}
        />

        {/* Tab Navigation */}
        <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('unfreeze')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'unfreeze'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>1. Somatic Unfreeze</span>
          </button>

          <button
            onClick={() => setActiveTab('lowbar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'lowbar'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>2. Micro-Bar (3 Tasks)</span>
          </button>

          <button
            onClick={() => setActiveTab('sprint')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sprint'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>3. 10/3 Sprint Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('burnout')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'burnout'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(192,132,252,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>4. 90-Day Defense</span>
          </button>
        </nav>

        {/* View Panels */}
        <main className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl">
          {activeTab === 'unfreeze' && (
            <SomaticUnfreeze onCompleteUnfreeze={() => setActiveTab('lowbar')} />
          )}

          {activeTab === 'lowbar' && (
            <MicroBar
              onLogTask={handleLogTask}
              onDrainBattery={handleDrainBattery}
              onAdvanceToSprint={() => setActiveTab('sprint')}
            />
          )}

          {activeTab === 'sprint' && (
            <MicroSprintTimer
              onLogTask={handleLogTask}
              onDrainBattery={handleDrainBattery}
            />
          )}

          {activeTab === 'burnout' && (
            <BurnoutShield
              logs={sessionLogs}
              onAddLog={handleAddLog}
              battery={battery}
              totalTasksToday={totalTasksToday}
            />
          )}
        </main>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce z-40">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Overlays / Modals */}
        <PanicOverlay
          isOpen={isPanicOpen}
          onClose={() => setIsPanicOpen(false)}
          onLogTask={handleLogTask}
          totalLogged={totalTasksToday}
        />

        <SessionLogsModal
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          logs={sessionLogs}
          onClearLogs={handleClearLogs}
        />
      </div>
    </div>
  );
}
