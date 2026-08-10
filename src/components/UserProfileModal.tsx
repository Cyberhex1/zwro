import React, { useState, useEffect } from 'react';
import { User, X, Shield, Sparkles, Check, Edit2, Flame, Target, HeartHandshake } from 'lucide-react';
import { UserProfile, AudioType } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  totalFocusBitsLogged: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  totalFocusBitsLogged,
}) => {
  const currentProfile = profile || {
    name: 'Calm Focus Worker',
    roleTitle: 'Zero-Adrenaline Specialist',
    dailyGoalBits: 5,
    preferredNoise: 'brown',
    avatarEmoji: '🌸',
    totalBitsLogged: 12,
    streakDays: 4,
    panicGroundingPhrase: 'I am completely safe. 1 Focus Bit is enough for today.',
  };

  const [formData, setFormData] = useState<UserProfile>(currentProfile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-pink-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-pink-500/10 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-100 border border-pink-300 flex items-center justify-center text-2xl shadow-sm shrink-0">
            {formData.avatarEmoji || '🌸'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{formData.name || 'Calm Explorer'}</h2>
            <p className="text-xs font-semibold text-pink-600">{formData.roleTitle || 'Zero-Adrenaline Worker'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-300">
                <Sparkles className="w-3 h-3 text-pink-500" /> Focus Bits Engine
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total Focus Bits</p>
              <p className="text-sm font-black text-slate-800 font-mono">{totalFocusBitsLogged}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Zero-Dread Streak</p>
              <p className="text-sm font-black text-slate-800 font-mono">{formData.streakDays || 1} Days</p>
            </div>
          </div>
        </div>

        {/* Form or Read View */}
        {!isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Daily Target:</span>
                <span className="font-bold text-slate-800">{formData.dailyGoalBits} Focus Bits/day</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Preferred Sound:</span>
                <span className="font-bold text-slate-800 capitalize">{formData.preferredNoise} Noise</span>
              </div>
              <div className="py-1.5 border-b border-slate-100 space-y-1">
                <span className="text-slate-500 block">Personal Grounding Anchor:</span>
                <p className="font-medium text-slate-700 italic bg-pink-50/60 p-2.5 rounded-xl border border-pink-100">
                  "{formData.panicGroundingPhrase || 'I am safe in my body. Lowering the bar.'}"
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile & Preferences</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Role / Persona Title</label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Avatar Emoji</label>
                <input
                  type="text"
                  value={formData.avatarEmoji}
                  onChange={(e) => setFormData({ ...formData, avatarEmoji: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Daily Focus Bits Goal</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.dailyGoalBits}
                  onChange={(e) => setFormData({ ...formData, dailyGoalBits: parseInt(e.target.value) || 3 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Preferred Ambient Sound</label>
                <select
                  value={formData.preferredNoise}
                  onChange={(e) => setFormData({ ...formData, preferredNoise: e.target.value as AudioType })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium cursor-pointer"
                >
                  <option value="brown">Brown Noise</option>
                  <option value="pink">Pink Noise</option>
                  <option value="white">White Noise</option>
                  <option value="rain">Rain on Glass</option>
                  <option value="binaural">40Hz Binaural</option>
                  <option value="drone">432Hz Drone</option>
                  <option value="office">Office Hum</option>
                  <option value="cafe">Cafe Ambience</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Grounding Phrase</label>
              <textarea
                rows={2}
                value={formData.panicGroundingPhrase}
                onChange={(e) => setFormData({ ...formData, panicGroundingPhrase: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-pink-500 font-medium resize-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {savedSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center animate-fadeIn">
            ✨ Profile updated successfully!
          </div>
        )}
      </div>
    </div>
  );
};
