import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Flame, Coffee } from 'lucide-react';

interface FocusTimerProps {
  onTimerComplete: (durationMinutes: number) => void;
  onAnnounceTimer: (minutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onTimerComplete,
  onAnnounceTimer,
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');

  // Countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      onTimerComplete(Math.round(totalSeconds / 60));
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, totalSeconds, onTimerComplete]);

  const startPreset = (minutes: number, mode: 'work' | 'break') => {
    setIsRunning(false);
    setTimerMode(mode);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(true);
    onAnnounceTimer(minutes);
  };

  const toggleRun = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-between h-full p-6 select-none font-sans text-slate-200">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-cyan-400" />
          <span className="font-hud text-xs tracking-wider text-cyan-300">
            NEURAL FOCUS TIMER (एकाग्रता टाइमर)
          </span>
        </div>
        <span className="text-xs font-tech text-cyan-400/80 uppercase">
          {timerMode === 'work' ? '🔥 FOCUS SESSION' : '☕ REST BREAK'}
        </span>
      </div>

      {/* Circular HUD Timer Gauge */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <svg className="w-56 h-56 -rotate-90 transform">
          <circle
            cx="112"
            cy="112"
            r="94"
            className="text-slate-900 stroke-current"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="112"
            cy="112"
            r="94"
            className="text-cyan-400 stroke-current transition-all duration-1000 ease-linear"
            strokeWidth="8"
            strokeDasharray={590}
            strokeDashoffset={590 - (590 * progressPct) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-hud font-bold text-4xl text-cyan-200 tracking-wider hud-glow">
            {timeFormatted}
          </span>
          <span className="font-tech text-xs text-cyan-400/70 mt-1">
            {isRunning ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={toggleRun}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-hud font-semibold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'PAUSE' : 'START'}</span>
        </button>

        <button
          onClick={reset}
          className="p-2.5 rounded-xl border border-cyan-500/30 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all"
          title="रीसेट करें"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-tech">
        <button
          onClick={() => startPreset(25, 'work')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-slate-900/60 hover:bg-cyan-950/40 text-cyan-300 transition-all"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>25 MIN (WORK)</span>
        </button>

        <button
          onClick={() => startPreset(15, 'work')}
          className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-slate-900/60 hover:bg-cyan-950/40 text-cyan-300 transition-all"
        >
          <span>15 MIN (SPRINT)</span>
        </button>

        <button
          onClick={() => startPreset(5, 'break')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-slate-900/60 hover:bg-cyan-950/40 text-sky-300 transition-all"
        >
          <Coffee className="w-3.5 h-3.5 text-sky-400" />
          <span>5 MIN (BREAK)</span>
        </button>
      </div>
    </div>
  );
};
