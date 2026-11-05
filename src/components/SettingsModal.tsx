import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext.tsx';
import { useProfile } from '../context/ProfileContext.tsx';
import { api } from '../api.ts';
import { X, Globe, Type, Eye, Users, RotateCcw, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    language,
    setLanguage,
    largeText,
    setLargeText,
    highContrast,
    setHighContrast,
    t
  } = useSettings();

  const { profiles, activeProfile, setActiveProfileId, refreshProfiles } = useProfile();

  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRelation, setNewProfileRelation] = useState('Family');
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isSettingsOpen) return null;

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    try {
      const colors = ['#0D9488', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const created = await api.createProfile({
        name: newProfileName.trim(),
        relation: newProfileRelation,
        avatar_color: randomColor
      });
      await refreshProfiles();
      setActiveProfileId(created.id);
      setNewProfileName('');
      setIsAddingProfile(false);
      toast.success(`Profile "${created.name}" created!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create profile');
    }
  };

  const handleDeleteProfile = async (id: number, name: string) => {
    if (profiles.length <= 1) {
      toast.error('Cannot delete the only remaining profile');
      return;
    }
    try {
      await api.deleteProfile(id);
      await refreshProfiles();
      toast.success(`Profile "${name}" removed`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete profile');
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      await refreshProfiles();
      toast.success('Database reset to fresh demo seed state!');
      setIsSettingsOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset demo');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div 
        className="w-full max-w-[480px] mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto border-t border-slate-200 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Settings & Accessibility</h3>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-6">
          {/* Language Selector */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <Globe className="w-4 h-4 text-teal-600" />
              <span>Language (மொழி / भाषा / భాష)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { code: 'en', label: 'English', native: 'English' },
                { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
                { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
                { code: 'te', label: 'Telugu', native: 'తెలుగు' }
              ].map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code as any)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    language === lang.code
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">{lang.label}</div>
                    <div className="text-xs text-slate-500 font-normal">{lang.native}</div>
                  </div>
                  {language === lang.code && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Accessibility</span>
            </div>

            <div className="space-y-2.5">
              {/* Large Text */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <Type className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Large Text (125%)</div>
                    <div className="text-[11px] text-slate-500">Increases base font size for elderly readers</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLargeText(!largeText)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    largeText ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={largeText}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                      largeText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <Eye className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">High Contrast</div>
                    <div className="text-[11px] text-slate-500">High readability black/yellow contrast mode</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    highContrast ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Family Profiles Management */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Manage Family Profiles</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingProfile(true)}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Profile
              </button>
            </div>

            <div className="space-y-2">
              {profiles.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    activeProfile?.id === p.id
                      ? 'bg-teal-50/60 border-teal-400'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div 
                    className="flex items-center space-x-2.5 cursor-pointer flex-1"
                    onClick={() => setActiveProfileId(p.id)}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: p.avatar_color }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {activeProfile?.id === p.id && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-1 rounded">Active</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{p.relation}</div>
                    </div>
                  </div>

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(p.id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAddingProfile && (
              <form onSubmit={handleCreateProfile} className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">Add New Profile</div>
                <input
                  type="text"
                  placeholder="Name (e.g. Mom, Child)..."
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <select
                  value={newProfileRelation}
                  onChange={e => setNewProfileRelation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Self">Self</option>
                  <option value="Parent">Parent</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Child">Child</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Family">Family Member</option>
                </select>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingProfile(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDemo}
              disabled={isResetting}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Seed Data</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Restores initial 17 verified medicines, profiles (Me, Grandma, Dad), and demo cabinet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
