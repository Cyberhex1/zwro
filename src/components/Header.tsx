import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldAlert, FileText, Sparkles, Activity } from 'lucide-react';
import { EnergyBattery } from './EnergyBattery';
import { audioSynth } from '../lib/audioSynth';
import { AudioType } from '../types';

interface HeaderProps {
  battery: number;
  onRechargeBattery: () => void;
  onDrainBattery: (amt: number) => void;
  onTogglePanic: () => void;
  onOpenLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  battery,
  onRechargeBattery,
  onDrainBattery,
  onTogglePanic,
  onOpenLogs,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioType, setAudioType] = useState<AudioType>('brown');
  const [volume, setVolume] = useState<number>(0.2);

  useEffect(() => {
    setIsPlayingAudio(audioSynth.getIsPlaying());
  }, []);

  const handleAudioToggle = () => {
    const playing = audioSynth.toggle(audioType);
    setIsPlayingAudio(playing);
  };

  const handleAudioTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as AudioType;
    setAudioType(newType);
    if (isPlayingAudio) {
      audioSynth.play(newType);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
  };

  return (
    <header className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 md:px-6 md:py-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
          <div className="absolute w-6 h-6 rounded-full border border-cyan-500/40 animate-ping opacity-75" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              ZAWE <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">v2.0</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">Zero-Adrenaline Work Engine</p>
        </div>
      </div>

      {/* Center Tools: Battery & Audio Synth */}
      <div className="flex flex-wrap items-center gap-3">
        <EnergyBattery battery={battery} onRecharge={onRechargeBattery} onDrain={onDrainBattery} />

        {/* Ambient Sound Player */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={audioType}
            onChange={handleAudioTypeChange}
            className="bg-transparent text-slate-200 outline-none cursor-pointer hover:text-cyan-300 transition-colors text-xs font-medium"
          >
            <option value="brown" className="bg-slate-900 text-slate-200">Brown Noise (Deep Rumble)</option>
            <option value="pink" className="bg-slate-900 text-slate-200">Pink Noise (Soft Rain)</option>
            <option value="binaural" className="bg-slate-900 text-slate-200">40Hz Binaural (Focus)</option>
            <option value="drone" className="bg-slate-900 text-slate-200">432Hz Calm Drone</option>
          </select>

          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            title={`Volume: ${Math.round(volume * 200)}%`}
            className="w-14 h-1 accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer hidden sm:inline-block"
          />

          <button
            onClick={handleAudioToggle}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              isPlayingAudio
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Playing</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Play Sound</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 hover:border-slate-600 transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Shift Logs</span>
        </button>

        <button
          onClick={onTogglePanic}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Panic Mode</span>
        </button>
      </div>
    </header>
  );
};
