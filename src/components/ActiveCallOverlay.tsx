import React, { useState, useEffect, useRef } from 'react';
import { ActiveCallState, ContactItem } from '../types';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Shield, ExternalLink, MessageCircle, Radio } from 'lucide-react';
import { jarvisAudioFx } from '../services/soundEffects';
import { executeDeviceDial } from '../services/callService';

interface ActiveCallOverlayProps {
  callState: ActiveCallState;
  onEndCall: () => void;
  userHonorific: string;
}

export const ActiveCallOverlay: React.FC<ActiveCallOverlayProps> = ({
  callState,
  onEndCall,
  userHonorific,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [callPhase, setCallPhase] = useState<'dialing' | 'ringing' | 'connected'>('dialing');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const ringIntervalRef = useRef<any>(null);

  // Transition call phases: dialing (0-2s) -> ringing (2-5s) -> connected (5s+)
  useEffect(() => {
    // Initial dial blip
    jarvisAudioFx.playDialTone(1209);

    const ringTimer = setTimeout(() => {
      setCallPhase('ringing');
      jarvisAudioFx.playPhoneRing();

      ringIntervalRef.current = setInterval(() => {
        jarvisAudioFx.playPhoneRing();
      }, 3500);
    }, 1800);

    const connectTimer = setTimeout(() => {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
      }
      setCallPhase('connected');
      jarvisAudioFx.playAcknowledge();
    }, 5500);

    return () => {
      clearTimeout(ringTimer);
      clearTimeout(connectTimer);
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
      }
    };
  }, []);

  // Timer counter when connected
  useEffect(() => {
    if (callPhase !== 'connected') return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callPhase]);

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLaunchNativeDialer = () => {
    jarvisAudioFx.playClick();
    executeDeviceDial(callState.contact.phoneNumber);
  };

  const handleLaunchWhatsApp = () => {
    jarvisAudioFx.playClick();
    const cleanNumber = callState.contact.phoneNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank', 'noopener,noreferrer');
  };

  const handleHangUp = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
    }
    jarvisAudioFx.playCallEndTone();
    onEndCall();
  };

  const contact = callState.contact;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* High-tech Holographic Call Container */}
      <div className="w-full max-w-sm rounded-3xl border border-cyan-500/40 bg-slate-950/95 p-6 shadow-[0_0_60px_rgba(6,182,212,0.3)] relative overflow-hidden flex flex-col items-center text-center">
        {/* Top Decorative Tech Lines */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="flex items-center justify-between w-full mb-4 px-2 text-[10px] font-mono text-cyan-400/70 border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
            <span>STARK COMMS LINK v8.5</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">ENCRYPTED</span>
          </div>
        </div>

        {/* Contact Avatar Circle with Glowing Waves */}
        <div className="relative my-4">
          <div
            className={`absolute -inset-3 rounded-full opacity-40 blur-md ${
              callPhase === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-cyan-500 animate-ping'
            }`}
          />
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold font-hud border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            style={{ backgroundColor: contact.avatarColor || '#0284c7' }}
          >
            {contact.relationship === 'mother' ? '👩' : contact.relationship === 'father' ? '👨' : '📞'}
          </div>
        </div>

        {/* Contact Name & Relationship */}
        <h3 className="text-xl font-bold font-hud text-slate-100 mt-2 tracking-wide">
          {contact.name}
        </h3>
        <p className="text-sm font-medium text-cyan-300 mb-1">
          {contact.hindiLabel}
        </p>
        <p className="text-xs font-mono text-slate-400 tracking-wider mb-3">
          {contact.phoneNumber}
        </p>

        {/* Call Status & Duration Banner */}
        <div className="w-full py-2 px-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 mb-5 flex items-center justify-between font-mono text-xs">
          <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {callPhase === 'dialing' && 'कॉल लग रहा है (DIALING...)'}
            {callPhase === 'ringing' && 'घंटी बज रही है (RINGING...)'}
            {callPhase === 'connected' && 'कॉल कनेक्टेड (CONNECTED)'}
          </span>
          <span className="font-bold text-slate-200">
            {callPhase === 'connected' ? formatDuration(seconds) : '--:--'}
          </span>
        </div>

        {/* Native Calling App Direct Launch Bar */}
        <div className="w-full mb-5 space-y-2">
          <button
            type="button"
            onClick={handleLaunchNativeDialer}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-hud text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>फोन ऐप में खोलें (OPEN PHONE APP)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleLaunchWhatsApp}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 font-hud text-xs flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>व्हाट्सएप पर संपर्क करें (WHATSAPP)</span>
          </button>
        </div>

        {/* Interactive In-Call Control Toggles */}
        <div className="flex items-center justify-center gap-5 mb-6">
          {/* Mute toggle */}
          <button
            type="button"
            onClick={() => {
              jarvisAudioFx.playClick();
              setIsMuted(!isMuted);
            }}
            className={`p-3 rounded-full border transition-all ${
              isMuted
                ? 'bg-amber-950/60 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Speaker toggle */}
          <button
            type="button"
            onClick={() => {
              jarvisAudioFx.playClick();
              setIsSpeaker(!isSpeaker);
            }}
            className={`p-3 rounded-full border transition-all ${
              isSpeaker
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isSpeaker ? 'Speaker Active' : 'Earpiece'}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Big Red Hang Up Button */}
        <button
          type="button"
          onClick={handleHangUp}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 transition-all"
          title="End Call / कॉल काटें"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
        <span className="text-[11px] font-mono text-red-400 mt-2">
          कॉल समाप्त करें (END CALL)
        </span>
      </div>
    </div>
  );
};
