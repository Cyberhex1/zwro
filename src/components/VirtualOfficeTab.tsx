import React, { useState, useEffect } from 'react';
import {
  Building2,
  Volume2,
  Users,
  Coffee,
  ShieldCheck,
  EyeOff,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  FileSpreadsheet,
  Activity,
  Maximize2,
  RefreshCw,
  Send,
  Bot,
  Copy,
  Check,
} from 'lucide-react';
import { VirtualCoworker } from '../types';
import { audioSynth } from '../lib/audioSynth';

const INITIAL_COWORKERS: VirtualCoworker[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Product Specialist',
    avatar: '👩‍💻',
    status: 'In Deep Focus Bit',
    currentFocus: 'Drafting Q3 roadmap proposal',
    timeAgo: '2m ago',
  },
  {
    id: '2',
    name: 'Liam Vance',
    role: 'Data Architect',
    avatar: '👨‍💼',
    status: 'Tea Break ☕',
    currentFocus: 'Grabbing chamomile tea',
    timeAgo: '5m ago',
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'UX Researcher',
    avatar: '👩‍🎨',
    status: 'Focus Bits Sprinting',
    currentFocus: 'Synthesizing usability feedback',
    timeAgo: '12m ago',
  },
  {
    id: '4',
    name: 'Marcus Brody',
    role: 'Operations Lead',
    avatar: '👨‍💻',
    status: 'Out of Office',
    currentFocus: 'Zero-Adrenaline Rest',
    timeAgo: '20m ago',
  },
];

const BOSS_PROMPTS = [
  "Hey, do you have a quick status update on the current deliverables?",
  "Hi! Just checking in on the Q3 milestones before our afternoon sync.",
  "Hello! Is everything on track for the sprint wrap-up today?",
  "Hey there, could you confirm when the revised analysis will be ready?",
];

const CORPORATE_REPLIES = [
  "Hi! All Q3 milestones are currently progressing right on schedule. I'm finalizing the metrics now and will share the report shortly!",
  "Hello! Yes, everything is proceeding smoothly. Initial phases are complete, and the final review is underway. Thanks for checking in!",
  "Hi! Deliverables are well in hand. I'm doing a quick quality pass on the data and will post the summary in our shared channel.",
  "Hey! Everything is on track. I've broken down the remaining tasks into quick micro-steps and expect to wrap up smoothly today.",
];

