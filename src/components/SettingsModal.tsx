import React, { useState } from 'react';
import { X, Settings, User, LogIn, LogOut, Volume2, RotateCcw, ShieldAlert, Trash2, Check, Sparkles, RefreshCw, Download, Upload, Database, FileJson, Sun, Moon, AlertTriangle, Copy } from 'lucide-react';
import { UserProfile, AudioType } from '../types';
import { signInWithGoogleWorkspace, logoutGoogleWorkspace } from '../lib/googleWorkspace';
import { User as FirebaseUser } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  profile?: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  googleUser: FirebaseUser | null;
  onDailyReset: () => void;
  onClearAllData: () => void;
  onGoogleLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile: userProfileProp,
  profile: profileProp,
  onUpdateProfile,
  googleUser,
  onDailyReset,
  onClearAllData,
  onGoogleLogout,
}) => {
  const currentProfile = userProfileProp || profileProp || {
    name: 'Calm Focus Worker',
    roleTitle: 'Zero-Adrenaline Specialist',
    dailyGoalBits: 5,
    preferredNoise: 'brown',
    avatarEmoji: '🌸',
    totalBitsLogged: 12,
    streakDays: 4,
    panicGroundingPhrase: 'I am completely safe. 1 Focus Bit is enough for today.',
  };

  const [dailyGoal, setDailyGoal] = useState<number>(currentProfile.dailyGoalBits ?? 5);
  const [noiseType, setNoiseType] = useState<AudioType>(currentProfile.preferredNoise ?? 'brown');
  const [panicPhrase, setPanicPhrase] = useState<string>(
    currentProfile.panicGroundingPhrase ?? 'I am completely safe. 1 Focus Bit is enough for today.'
  );
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(currentProfile.theme || 'light');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setThemeMode(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentProfile,
      dailyGoalBits: dailyGoal,
      preferredNoise: noiseType,
      panicGroundingPhrase: panicPhrase.trim(),
      theme: themeMode,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await signInWithGoogleWorkspace();
      if (res?.user) {
        onUpdateProfile({
          ...currentProfile,
          name: res.user.displayName || currentProfile.name,
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain') || err?.message?.includes('invalid')) {
        setLoginError(`Domain Unauthorized: "${window.location.hostname}" is not authorized in Firebase Console.`);
      } else {
        setLoginError(err?.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    if (onGoogleLogout) {
      onGoogleLogout();
    } else {
      await logoutGoogleWorkspace();
    }
  };

  const downloadJSON = (data: object, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportProfile = () => {
    downloadJSON(currentProfile, `mental_medic_profile_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleExportBackup = () => {
    const fullBackup = {
      version: '3.5',
      exportDate: new Date().toISOString(),
      userProfile: currentProfile,
      todos: JSON.parse(localStorage.getItem('zawe_todos') || '[]'),
      symptomLogs: JSON.parse(localStorage.getItem('zawe_symptoms') || '[]'),
      notes: JSON.parse(localStorage.getItem('zawe_notes') || '[]'),
      sessionLogs: JSON.parse(localStorage.getItem('zawe_session_logs') || '[]'),
      battery: parseInt(localStorage.getItem('zawe_battery') || '100', 10),
    };
    downloadJSON(fullBackup, `mental_medic_backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.userProfile) {
          localStorage.setItem('zawe_profile', JSON.stringify(parsed.userProfile));
          onUpdateProfile(parsed.userProfile);
        }
        if (parsed.todos) localStorage.setItem('zawe_todos', JSON.stringify(parsed.todos));
        if (parsed.symptomLogs) localStorage.setItem('zawe_symptoms', JSON.stringify(parsed.symptomLogs));
        if (parsed.notes) localStorage.setItem('zawe_notes', JSON.stringify(parsed.notes));
        if (parsed.sessionLogs) localStorage.setItem('zawe_session_logs', JSON.stringify(parsed.sessionLogs));
        if (parsed.battery) localStorage.setItem('zawe_battery', parsed.battery.toString());

        alert('Backup successfully restored! Reloading application state.');
        window.location.reload();
      } catch (err) {
        alert('Could not parse backup file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-pink-200 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-pink-50/40">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-bold text-slate-800">Mental Medic Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Account & Google Login Control */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-pink-500" />
                <span>Account Control & Sync</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                googleUser ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {googleUser ? 'Google Connected' : 'Guest Account'}
              </span>
            </div>

            {googleUser ? (
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {googleUser.photoURL ? (
                    <img src={googleUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-pink-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                      {googleUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 truncate">{googleUser.displayName || googleUser.email}</p>
                    <p className="text-[10px] text-slate-400 truncate">{googleUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogout}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-500 text-[11px]">
                  Sign in with Google to enable Workspace sync, save cloud logs, and access Google Tasks.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-4 h-4 text-pink-500" />
                  <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google Account'}</span>
                </button>

                {loginError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                    <div className="flex items-start gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Google Login Error</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">{loginError}</p>
                    <div className="pt-1 flex items-center justify-between gap-2 border-t border-amber-200/60">
                      <span className="text-[10px] font-mono font-semibold truncate bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                        {window.location.hostname}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                      >
                        {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? 'Copied Domain!' : 'Copy Domain'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preferences Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Daily Focus Bits Target</label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value={3}>3 Focus Bits (Crisis Mode)</option>
                <option value={5}>5 Focus Bits (Gentle Baseline)</option>
                <option value={8}>8 Focus Bits (Expanded Flow)</option>
                <option value={12}>12 Focus Bits (High Stamina)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Preferred Ambient Sound Generator</label>
              <select
                value={noiseType}
                onChange={(e) => setNoiseType(e.target.value as AudioType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="brown">Brown Noise (Deep Calm)</option>
                <option value="pink">Pink Noise (Focused Rest)</option>
                <option value="white">White Noise (Masking)</option>
                <option value="rain">Rain on Glass</option>
                <option value="binaural">40Hz Binaural Waves</option>
                <option value="drone">432Hz Solfeggio Drone</option>
                <option value="office">Soft Pretend Office Hum</option>
                <option value="cafe">Gentle Coffee Shop</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Appearance / Theme Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    themeMode === 'light'
                      ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    themeMode === 'dark'
                      ? 'bg-slate-900 border-pink-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Panic Mode Grounding Phrase</label>
              <input
                type="text"
                value={panicPhrase}
                onChange={(e) => setPanicPhrase(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{saveSuccess ? 'Preferences Saved!' : 'Save Settings'}</span>
            </button>
          </form>

          {/* Local Offline Data & Backup */}
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-pink-500" />
                <span>Local Data Backup & Export</span>
              </h3>
              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-[10px] font-bold">100% Private</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Export your profile preferences or a complete snapshot backup of all local tasks, symptom logs, and focus notes.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportProfile}
                className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm text-[11px]"
              >
                <FileJson className="w-3.5 h-3.5 text-pink-500" />
                <span>Export Profile</span>
              </button>

              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2 px-3 bg-pink-500 hover:bg-pink-600 border border-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Backup</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Restore from local JSON backup:</span>
              <label className="py-1 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center gap-1 cursor-pointer text-[10px]">
                <Upload className="w-3 h-3 text-pink-500" />
                <span>Restore JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Daily Reset System */}
          <div className="bg-pink-50/50 border border-pink-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-pink-500" />
                <span>Daily Reset & Archive</span>
              </h3>
              <span className="text-[10px] text-pink-600 font-mono font-bold">Cleans daily tasks & archives logs</span>
            </div>

            <p className="text-slate-600 text-[11px]">
              Clicking Daily Reset saves a dated summary entry to your Shift Logs Archive and restores battery to 100% for a clean new day.
            </p>

            {showConfirmReset ? (
              <div className="bg-white p-3 rounded-xl border border-pink-200 space-y-2">
                <p className="font-bold text-pink-700">Confirm Daily Reset & Archive?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDailyReset();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-pink-500 text-white font-bold cursor-pointer"
                  >
                    Yes, Perform Daily Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold border border-pink-200 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-pink-500" />
                <span>Perform Daily Reset & Archive Log</span>
              </button>
            )}
          </div>

          {/* Danger Zone: Clear All Data */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-rose-800 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Reset All App Data</span>
            </h3>

            {showConfirmClearAll ? (
              <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-2">
                <p className="font-bold text-rose-700">Delete all tasks, logs, and stored preferences?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmClearAll(false)}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onClearAllData();
                      setShowConfirmClearAll(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
                  >
                    Wipe All Data
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClearAll(true)}
                className="w-full py-2 bg-rose-100/60 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-xl transition-all cursor-pointer"
              >
                Wipe Local Storage Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
