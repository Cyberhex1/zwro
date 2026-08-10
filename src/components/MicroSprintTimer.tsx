import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Zap, CheckCircle2, AlertOctagon, Timer } from 'lucide-react';
import { SprintPhase, SprintConfig } from '../types';
import { audioSynth } from '../lib/audioSynth';

interface MicroSprintTimerProps {
  onLogTask: () => void;
  onDrainBattery: (amt: number) => void;
}

const SPRINT_PRESETS: SprintConfig[] = [
  { name: 'Ultra-Light (5/2)', workDuration: 300, restDuration: 120 },
  { name: 'Standard (10/3)', workDuration: 600, restDuration: 180 },
  { name: 'Extended (15/5)', workDuration: 900, restDuration: 300 },
];

export const MicroSprintTimer: React.FC<MicroSprintTimerProps> = ({ onLogTask, onDrainBattery }) => {
  const [selectedPreset, setSelectedPreset] = useState<SprintConfig>(SPRINT_PRESETS[1]); // Default 10/3
  const [phase, setPhase] = useState<SprintPhase>('work');
  const [timeLeft, setTimeLeft] = useState<number>(selectedPreset.workDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sprintTaskCount, setSprintTaskCount] = useState<number>(0);
  const [sprintTotalCompleted, setSprintTotalCompleted] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync preset change if timer is stopped
  const handleSelectPreset = (preset: SprintConfig) => {
    setSelectedPreset(preset);
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(preset.workDuration);
  };

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Phase Transition
        audioSynth.playChime();

        if (phase === 'work') {
          setPhase('rest');
          setSprintTotalCompleted((c) => c + 1);
          return selectedPreset.restDuration;
        } else {
          setPhase('work');
          return selectedPreset.workDuration;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phase, selectedPreset]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(selectedPreset.workDuration);
  };

  const handleLogTaskClick = () => {
    setSprintTaskCount((prev) => prev + 1);
    onLogTask();
    onDrainBattery(3);
  };

  const currentDuration = phase === 'work' ? selectedPreset.workDuration : selectedPreset.restDuration;
  const progressRatio = timeLeft / currentDuration;
  const circumference = 2 * Math.PI * 90; // ~565.48
  const strokeDashoffset = circumference * (1 - progressRatio);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">10/3 Micro-Sprint Engine</h2>
        </div>
        <p className="text-sm text-slate-400">
          Contained, low-stakes time windows. When the timer hits 0:00, stop working immediately — even mid-click.
        </p>
      </div>

      {/* Preset Selectors */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SPRINT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleSelectPreset(preset)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedPreset.name === preset.name
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* SVG Ring Timer */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center backdrop-blur-md relative">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            {/* Background Circle */}
            <circle
              cx="112"
              cy="112"
              r="90"
              className="stroke-slate-800 fill-none"
              strokeWidth="8"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="112"
              cy="112"
              r="90"
              className={`fill-none transition-all duration-1000 ${
                phase === 'work' ? 'stroke-cyan-400' : 'stroke-amber-400'
              }`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-1 ${
                phase === 'work'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              {phase === 'work' ? 'Work Phase' : 'Rest Phase'}
            </span>
            <div className="text-4xl font-extrabold text-slate-100 tracking-tight font-mono my-1">
              {formatTime(timeLeft)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {phase === 'work' ? 'Focus Window' : 'Step Away & Rest'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Sprint</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Sprint</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Task Logger Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Sprint Session Annotations:</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-bold text-cyan-400">{sprintTaskCount}</span>
            <span className="text-xs text-slate-500 font-medium">items completed</span>
            {sprintTotalCompleted > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {sprintTotalCompleted} Sprints Finished
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogTaskClick}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all hover:border-cyan-500/50"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>+ Log 1 Annotation</span>
        </button>
      </div>

      {/* Hard Stop Anchor Callout */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90">
        <AlertOctagon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <strong className="text-amber-300 block font-semibold mb-0.5">The Hard-Stop Guarantee:</strong>
          When the rest alarm sounds, stand up from your chair immediately. Never "push through." Rebuilding trust in boundaries is how you cure task dread.
        </div>
      </div>
    </div>
  );
};
