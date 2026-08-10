import React, { useState } from 'react';
import { Heart, ShieldCheck, Sparkles, Check, Play, RefreshCw, Volume2, ShieldAlert, Activity, UserCheck } from 'lucide-react';
import { GroundingStep, SessionLog, BurnoutPhaseInfo } from '../types';
import { audioSynth } from '../lib/audioSynth';

interface SomaticMindsetTabProps {
  onCompleteUnfreeze?: () => void;
  logs?: SessionLog[];
}

const INITIAL_GROUNDING_STEPS: GroundingStep[] = [
  {
    id: '5-see',
    title: '5-See (Visual Orientation)',
    instruction: 'Look around your room without moving your head rapidly.',
    detail: 'Name 5 physical objects with high detail (e.g. "blue coffee cup", "textured wood grain").',
    completed: false,
  },
  {
    id: '4-feel',
    title: '4-Touch (Tactile Anchor)',
    instruction: 'Notice 4 physical touch points right now.',
    detail: 'Feel your feet flat on the floor, your back pressed against the chair, air on skin.',
    completed: false,
  },
  {
    id: '3-hear',
    title: '3-Hear (Auditory Grounding)',
    instruction: 'Close your eyes and listen closely for 3 distinct sounds.',
    detail: 'Listen to the ambient noise synth, computer fan, or distant wind.',
    completed: false,
  },
  {
    id: '2-smell',
    title: '2-Smell/Taste (Somatic Sense)',
    instruction: 'Notice 2 subtle scents or tastes.',
    detail: 'Take a slow breath in. Notice coffee, tea, or clean air.',
    completed: false,
  },
  {
    id: '1-breath',
    title: '1-Exhale (Vagus Nerve Reset)',
    instruction: 'Perform one deep, slow physiological sigh.',
    detail: 'Inhale twice quickly through the nose, then exhale slowly through the mouth.',
    completed: false,
  },
];

const BODY_SCAN_ITEMS = [
  { id: 'forehead', label: 'Unclench Forehead & Eyebrows', detail: 'Smooth out frowning muscles, relax eyelids.' },
  { id: 'jaw', label: 'Drop Jaw & Separate Teeth', detail: 'Let tongue rest gently behind top front teeth.' },
  { id: 'shoulders', label: 'Drop Shoulders Away from Ears', detail: 'Inhale up, roll back, exhale completely down.' },
  { id: 'belly', label: 'Soften Stomach & Belly Muscles', detail: 'Allow abdomen to expand naturally on in-breath.' },
  { id: 'hands', label: 'Unclench Fists & Palms', detail: 'Let fingers rest softly on desk or lap.' },
  { id: 'feet', label: 'Press Both Soles Flat to Ground', detail: 'Feel solid support beneath you.' },
];

const BURNOUT_PHASES: BurnoutPhaseInfo[] = [
  {
    phase: 1,
    title: 'Acute Crisis Stabilization',
    daysRange: 'Days 1 - 14',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    tagline: 'Absolute Zero Adrenaline Guarantee',
    description: 'Your nervous system is currently hyper-aroused. Output is capped to micro-sprints.',
    rules: [
      'Maximum 3 Focus Bits total per shift.',
      'Mandatory 3-minute physiological rest between every 10-min sprint.',
      'Zero strict deadlines allowed.',
    ],
  },
  {
    phase: 2,
    title: 'Gentle Pacing Reconstruction',
    daysRange: 'Days 15 - 45',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    tagline: 'Controlled Capacity Expansion',
    description: 'Rebuilding cognitive stamina slowly without triggering freeze states.',
    rules: [
      'Target 5 - 8 Focus Bits per day.',
      'Practice 1-3-5 Rule (1 Big, 3 Medium, 5 Focus Bits).',
      'Hydrate & perform somatic stretch after each block.',
    ],
  },
  {
    phase: 3,
    title: 'Sustainable Engine Flow',
    daysRange: 'Days 46 - 90',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tagline: 'Autonomous Calm Productivity',
    description: 'Operating in smooth, sustainable flow with built-in burnout shields.',
    rules: [
      'Flexible sprint durations with automatic break prompts.',
      'Log weekly health & symptom trends.',
      'Maintain zero-adrenaline baseline.',
    ],
  },
];

