import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, ShieldCheck, Activity, Sparkles, Trash2, User, Lock, Phone } from 'lucide-react';
import { VoiceSettings, UserProfile } from '../types';

interface TopNavProps {
  voiceSettings: VoiceSettings;
  userProfile: UserProfile;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onClearHistory: () => void;
  onLockDevice?: () => void;
  onOpenContacts?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  voiceSettings,
  userProfile,
  onUpdateSettings,
  onOpenSettings,
  onOpenProfile,
  onClearHistory,
  onLockDevice,
  onOpenContacts,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('hi-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-cyan-500/20 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 flex items-center justify-between z-20 select-none">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-hud font-bold text-base tracking-widest text-cyan-300 hud-glow">
              J.A.R.V.I.S.
            </span>
            <span className="text-[10px] font-tech px-1.5 py-0.5 rounded bg-cyan-900/40 border border-cyan-500/30 text-cyan-300">
              MK-85 PERSONAL AI
            </span>
          </div>
          <p className="text-[11px] font-tech text-cyan-400/60 leading-none">
            VOICE TO VOICE // HINDI MALE ASSISTANT
          </p>
        </div>
      </div>

      {/* Center Digital Telemetry Bar */}
      <div className="hidden lg:flex items-center gap-5 font-tech text-xs text-cyan-300/80">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">CORE:</span>
          <span className="text-emerald-400 font-semibold">OPTIMAL</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">VOICE:</span>
          <span className="text-cyan-300">
            {voiceSettings.engineMode === 'gemini-tts' ? 'GEMINI NEURAL MALE' : 'NATIVE HINDI MALE'}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/60 border border-cyan-500/20">
          <span className="text-slate-400">{dateStr}</span>
          <span className="text-cyan-300 font-bold">{timeStr}</span>
        </div>
      </div>

      {/* Action Controls & User Profile Badge */}
      <div className="flex items-center gap-2">
        {/* Personal User Identity Badge (Click to open profile) */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 hover:border-cyan-400 text-cyan-200 transition-all text-xs font-tech tracking-wide shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          title="व्यक्तिगत प्रोफ़ाइल सेटिंग्स"
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-cyan-300">{userProfile.name}</span>
          <span className="text-[10px] text-cyan-400/70">({userProfile.honorific})</span>
        </button>

        {/* Clear Conversation */}
        <button
          id="btn-clear-chat"
          onClick={onClearHistory}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900/60 border border-transparent hover:border-red-500/30 transition-all text-xs flex items-center gap-1"
          title="बातचीत साफ़ करें"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          id="btn-toggle-sound-fx"
          onClick={() =>
            onUpdateSettings({
              soundEffectsEnabled: !voiceSettings.soundEffectsEnabled,
            })
          }
          className={`p-1.5 rounded-lg border transition-all ${
            voiceSettings.soundEffectsEnabled
              ? 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30'
              : 'text-slate-500 border-slate-700/50 bg-slate-900/30'
          }`}
          title={voiceSettings.soundEffectsEnabled ? 'ध्वनि प्रभाव चालू' : 'ध्वनि प्रभाव बंद'}
        >
          {voiceSettings.soundEffectsEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Lock Device Screen */}
        {onLockDevice && (
          <button
            id="btn-lock-device"
            onClick={onLockDevice}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-900/40 hover:border-red-400 transition-all text-xs font-tech tracking-wider"
            title="डिवाइस लॉक करें (Lock Device)"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">LOCK</span>
          </button>
        )}

        {/* Speed Dial & Phone Calls */}
        {onOpenContacts && (
          <button
            id="btn-open-contacts"
            onClick={onOpenContacts}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition-all text-xs font-tech tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            title="कॉल एवं संपर्क (Phone Calls & Speed Dial)"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CALLS</span>
          </button>
        )}

        {/* Voice & System Settings */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all text-xs font-tech tracking-wider"
          title="जार्विस आवाज व सिस्टम सेटिंग्स"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">SETTINGS</span>
        </button>
      </div>
    </header>
  );
};
