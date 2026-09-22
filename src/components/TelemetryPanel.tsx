import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Activity, Terminal, CheckCircle2, CloudRain } from 'lucide-react';
import { JarvisStatus } from '../types';

interface TelemetryPanelProps {
  status: JarvisStatus;
  frequencyData: Uint8Array;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  status,
  frequencyData,
}) => {
  const [cpuVal, setCpuVal] = useState<number>(18);
  const [memVal, setMemVal] = useState<number>(4.2);
  const [latencyVal, setLatencyVal] = useState<number>(38);

  // Dynamic telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      let targetCpu = 15 + Math.random() * 8;
      if (status === 'processing') targetCpu = 78 + Math.random() * 15;
      if (status === 'speaking') targetCpu = 42 + Math.random() * 12;
      if (status === 'listening') targetCpu = 35 + Math.random() * 10;
      setCpuVal(Math.round(targetCpu));

      setMemVal(+(4.1 + Math.random() * 0.4).toFixed(1));
      setLatencyVal(Math.round(28 + Math.random() * 14));
    }, 1200);

    return () => clearInterval(interval);
  }, [status]);

  // Derive average audio frequency level
  const audioLevel = frequencyData && frequencyData.length > 0
    ? Math.round((frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255) * 100)
    : 0;

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-3 font-tech select-none">
      {/* System Telemetry Box */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-md p-3.5 box-glow-cyan">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
          <div className="flex items-center gap-2 text-cyan-300 font-hud text-xs tracking-wider">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>SYSTEM DIAGNOSTICS</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            SYNCED
          </span>
        </div>

        {/* CPU Bar */}
        <div className="space-y-1 mb-2.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> NEURAL PROCESSOR
            </span>
            <span className="text-cyan-300 font-bold">{cpuVal}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/10">
            <div
              className={`h-full transition-all duration-500 ${
                cpuVal > 70 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${cpuVal}%` }}
            />
          </div>
        </div>

        {/* Memory Bar */}
        <div className="space-y-1 mb-2.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> MEMORY BUFFER
            </span>
            <span className="text-cyan-300 font-bold">{memVal} GB / 16 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/10">
            <div
              className="h-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${(memVal / 16) * 100}%` }}
            />
          </div>
        </div>

        {/* Network & Latency */}
        <div className="flex justify-between items-center text-xs pt-1 border-t border-cyan-500/10 text-slate-400">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" /> LATENCY
          </span>
          <span className="text-emerald-400 font-bold">{latencyVal} ms</span>
        </div>
      </div>

      {/* Real-time Oscilloscope / Frequency Spectrum */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-md p-3.5 box-glow-cyan">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2.5">
          <span className="text-cyan-300 font-hud text-xs tracking-wider">
            AUDIO SPECTRUM
          </span>
          <span className="text-[10px] text-cyan-400/80">
            LEVEL: {audioLevel}%
          </span>
        </div>

        {/* Mini Frequency EQ Bars */}
        <div className="h-14 flex items-end gap-1 px-1 py-1 bg-slate-900/40 rounded border border-cyan-500/10">
          {Array.from({ length: 20 }).map((_, idx) => {
            const freq = frequencyData[idx * 2] || 0;
            const barPct = Math.min(100, Math.max(8, (freq / 255) * 100));
            return (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-cyan-600 via-cyan-400 to-sky-200 rounded-t transition-all duration-75"
                style={{ height: `${barPct}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
          <span>60 Hz</span>
          <span>1 kHz</span>
          <span>16 kHz</span>
        </div>
      </div>

      {/* Core Protocol Checklist */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-md p-3.5 box-glow-cyan">
        <div className="flex items-center gap-1.5 text-cyan-300 font-hud text-xs tracking-wider mb-2.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>NEURAL SUBSYSTEMS</span>
        </div>

        <ul className="space-y-1.5 text-xs">
          <li className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> हिंदी वॉइस इंजन
            </span>
            <span className="text-cyan-300 text-[11px]">ACTIVE</span>
          </li>
          <li className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> GEMINI 3.8 FLASH
            </span>
            <span className="text-emerald-400 text-[11px]">ONLINE</span>
          </li>
          <li className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> MALE TIMBRE CALIBRATION
            </span>
            <span className="text-cyan-300 text-[11px]">CHARON/0.88</span>
          </li>
          <li className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> AUDIO-TO-AUDIO PIPELINE
            </span>
            <span className="text-cyan-300 text-[11px]">READY</span>
          </li>
        </ul>
      </div>

      {/* Desktop Environment / Weather Sensor Card */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-md p-3 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> वातावरण / ENVIRONMENT
          </span>
          <span className="text-slate-400 text-[11px]">DESKTOP HUD</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-slate-200">
          <span>तापमान: 26°C</span>
          <span className="text-cyan-300">वायु गुणवत्ता: उत्तम</span>
        </div>
      </div>
    </aside>
  );
};
