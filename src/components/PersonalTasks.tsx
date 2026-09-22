import React, { useState } from 'react';
import { TaskItem } from '../types';
import { CheckCircle2, Circle, Trash2, Plus, Volume2, ListTodo, AlertTriangle } from 'lucide-react';
import { TaskCompletionTrends } from './TaskCompletionTrends';

interface PersonalTasksProps {
  tasks: TaskItem[];
  onAddTask: (text: string, priority?: 'high' | 'medium' | 'low') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onReadTasks: () => void;
}

export const PersonalTasks: React.FC<PersonalTasksProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onReadTasks,
}) => {
  const [newText, setNewText] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      onAddTask(newText.trim(), priority);
      setNewText('');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none font-sans text-slate-200">
      {/* Header & Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-cyan-400" />
          <span className="font-hud text-xs tracking-wider text-cyan-300">
            PERSONAL TASK DIRECTIVE (दैनिक कार्य)
          </span>
          <span className="text-[10px] font-tech px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            {pendingCount} PENDING
          </span>
        </div>

        {tasks.length > 0 && (
          <button
            onClick={onReadTasks}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-tech transition-all"
            title="जार्विस से कार्य पढ़कर सुनाने को कहें"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>READ ALOUD</span>
          </button>
        )}
      </div>

      {/* D3-based Weekly Task Completion Trends Visualization */}
      <TaskCompletionTrends tasks={tasks} />

      {/* Add Task Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-b border-cyan-500/10 bg-slate-950/40 flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="नया कार्य जोड़ें... (उदा: शाम 5 बजे क्लाइंट से बात करना)"
          className="flex-1 bg-slate-900/80 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
        />

        <div className="flex items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-slate-900 border border-cyan-500/30 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="high">उच्च प्राथमिकता (High)</option>
            <option value="medium">मध्यम (Medium)</option>
            <option value="low">सामान्य (Low)</option>
          </select>

          <button
            type="submit"
            disabled={!newText.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-hud text-xs font-semibold tracking-wider transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-500/10 text-xs font-tech text-slate-400">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-0.5 rounded transition-all ${
            filter === 'all' ? 'text-cyan-300 bg-cyan-950 border border-cyan-500/30' : 'hover:text-slate-200'
          }`}
        >
          ALL ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-2 py-0.5 rounded transition-all ${
            filter === 'pending' ? 'text-cyan-300 bg-cyan-950 border border-cyan-500/30' : 'hover:text-slate-200'
          }`}
        >
          PENDING ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-2 py-0.5 rounded transition-all ${
            filter === 'completed' ? 'text-cyan-300 bg-cyan-950 border border-cyan-500/30' : 'hover:text-slate-200'
          }`}
        >
          COMPLETED ({tasks.length - pendingCount})
        </button>
      </div>

      {/* Task Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs font-tech">
            <ListTodo className="w-8 h-8 text-cyan-500/30 mb-2" />
            <p>कोई कार्य नहीं मिला।</p>
            <p className="text-[11px] text-slate-600 mt-1">
              आप माइक में "JARVIS, टास्क जोड़ो [काम]" बोलकर भी जोड़ सकते हैं।
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                t.completed
                  ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                  : 'bg-slate-900/60 border-cyan-500/20 hover:border-cyan-500/40 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                <button
                  onClick={() => onToggleTask(t.id)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0"
                >
                  {t.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-sans truncate ${
                      t.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {t.text}
                  </p>
                  <span className="text-[10px] font-tech text-slate-500">
                    {t.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-tech px-2 py-0.5 rounded border ${
                    t.priority === 'high'
                      ? 'bg-red-950/40 border-red-500/30 text-red-300'
                      : t.priority === 'medium'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {t.priority.toUpperCase()}
                </span>

                <button
                  onClick={() => onDeleteTask(t.id)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                  title="हटाएँ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
