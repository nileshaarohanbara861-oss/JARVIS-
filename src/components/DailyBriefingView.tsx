import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, RefreshCw, Sparkles, SunMedium, Compass } from 'lucide-react';
import { UserProfile, TaskItem } from '../types';

interface DailyBriefingViewProps {
  briefingMarkdown: string;
  spokenText: string;
  isLoading: boolean;
  onRefresh: () => void;
  onReadAloud: (text: string) => void;
  userProfile: UserProfile;
  pendingTasks: TaskItem[];
}

export const DailyBriefingView: React.FC<DailyBriefingViewProps> = ({
  briefingMarkdown,
  spokenText,
  isLoading,
  onRefresh,
  onReadAloud,
  userProfile,
  pendingTasks,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none font-sans text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <SunMedium className="w-4 h-4 text-amber-400" />
          <span className="font-hud text-xs tracking-wider text-cyan-300">
            PERSONAL EXECUTIVE BRIEFING (दैनिक ब्रीफिंग)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onReadAloud(spokenText || briefingMarkdown)}
            disabled={isLoading || !briefingMarkdown}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 disabled:opacity-40 text-xs font-tech transition-all"
            title="जार्विस से पूरी ब्रीफिंग सुनें"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>PLAY AUDIO</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-cyan-500/30 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all"
            title="ताजा ब्रीफिंग तैयार करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Briefing Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 font-tech text-cyan-300">
            <Sparkles className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs">
              जार्विस आपके शहर ({userProfile.city}) और दैनिक कार्यों का विश्लेषण कर रहा है...
            </p>
          </div>
        ) : briefingMarkdown ? (
          <div className="prose prose-invert prose-cyan max-w-none text-xs sm:text-sm leading-relaxed space-y-3">
            <ReactMarkdown>{briefingMarkdown}</ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs font-tech space-y-3">
            <Compass className="w-8 h-8 text-cyan-500/30" />
            <p>आज की दैनिक ब्रीफिंग अभी लोड नहीं हुई है।</p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              ब्रीफिंग तैयार करें (GENERATE NOW)
            </button>
          </div>
        )}
      </div>

      {/* Footer Info Pill */}
      <div className="px-4 py-2 border-t border-cyan-500/10 bg-slate-950/60 flex items-center justify-between text-[11px] font-tech text-slate-400">
        <span>स्थान: {userProfile.city}</span>
        <span>लंबित कार्य: {pendingTasks.filter((t) => !t.completed).length}</span>
        <span>मान: {userProfile.name} ({userProfile.honorific})</span>
      </div>
    </div>
  );
};
