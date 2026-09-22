import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, X, MapPin, Briefcase, Sparkles, Palette } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none font-sans text-slate-200">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-sm text-cyan-300 tracking-wider">
              PERSONAL USER IDENTITY (व्यक्तिगत प्रोफ़ाइल)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-hud">
              आपका नाम (YOUR NAME)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="उदा: रोहित (Rohit)"
              className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-hud">
              संबोधन / उपाधि (PREFERRED HONORIFIC)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['Mr. Nilesh', 'सर', 'बॉस', 'दोस्त'].map((honor) => (
                <button
                  key={honor}
                  type="button"
                  onClick={() => setFormData({ ...formData, honorific: honor })}
                  className={`p-2 rounded-lg border text-center font-hud text-xs transition-all truncate ${
                    formData.honorific === honor
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {honor}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.honorific}
              onChange={(e) => setFormData({ ...formData, honorific: e.target.value })}
              placeholder="या कस्टम संबोधन लिखें (उदा: Mr. Nilesh)"
              className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400 text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              जार्विस बातचीत में आपको इस आदरसूचक नाम से संबोधित करेगा।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-hud flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>शहर (CITY)</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="उदा: नई दिल्ली, मुंबई"
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-hud flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>पेशा / कार्य (ROLE)</span>
              </label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="उदा: सॉफ्टवेयर इंजीनियर"
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-hud flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>जार्विस के लिए विशेष निर्देश (CUSTOM INSTRUCTIONS)</span>
            </label>
            <textarea
              value={formData.customPreferences}
              onChange={(e) => setFormData({ ...formData, customPreferences: e.target.value })}
              placeholder="उदा: मुझे व्यावहारिक उदाहरणों के साथ संक्षिप्त उत्तर दें और कोडिंग में पायथन को प्राथमिकता दें।"
              rows={2}
              className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2 text-slate-100 outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-hud flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>HUD थीम (VISUAL THEME)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'stark-cyan', label: 'Stark Cyan', border: 'border-cyan-500/50', bg: 'bg-cyan-950/40' },
                { id: 'iron-gold', label: 'Iron Gold', border: 'border-amber-500/50', bg: 'bg-amber-950/40' },
                { id: 'stealth-emerald', label: 'Emerald', border: 'border-emerald-500/50', bg: 'bg-emerald-950/40' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: th.id as any })}
                  className={`p-2 rounded-lg border text-center font-hud text-xs transition-all ${
                    formData.theme === th.id
                      ? `${th.border} ${th.bg} text-slate-100 shadow-[0_0_12px_rgba(6,182,212,0.2)]`
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-hud transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-semibold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              SAVE PROFILE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
