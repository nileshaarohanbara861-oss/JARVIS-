// Audio-to-Audio and Hindi Speech Service for JARVIS Desktop
import { VoiceSettings, MaleVoicePreset } from '../types';

export interface MalePresetConfig {
  id: MaleVoicePreset;
  title: string;
  hindiTitle: string;
  description: string;
  pitch: number;
  rate: number;
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck' | 'Zephyr';
  engineMode: 'browser-native' | 'gemini-tts';
}

export const MALE_VOICE_PRESETS: MalePresetConfig[] = [
  {
    id: 'jarvis-deep-male',
    title: 'JARVIS Mark-85 (Classic Deep Male)',
    hindiTitle: 'मार्क-85 क्लासिक गंभीर पुरुष (नया)',
    description: 'Paul Bettany inspired deep, calm, authoritative AI male voice',
    pitch: 0.78,
    rate: 0.98,
    geminiVoice: 'Charon',
    engineMode: 'browser-native',
  },
  {
    id: 'fenrir-neural',
    title: 'Stark Fenrir Neural (Deep Baritone)',
    hindiTitle: 'स्टार्क फ़ेनरिर न्यूरल (बारीटोन)',
    description: 'Rich, high-fidelity neural AI male voice with deep baritone tone',
    pitch: 0.82,
    rate: 1.0,
    geminiVoice: 'Fenrir',
    engineMode: 'gemini-tts',
  },
  {
    id: 'hindi-authentic-male',
    title: 'Hemant / Madhur (Pure Hindi Male)',
    hindiTitle: 'हेमंत / मधुर (शुद्ध हिंदी पुरुष)',
    description: 'Authentic Indian Hindi male timbre for fluent everyday Hindi speech',
    pitch: 0.86,
    rate: 1.02,
    geminiVoice: 'Puck',
    engineMode: 'browser-native',
  },
  {
    id: 'charon-deep',
    title: 'Charon Tactical (Deep Bass Male)',
    hindiTitle: 'कैरन टैक्टिकल (डीप बास पुरुष)',
    description: 'Ultra-deep bass military intelligence male tone for security & HUD',
    pitch: 0.72,
    rate: 0.95,
    geminiVoice: 'Charon',
    engineMode: 'gemini-tts',
  },
  {
    id: 'stark-baritone',
    title: 'Stark Commander (Warm Baritone)',
    hindiTitle: 'स्टार्क कमांडर (गर्म बारीटोन)',
    description: 'Smooth, friendly, commanding male tone for desktop operations',
    pitch: 0.84,
    rate: 1.04,
    geminiVoice: 'Fenrir',
    engineMode: 'browser-native',
  },
  {
    id: 'orion-crisp-male',
    title: 'Orion Tech Male (Modern Fast AI)',
    hindiTitle: 'ओरियन टेक मेल (आधुनिक पुरुष)',
    description: 'Crisp, articulate modern tech assistant voice with clear pronunciation',
    pitch: 0.92,
    rate: 1.08,
    geminiVoice: 'Puck',
    engineMode: 'browser-native',
  },
];