export const SomaticMindsetTab: React.FC<SomaticMindsetTabProps> = ({ onCompleteUnfreeze }) => {
  const [subView, setSubView] = useState<'unfreeze' | 'bodyscan' | 'defense'>('unfreeze');
  const [steps, setSteps] = useState<GroundingStep[]>(INITIAL_GROUNDING_STEPS);
  const [bodyChecklist, setBodyChecklist] = useState<Record<string, boolean>>({});
  const [breathCount, setBreathCount] = useState<number>(0);
  const [isBreathing, setIsBreathing] = useState<boolean>(false);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const toggleBodyItem = (id: string) => {
    setBodyChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = steps.filter((s) => s.completed).length;

  const triggerBreathCycle = () => {
    setIsBreathing(true);
    audioSynth.playChime();
    setTimeout(() => {
      setBreathCount((c) => c + 1);
      setIsBreathing(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Header Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubView('unfreeze')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'unfreeze'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>5-4-3-2-1 Somatic Unfreeze</span>
          </button>

          <button
            onClick={() => setSubView('bodyscan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'bodyscan'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Somatic Body Scan</span>
          </button>

          <button
            onClick={() => setSubView('defense')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'defense'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>90-Day Defense Protocol</span>
          </button>
        </div>

        <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
          Nervous System Safety First
        </span>
      </div>

      {subView === 'unfreeze' && (
        <div className="space-y-6">
          {/* Unfreeze Overview Banner */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full">
                Somatic Regulation
              </span>
              <h3 className="text-base font-bold text-slate-800">5-4-3-2-1 Executive Unfreeze</h3>
              <p className="text-xs text-slate-600 max-w-lg">
                If you feel frozen or overwhelmed, complete these 5 grounding steps. They signal safety to your amygdala so you can complete your first Focus Bit without dread.
              </p>
            </div>

            <div className="bg-white px-5 py-3 rounded-2xl border border-pink-100 text-center shadow-sm shrink-0">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Grounding Progress</span>
              <span className="text-xl font-black text-pink-600 font-mono">
                {completedCount} / {steps.length}
              </span>
            </div>
          </div>

          {/* Physiological Breath Pacer */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-100 text-pink-600">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Vagus Nerve Reset Pacer</h4>
                <p className="text-[11px] text-slate-500">
                  Tap to take a 4-second slow physiological sigh with solfeggio chime tones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-600">{breathCount} Sighs Done</span>
              <button
                onClick={triggerBreathCycle}
                disabled={isBreathing}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Sparkles className={`w-4 h-4 ${isBreathing ? 'animate-spin' : ''}`} />
                <span>{isBreathing ? 'Inhale... Exhale...' : 'Take Physiological Sigh'}</span>
              </button>
            </div>
          </div>

          {/* Grounding Steps List */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  step.completed
                    ? 'bg-pink-50/60 border-pink-200'
                    : 'bg-white border-slate-100 hover:border-pink-200 hover:shadow-sm'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    step.completed
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>

                <div className="space-y-0.5">
                  <h4
                    className={`text-xs font-bold ${
                      step.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600">{step.instruction}</p>
                  <p className="text-[11px] text-pink-600 italic font-medium">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {completedCount === steps.length && (
            <div className="p-5 rounded-2xl bg-pink-500 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-pink-500/20 animate-fadeIn">
              <div>
                <h4 className="text-sm font-bold">✨ Nervous System Grounded!</h4>
                <p className="text-xs text-pink-100">
                  Your amygdala acknowledges physical safety. Ready to execute 1 Focus Bit?
                </p>
              </div>
              {onCompleteUnfreeze && (
                <button
                  onClick={onCompleteUnfreeze}
                  className="px-4 py-2 bg-white text-pink-600 font-extrabold text-xs rounded-xl hover:bg-pink-50 transition-all shrink-0 cursor-pointer shadow-md"
                >
                  Go to Focus Bits To-Do →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {subView === 'bodyscan' && (
        <div className="space-y-6">
          <div className="bg-white border border-pink-100 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-pink-500" />
              <span>Somatic Tension Release Scan</span>
            </h3>
            <p className="text-xs text-slate-500">
              Task dread often manifests physically in muscle bracing. Unclench these 6 tension points to release physical freeze signals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {BODY_SCAN_ITEMS.map((item) => {
              const isChecked = !!bodyChecklist[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleBodyItem(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked ? 'bg-pink-50 border-pink-200' : 'bg-white border-slate-100 hover:border-pink-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'bg-pink-500 border-pink-500 text-white' : 'border-slate-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold ${isChecked ? 'text-pink-700' : 'text-slate-800'}`}>
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subView === 'defense' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">90-Day Burnout Shield</h3>
            <p className="text-xs text-slate-500">
              A structured, long-term protocol designed to rebuild executive stamina without triggering panic cycles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {BURNOUT_PHASES.map((phase) => (
              <div
                key={phase.phase}
                className={`p-5 rounded-2xl border space-y-3 bg-white shadow-sm hover:shadow-md transition-all ${phase.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80">
                    Phase {phase.phase}
                  </span>
                  <span className="text-[11px] font-bold">{phase.daysRange}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800">{phase.title}</h4>
                  <p className="text-[11px] font-semibold text-pink-600 mt-0.5">{phase.tagline}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{phase.description}</p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <p className="font-bold text-[11px] text-slate-800">Phase Guidelines:</p>
                  {phase.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-pink-500 font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
