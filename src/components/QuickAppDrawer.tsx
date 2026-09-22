import React from 'react';
import { APP_REGISTRY, AppDefinition } from '../services/appLauncher';
import { ExternalLink, Compass } from 'lucide-react';

interface QuickAppDrawerProps {
  onLaunchApp: (app: AppDefinition) => void;
}

export const QuickAppDrawer: React.FC<QuickAppDrawerProps> = ({ onLaunchApp }) => {
  return (
    <div className="w-full flex items-center justify-between gap-1 overflow-x-auto py-1 px-1 text-xs select-none">
      <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
        <span className="text-[10px] font-tech text-cyan-400/70 uppercase tracking-wider flex items-center gap-1 px-1">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>DESKTOP APPS:</span>
        </span>

        {APP_REGISTRY.slice(0, 9).map((app) => (
          <button
            key={app.id}
            onClick={() => onLaunchApp(app)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:bg-cyan-950/50 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 transition-all font-tech text-[11px] shadow-sm group"
            title={`${app.name} (${app.hindiName}) खोलें`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
              style={{ backgroundColor: app.iconColor }}
            />
            <span>{app.name}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-300 opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
};
