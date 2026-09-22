export type JarvisStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export type VoiceEngineMode = 'gemini-tts' | 'browser-native';

export type JarvisTheme = 'stark-cyan' | 'iron-gold' | 'stealth-emerald';

export type ActiveHUDTab = 'chat' | 'tasks' | 'notes' | 'timer' | 'briefing' | 'contacts';

export interface ContactItem {
  id: string;
  name: string;
  hindiLabel: string;
  relationship: 'father' | 'mother' | 'family' | 'friend' | 'work' | 'emergency';
  phoneNumber: string;
  avatarColor: string;
  isSpeedDial?: boolean;
}

export interface ActiveCallState {
  contact: ContactItem;
  status: 'dialing' | 'ringing' | 'connected' | 'ended';
  startedAt: number;
  durationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
}

export interface UserProfile {
  name: string;
  honorific: string; // e.g. 'सर', 'मैम', 'बॉस', 'दोस्त'
  city: string;
  profession: string;
  customPreferences: string;
  theme: JarvisTheme;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'ideas' | 'code' | 'todo';
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string; // User message or Assistant markdown
  spokenText?: string; // Natural Hindi text for speech
  timestamp: string;
  audioBase64?: string;
  suggestedFollowUps?: string[];
  isActionLog?: boolean;
  appLaunch?: {
    appName: string;
    url: string;
    icon?: string;
    query?: string;
  };
  callAction?: {
    contactName: string;
    hindiLabel: string;
    phoneNumber: string;
    directDialUrl: string;
    whatsAppUrl: string;
  };
  timeData?: {
    time12: string;
    time24: string;
    period: string;
    dateHindi: string;
    dayHindi: string;
    timeZone: string;
  };
}

export type MaleVoicePreset =
  | 'jarvis-deep-male'
  | 'stark-baritone'
  | 'fenrir-neural'
  | 'charon-deep'
  | 'hindi-authentic-male'
  | 'orion-crisp-male';

export interface VoiceSettings {
  engineMode: VoiceEngineMode;
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck' | 'Zephyr';
  maleVoicePreset?: MaleVoicePreset;
  nativeVoiceURI: string;
  pitch: number;
  rate: number;
  volume: number;
  soundEffectsEnabled: boolean;
  autoSpeakResponse: boolean;
  continuousListening: boolean;
}

export interface TelemetryData {
  cpuLoad: number;
  memoryUsage: number;
  latencyMs: number;
  audioInputLevel: number;
  audioOutputLevel: number;
}

