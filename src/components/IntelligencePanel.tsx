import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ActiveHUDTab, TaskItem, NoteItem, UserProfile, ContactItem } from '../types';
import {
  Volume2,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  User,
  Bot,
  HelpCircle,
  ListTodo,
  FileText,
  Timer,
  SunMedium,
  ExternalLink,
  Phone,
  PhoneCall,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { PersonalTasks } from './PersonalTasks';
import { PersonalNotes } from './PersonalNotes';
import { FocusTimer } from './FocusTimer';
import { DailyBriefingView } from './DailyBriefingView';
import { ContactsPanel } from './ContactsPanel';

interface IntelligencePanelProps {
  activeTab: ActiveHUDTab;
  onTabChange: (tab: ActiveHUDTab) => void;
  messages: ChatMessage[];
  onReplayAudio: (text: string, audioBase64?: string) => void;
  onSelectPrompt: (promptText: string) => void;
  isProcessing: boolean;
  // Personal Tasks props
  tasks: TaskItem[];
  onAddTask: (text: string, priority?: 'high' | 'medium' | 'low') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onReadTasks: () => void;
  // Personal Notes props
  notes: NoteItem[];
  onAddNote: (title: string, content: string, category?: any) => void;
  onDeleteNote: (id: string) => void;
  onReadNote: (content: string) => void;
  // Focus Timer props
  onTimerComplete: (durationMinutes: number) => void;
  onAnnounceTimer: (minutes: number) => void;
  // Daily Briefing props
  briefingMarkdown: string;
  briefingSpokenText: string;
  isBriefingLoading: boolean;
  onRefreshBriefing: () => void;
  userProfile: UserProfile;
  // Contacts & Phone Speed Dial props
  contacts: ContactItem[];
  onCallContact: (contact: ContactItem) => void;
  onCallNumber: (number: string) => void;
  onUpdateContact: (contact: ContactItem) => void;
  onAddContact: (contact: Omit<ContactItem, 'id'>) => void;
  onDeleteContact: (id: string) => void;
}

const DEFAULT_QUICK_PROMPTS = [
  "अभी कितना टाइम हो रहा है? (Current Time)",
  "पापा को कॉल करो (Call Papa)",
  "मम्मी को कॉल करो (Call Mumma)",
  "जार्विस कैसे हो? (JARVIS kaise ho)",
  "पुरुष आवाज बदलो (Change Voice)",
  "फोन लॉक करो (Lock Device)",
  "यूट्यूब खोलो (Open YouTube)",
  "व्हाट्सएप खोलो (Open WhatsApp)",
  "आज का हाल बताओ (Daily Briefing)",
];

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  activeTab,
  onTabChange,
  messages,
  onReplayAudio,
  onSelectPrompt,
  isProcessing,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onReadTasks,
  notes,
  onAddNote,
  onDeleteNote,
  onReadNote,
  onTimerComplete,
  onAnnounceTimer,
  briefingMarkdown,
  briefingSpokenText,
  isBriefingLoading,
  onRefreshBriefing,
  userProfile,
  contacts,
  onCallContact,
  onCallNumber,
  onUpdateContact,
  onAddContact,
  onDeleteContact,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex-1 flex flex-col h-full rounded-xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-md overflow-hidden box-glow-cyan">
      {/* Top Modular Tabs Switcher */}
      <div className="flex items-center justify-between px-2 pt-2 border-b border-cyan-500/20 bg-slate-900/50 select-none overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-hud tracking-wider transition-all border-t border-x ${
              activeTab === 'chat'
                ? 'bg-slate-950 border-cyan-500/40 text-cyan-300 shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>संवाद (CHAT)</span>
          </button>

          <button
            onClick={() => onTabChange('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-hud tracking-wider transition-all border-t border-x ${
              activeTab === 'tasks'
                ? 'bg-slate-950 border-cyan-500/40 text-cyan-300 shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
            <span>कार्य (TASKS)</span>
            {pendingTasksCount > 0 && (
              <span className="text-[10px] font-tech px-1.5 rounded-full bg-cyan-900 text-cyan-200">
                {pendingTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-hud tracking-wider transition-all border-t border-x ${
              activeTab === 'notes'
                ? 'bg-slate-950 border-cyan-500/40 text-cyan-300 shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>नोट्स (NOTES)</span>
          </button>

          <button
            onClick={() => onTabChange('timer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-hud tracking-wider transition-all border-t border-x ${
              activeTab === 'timer'
                ? 'bg-slate-950 border-cyan-500/40 text-cyan-300 shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
            <span>टाइमर (FOCUS)</span>
          </button>

          <button
            onClick={() => onTabChange('briefing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-hud tracking-wider transition-all border-t border-x ${
              activeTab === 'briefing'
                ? 'bg-slate-950 border-cyan-500/40 text-cyan-300 shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            <span>दैनिक ब्रीफिंग</span>
          </button>

          <button
            onClick={() => onTabChange('contacts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-hud tracking-wider transition-all border-t border-x ${
              activeTab === 'contacts'
                ? 'bg-slate-950 border-cyan-500/40 text-cyan-300 shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>कॉल व संपर्क</span>
          </button>
        </div>

        <span className="hidden md:inline font-tech text-[10px] text-cyan-400/60 pr-2">
          INTELLIGENCE OS // ACTIVE
        </span>
      </div>

      {/* Tab Content Display */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'tasks' ? (
          <PersonalTasks
            tasks={tasks}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onReadTasks={onReadTasks}
          />
        ) : activeTab === 'notes' ? (
          <PersonalNotes
            notes={notes}
            onAddNote={onAddNote}
            onDeleteNote={onDeleteNote}
            onReadNote={onReadNote}
          />
        ) : activeTab === 'timer' ? (
          <FocusTimer
            onTimerComplete={onTimerComplete}
            onAnnounceTimer={onAnnounceTimer}
          />
        ) : activeTab === 'briefing' ? (
          <DailyBriefingView
            briefingMarkdown={briefingMarkdown}
            spokenText={briefingSpokenText}
            isLoading={isBriefingLoading}
            onRefresh={onRefreshBriefing}
            onReadAloud={(text) => onReplayAudio(text)}
            userProfile={userProfile}
            pendingTasks={tasks}
          />
        ) : activeTab === 'contacts' ? (
          <ContactsPanel
            contacts={contacts}
            onCallContact={onCallContact}
            onCallNumber={onCallNumber}
            onUpdateContact={onUpdateContact}
            onAddContact={onAddContact}
            onDeleteContact={onDeleteContact}
            userHonorific={userProfile.honorific}
          />
        ) : (
          /* Default: Dialogue & Chat History */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <Sparkles className="w-7 h-7 text-cyan-300 animate-pulse" />
                  </div>
                  <h3 className="font-hud text-base font-semibold text-cyan-300 tracking-wide mb-1">
                    नमस्ते {userProfile.name} {userProfile.honorific}! मैं जार्विस हूँ।
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                    मैं आपका वफादार और अत्यधिक ज्ञानी पर्सनल डेस्कटॉप एआई सहायक हूँ। 
                    टास्क जोड़ने, नोट्स लिखने, टाइमर शुरू करने या किसी भी विषय पर मुझसे हिंदी में बात करें।
                  </p>

                  {/* Starter Suggestion Grid */}
                  <div className="w-full max-w-md text-left">
                    <div className="flex items-center gap-1.5 text-xs font-tech text-cyan-400 mb-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>त्वरित सुझाव (QUICK PROMPTS):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEFAULT_QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectPrompt(prompt)}
                          className="p-2.5 rounded-lg border border-cyan-500/20 bg-slate-900/50 hover:bg-cyan-950/40 hover:border-cyan-400/60 text-xs text-slate-300 hover:text-cyan-200 text-left transition-all duration-200"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-3.5 border transition-all ${
                        msg.role === 'user'
                          ? 'bg-cyan-950/40 border-cyan-500/40 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : msg.isActionLog
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'bg-slate-900/80 border-slate-700/60 text-slate-200 shadow-[0_0_20px_rgba(10,15,25,0.4)]'
                      }`}
                    >
                      {/* Header Tag */}
                      <div className="flex items-center justify-between gap-3 text-xs mb-1.5 pb-1 border-b border-white/5 font-tech">
                        <div className="flex items-center gap-1.5">
                          {msg.role === 'user' ? (
                            <>
                              <User className="w-3.5 h-3.5 text-cyan-300" />
                              <span className="text-cyan-300 font-semibold">
                                {userProfile.name} ({userProfile.honorific})
                              </span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-3.5 h-3.5 text-sky-400" />
                              <span className="text-sky-300 font-semibold font-hud tracking-wide">
                                J.A.R.V.I.S.
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>

                      {/* Content */}
                      <div className="text-sm leading-relaxed prose prose-invert prose-cyan max-w-none text-slate-200">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* App Launch HUD Card */}
                      {msg.appLaunch && (
                        <div className="mt-3 p-3 rounded-xl border border-cyan-400/40 bg-cyan-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                          <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-hud font-bold text-xs shadow-sm flex-shrink-0">
                              {msg.appLaunch.appName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-hud font-semibold text-xs text-cyan-200 truncate">
                                {msg.appLaunch.appName}
                              </div>
                              <div className="text-[10px] font-tech text-slate-400 truncate max-w-[220px]">
                                {msg.appLaunch.url}
                              </div>
                            </div>
                          </div>

                          <a
                            href={msg.appLaunch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex-shrink-0"
                          >
                            <span>OPEN APP</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {/* Outgoing Phone Call HUD Card */}
                      {msg.callAction && (
                        <div className="mt-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <div className="w-9 h-9 rounded-full bg-emerald-900/80 border border-emerald-400/50 flex items-center justify-center text-emerald-200 font-bold text-sm shadow-sm shrink-0">
                              📞
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-hud font-bold text-xs text-emerald-200 truncate">
                                {msg.callAction.contactName} ({msg.callAction.hindiLabel})
                              </div>
                              <div className="text-[11px] font-mono text-emerald-400/90 truncate">
                                {msg.callAction.phoneNumber}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <a
                              href={msg.callAction.directDialUrl}
                              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-hud font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>कॉल ऐप खोलें</span>
                            </a>
                            <a
                              href={msg.callAction.whatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:text-white font-hud text-xs flex items-center gap-1 transition-all"
                              title="WhatsApp Call / Message"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WHATSAPP</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Current Time Holographic HUD Card */}
                      {msg.timeData && (
                        <div className="mt-3 p-3.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-slate-950/80 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
                              <Clock className="w-6 h-6 animate-pulse text-cyan-400" />
                            </div>
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-hud font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                                  {msg.timeData.time12}
                                </span>
                                <span className="text-[11px] font-tech text-cyan-300 tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                                  {msg.timeData.period}
                                </span>
                              </div>
                              <div className="text-xs text-slate-300 font-tech flex items-center gap-2 mt-0.5">
                                <span>{msg.timeData.dateHindi}</span>
                                <span className="text-cyan-500/60">•</span>
                                <span className="text-cyan-300 font-medium">{msg.timeData.dayHindi}</span>
                              </div>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-cyan-500/20 pt-2 sm:pt-0 sm:pl-3 text-right">
                            <span className="text-[10px] font-tech text-cyan-400/70 tracking-widest uppercase">
                              24H CLOCK
                            </span>
                            <span className="font-mono text-xs text-cyan-200 tracking-wider">
                              {msg.timeData.time24}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]">
                              {msg.timeData.timeZone}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Assistant Footer Actions */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onReplayAudio(msg.spokenText || msg.content, msg.audioBase64)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-all font-tech text-xs"
                              title="आवाज़ दोबारा सुनें (Play Audio Voice)"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>REPLAY VOICE</span>
                            </button>

                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                              title="कॉपी करें"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <span className="text-[10px] font-tech text-cyan-400/60">
                            HINDI MALE AUDIO
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dynamic Follow-Up Suggestions from JARVIS */}
                    {msg.role === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-2 max-w-[85%]">
                        {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => onSelectPrompt(suggestion)}
                            className="text-xs px-2.5 py-1 rounded-full bg-slate-900/70 border border-cyan-500/20 hover:border-cyan-400/60 text-cyan-300/80 hover:text-cyan-200 hover:bg-cyan-950/30 transition-all flex items-center gap-1 text-left"
                          >
                            <MessageSquare className="w-3 h-3 text-cyan-400" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs font-tech text-amber-300 p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>जार्विस व्यक्तिगत डेटा संसाधित कर रहा है और हिंदी आवाज तैयार कर रहा है...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
