import React from 'react';
import { VoiceSettings, MaleVoicePreset } from '../types';
import { X, Volume2, Sliders, Cpu, Mic, Sparkles, Check } from 'lucide-react';
import { jarvisVoice, MALE_VOICE_PRESETS, MalePresetConfig } from '../services/voiceService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  onTestVoice: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTestVoice,
}) => {
  if (!isOpen) return null;

  const availableVoices = jarvisVoice.getAvailableVoices();
  const hindiVoices = jarvisVoice.getHindiVoices();

  const handleSelectPreset = (preset: MalePresetConfig) => {
    onUpdateSettings({
      maleVoicePreset: preset.id,
      pitch: preset.pitch,
      rate: preset.rate,
      geminiVoice: preset.geminiVoice,
      engineMode: preset.engineMode,
    });
  };

  const handlePreviewPreset = (e: React.MouseEvent, preset: MalePresetConfig) => {
    e.stopPropagation();
    handleSelectPreset(preset);
    setTimeout(() => {
      onTestVoice();
    }, 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] font-sans text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-base text-cyan-300 tracking-wider">
              JARVIS MALE VOICE & AUDIO CONFIGURATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs overflow-y-auto pr-1">
          {/* New Male Voice Personas Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-hud tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-cyan-300">
                  MALE VOICE PERSONAS (नई पुरुष आवाजें)
                </span>
              </label>
              <span className="text-[10px] text-cyan-400/80 font-mono">
                {MALE_VOICE_PRESETS.length} MALE TIMBRES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MALE_VOICE_PRESETS.map((preset) => {
                const isSelected =
                  settings.maleVoicePreset === preset.id ||
                  (!settings.maleVoicePreset && preset.id === 'jarvis-deep-male');

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="font-hud font-bold text-xs text-cyan-300">
                          {preset.title}
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-cyan-400/90 font-medium mb-1">
                        {preset.hindiTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {preset.description}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        {preset.engineMode === 'gemini-tts' ? 'Neural AI' : 'Native Hindi'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handlePreviewPreset(e, preset)}
                        className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[10px] border border-cyan-500/40 flex items-center gap-1 font-mono transition-all"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>TEST</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice Engine Selector */}
          <div className="pt-2 border-t border-cyan-500/10">
            <label className="block text-slate-300 font-hud tracking-wide mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>VOICE ENGINE MODE (आवाज़ इंजन)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateSettings({ engineMode: 'browser-native' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.engineMode === 'browser-native'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-hud font-semibold text-xs mb-1 text-cyan-300">
                  Native Hindi Male Voice
                </div>
                <div className="text-[11px] text-slate-400">
                  Local browser speech synthesis (Instant latency, deep tone)
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ engineMode: 'gemini-tts' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.engineMode === 'gemini-tts'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-hud font-semibold text-xs mb-1 text-cyan-300">
                  Gemini Neural Male
                </div>
                <div className="text-[11px] text-slate-400">
                  Cloud AI TTS (Charon & Fenrir deep baritone male)
                </div>
              </button>
            </div>
          </div>

          {/* Browser Voice Selection (if native mode) */}
          {settings.engineMode === 'browser-native' && (
            <div>
              <label className="block text-slate-300 font-hud tracking-wide mb-1.5 flex items-center justify-between">
                <span>SYSTEM HINDI VOICE (सिस्टम आवाज)</span>
                {hindiVoices.length > 0 && (
                  <span className="text-[10px] text-emerald-400">
                    {hindiVoices.length} Hindi Voice(s) Found
                  </span>
                )}
              </label>
              <select
                value={settings.nativeVoiceURI}
                onChange={(e) => onUpdateSettings({ nativeVoiceURI: e.target.value })}
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2 text-slate-200 text-xs focus:border-cyan-400 outline-none"
              >
                <option value="">-- सर्वश्रेष्ठ हिंदी पुरुष आवाज़ (Auto-Detect Male) --</option>
                {hindiVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    🇮🇳 {v.name} ({v.lang})
                  </option>
                ))}
                <option disabled>--- अन्य उपलब्ध आवाजें ---</option>
                {availableVoices
                  .filter((v) => !hindiVoices.includes(v))
                  .slice(0, 15)
                  .map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Gemini Voice Selection (if gemini mode) */}
          {settings.engineMode === 'gemini-tts' && (
            <div>
              <label className="block text-slate-300 font-hud tracking-wide mb-1.5">
                NEURAL MALE TIMBRE (न्यूरल पुरुष टोन)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Charon', name: 'Charon (गंभीर पुरुष आवाज)', desc: 'Deep & Authoritative' },
                  { id: 'Fenrir', name: 'Fenrir (गर्म व मजबूत)', desc: 'Resonant Baritone' },
                  { id: 'Puck', name: 'Puck (उत्साही पुरुष)', desc: 'Clear & Energetic' },
                  { id: 'Zephyr', name: 'Zephyr (शांत पुरुष)', desc: 'Calm & Warm' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onUpdateSettings({ geminiVoice: v.id as any })}
                    className={`p-2 rounded-lg border text-left text-xs transition-all ${
                      settings.geminiVoice === v.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-[10px] text-slate-500">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice Tuning Sliders: Pitch, Speed */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-cyan-500/10">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">PITCH (आवाज़ का भारीपन)</span>
                <span className="font-tech text-cyan-300">{settings.pitch.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.65"
                max="1.15"
                step="0.02"
                value={settings.pitch}
                onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">कम मान = गहरा पुरुष स्वर (JARVIS Male)</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">SPEED RATE (बोलने की गति)</span>
                <span className="font-tech text-cyan-300">{settings.rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={settings.rate}
                onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">1.0x सामान्य प्राकृतिक गति है</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-cyan-500/10">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">उत्तर मिलते ही अपने आप आवाज़ में बोलें (Auto-Speak)</span>
              <input
                type="checkbox"
                checked={settings.autoSpeakResponse}
                onChange={(e) => onUpdateSettings({ autoSpeakResponse: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">साई-फाई साउंड इफेक्ट्स (Sound FX)</span>
              <input
                type="checkbox"
                checked={settings.soundEffectsEnabled}
                onChange={(e) => onUpdateSettings({ soundEffectsEnabled: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-cyan-500/20 shrink-0">
          <button
            type="button"
            onClick={onTestVoice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-tech text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <Volume2 className="w-4 h-4" />
            <span>TEST MALE VOICE (आवाज़ टेस्ट करें)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-semibold text-xs tracking-wider transition-all"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
