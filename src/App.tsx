/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { ArcReactor } from './components/ArcReactor';
import { TelemetryPanel } from './components/TelemetryPanel';
import { IntelligencePanel } from './components/IntelligencePanel';
import { VoiceDock } from './components/VoiceDock';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { DeviceLockScreen } from './components/DeviceLockScreen';
import { ActiveCallOverlay } from './components/ActiveCallOverlay';
import {
  JarvisStatus,
  VoiceSettings,
  ChatMessage,
  UserProfile,
  TaskItem,
  NoteItem,
  ActiveHUDTab,
  ContactItem,
  ActiveCallState,
} from './types';
import { jarvisVoice, MALE_VOICE_PRESETS } from './services/voiceService';
import { jarvisAudioFx } from './services/soundEffects';
import { parseAppCommand, launchUrl, AppDefinition } from './services/appLauncher';
import { INITIAL_CONTACTS, parseCallCommand, executeDeviceDial } from './services/callService';
import { isTimeQuery, isDateQuery, getTimeData } from './services/timeService';

const INITIAL_SETTINGS: VoiceSettings = {
  engineMode: 'browser-native', // Default to instant native Hindi male voice
  geminiVoice: 'Charon', // Deep male voice for Gemini neural TTS
  maleVoicePreset: 'jarvis-deep-male',
  nativeVoiceURI: '',
  pitch: 0.78, // Deep, resonant cinematic male tone like JARVIS
  rate: 0.98,
  volume: 1.0,
  soundEffectsEnabled: true,
  autoSpeakResponse: true,
  continuousListening: false,
};

const INITIAL_PROFILE: UserProfile = {
  name: 'Nilesh',
  honorific: 'Mr. Nilesh',
  city: 'नई दिल्ली',
  profession: 'सॉफ्टवेयर इंजीनियर',
  customPreferences: 'मुझे हमेशा Mr. Nilesh कहकर ही संबोधित करें और तकनीकी सहायता प्रदान करें।',
  theme: 'stark-cyan',
};

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    text: 'JARVIS आर्किटेक्चर और न्यूरल रिस्पॉन्स टेस्ट करना',
    completed: true,
    priority: 'high',
    createdAt: 'आज',
  },
  {
    id: 't-2',
    text: 'रिएक्ट और जेमिनी 3.8 फ़्लैश कोड का निरीक्षण',
    completed: false,
    priority: 'high',
    createdAt: 'आज',
  },
  {
    id: 't-3',
    text: 'शाम 5 बजे दैनिक कार्य प्रगति की समीक्षा',
    completed: false,
    priority: 'medium',
    createdAt: 'आज',
  },
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n-1',
    title: 'आयरन मैन प्रोटोटाइप विचार',
    content: 'मार्क-85 न्यूरल इंटरफ़ेस में रियल-टाइम ऑडियो-टू-ऑडियो प्रोसेसिंग और स्थानीय कार्य प्रबंधन मॉड्यूल पूर्ण रूप से सक्रिय हैं।',
    category: 'ideas',
    updatedAt: 'आज',
  },
];

