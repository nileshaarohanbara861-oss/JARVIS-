import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Fingerprint,
  Mic,
  KeyRound,
  BatteryCharging,
  Wifi,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { jarvisAudioFx } from '../services/soundEffects';

interface DeviceLockScreenProps {
  userHonorific: string;
  userName: string;
  onUnlock: () => void;
  onSpeak: (text: string) => void;
}

export const DeviceLockScreen: React.FC<DeviceLockScreenProps> = ({
  userHonorific,
  userName,
  onUnlock,
  onSpeak,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [showPinPad, setShowPinPad] = useState<boolean>(false);
  const [isScanningBiometric, setIsScanningBiometric] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [securityMessage, setSecurityMessage] = useState<string>(
    'STARK SECURITY SYSTEM: DEVICE LOCKED (डिवाइस लॉक है)'
  );
  const [pinError, setPinError] = useState<boolean>(false);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('hi-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Biometric Scan Handler
  const handleBiometricScan = () => {
    if (isScanningBiometric) return;
    jarvisAudioFx.playAcknowledge();
    setIsScanningBiometric(true);
    setSecurityMessage('बायोमेट्रिक पहचान सत्यापित की जा रही है...');
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          triggerUnlock('बायोमेट्रिक प्रमाणीकरण सफल');
        }, 200);
      }
    }, 150);
  };

  // Trigger Successful Unlock
  const triggerUnlock = (reason: string) => {
    jarvisAudioFx.playUnlockChime();
    setSecurityMessage(`${reason}। डिवाइस अनलॉक हो गया!`);
    const spoken = `डिवाइस अनलॉक कर दिया गया है। स्वागत है ${userHonorific}!`;
    onSpeak(spoken);
    setTimeout(() => {
      onUnlock();
    }, 600);
  };

  // PIN verification
  const handlePinSubmit = (digit: string) => {
    jarvisAudioFx.playClick();
    if (pinInput.length < 4) {
      const newPin = pinInput + digit;
      setPinInput(newPin);

      if (newPin.length === 4) {
        // Accept 3000, 0000, 1234 or any 4-digit master code
        if (newPin === '3000' || newPin === '0000' || newPin === '1234') {
          triggerUnlock('पिन कोड सत्यापित');
        } else {
          setPinError(true);
          setSecurityMessage('अमान्य पिन कोड! पुनः प्रयास करें (मास्टर कोड: 3000 / 0000)');
          jarvisAudioFx.playDeactivate();
          setTimeout(() => {
            setPinInput('');
            setPinError(false);
          }, 1000);
        }
      }
    }
  };

  const handleClearPin = () => {
    jarvisAudioFx.playClick();
    setPinInput('');
  };

  // Voice Command Unlock on Lock Screen
  const handleVoiceUnlock = () => {
    jarvisAudioFx.playWakeChime();
    setSecurityMessage('वॉयस अनलॉक: कहिए "जार्विस अनलॉक करो"...');

    // Simulate instant voice recognition or trigger recognition
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript.toLowerCase();
          if (
            text.includes('अनलॉक') ||
            text.includes('unlock') ||
            text.includes('kholo') ||
            text.includes('open')
          ) {
            triggerUnlock('वॉयस कमांड स्वीकृत');
          } else {
            setSecurityMessage(`कहा गया: "${text}" (अनलॉक करने के लिए "अनलॉक करो" कहें)`);
          }
        };
        recognition.onerror = () => {
          // If error or canceled, provide fallback one-click voice unlock
          triggerUnlock('वॉयस अथेंटिकेशन सफल');
        };
        recognition.start();
      } catch {
        triggerUnlock('वॉयस अथेंटिकेशन सफल');
      }
    } else {
      triggerUnlock('वॉयस अथेंटिकेशन सफल');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-950/95 text-slate-100 backdrop-blur-3xl select-none animate-in fade-in duration-300">
      {/* Background Cybernetic Radar FX */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-cyan-500/30 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-dashed border-red-500/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-cyan-400/40" />
      </div>

      {/* Top Status Bar */}
      <div className="w-full max-w-md flex items-center justify-between text-xs font-tech text-cyan-400/80 z-10 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-red-400 font-semibold tracking-wider">DEFENSE PROTOCOL: LOCK</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" /> 5G SECURE
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <BatteryCharging className="w-3.5 h-3.5" /> 100%
          </span>
        </div>
      </div>

      {/* Central Holographic Time & Security Display */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-lg w-full">
        {/* Pulsing Arc Reactor / Padlock */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-cyan-400/60 flex items-center justify-center bg-slate-900/80 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
            <Lock className="w-10 h-10 text-cyan-300 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-full border border-cyan-500/30 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute -inset-4 rounded-full border border-red-500/20" />
        </div>

        {/* Live Digital Clock */}
        <div className="font-hud text-5xl sm:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-cyan-300 to-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
          {currentTime || '00:00:00'}
        </div>

        {/* Hindi Date */}
        <div className="mt-2 text-sm sm:text-base font-sans text-cyan-200/90 font-medium">
          {currentDate}
        </div>

        {/* User Identity Banner */}
        <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-tech text-cyan-300 flex items-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>सुरक्षित स्वामी: <strong>{userName} ({userHonorific})</strong></span>
        </div>

        {/* Dynamic Security Telemetry */}
        <div className="mt-4 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-tech text-slate-300 max-w-sm">
          {securityMessage}
        </div>

        {/* Interactive PIN Pad Mode */}
        {showPinPad ? (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 w-64 shadow-2xl backdrop-blur-md animate-in zoom-in-95">
            <div className="text-center font-tech text-xs text-cyan-300 mb-2">
              4-DIGIT SECURITY PIN
            </div>
            {/* PIN Dots */}
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    pinInput.length > i
                      ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    if (k === 'C' || k === '⌫') {
                      handleClearPin();
                    } else {
                      handlePinSubmit(k);
                    }
                  }}
                  className="p-3 rounded-xl border border-cyan-500/20 bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 font-hud text-sm font-bold text-slate-200 transition-all active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-tech text-slate-400">
              <span>मास्टर कोड: 3000</span>
              <button
                onClick={() => setShowPinPad(false)}
                className="text-cyan-400 hover:underline"
              >
                बायोमेट्रिक पर वापस जाएँ
              </button>
            </div>
          </div>
        ) : (
          /* Biometric Fingerprint / Arc Scanner */
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="relative">
              {isScanningBiometric && (
                <div
                  className="absolute inset-0 rounded-2xl bg-cyan-400/20 border border-cyan-400 animate-pulse"
                  style={{ height: `${scanProgress}%` }}
                />
              )}
              <button
                id="btn-biometric-unlock"
                onClick={handleBiometricScan}
                className="relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-cyan-400/50 bg-slate-900/90 hover:bg-cyan-950/60 hover:border-cyan-300 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all group active:scale-95"
                title="टैप करके अनलॉक करें (Tap to Authenticate)"
              >
                <Fingerprint className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-tech text-cyan-300/80 mt-1">
                  TAP TO SCAN
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice Unlock Option */}
              <button
                id="btn-voice-unlock"
                onClick={handleVoiceUnlock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-900/70 hover:bg-cyan-950/80 text-cyan-300 text-xs font-tech transition-all"
                title="बोलकर अनलॉक करें"
              >
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>वॉयस अनलॉक</span>
              </button>

              {/* Enter PIN Option */}
              <button
                id="btn-pin-unlock"
                onClick={() => setShowPinPad(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-300 text-xs font-tech transition-all"
                title="पिन कोड दर्ज करें"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>पिन कोड</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Emergency & Quick Unlock Hint */}
      <div className="w-full max-w-md flex items-center justify-between text-xs font-tech text-slate-500 z-10 border-t border-slate-800/80 pt-3">
        <button
          onClick={() => triggerUnlock('मास्टर इमरजेंसी बाईपास')}
          className="text-cyan-400/80 hover:text-cyan-300 underline text-[11px]"
        >
          [ EMERGENCY UNLOCK ]
        </button>

        <span className="text-[11px] text-slate-400">
          बोलें: "JARVIS unlock karo"
        </span>
      </div>
    </div>
  );
};
