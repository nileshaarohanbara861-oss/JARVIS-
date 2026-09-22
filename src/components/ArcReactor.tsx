import React, { useEffect, useRef } from 'react';
import { JarvisStatus } from '../types';
import { Mic, Volume2, Cpu, Radio } from 'lucide-react';

interface ArcReactorProps {
  status: JarvisStatus;
  onCoreClick: () => void;
  frequencyData: Uint8Array;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  status,
  onCoreClick,
  frequencyData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationAngleRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Speed of rotation depends on status
      let rotSpeed = 0.005;
      if (status === 'processing') rotSpeed = 0.035;
      if (status === 'speaking') rotSpeed = 0.018;
      if (status === 'listening') rotSpeed = 0.012;
      rotationAngleRef.current += rotSpeed;
      const angle = rotationAngleRef.current;

      // Color scheme based on state
      let primaryColor = 'rgba(6, 182, 212, '; // Cyan default
      let glowColor = 'rgba(6, 182, 212, 0.4)';
      let coreColor = '#06b6d4';

      if (status === 'listening') {
        primaryColor = 'rgba(56, 189, 248, '; // Bright Sky Blue
        glowColor = 'rgba(56, 189, 248, 0.6)';
        coreColor = '#38bdf8';
      } else if (status === 'processing') {
        primaryColor = 'rgba(245, 158, 11, '; // Amber/Gold Iron Man
        glowColor = 'rgba(245, 158, 11, 0.6)';
        coreColor = '#f59e0b';
      } else if (status === 'speaking') {
        primaryColor = 'rgba(14, 165, 233, '; // Electric Cyan/Blue
        glowColor = 'rgba(14, 165, 233, 0.7)';
        coreColor = '#38bdf8';
      }

      // Calculate audio energy
      let audioEnergy = 0;
      if (frequencyData && frequencyData.length > 0) {
        let sum = 0;
        const count = Math.min(frequencyData.length, 32);
        for (let i = 0; i < count; i++) {
          sum += frequencyData[i];
        }
        audioEnergy = sum / (count * 255); // 0.0 to 1.0
      }

      const pulseOffset = Math.sin(Date.now() / 300) * 3 + (audioEnergy * 14);

      // 1. Outermost Ambient Holographic Glow Circle
      const baseOuterRadius = 140;
      const outerRadius = baseOuterRadius + pulseOffset;

      ctx.save();
      const grad = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, outerRadius + 20);
      grad.addColorStop(0, primaryColor + '0.15)');
      grad.addColorStop(0.6, primaryColor + '0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Frequency Audio Visualizer Bars (Circular)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.5);

      const numBars = 48;
      const barBaseRadius = 110;
      for (let i = 0; i < numBars; i++) {
        const theta = (i / numBars) * Math.PI * 2;
        const freqIndex = Math.floor((i / numBars) * (frequencyData.length / 2));
        const rawFreq = frequencyData[freqIndex] || 0;
        const barHeight = 4 + (rawFreq / 255) * 32 + (status === 'speaking' ? Math.random() * 8 : 0);

        const x1 = Math.cos(theta) * barBaseRadius;
        const y1 = Math.sin(theta) * barBaseRadius;
        const x2 = Math.cos(theta) * (barBaseRadius + barHeight);
        const y2 = Math.sin(theta) * (barBaseRadius + barHeight);

        ctx.strokeStyle = primaryColor + (0.3 + (barHeight / 40) * 0.7) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Segmented Tech Outer Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle);
      ctx.strokeStyle = primaryColor + '0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Tick Marks / Coordinate Compass Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.8);
      const totalTicks = 36;
      for (let i = 0; i < totalTicks; i++) {
        const rad = (i / totalTicks) * Math.PI * 2;
        const isMajor = i % 9 === 0;
        const r1 = 88;
        const r2 = isMajor ? 78 : 83;

        ctx.strokeStyle = isMajor ? primaryColor + '0.9)' : primaryColor + '0.3)';
        ctx.lineWidth = isMajor ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * r1, Math.sin(rad) * r1);
        ctx.lineTo(Math.cos(rad) * r2, Math.sin(rad) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Secondary Inner Geometric Ring with Triangles
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 1.4);
      ctx.strokeStyle = primaryColor + '0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([30, 20]);
      ctx.beginPath();
      ctx.arc(0, 0, 72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 6. Arc Reactor Core Glowing Center
      const coreRadius = 46 + (pulseOffset * 0.4);
      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = glowColor;

      // Core Glass Backing
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreRadius);
      coreGrad.addColorStop(0, primaryColor + '0.9)');
      coreGrad.addColorStop(0.5, primaryColor + '0.3)');
      coreGrad.addColorStop(1, primaryColor + '0.05)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core Outer Ring
      ctx.strokeStyle = primaryColor + '0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Core Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [status, frequencyData]);

  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return {
          label: 'सुन रहा हूँ... (LISTENING)',
          color: 'text-cyan-300 border-cyan-400 bg-cyan-950/40 animate-pulse',
          icon: Mic,
        };
      case 'processing':
        return {
          label: 'सोच रहा हूँ... (PROCESSING)',
          color: 'text-amber-300 border-amber-400 bg-amber-950/40 animate-pulse',
          icon: Cpu,
        };
      case 'speaking':
        return {
          label: 'बोल रहा हूँ... (SPEAKING)',
          color: 'text-sky-300 border-sky-400 bg-sky-950/40',
          icon: Volume2,
        };
      default:
        return {
          label: 'जार्विस तैयार है (ONLINE / STANDBY)',
          color: 'text-cyan-400/80 border-cyan-500/30 bg-cyan-950/20',
          icon: Radio,
        };
    }
  };

  const badge = getStatusBadge();
  const Icon = badge.icon;

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      {/* Reactor Canvas Container */}
      <div 
        id="jarvis-arc-reactor-core"
        onClick={onCoreClick}
        className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
        title="क्लिक करें या स्पेसबार दबाएं जार्विस से बात करने के लिए"
      >
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        />

        {/* Center Interactive Overlay Icon / Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-950/60 backdrop-blur-sm border border-cyan-500/50 shadow-inner">
            {status === 'listening' ? (
              <Mic className="w-7 h-7 text-cyan-300 animate-bounce" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-7 h-7 text-sky-300 animate-pulse" />
            ) : status === 'processing' ? (
              <Cpu className="w-7 h-7 text-amber-400 animate-spin" />
            ) : (
              <span className="font-hud font-bold text-lg text-cyan-300 tracking-wider">
                J
              </span>
            )}
          </div>
          <span className="mt-2 text-[10px] font-tech text-cyan-300/80 tracking-widest uppercase">
            {status === 'listening' ? 'MIC LIVE' : 'CLICK TO TALK'}
          </span>
        </div>
      </div>

      {/* Status Pill */}
      <div 
        id="jarvis-status-badge"
        className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-hud tracking-wider backdrop-blur-md transition-all ${badge.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{badge.label}</span>
      </div>

      <div className="text-[11px] font-tech text-cyan-400/50 mt-1.5 tracking-widest">
        MARK-85 HINDI NEURAL INTERFACE
      </div>
    </div>
  );
};