export default function App() {
  const [status, setStatus] = useState<JarvisStatus>('idle');
  const [activeTab, setActiveTab] = useState<ActiveHUDTab>('chat');
  const [isDeviceLocked, setIsDeviceLocked] = useState<boolean>(false);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('jarvis_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'रोहित' || parsed.honorific === 'सर' || !parsed.name) {
          const updated = { ...INITIAL_PROFILE, ...parsed, name: 'Nilesh', honorific: 'Mr. Nilesh' };
          localStorage.setItem('jarvis_user_profile', JSON.stringify(updated));
          return updated;
        }
        return { ...INITIAL_PROFILE, ...parsed };
      }
    } catch {}
    return INITIAL_PROFILE;
  });

  // Voice Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('jarvis_voice_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          maleVoicePreset: parsed.maleVoicePreset || 'jarvis-deep-male',
        };
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  // Tasks
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_personal_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TASKS;
  });

  // Notes
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_personal_notes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTES;
  });

  // Daily Briefing State
  const [briefingMarkdown, setBriefingMarkdown] = useState<string>('');
  const [briefingSpokenText, setBriefingSpokenText] = useState<string>('');
  const [isBriefingLoading, setIsBriefingLoading] = useState<boolean>(false);

  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'init-msg',
        role: 'assistant',
        content: `**नमस्ते Mr. Nilesh! मैं जार्विस (J.A.R.V.I.S.) हूँ।**

आपका निजी डेस्कटॉप एआई सहायक पूर्ण रूप से सक्रिय है। मैं आपकी व्यक्तिगत कार्य सूची, दैनिक ब्रीफिंग, वॉयस नोट्स, ऐप लॉन्च और फोकस टाइमर का प्रबंधन करने के लिए तैयार हूँ।

*माइक्रोफ़ोन बटन दबाकर या स्पेसबार दबाकर बोलें:*
- *"जार्विस अभी कितना टाइम हो रहा है"*
- *"जार्विस कैसे हो"*
- *"यूट्यूब खोलो"* / *"व्हाट्सएप खोलो"*
- *"पापा को कॉल करो"* / *"मम्मी को कॉल करो"*
- *"मेरा फोन लॉक कर दो"*
- *"टास्क जोड़ो: नया प्रोजेक्ट कोड करना है"*
- *"या कोई भी सवाल पूछें"*`,
        spokenText: `नमस्ते Mr. Nilesh! मैं आपका पर्सनल सहायक जार्विस हूँ। बताइए आज आपकी क्या सेवा करूँ?`,
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'अभी कितना टाइम हो रहा है? (Current Time)',
          'पापा को कॉल करो (Call Papa)',
          'मम्मी को कॉल करो (Call Mumma)',
          'जार्विस कैसे हो? (JARVIS kaise ho)',
          'यूट्यूब खोलो (Open YouTube)',
          'फोन लॉक करो (Lock Device)',
          'कॉल ऐप खोलो (Open Dialer)',
          'आज का दैनिक ब्रीफिंग दो',
        ],
      },
    ];
  });

  // Contacts & Speed Dial
  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_user_contacts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CONTACTS;
  });

  // Active Holographic Phone Call State
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);

  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(64));
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Refs for callbacks
  const voiceSettingsRef = useRef<VoiceSettings>(voiceSettings);
  const userProfileRef = useRef<UserProfile>(userProfile);
  const tasksRef = useRef<TaskItem[]>(tasks);
  const contactsRef = useRef<ContactItem[]>(contacts);

  useEffect(() => {
    contactsRef.current = contacts;
    try {
      localStorage.setItem('jarvis_user_contacts', JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  useEffect(() => {
    voiceSettingsRef.current = voiceSettings;
    try {
      localStorage.setItem('jarvis_voice_settings', JSON.stringify(voiceSettings));
    } catch {}
  }, [voiceSettings]);

  useEffect(() => {
    userProfileRef.current = userProfile;
    try {
      localStorage.setItem('jarvis_user_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    tasksRef.current = tasks;
    try {
      localStorage.setItem('jarvis_personal_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('jarvis_personal_notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Visualizer loop
  useEffect(() => {
    jarvisVoice.startVisualizerLoop((freqs) => {
      setFrequencyData(new Uint8Array(freqs));
    });
    return () => {
      jarvisVoice.stopVisualizerLoop();
    };
  }, []);

  // Update Voice Settings
  const handleUpdateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Update Profile
  const handleSaveProfile = useCallback((newProfile: UserProfile) => {
    setUserProfile(newProfile);
    jarvisAudioFx.playAcknowledge();
  }, []);

  // Play Speech
  const speakText = useCallback(
    async (text: string, base64Audio?: string) => {
      setStatus('speaking');
      const settings = voiceSettingsRef.current;

      if (settings.soundEffectsEnabled) {
        jarvisAudioFx.playSpeakStart();
      }

      if (settings.engineMode === 'gemini-tts') {
        try {
          let audioData = base64Audio;
          if (!audioData) {
            const resp = await fetch('/api/jarvis/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text,
                voice: settings.geminiVoice,
              }),
            });
            const data = await resp.json();
            if (data.success && data.audioBase64) {
              audioData = data.audioBase64;
            }
          }

          if (audioData) {
            await jarvisVoice.playRawAudioBase64(
              audioData,
              24000,
              () => setStatus('speaking'),
              () => {
                setStatus('idle');
                if (settings.continuousListening) {
                  startListening();
                }
              }
            );
            return;
          }
        } catch (e) {
          console.warn('Gemini TTS fallback:', e);
        }
      }

      // Native Speech
      await jarvisVoice.speakWithBrowserVoice(
        text,
        settings,
        () => setStatus('speaking'),
        () => {
          setStatus('idle');
          if (settings.continuousListening) {
            startListening();
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Add Task Function
  const handleAddTask = useCallback(
    (text: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
      const newTask: TaskItem = {
        id: `t-${Date.now()}`,
        text,
        completed: false,
        priority,
        createdAt: 'अभी',
      };
      setTasks((prev) => [newTask, ...prev]);
      jarvisAudioFx.playAcknowledge();
    },
    []
  );

  // Toggle Task
  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    jarvisAudioFx.playAcknowledge();
  }, []);

  // Delete Task
  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Read Tasks aloud
  const handleReadTasks = useCallback(() => {
    const pending = tasksRef.current.filter((t) => !t.completed);
    const honor = userProfileRef.current.honorific;
    if (pending.length === 0) {
      speakText(`${honor}, आपके पास कोई भी लंबित कार्य नहीं है। सब कुछ पूरा हो चुका है।`);
    } else {
      const taskList = pending.map((t, idx) => `${idx + 1}, ${t.text}`).join('। ');
      speakText(`${honor}, आपके कुल ${pending.length} कार्य बाकी हैं: ${taskList}`);
    }
  }, [speakText]);

  // Add Note
  const handleAddNote = useCallback(
    (title: string, content: string, category: any = 'general') => {
      const newNote: NoteItem = {
        id: `n-${Date.now()}`,
        title,
        content,
        category,
        updatedAt: 'अभी',
      };
      setNotes((prev) => [newNote, ...prev]);
      jarvisAudioFx.playAcknowledge();
    },
    []
  );

  // Delete Note
  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Generate Executive Daily Briefing
  const handleGenerateBriefing = useCallback(async () => {
    setIsBriefingLoading(true);
    try {
      const timeString = new Date().toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const resp = await fetch('/api/jarvis/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userProfileRef.current,
          pendingTasks: tasksRef.current.filter((t) => !t.completed),
          timeString,
        }),
      });
      const data = await resp.json();
      if (data.displayMarkdown) {
        setBriefingMarkdown(data.displayMarkdown);
        setBriefingSpokenText(data.spokenText || '');
        if (voiceSettingsRef.current.autoSpeakResponse && data.spokenText) {
          speakText(data.spokenText);
        }
      }
    } catch (e) {
      console.error('Failed to generate briefing:', e);
    } finally {
      setIsBriefingLoading(false);
    }
  }, [speakText]);

  // Focus Timer Complete Callback
  const handleTimerComplete = useCallback(
    (durationMinutes: number) => {
      const honor = userProfileRef.current.honorific;
      const msg = `${honor}, आपका ${durationMinutes} मिनट का एकाग्रता सत्र समाप्त हो गया है। कृपया कुछ देर का विराम लें।`;
      speakText(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `timer-end-${Date.now()}`,
          role: 'assistant',
          content: `⏰ **टाइमर अलर्ट**: ${durationMinutes} मिनट का एकाग्रता सत्र पूर्ण हुआ।`,
          spokenText: msg,
          timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
          isActionLog: true,
        },
      ]);
    },
    [speakText]
  );

  const handleAnnounceTimer = useCallback(
    (minutes: number) => {
      const honor = userProfileRef.current.honorific;
      speakText(`जी ${honor}, ${minutes} मिनट का टाइमर शुरू कर दिया गया है।`);
    },
    [speakText]
  );

  // Initiate Phone Call
  const handleCallContact = useCallback(
    (contact: ContactItem) => {
      executeDeviceDial(contact.phoneNumber);
      setActiveCall({
        contact,
        status: 'dialing',
        startedAt: Date.now(),
        durationSeconds: 0,
        isMuted: false,
        isSpeaker: true,
      });

      const honor = userProfileRef.current.honorific;
      const cleanNumber = contact.phoneNumber.replace(/[^0-9]/g, '');
      const spoken = `जी ${honor}, ${contact.hindiLabel} को कॉल लगाया जा रहा है। कॉलिंग ऐप खोला जा रहा है।`;
      const timeNow = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [
        ...prev,
        {
          id: `a-call-${Date.now()}`,
          role: 'assistant',
          content: `📞 **आउटगोइंग कॉल**: ${contact.name} (${contact.hindiLabel})\n\n- **फोन नंबर**: \`${contact.phoneNumber}\`\n- **स्थिति**: डिवाइस कॉलिंग ऐप और स्टार्क नेटवर्क लिंक प्रारंभ किया गया।`,
          spokenText: spoken,
          timestamp: timeNow,
          isActionLog: true,
          callAction: {
            contactName: contact.name,
            hindiLabel: contact.hindiLabel,
            phoneNumber: contact.phoneNumber,
            directDialUrl: `tel:${contact.phoneNumber}`,
            whatsAppUrl: `https://wa.me/${cleanNumber}`,
          },
        },
      ]);

      if (voiceSettingsRef.current.autoSpeakResponse) {
        speakText(spoken);
      }
    },
    [speakText]
  );

  const handleCallNumber = useCallback(
    (number: string) => {
      const customContact: ContactItem = {
        id: `num-${Date.now()}`,
        name: `नंबर ${number}`,
        hindiLabel: `डायरेक्ट नंबर (${number})`,
        relationship: 'family',
        phoneNumber: number,
        avatarColor: '#06b6d4',
      };
      handleCallContact(customContact);
    },
    [handleCallContact]
  );

  const handleEndCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const handleToggleCallMute = useCallback(() => {
    setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  }, []);

  const handleToggleCallSpeaker = useCallback(() => {
    setActiveCall((prev) => (prev ? { ...prev, isSpeaker: !prev.isSpeaker } : null));
  }, []);

  const handleUpdateContact = useCallback((updated: ContactItem) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const handleAddContact = useCallback((newContact: Omit<ContactItem, 'id'>) => {
    const item: ContactItem = {
      ...newContact,
      id: `contact-${Date.now()}`,
    };
    setContacts((prev) => [...prev, item]);
  }, []);

  const handleDeleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Direct Desktop / Web App Launcher
  const handleLaunchApp = useCallback(
    (app: AppDefinition) => {
      const honor = userProfileRef.current.honorific;
      const spoken = `जी ${honor}, ${app.hindiName} खोला जा रहा है।`;
      launchUrl(app.defaultUrl);
      if (voiceSettingsRef.current.autoSpeakResponse) {
        speakText(spoken);
      }
      const timeNow = new Date().toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `app-click-${Date.now()}`,
          role: 'assistant',
          content: `🚀 **एप्लिकेशन लॉन्च**: ${app.name} (${app.hindiName})\n\nजार्विस आपके डेस्कटॉप पर ${app.name} प्रारंभ कर रहा है।`,
          spokenText: spoken,
          timestamp: timeNow,
          isActionLog: true,
          appLaunch: {
            appName: app.name,
            url: app.defaultUrl,
          },
        },
      ]);
      setActiveTab('chat');
    },
    [speakText]
  );

  // Device Lock Screen Handler
  const handleLockDevice = useCallback(() => {
    jarvisAudioFx.playLockChime();
    setIsDeviceLocked(true);
    const honor = userProfileRef.current.honorific;
    const spoken = `जी ${honor}, आपका डिवाइस लॉक कर दिया गया है। सुरक्षा प्रोटोकॉल सक्रिय है।`;
    if (voiceSettingsRef.current.autoSpeakResponse) {
      speakText(spoken);
    }
    const timeNow = new Date().toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `lock-${Date.now()}`,
        role: 'assistant',
        content: `🔒 **सुरक्षा प्रोटोकॉल सक्रिय (DEVICE LOCKED)**\n\nजार्विस ने आपका डिवाइस लॉक कर दिया है। बायोमेट्रिक स्कैनर, पिन कोड (मास्टर कोड: 3000), या वॉयस कमांड *"JARVIS unlock karo"* से अनलॉक करें।`,
        spokenText: spoken,
        timestamp: timeNow,
        isActionLog: true,
      },
    ]);
  }, [speakText]);

  // Smart Voice Action Interceptor & Conversational Dispatcher
  const handleSendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      jarvisVoice.stopCurrentSpeech();
      jarvisVoice.stopSpeechRecognition();
      setLiveTranscript('');

      const timeNow = new Date().toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const lower = text.toLowerCase();
      const honor = userProfileRef.current.honorific;

      // 0.0 Voice Action: Lock Device / Screen ("mera phone lock kardo", "phone lock karo", "lock device")
      const isLockCommand =
        lower.includes('phone lock') ||
        lower.includes('lock phone') ||
        lower.includes('device lock') ||
        lower.includes('lock device') ||
        lower.includes('screen lock') ||
        lower.includes('lock screen') ||
        lower.includes('lock kardo') ||
        lower.includes('lock kar do') ||
        lower.includes('lock karo') ||
        text.includes('फोन लॉक') ||
        text.includes('मोबाइल लॉक') ||
        text.includes('डिवाइस लॉक') ||
        text.includes('स्क्रीन लॉक') ||
        text.includes('लॉक कर दो') ||
        text.includes('लॉक करो');

      if (isLockCommand) {
        handleLockDevice();
        return;
      }

      // 0.05 Voice Action: Change JARVIS Voice / Switch Male Voice
      const isVoiceChangeCommand =
        lower.includes('change voice') ||
        lower.includes('change jarvis voice') ||
        lower.includes('new voice') ||
        lower.includes('male voice') ||
        lower.includes('voice badlo') ||
        lower.includes('aawaz badlo') ||
        lower.includes('awaaz badlo') ||
        text.includes('आवाज बदलो') ||
        text.includes('आवाज़ बदलो') ||
        text.includes('पुरुष आवाज') ||
        text.includes('पुरुष आवाज़') ||
        text.includes('नई आवाज') ||
        text.includes('नयी आवाज़');

      if (isVoiceChangeCommand) {
        // Switch to the next male voice persona
        const currentId = voiceSettingsRef.current.maleVoicePreset || 'jarvis-deep-male';
        const currentIndex = MALE_VOICE_PRESETS.findIndex((p) => p.id === currentId);
        const nextIndex = (currentIndex + 1) % MALE_VOICE_PRESETS.length;
        const newPreset = MALE_VOICE_PRESETS[nextIndex];

        const updatedSettings: VoiceSettings = {
          ...voiceSettingsRef.current,
          maleVoicePreset: newPreset.id,
          pitch: newPreset.pitch,
          rate: newPreset.rate,
          geminiVoice: newPreset.geminiVoice,
          engineMode: newPreset.engineMode,
        };

        setVoiceSettings(updatedSettings);
        try {
          localStorage.setItem('jarvis_voice_settings', JSON.stringify(updatedSettings));
        } catch {}

        const spoken = `जी ${honor}, आपकी नई पुरुष आवाज़ ${newPreset.hindiTitle} सक्रिय कर दी गई है। बताइए अब आवाज़ कैसी लग रही है?`;
        setActiveTab('chat');
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
          {
            id: `a-voice-${Date.now()}`,
            role: 'assistant',
            content: `🎙️ **जार्विस आवाज़ अपडेट**: नई पुरुष आवाज़ सक्रिय की गई!\n\n- **वॉइस प्रोफाइल**: ${newPreset.title}\n- **हिंदी नाम**: ${newPreset.hindiTitle}\n- **विवरण**: ${newPreset.description}\n- **इंजन मोड**: ${newPreset.engineMode === 'gemini-tts' ? 'Neural Cloud AI (Gemini)' : 'Native Hindi Low-Latency'}\n\n*आप ऊपर सेटिंग्स (⚙️) से सभी 6 पुरुष आवाज़ों का त्वरित ऑडियो टेस्ट भी कर सकते हैं।*`,
            spokenText: spoken,
            timestamp: timeNow,
            isActionLog: true,
            suggestedFollowUps: [
              'पुरुष आवाज़ बदलो (Next Male Voice)',
              'आवाज़ टेस्ट करो (Test Voice)',
              'यूट्यूब खोलो (Open YouTube)',
              'आज का हाल बताओ (Daily Briefing)',
            ],
          },
        ]);
        if (voiceSettingsRef.current.autoSpeakResponse) {
          speakText(spoken);
        }
        return;
      }

      // 0.05 Voice Action: System Time & Clock ("JARVIS abhi kitna time ho raha hai", "time kya ho raha hai", "kya samay hai", "what time is it")
      if (isTimeQuery(text) || isDateQuery(text)) {
        const timeInfo = getTimeData(honor);
        setActiveTab('chat');
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
          {
            id: `a-time-${Date.now()}`,
            role: 'assistant',
            content: timeInfo.displayMarkdown,
            spokenText: timeInfo.spokenHindi,
            timestamp: timeNow,
            isActionLog: true,
            timeData: {
              time12: timeInfo.time12,
              time24: timeInfo.time24,
              period: timeInfo.period,
              dateHindi: timeInfo.dateHindi,
              dayHindi: timeInfo.dayHindi,
              timeZone: timeInfo.timeZone,
            },
            suggestedFollowUps: [
              'आज का हाल बताओ (Daily Briefing)',
              'पापा को कॉल करो (Call Papa)',
              'यूट्यूब खोलो (Open YouTube)',
              'पुरुष आवाज़ बदलो (Change Voice)',
            ],
          },
        ]);

        if (voiceSettingsRef.current.autoSpeakResponse) {
          speakText(timeInfo.spokenHindi);
        }
        return;
      }

      // 0.08 Voice Action: Phone Call & Speed Dial (e.g. "mumma ko call karo", "papa ko call karo", "mumma, papa ko call karo", "कॉल ऐप खोलो")
      const callCommand = parseCallCommand(text, contactsRef.current, honor);
      if (callCommand) {
        if (callCommand.isOpenDialerOnly) {
          setActiveTab('contacts');
          const spoken = callCommand.spokenHindi;
          setMessages((prev) => [
            ...prev,
            { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
            {
              id: `a-dialer-${Date.now()}`,
              role: 'assistant',
              content: callCommand.displayMarkdown,
              spokenText: spoken,
              timestamp: timeNow,
              isActionLog: true,
              suggestedFollowUps: [
                'पापा को कॉल करो (Call Papa)',
                'मम्मी को कॉल करो (Call Mumma)',
                'पुरुष आवाज़ बदलो (Change Voice)',
                'यूट्यूब खोलो (Open YouTube)',
              ],
            },
          ]);
          if (voiceSettingsRef.current.autoSpeakResponse) {
            speakText(spoken);
          }
          return;
        }

        // Trigger native device dialer and active holographic call overlay
        executeDeviceDial(callCommand.phoneNumber);
        setActiveCall({
          contact: callCommand.contact,
          status: 'dialing',
          startedAt: Date.now(),
          durationSeconds: 0,
          isMuted: false,
          isSpeaker: true,
        });

        const spoken = callCommand.spokenHindi;
        setActiveTab('chat');
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
          {
            id: `a-call-${Date.now()}`,
            role: 'assistant',
            content: callCommand.displayMarkdown,
            spokenText: spoken,
            timestamp: timeNow,
            isActionLog: true,
            callAction: {
              contactName: callCommand.contact.name,
              hindiLabel: callCommand.contact.hindiLabel,
              phoneNumber: callCommand.phoneNumber,
              directDialUrl: callCommand.directDialUrl,
              whatsAppUrl: callCommand.whatsAppUrl,
            },
            suggestedFollowUps: [
              'पापा को कॉल करो (Call Papa)',
              'मम्मी को कॉल करो (Call Mumma)',
              'कॉल ऐप खोलो (Open Dialer)',
              'यूट्यूब खोलो (Open YouTube)',
            ],
          },
        ]);

        if (voiceSettingsRef.current.autoSpeakResponse) {
          speakText(spoken);
        }
        return;
      }

      // 0.1 Voice Action: Desktop & Web App Launcher (e.g. "open YouTube", "playstore खोलो", "whatsapp खोलो")
      const appCommand = parseAppCommand(text, honor);
      if (appCommand) {
        launchUrl(appCommand.url);
        setActiveTab('chat');
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
          {
            id: `a-app-${Date.now()}`,
            role: 'assistant',
            content: appCommand.displayMarkdown,
            spokenText: appCommand.spokenHindi,
            timestamp: timeNow,
            isActionLog: true,
            appLaunch: {
              appName: appCommand.app.name,
              url: appCommand.url,
              query: appCommand.query,
            },
          },
        ]);
        if (voiceSettingsRef.current.autoSpeakResponse) {
          speakText(appCommand.spokenHindi);
        }
        return;
      }

      // 0.5 Voice Action: Casual Greeting ("JARVIS kaise ho" / "kaise ho" / "how are you" / "क्या हाल है")
      const isGreetingKaiseHo =
        lower.includes('kaise ho') ||
        lower.includes('kaise hai') ||
        lower.includes('kaise h') ||
        lower.includes('kya hal hai') ||
        lower.includes('kya haal hai') ||
        lower.includes('how are you') ||
        text.includes('कैसे हो') ||
        text.includes('कैसे हैं') ||
        text.includes('क्या हाल है') ||
        text.includes('सब ठीक');

      if (
        isGreetingKaiseHo &&
        (lower.length < 40 || lower.includes('jarvis') || text.includes('जार्विस'))
      ) {
        const spoken = `मैं ठीक हूँ ${honor}, क्या हेल्प चाहिए?`;
        setActiveTab('chat');
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
          {
            id: `a-greeting-${Date.now()}`,
            role: 'assistant',
            content: `मैं ठीक हूँ **${honor}**! क्या हेल्प चाहिए? 😊\n\nआप मुझसे कोई भी सवाल पूछ सकते हैं, यूट्यूब/व्हाट्सएप जैसे ऐप्स खोलने को कह सकते हैं, या दैनिक कार्य व नोट्स मैनेज करवा सकते हैं।`,
            spokenText: spoken,
            timestamp: timeNow,
            suggestedFollowUps: [
              'यूट्यूब खोलो (Open YouTube)',
              'आज का हाल बताओ (Daily Briefing)',
              'व्हाट्सएप खोलो (Open WhatsApp)',
              'टास्क जोड़ो: आज का काम',
            ],
          },
        ]);
        if (voiceSettingsRef.current.autoSpeakResponse) {
          speakText(spoken);
        }
        return;
      }

      // 1. Voice Action: Add Task
      // e.g. "टास्क जोड़ो: कोड लिखना है" or "नया काम ..." or "add task ..."
      if (
        lower.startsWith('टास्क जोड़ो') ||
        lower.startsWith('नया काम') ||
        lower.startsWith('add task') ||
        lower.startsWith('कार्य जोड़ो')
      ) {
        const taskText = text
          .replace(/^(टास्क जोड़ो|नया काम|add task|कार्य जोड़ो)[:\s]*/i, '')
          .trim();
        if (taskText) {
          handleAddTask(taskText, 'high');
          setActiveTab('tasks');
          const spoken = `जी ${honor}, मैंने आपकी कार्य सूची में जोड़ दिया है: ${taskText}।`;
          setMessages((prev) => [
            ...prev,
            { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: `✅ **नया कार्य जोड़ा गया**: "${taskText}" (उच्च प्राथमिकता)`,
              spokenText: spoken,
              timestamp: timeNow,
              isActionLog: true,
            },
          ]);
          if (voiceSettingsRef.current.autoSpeakResponse) {
            speakText(spoken);
          }
          return;
        }
      }

      // 2. Voice Action: Show / Read Tasks
      if (
        lower.includes('टास्क बताओ') ||
        lower.includes('मेरे काम क्या हैं') ||
        lower.includes('टू-डू लिस्ट') ||
        lower.includes('show tasks')
      ) {
        setActiveTab('tasks');
        handleReadTasks();
        return;
      }

      // 3. Voice Action: Save Note
      if (
        lower.startsWith('नोट लिखो') ||
        lower.startsWith('save note') ||
        lower.startsWith('नया नोट')
      ) {
        const noteContent = text
          .replace(/^(नोट लिखो|save note|नया नोट)[:\s]*/i, '')
          .trim();
        if (noteContent) {
          handleAddNote('वॉयस नोट', noteContent, 'general');
          setActiveTab('notes');
          const spoken = `जी ${honor}, आपका नोट सहेज लिया गया है।`;
          setMessages((prev) => [
            ...prev,
            { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: `📝 **वॉयस नोट सहेजा गया**: "${noteContent}"`,
              spokenText: spoken,
              timestamp: timeNow,
              isActionLog: true,
            },
          ]);
          if (voiceSettingsRef.current.autoSpeakResponse) {
            speakText(spoken);
          }
          return;
        }
      }

      // 4. Voice Action: Focus Timer
      if (
        lower.includes('टाइमर लगाओ') ||
        lower.includes('फोकस टाइमर') ||
        lower.includes('start timer')
      ) {
        const match = text.match(/(\d+)\s*(मिनट|min)/i);
        const mins = match ? parseInt(match[1], 10) : 25;
        setActiveTab('timer');
        handleAnnounceTimer(mins);
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: timeNow },
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: `⏱️ **एकाग्रता टाइमर सक्रिय**: ${mins} मिनट का सत्र प्रारंभ।`,
            spokenText: `जी ${honor}, ${mins} मिनट का टाइमर शुरू कर दिया गया है।`,
            timestamp: timeNow,
            isActionLog: true,
          },
        ]);
        return;
      }

      // 5. Voice Action: Daily Briefing
      if (
        lower.includes('ब्रीफिंग') ||
        lower.includes('आज का हाल') ||
        lower.includes('morning brief') ||
        lower.includes('daily briefing')
      ) {
        setActiveTab('briefing');
        handleGenerateBriefing();
        return;
      }

      // Standard Conversational Flow
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: timeNow,
      };

      setMessages((prev) => [...prev, userMsg]);
      setStatus('processing');

      try {
        const response = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            profile: userProfileRef.current,
            currentTimeString: new Date().toLocaleString('hi-IN'),
            history: messages.map((m) => ({
              role: m.role,
              content: m.spokenText || m.content,
            })),
          }),
        });

        const data = await response.json();
        const spoken = data.spokenText || data.displayMarkdown || `जी ${honor}।`;
        const display = data.displayMarkdown || spoken;
        const followUps = data.suggestedFollowUps || [];

        const assistantMsg: ChatMessage = {
          id: `jarvis-${Date.now()}`,
          role: 'assistant',
          content: display,
          spokenText: spoken,
          timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: followUps,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (voiceSettingsRef.current.autoSpeakResponse) {
          await speakText(spoken);
        } else {
          setStatus('idle');
        }
      } catch (err: any) {
        console.error('Error contacting JARVIS:', err);
        const errMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `माफ़ कीजिये ${honor}, नेटवर्क में समस्या आ गई है। कृपया पुनः प्रयास करें।`,
          spokenText: `माफ़ कीजिये ${honor}, नेटवर्क में समस्या आ गई है।`,
          timestamp: timeNow,
        };
        setMessages((prev) => [...prev, errMsg]);
        setStatus('idle');
      }
    },
    [
      messages,
      speakText,
      handleAddTask,
      handleReadTasks,
      handleAddNote,
      handleAnnounceTimer,
      handleGenerateBriefing,
    ]
  );

  // Start Voice Recognition
  const startListening = useCallback(() => {
    jarvisVoice.stopCurrentSpeech();

    if (voiceSettingsRef.current.soundEffectsEnabled) {
      jarvisAudioFx.playWakeChime();
    }

    setStatus('listening');
    setLiveTranscript('');

    const started = jarvisVoice.startSpeechRecognition(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim()) {
          if (voiceSettingsRef.current.soundEffectsEnabled) {
            jarvisAudioFx.playAcknowledge();
          }
          handleSendMessage(transcript.trim());
        }
      },
      (error) => {
        console.warn('Speech error:', error);
        setStatus('idle');
        setLiveTranscript('');
      },
      () => {
        if (status === 'listening') {
          setStatus('idle');
        }
      }
    );

    if (!started) {
      setStatus('idle');
    }
  }, [handleSendMessage, status]);

  // Stop Listening
  const stopListening = useCallback(() => {
    jarvisVoice.stopSpeechRecognition();
    if (voiceSettingsRef.current.soundEffectsEnabled) {
      jarvisAudioFx.playDeactivate();
    }
    setStatus('idle');
    setLiveTranscript('');
  }, []);

  // Toggle Mic
  const handleToggleMic = useCallback(() => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  // Stop Speech
  const handleStopSpeech = useCallback(() => {
    jarvisVoice.stopCurrentSpeech();
    setStatus('idle');
  }, []);

  // Clear History
  const handleClearHistory = useCallback(() => {
    jarvisVoice.stopCurrentSpeech();
    jarvisVoice.stopSpeechRecognition();
    setMessages([]);
    setStatus('idle');
  }, []);

  // Test Hindi Voice
  const handleTestVoice = useCallback(() => {
    const honor = userProfileRef.current.honorific;
    speakText(
      `नमस्ते ${userProfileRef.current.name} ${honor}, मैं आपका पर्सनल सहायक जार्विस हूँ। मेरी हिंदी आवाज़ और न्यूरल कोर एकदम सही हैं।`
    );
  }, [speakText]);

  // Global Keyboard Shortcuts (Space = Talk, Esc = Cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleMic();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleStopSpeech();
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMic, handleStopSpeech, stopListening]);

  return (
    <div
      className={`relative w-screen h-screen flex flex-col bg-[#060810] bg-cyber-grid text-slate-100 overflow-hidden font-body theme-${userProfile.theme}`}
    >
      {/* Holographic Scanline Overlay */}
      <div className="scanlines absolute inset-0 z-10" />

      {/* Top Desktop Navigation & Personal Identity Bar */}
      <TopNav
        voiceSettings={voiceSettings}
        userProfile={userProfile}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onClearHistory={handleClearHistory}
        onLockDevice={handleLockDevice}
        onOpenContacts={() => setActiveTab('contacts')}
      />

      {/* Main Desktop Command Center */}
      <main className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-hidden z-20">
        {/* Left Side: System Telemetry, Sensors & Audio Spectrum */}
        <TelemetryPanel status={status} frequencyData={frequencyData} />

        {/* Center/Right: Interactive Arc-Reactor & Modular Intelligence OS */}
        <div className="flex-1 flex flex-col items-center justify-between gap-2 overflow-hidden">
          {/* Arc Reactor Centerpiece */}
          <div className="flex-shrink-0">
            <ArcReactor
              status={status}
              onCoreClick={handleToggleMic}
              frequencyData={frequencyData}
            />
          </div>

          {/* Tabbed Intelligence Panel (Dialogue, Tasks, Notes, Timer, Briefing, Contacts) */}
          <div className="w-full flex-1 overflow-hidden">
            <IntelligencePanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              messages={messages}
              onReplayAudio={(text, audio) => speakText(text, audio)}
              onSelectPrompt={handleSendMessage}
              isProcessing={status === 'processing'}
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onReadTasks={handleReadTasks}
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onReadNote={(content) => speakText(content)}
              onTimerComplete={handleTimerComplete}
              onAnnounceTimer={handleAnnounceTimer}
              briefingMarkdown={briefingMarkdown}
              briefingSpokenText={briefingSpokenText}
              isBriefingLoading={isBriefingLoading}
              onRefreshBriefing={handleGenerateBriefing}
              userProfile={userProfile}
              contacts={contacts}
              onCallContact={handleCallContact}
              onCallNumber={handleCallNumber}
              onUpdateContact={handleUpdateContact}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
            />
          </div>

          {/* Bottom Floating Voice Dock */}
          <div className="w-full flex-shrink-0 pt-1">
            <VoiceDock
              status={status}
              transcript={liveTranscript}
              onToggleMic={handleToggleMic}
              onStopSpeech={handleStopSpeech}
              onSendMessage={handleSendMessage}
              onLaunchApp={handleLaunchApp}
              continuousListening={voiceSettings.continuousListening}
              onToggleContinuous={() =>
                handleUpdateSettings({
                  continuousListening: !voiceSettings.continuousListening,
                })
              }
            />
          </div>
        </div>
      </main>

      {/* Audio & Voice Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={handleUpdateSettings}
        onTestVoice={handleTestVoice}
      />

      {/* User Personal Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Futuristic Stark Device Lock Screen */}
      {isDeviceLocked && (
        <DeviceLockScreen
          userHonorific={userProfile.honorific}
          userName={userProfile.name}
          onUnlock={() => setIsDeviceLocked(false)}
          onSpeak={speakText}
        />
      )}

      {/* Futuristic Holographic Phone Call Overlay */}
      {activeCall && (
        <ActiveCallOverlay
          callState={activeCall}
          onEndCall={handleEndCall}
          userHonorific={userProfile.honorific}
        />
      )}
    </div>
  );
}
