import React, { useState } from 'react';
import { NoteItem } from '../types';
import { FileText, Plus, Trash2, Volume2, Copy, Check, Tag } from 'lucide-react';

interface PersonalNotesProps {
  notes: NoteItem[];
  onAddNote: (title: string, content: string, category?: any) => void;
  onDeleteNote: (id: string) => void;
  onReadNote: (content: string) => void;
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onReadNote,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'general' | 'ideas' | 'code' | 'todo'>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAddNote(title.trim() || 'बिना शीर्षक नोट', content.trim(), category);
      setTitle('');
      setContent('');
      setIsAdding(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none font-sans text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-hud text-xs tracking-wider text-cyan-300">
            PERSONAL NEURAL SCRATCHPAD (वॉयस नोट्स)
          </span>
          <span className="text-[10px] font-tech px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            {notes.length} NOTES
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-hud font-semibold tracking-wider transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'CANCEL' : 'NEW NOTE'}</span>
        </button>
      </div>

      {/* New Note Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-4 border-b border-cyan-500/20 bg-slate-950/80 space-y-2.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="नोट शीर्षक (Title)..."
            className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="यहाँ अपने विचार या कोड लिखें... (या माइक से 'JARVIS, नोट लिखो...' बोलें)"
            rows={3}
            className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 resize-none font-sans"
          />

          <div className="flex items-center justify-between">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-slate-900 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none"
            >
              <option value="general">सामान्य (General)</option>
              <option value="ideas">नया विचार (Ideas)</option>
              <option value="code">कोड स्निपेट (Code)</option>
              <option value="todo">कार्य (Todo)</option>
            </select>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-hud text-xs font-semibold tracking-wider transition-all"
            >
              SAVE NOTE
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs font-tech">
            <FileText className="w-8 h-8 text-cyan-500/30 mb-2" />
            <p>कोई नोट उपलब्ध नहीं है।</p>
            <p className="text-[11px] text-slate-600 mt-1">
              "JARVIS, नोट लिखो [बात]" बोलकर तुरंत वॉयस नोट सहेजें।
            </p>
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-xl border border-cyan-500/20 bg-slate-900/60 hover:border-cyan-500/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between border-b border-cyan-500/10 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-hud font-semibold text-xs text-cyan-300">
                    {n.title}
                  </span>
                  <span className="text-[10px] font-tech px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                    {n.category.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] font-tech text-slate-500">{n.updatedAt}</span>
              </div>

              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {n.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onReadNote(n.content)}
                    className="flex items-center gap-1 text-[11px] font-tech text-cyan-400 hover:text-cyan-200 transition-colors"
                    title="जार्विस से यह नोट पढ़वाएं"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>READ NOTE</span>
                  </button>

                  <button
                    onClick={() => handleCopy(n.id, n.content)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                    title="कॉपी करें"
                  >
                    {copiedId === n.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => onDeleteNote(n.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="हटाएँ"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