export const VirtualOfficeTab: React.FC = () => {
  const [coworkers, setCoworkers] = useState<VirtualCoworker[]>(INITIAL_COWORKERS);
  const [myStatus, setMyStatus] = useState<string>('Deep Focus Bit Mode 🌸');
  const [officeSoundPlaying, setOfficeSoundPlaying] = useState<boolean>(false);
  const [showDecoyDoc, setShowDecoyDoc] = useState<boolean>(false);

  // Boss simulator state
  const [bossMsgIndex, setBossMsgIndex] = useState<number>(0);
  const [generatedReply, setGeneratedReply] = useState<string>('');
  const [copiedReply, setCopiedReply] = useState<boolean>(false);

  // Coffee break timer state
  const [coffeeTimer, setCoffeeTimer] = useState<number>(0); // seconds
  const [isCoffeeTimerRunning, setIsCoffeeTimerRunning] = useState<boolean>(false);

  // Simulated live ticker adding background events
  useEffect(() => {
    const interval = setInterval(() => {
      const names = ['Sarah', 'Liam', 'Elena', 'Marcus', 'Jordan', 'Maya'];
      const actions = [
        'logged a Focus Bit',
        'took a 3-minute somatic sigh break',
        'updated sprint tracker',
        'completed a micro task',
        'refilled water bottle',
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      setCoworkers((prev) => [
        {
          id: Date.now().toString(),
          name: `${randomName} (Virtual)`,
          role: 'Team Member',
          avatar: '🧑‍💻',
          status: 'Active',
          currentFocus: randomAction,
          timeAgo: 'Just now',
        },
        ...prev.slice(0, 4),
      ]);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  // Coffee break timer interval
  useEffect(() => {
    if (!isCoffeeTimerRunning) return;
    const timer = setInterval(() => {
      setCoffeeTimer((prev) => {
        if (prev <= 1) {
          setIsCoffeeTimerRunning(false);
          audioSynth.playChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCoffeeTimerRunning]);

  const toggleOfficeAmbiance = () => {
    const isPlaying = audioSynth.toggle('office');
    setOfficeSoundPlaying(isPlaying);
  };

  const handleGenerateReply = () => {
    const reply = CORPORATE_REPLIES[bossMsgIndex % CORPORATE_REPLIES.length];
    setGeneratedReply(reply);
  };

  const handleShuffleBossMsg = () => {
    setBossMsgIndex((prev) => (prev + 1) % BOSS_PROMPTS.length);
    setGeneratedReply('');
  };

  const handleCopyReply = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const startCoffeeBreak = () => {
    setCoffeeTimer(180); // 3 minutes
    setIsCoffeeTimerRunning(true);
    audioSynth.playChime();
  };

  const formatCoffeeTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-pink-500" />
            <span>Virtual Office Simulator ("Pretend Office")</span>
          </h3>
          <p className="text-xs text-slate-500">
            A psychological co-working shelter with office soundscapes, team ticker, boss simulator, and decoy corporate shield.
          </p>
        </div>

        <button
          onClick={() => setShowDecoyDoc(!showDecoyDoc)}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            showDecoyDoc
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>{showDecoyDoc ? 'Exit Decoy Corporate Shield' : 'Open Corporate Decoy Shield'}</span>
        </button>
      </div>

      {/* Decoy Interactive Corporate Spec Document Simulator */}
      {showDecoyDoc ? (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-slate-100 space-y-4 shadow-2xl animate-fadeIn font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">INTERNAL_Q3_STRATEGY_DECOY_SPREADSHEET_V4.XLSX</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">
              CONFIDENTIAL / HIGH-LEVEL PRODUCTIVITY
            </span>
          </div>

          <p className="text-slate-400 font-sans text-xs">
            (If anyone looks at your screen right now, this looks like high-level corporate analysis and spreadsheet work!)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300">
                  <th className="p-2 border border-slate-700">Sprint ID</th>
                  <th className="p-2 border border-slate-700">Module Target</th>
                  <th className="p-2 border border-slate-700">Status</th>
                  <th className="p-2 border border-slate-700">Completion %</th>
                  <th className="p-2 border border-slate-700">Quarter Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-slate-800">
                  <td className="p-2 border border-slate-800">#FOCUS-801</td>
                  <td className="p-2 border border-slate-800">Data Pipeline Refinement</td>
                  <td className="p-2 border border-slate-800 text-emerald-400">IN_PROGRESS</td>
                  <td className="p-2 border border-slate-800">88.5%</td>
                  <td className="p-2 border border-slate-800">HIGH</td>
                </tr>
                <tr className="border border-slate-800">
                  <td className="p-2 border border-slate-800">#FOCUS-802</td>
                  <td className="p-2 border border-slate-800">Executive Summary Generation</td>
                  <td className="p-2 border border-slate-800 text-cyan-400">PASSED</td>
                  <td className="p-2 border border-slate-800">100.0%</td>
                  <td className="p-2 border border-slate-800">CRITICAL</td>
                </tr>
                <tr className="border border-slate-800">
                  <td className="p-2 border border-slate-800">#FOCUS-803</td>
                  <td className="p-2 border border-slate-800">Somatic Reliability Testing</td>
                  <td className="p-2 border border-slate-800 text-amber-400">STANDBY</td>
                  <td className="p-2 border border-slate-800">64.0%</td>
                  <td className="p-2 border border-slate-800">MEDIUM</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
            <p className="text-[11px] text-slate-300 font-bold">Executive Summary Notes:</p>
            <p className="text-[11px] text-slate-400 font-sans">
              "All Q3 metrics demonstrate steady progress with low error rates. Operational efficiency remains within optimal parameters."
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Office Status Bar & Boss Shield */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Boss Shield Indicator */}
            <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Manager & Deadline Shield</h4>
                  <p className="text-[11px] text-pink-700 font-medium">
                    Status: <span className="font-bold">Out of Office / All Deadlines Satisfied</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                100% SECURE
              </span>
            </div>

            {/* Slack-style Status Builder */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Office Status</label>
                  <input
                    type="text"
                    value={myStatus}
                    onChange={(e) => setMyStatus(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none focus:border-b focus:border-pink-500 w-48"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 italic hidden sm:inline">Visible to virtual team</span>
            </div>
          </div>

          {/* Sound Ambiance Generator */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-100 text-pink-600">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Office Desk & Typing Sound Ambiance</h4>
                <p className="text-[11px] text-slate-500">
                  Soft HVAC hum, subtle mechanical keyboard clicking, and distant office chatter.
                </p>
              </div>
            </div>

            <button
              onClick={toggleOfficeAmbiance}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                officeSoundPlaying
                  ? 'bg-pink-500 text-white shadow-pink-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Activity className={`w-4 h-4 ${officeSoundPlaying ? 'animate-spin' : ''}`} />
              <span>{officeSoundPlaying ? 'Pause Office Audio' : 'Play Office Audio'}</span>
            </button>
          </div>

          {/* Boss Simulator & Confident Response Generator */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Bot className="w-4 h-4 text-pink-500" />
                <span>Manager Check-In & Corporate Reply Generator</span>
              </h4>
              <button
                onClick={handleShuffleBossMsg}
                className="p-1 rounded text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                title="Shuffle Prompt"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated Slack Message from Boss */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                👨‍💼
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800">Alex (Manager)</span>
                  <span className="text-[10px] text-slate-400">10:14 AM</span>
                </div>
                <p className="text-xs text-slate-700 italic">"{BOSS_PROMPTS[bossMsgIndex]}"</p>
              </div>
            </div>

            {/* Generated Confident Response */}
            {generatedReply ? (
              <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pink-700 uppercase">Suggested Professional Reply:</span>
                  <button
                    onClick={handleCopyReply}
                    className="px-2.5 py-1 bg-white border border-pink-200 hover:bg-pink-100 text-pink-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedReport ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-pink-500" />}
                    <span>{copiedReport ? 'Copied!' : 'Copy Reply'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 font-medium">"{generatedReply}"</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateReply}
                className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold border border-pink-200 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Generate Confident Corporate Response</span>
              </button>
            )}
          </div>

          {/* Virtual Coworker Activity Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-500" />
                <span>Virtual Coworker Presence Feed</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Gentle background co-working presence</span>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {coworkers.map((cw) => (
                <div
                  key={cw.id}
                  className="bg-white border border-slate-100 hover:border-pink-100 rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-xl shrink-0">
                    {cw.avatar}
                  </div>

                  <div className="space-y-0.5 overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-slate-800 truncate">{cw.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{cw.timeAgo}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{cw.role}</p>
                    <p className="text-xs text-slate-600 font-medium pt-1">
                      <span className="text-pink-600 font-bold">Focus:</span> {cw.currentFocus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Virtual Watercooler / Tea Break Timer */}
          <div className="p-4 rounded-2xl bg-pink-50 border border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Coffee className="w-5 h-5 text-pink-500 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-slate-800">Virtual Watercooler & Coffee Break</h5>
                <p className="text-[11px] text-slate-500">
                  Step away to grab water, tea, or stretch for 3 minutes. Your desk is completely safe.
                </p>
              </div>
            </div>

            {isCoffeeTimerRunning ? (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-pink-200 font-mono font-black text-pink-600 text-sm">
                <Clock className="w-4 h-4 text-pink-500 animate-spin" />
                <span>{formatCoffeeTime(coffeeTimer)}</span>
              </div>
            ) : (
              <button
                onClick={startCoffeeBreak}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 cursor-pointer transition-all shrink-0"
              >
                Take 3-Min Tea Break
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
