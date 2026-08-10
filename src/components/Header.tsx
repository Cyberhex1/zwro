import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldAlert, FileText, Activity, Settings, RotateCcw, FileEdit, Cross } from 'lucide-react';
import { EnergyBattery } from './EnergyBattery';
import { MindsetPulse } from './MindsetPulse';
import { audioSynth } from '../lib/audioSynth';
import { AudioType, UserProfile } from '../types';

interface HeaderProps {
  battery: number;
  onRechargeBattery: () => void;
  onDrainBattery: (amount: number) => void;
  onTogglePanic: () => void;
  onOpenLogs: () => void;
  onOpenProfile: () => void;
  onOpenNotes: () => void;
  onOpenSettings: () => void;
  onDailyReset: () => void;
  userProfile: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  battery,
  onRechargeBattery,
  onDrainBattery,
  onTogglePanic,
  onOpenLogs,
  onOpenProfile,
  onOpenNotes,
  onOpenSettings,
  onDailyReset,
  userProfile,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(audioSynth.getIsPlaying());
  const [audioType, setAudioType] = useState<AudioType>(audioSynth.getCurrentType());
  const [volume, setVolume] = useState<number>(0.2);

  const handleAudioToggle = () => {
    const newState = audioSynth.toggle(audioType);
    setIsPlayingAudio(newState);
  };

  const handleAudioTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as AudioType;
    setAudioType(newType);
    if (isPlayingAudio) {
      audioSynth.play(newType);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    audioSynth.setVolume(newVol);
  };

  return (
    <div className="space-y-3">
      <header className="bg-white/90 border border-pink-200/80 backdrop-blur-xl rounded-2xl p-4 md:px-6 md:py-4 shadow-xl shadow-pink-500/5 flex flex-wrap items-center justify-between gap-4">
        {/* Mental Medic Branding with Medic Sprite */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="relative flex items-center justify-center p-1 rounded-2xl bg-white border border-pink-300/90 shadow-sm hover:border-pink-400 hover:shadow transition-all cursor-pointer group"
            title="Open Account Profile"
          >
            {/* Medic Sprite Icon - Clean White & Gentle */}
            <div className="w-9 h-9 rounded-xl bg-pink-50/80 border border-pink-200 flex items-center justify-center text-pink-500 relative">
              <Cross className="w-5 h-5 text-pink-500 fill-white" />
              <span className="absolute -top-1 -right-1 text-xs">{userProfile.avatarEmoji || '🩺'}</span>
            </div>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-tight text-slate-800 flex items-center gap-1.5">
                <span className="text-pink-600">Mental Medic</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 border border-pink-300 uppercase tracking-wide">
                  v3.5
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">Zero-Adrenaline Mind & Task Relief</p>
          </div>
        </div>

        {/* Center Tools: Battery & Audio Synth */}
        <div className="flex flex-wrap items-center gap-3">
          <EnergyBattery battery={battery} onRecharge={onRechargeBattery} onDrain={onDrainBattery} />

          {/* Ambient Sound Player */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
            <Activity className="w-3.5 h-3.5 text-pink-500" />
            <select
              value={audioType}
              onChange={handleAudioTypeChange}
              className="bg-transparent text-slate-800 outline-none cursor-pointer hover:text-pink-600 transition-colors text-xs font-semibold"
            >
              <option value="brown">Brown Noise</option>
              <option value="pink">Pink Noise</option>
              <option value="white">White Noise</option>
              <option value="rain">Rain on Glass</option>
              <option value="binaural">40Hz Binaural</option>
              <option value="drone">432Hz Calm Drone</option>
              <option value="office">Office Ambiance</option>
              <option value="cafe">Coffee Shop</option>
            </select>

            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              title={`Volume: ${Math.round(volume * 200)}%`}
              className="w-12 h-1 accent-pink-500 bg-slate-200 rounded-lg cursor-pointer hidden sm:inline-block"
            />

            <button
              onClick={handleAudioToggle}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
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
                  <span>Sound</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNotes}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-300 transition-all cursor-pointer"
            title="Open Focus & Somatic Notes"
          >
            <FileEdit className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer"
            title="View Archive Logs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Logs</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-300"
            title="Open Settings"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={onTogglePanic}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 shadow-sm transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Panic Mode</span>
          </button>
        </div>
      </header>

      {/* Mindset Pulse Header Banner with Date Greeting & Anxiety Quotes */}
      <div className="flex justify-center">
        <MindsetPulse />
      </div>
    </div>
  );
};
