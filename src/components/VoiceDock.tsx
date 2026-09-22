import React, { useState } from 'react';
import { Mic, MicOff, Send, Square, Radio, Keyboard } from 'lucide-react';
import { JarvisStatus } from '../types';
import { QuickAppDrawer } from './QuickAppDrawer';
import { AppDefinition } from '../services/appLauncher';

interface VoiceDockProps {
  status: JarvisStatus;
  transcript: string;
  onToggleMic: () => void;
  onStopSpeech: () => void;
  onSendMessage: (text: string) => void;
  onLaunchApp?: (app: AppDefinition) => void;
  continuousListening: boolean;
  onToggleContinuous: () => void;
}

export const VoiceDock: React.FC<VoiceDockProps> = ({
  status,
  transcript,
  onToggleMic,
  onStopSpeech,
  onSendMessage,
  onLaunchApp,
  continuousListening,
  onToggleContinuous,
}) => {
  const [inputText, setInputText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const isMicActive = status === 'listening';
  const isSpeaking = status === 'speaking';

  return (
    <div className="w-full flex flex-col items-center gap-1.5 select-none">
      {/* Live Audio Transcription Bubble */}
      {transcript && (
        <div className="px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs font-tech flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse max-w-lg truncate">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-slate-400">पहचाना गया:</span>
          <span className="font-semibold text-cyan-100">"{transcript}"</span>
        </div>
      )}

      {/* Main Glass Control Dock */}
      <div className="w-full max-w-2xl px-4 py-2 rounded-2xl border border-cyan-500/30 bg-slate-950/85 backdrop-blur-xl flex items-center justify-between gap-3 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        {/* Left Side: Continuous Listen & Mode */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-continuous"
            onClick={onToggleContinuous}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-tech transition-all ${
              continuousListening
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="ऑटो कंटीन्यूअस लिसन (Always Listen Mode)"
          >
            <Radio className={`w-3.5 h-3.5 ${continuousListening ? 'animate-pulse text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">AUTO LISTEN</span>
          </button>

          {isSpeaking && (
            <button
              id="btn-stop-speech"
              onClick={onStopSpeech}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-all text-xs font-tech animate-pulse"
              title="जार्विस की आवाज रोकें (Stop Voice)"
            >
              <Square className="w-3.5 h-3.5" />
              <span>STOP</span>
            </button>
          )}
        </div>

        {/* Center: Push-To-Talk Main Audio Button */}
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Ripples when active */}
          {isMicActive && (
            <div className="absolute w-16 h-16 rounded-full bg-cyan-400/20 animate-ping pointer-events-none" />
          )}

          <button
            id="btn-jarvis-mic"
            onClick={onToggleMic}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full border transition-all duration-300 ${
              isMicActive
                ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.8)] scale-110'
                : 'bg-gradient-to-b from-cyan-950 to-slate-950 border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            }`}
            title={isMicActive ? 'माइक बंद करें' : 'माइक चालू करें (या स्पेसबार दबाएं)'}
          >
            {isMicActive ? (
              <MicOff className="w-6 h-6 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Right Side: Keyboard Typing Toggle & Text Input */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-keyboard-mode"
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-2 rounded-xl border text-xs font-tech transition-all ${
              showTextInput
                ? 'bg-cyan-950/50 border-cyan-400 text-cyan-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="कीबोर्ड टाइपिंग बॉक्स दिखाएँ/छुपाएँ"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Text Input Box */}
      {showTextInput && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-md"
        >
          <input
            id="input-jarvis-text"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="कमांड बोलें या लिखें... (उदा: 'open YouTube', 'Playstore खोलो', 'WhatsApp खोलो')"
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 font-sans"
          />
          <button
            id="btn-send-jarvis-text"
            type="submit"
            disabled={!inputText.trim()}
            className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-semibold transition-all"
            title="भेजें (Send)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Quick Desktop Apps Launcher Bar */}
      {onLaunchApp && (
        <div className="w-full max-w-2xl">
          <QuickAppDrawer onLaunchApp={onLaunchApp} />
        </div>
      )}
    </div>
  );
};
