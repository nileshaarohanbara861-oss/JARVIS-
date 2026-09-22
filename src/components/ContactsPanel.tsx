import React, { useState } from 'react';
import { ContactItem } from '../types';
import { Phone, Plus, Trash2, Edit2, Check, X, ShieldAlert, PhoneCall, User, Heart } from 'lucide-react';
import { jarvisAudioFx } from '../services/soundEffects';

interface ContactsPanelProps {
  contacts: ContactItem[];
  onCallContact: (contact: ContactItem) => void;
  onCallNumber: (number: string) => void;
  onUpdateContact: (contact: ContactItem) => void;
  onAddContact: (contact: Omit<ContactItem, 'id'>) => void;
  onDeleteContact: (id: string) => void;
  userHonorific: string;
}

export const ContactsPanel: React.FC<ContactsPanelProps> = ({
  contacts,
  onCallContact,
  onCallNumber,
  onUpdateContact,
  onAddContact,
  onDeleteContact,
  userHonorific,
}) => {
  const [dialPadInput, setDialPadInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [editName, setEditName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHindi, setNewHindi] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newRelation, setNewRelation] = useState<'family' | 'friend' | 'work' | 'emergency'>('family');

  const handleDialDigit = (digit: string, freq: number) => {
    jarvisAudioFx.playDialTone(freq);
    setDialPadInput((prev) => prev + digit);
  };

  const handleBackspace = () => {
    jarvisAudioFx.playClick();
    setDialPadInput((prev) => prev.slice(0, -1));
  };

  const handleDialpadCall = () => {
    const trimmed = dialPadInput.trim();
    if (!trimmed) return;
    jarvisAudioFx.playClick();
    onCallNumber(trimmed);
  };

  const handleStartEdit = (contact: ContactItem) => {
    jarvisAudioFx.playClick();
    setEditingId(contact.id);
    setEditName(contact.name);
    setEditNumber(contact.phoneNumber);
  };

  const handleSaveEdit = (contact: ContactItem) => {
    jarvisAudioFx.playAcknowledge();
    onUpdateContact({
      ...contact,
      name: editName.trim() || contact.name,
      phoneNumber: editNumber.trim() || contact.phoneNumber,
    });
    setEditingId(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim() || !newName.trim()) return;
    jarvisAudioFx.playAcknowledge();
    onAddContact({
      name: newName.trim(),
      hindiLabel: newHindi.trim() || newName.trim(),
      phoneNumber: newNumber.trim(),
      relationship: newRelation,
      avatarColor: newRelation === 'family' ? '#ec4899' : '#06b6d4',
      isSpeedDial: true,
    });
    setNewName('');
    setNewHindi('');
    setNewNumber('');
    setIsAddingNew(false);
  };

  const dialKeys = [
    { label: '1', sub: '', freq: 697 },
    { label: '2', sub: 'ABC', freq: 770 },
    { label: '3', sub: 'DEF', freq: 852 },
    { label: '4', sub: 'GHI', freq: 697 },
    { label: '5', sub: 'JKL', freq: 770 },
    { label: '6', sub: 'MNO', freq: 852 },
    { label: '7', sub: 'PQRS', freq: 697 },
    { label: '8', sub: 'TUV', freq: 770 },
    { label: '9', sub: 'WXYZ', freq: 852 },
    { label: '*', sub: '', freq: 941 },
    { label: '0', sub: '+', freq: 941 },
    { label: '#', sub: '', freq: 941 },
  ];

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4 overflow-y-auto text-slate-200">
      {/* Left: Speed Dial Cards (Mumma, Papa, Family, Emergency) */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <div>
            <h3 className="font-hud font-bold text-sm text-cyan-300 tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>SPEED DIAL & FAMILY CONTACTS (त्वरित कॉलिंग)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              बोलें *"मम्मी को कॉल करो"* या *"पापा को कॉल करो"* तुरंत कॉल करने के लिए।
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              jarvisAudioFx.playClick();
              setIsAddingNew(!isAddingNew);
            }}
            className="px-2.5 py-1 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-hud text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नया नंबर जोड़ें</span>
          </button>
        </div>

        {/* Add Contact Form */}
        {isAddingNew && (
          <form onSubmit={handleSaveNew} className="p-3 rounded-xl border border-cyan-500/40 bg-slate-900/80 space-y-2 text-xs">
            <div className="font-hud font-semibold text-cyan-300 flex items-center justify-between">
              <span>नया संपर्क जोड़ें</span>
              <button type="button" onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="नाम (उदा: Brother / रोहित)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400 text-xs"
                required
              />
              <input
                type="text"
                placeholder="हिंदी लेबल (उदा: भाई)"
                value={newHindi}
                onChange={(e) => setNewHindi(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="फोन नंबर (उदा: +919876543210)"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400 text-xs"
                required
              />
              <select
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400 text-xs"
              >
                <option value="family">Family (परिवार)</option>
                <option value="friend">Friend (मित्र)</option>
                <option value="work">Work (काम)</option>
                <option value="emergency">Emergency (आपातकालीन)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-hud font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>संपर्क सुरक्षित करें</span>
            </button>
          </form>
        )}

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
          {contacts.map((contact) => {
            const isEditing = editingId === contact.id;

            return (
              <div
                key={contact.id}
                className="p-3.5 rounded-2xl border border-cyan-500/25 bg-slate-950/70 hover:border-cyan-400/60 transition-all flex flex-col justify-between shadow-[0_0_15px_rgba(0,0,0,0.4)] relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md shrink-0 border border-cyan-400/40"
                        style={{ backgroundColor: contact.avatarColor || '#0284c7' }}
                      >
                        {contact.relationship === 'mother' ? '👩' : contact.relationship === 'father' ? '👨' : contact.relationship === 'emergency' ? '🚨' : '👤'}
                      </div>
                      <div>
                        <div className="font-hud font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <span>{contact.name}</span>
                        </div>
                        <div className="text-[11px] font-medium text-cyan-400">
                          {contact.hindiLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(contact)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-all"
                        title="Edit Phone Number"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {contact.relationship !== 'father' && contact.relationship !== 'mother' && (
                        <button
                          type="button"
                          onClick={() => onDeleteContact(contact.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-all"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-1.5 my-2">
                      <input
                        type="tel"
                        value={editNumber}
                        onChange={(e) => setEditNumber(e.target.value)}
                        placeholder="नंबर अपडेट करें..."
                        className="w-full bg-slate-900 border border-cyan-500 rounded p-1.5 text-xs text-slate-100 outline-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                        >
                          रद्द करें
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(contact)}
                          className="px-2.5 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          सहेजें
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800 mb-3 flex items-center justify-between">
                      <span>{contact.phoneNumber}</span>
                      <span className="text-[10px] text-cyan-400/80">SPEED DIAL</span>
                    </div>
                  )}
                </div>

                {/* Direct Call Button */}
                <button
                  type="button"
                  onClick={() => onCallContact(contact)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-hud font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>CALL NOW (कॉल करें)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Touch Screen Numeric Keypad */}
      <div className="w-full md:w-64 flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-4 shrink-0 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="font-hud font-bold text-xs text-cyan-300 tracking-wider mb-2 flex items-center justify-between">
          <span>DIAL PAD (कीपैड)</span>
          <span className="text-[10px] text-slate-500 font-mono">DTMF AUDIO</span>
        </div>

        {/* Display Screen */}
        <div className="h-11 bg-slate-900/90 border border-cyan-500/40 rounded-xl px-3 flex items-center justify-between mb-3 text-cyan-200 font-mono text-base font-bold tracking-widest overflow-x-auto">
          <span>{dialPadInput || <span className="text-slate-600 text-xs font-normal">नंबर डायल करें...</span>}</span>
          {dialPadInput && (
            <button
              type="button"
              onClick={handleBackspace}
              className="text-slate-400 hover:text-red-400 text-xs font-hud transition-all ml-2"
            >
              DEL
            </button>
          )}
        </div>

        {/* 12 Key Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {dialKeys.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => handleDialDigit(k.label, k.freq)}
              className="h-12 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-400/50 flex flex-col items-center justify-center text-slate-100 font-mono font-bold text-base transition-all active:scale-90"
            >
              <span>{k.label}</span>
              {k.sub && <span className="text-[8px] text-slate-500 font-sans">{k.sub}</span>}
            </button>
          ))}
        </div>

        {/* Direct Dial Call Button */}
        <button
          type="button"
          disabled={!dialPadInput}
          onClick={handleDialpadCall}
          className={`w-full py-2.5 rounded-xl font-hud font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            dialPadInput
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95'
              : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>DIAL NUMBER (कॉल लगाओ)</span>
        </button>
      </div>
    </div>
  );
};