export class JarvisVoiceService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private onFrequencyDataCallback?: (freqArray: Uint8Array) => void;
  private animationFrameId?: number;

  constructor() {
    this.initAudioContext();
    this.initSpeechSynthesis();
  }

  public initAudioContext() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !this.audioCtx) {
        this.audioCtx = new AudioCtx();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  public getAudioContext(): AudioContext | null {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  // Visualizer loop hook
  public startVisualizerLoop(callback: (freqArray: Uint8Array) => void) {
    this.onFrequencyDataCallback = callback;
    const dataArray = new Uint8Array(this.analyser ? this.analyser.frequencyBinCount : 64);

    const update = () => {
      if (this.analyser && this.onFrequencyDataCallback) {
        this.analyser.getByteFrequencyData(dataArray);
        this.onFrequencyDataCallback(dataArray);
      }
      this.animationFrameId = requestAnimationFrame(update);
    };
    update();
  }

  public stopVisualizerLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  // --- Web Speech Voices Discovery ---
  private initSpeechSynthesis() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      this.cachedVoices = window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0 && typeof window !== 'undefined' && window.speechSynthesis) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  // Specifically locate Hindi voices, prioritizing male timbre
  public getHindiVoices(): SpeechSynthesisVoice[] {
    const all = this.getAvailableVoices();
    const hindiVoices = all.filter(
      (v) =>
        v.lang.toLowerCase().includes('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('hemant') ||
        v.name.toLowerCase().includes('madhur')
    );
    return hindiVoices;
  }

  public getBestHindiMaleVoice(preferredURI?: string, preset?: MaleVoicePreset): SpeechSynthesisVoice | null {
    const all = this.getAvailableVoices();
    if (preferredURI) {
      const match = all.find((v) => v.voiceURI === preferredURI);
      if (match) return match;
    }

    const femaleBlacklist = [
      'female',
      'zira',
      'swara',
      'kalpana',
      'priya',
      'samantha',
      'victoria',
      'karen',
      'catherine',
      'heera',
      'veena',
      'anjali',
      'pooja',
    ];
    const isFemale = (v: SpeechSynthesisVoice) => {
      const n = (v.name + ' ' + v.voiceURI).toLowerCase();
      return femaleBlacklist.some((f) => n.includes(f));
    };

    // 1. First priority: Hindi language voices with male hints
    const hindi = this.getHindiVoices();
    const hindiMale = hindi.find(
      (v) =>
        !isFemale(v) &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('hemant') ||
          v.name.toLowerCase().includes('madhur') ||
          v.name.toLowerCase().includes('guy') ||
          v.name.toLowerCase().includes('man'))
    );
    if (hindiMale) return hindiMale;

    // Any Hindi voice that isn't explicitly female
    const anyHindiNonFemale = hindi.find((v) => !isFemale(v));
    if (anyHindiNonFemale) return anyHindiNonFemale;
    if (hindi.length > 0) return hindi[0];

    // 2. Fallback: Indian English male voice (sounds natural and fluent with Hindi/Hinglish)
    const indianEnglishMale = all.find(
      (v) =>
        v.lang.toLowerCase().includes('en-in') &&
        !isFemale(v) &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('prabhat') ||
          v.name.toLowerCase().includes('ravi'))
    );
    if (indianEnglishMale) return indianEnglishMale;

    // 3. Fallback: British / UK Male voice for classic deep JARVIS AI timbre
    const ukMale = all.find(
      (v) =>
        (v.lang.toLowerCase().includes('en-gb') || v.lang.toLowerCase().includes('en-uk')) &&
        !isFemale(v) &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('arthur') ||
          v.name.toLowerCase().includes('oliver'))
    );
    if (ukMale) return ukMale;

    // 4. Any male voice
    const anyMale = all.find(
      (v) =>
        !isFemale(v) &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('guy') ||
          v.name.toLowerCase().includes('david'))
    );
    if (anyMale) return anyMale;

    // 5. Default
    return all.find((v) => !isFemale(v)) || all[0] || null;
  }

  // --- Voice Playback: Native Web Speech ---
  public speakWithBrowserVoice(
    text: string,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd?.();
        return resolve();
      }

      window.speechSynthesis.cancel();

      // Clean markdown tags for spoken clarity
      const cleanSpoken = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanSpoken);
      const voice = this.getBestHindiMaleVoice(settings.nativeVoiceURI, settings.maleVoicePreset);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'hi-IN';
      } else {
        utterance.lang = 'hi-IN';
      }

      // Fine-tuned deep male pitch and rate
      const preset = MALE_VOICE_PRESETS.find((p) => p.id === settings.maleVoicePreset);
      const targetPitch = settings.pitch ?? preset?.pitch ?? 0.78;
      const targetRate = settings.rate ?? preset?.rate ?? 0.98;

      utterance.pitch = Math.max(0.65, Math.min(1.2, targetPitch));
      utterance.rate = Math.max(0.75, Math.min(1.4, targetRate));
      utterance.volume = Math.max(0.1, Math.min(1.0, settings.volume));

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  // --- Voice Playback: Gemini PCM/Audio Buffer ---
  public async playRawAudioBase64(
    base64Data: string,
    sampleRate: number = 24000,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx) {
      onEnd?.();
      return;
    }

    try {
      this.stopCurrentSpeech();

      // Binary string decode
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      let audioBuffer: AudioBuffer;

      // Check if it's raw 16-bit PCM (standard from Gemini Live/TTS) or container
      const isPCM = !base64Data.startsWith('RIFF') && !base64Data.startsWith('OggS');
      if (isPCM) {
        // Decode 16-bit signed PCM to Float32
        const pcm16 = new Int16Array(bytes.buffer);
        audioBuffer = ctx.createBuffer(1, pcm16.length, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < pcm16.length; i++) {
          channelData[i] = pcm16[i] / 32768.0;
        }
      } else {
        audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.analyser) {
        source.connect(this.analyser);
        this.analyser.connect(ctx.destination);
      } else {
        source.connect(ctx.destination);
      }

      this.activeSource = source;

      source.onended = () => {
        this.activeSource = null;
        onEnd?.();
      };

      onStart?.();
      source.start();
    } catch (err) {
      console.warn("Error playing raw audio buffer:", err);
      onEnd?.();
    }
  }

  public stopCurrentSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch {}
      this.activeSource = null;
    }
  }

  // --- Speech-to-Text (Microphone Recognition) ---
  public startSpeechRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError('आपके ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया टाइप करें।');
      return false;
    }

    try {
      this.stopSpeechRecognition();

      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      // Primary Hindi recognition with fallback
      this.recognition.lang = 'hi-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onResult(text, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn("SpeechRecognition error:", event.error);
        if (event.error !== 'no-speech') {
          onError(`माइक त्रुटि: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      console.warn("SpeechRec start failure:", e);
      onError(e?.message || 'माइक प्रारंभ नहीं हो सका');
      return false;
    }
  }

  public stopSpeechRecognition() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const jarvisVoice = new JarvisVoiceService();
