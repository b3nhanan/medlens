import React, { useState, useEffect } from 'react';
import { api, EmergencyCard, CabinetItem } from '../api.ts';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { 
  HeartPulse, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Save, 
  Phone, 
  AlertTriangle, 
  User, 
  FileText,
  Pill
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EmergencyCardPage: React.FC = () => {
  const { activeProfile } = useProfile();
  const { t } = useSettings();

  const [card, setCard] = useState<EmergencyCard | null>(null);
  const [cabinetItems, setCabinetItems] = useState<CabinetItem[]>([]);
  const [allergies, setAllergies] = useState('');
  const [doctorInstructions, setDoctorInstructions] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const pid = activeProfile?.id || 1;
    Promise.all([
      api.getEmergencyCard(pid),
      api.getCabinet(pid)
    ])
      .then(([cardData, cabData]) => {
        setCard(cardData);
        setCabinetItems(cabData);
        setAllergies(cardData.allergies || '');
        setDoctorInstructions(cardData.doctor_instructions || '');
        setContactName(cardData.contact_name || '');
        setContactPhone(cardData.contact_phone || '');
      })
      .catch(() => {});
  }, [activeProfile?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;
    setIsSaving(true);
    try {
      const updated = await api.updateEmergencyCard(activeProfile.id, {
        allergies,
        doctor_instructions: doctorInstructions,
        contact_name: contactName,
        contact_phone: contactPhone
      });
      setCard(updated);
      toast.success('Emergency Medicine Card saved!');
    } catch (err: any) {
      toast.error('Failed to save emergency card');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`p-4 space-y-4 ${isFullScreen ? 'fixed inset-0 z-50 bg-black text-white p-6 overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between no-print px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-600" />
            <span>{t.emergency.title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Critical medical summary for emergency first responders ({activeProfile?.name})
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title={isFullScreen ? t.emergency.exitFullScreen : t.emergency.fullScreen}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* EMERGENCY DOSSIER CARD */}
      <div className={`emergency-card-print p-6 rounded-3xl border-2 transition-all ${
        isFullScreen 
          ? 'bg-black text-white border-yellow-400' 
          : 'bg-white border-red-500 shadow-xl'
      }`}>
        {/* Top Emergency Banner */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-red-500 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg">
              +
            </div>
            <div>
              <div className="text-xs font-mono-clinical font-black tracking-widest text-red-600 uppercase">
                EMERGENCY MEDICAL DOSSIER
              </div>
              <div className={`text-lg font-black ${isFullScreen ? 'text-white' : 'text-slate-900'}`}>
                PATIENT: {activeProfile?.name.toUpperCase()} ({activeProfile?.relation.toUpperCase()})
              </div>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-mono-clinical">
            Updated: {card?.updated_at ? card.updated_at.split('T')[0] : 'Today'}
          </div>
        </div>

        {/* Form / Detail Fields */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Allergies High Contrast Box */}
          <div className={`p-4 rounded-2xl border-2 ${
            isFullScreen 
              ? 'bg-red-950/80 border-red-500 text-white' 
              : 'bg-red-50/90 border-red-400 text-red-950'
          }`}>
            <div className="flex items-center space-x-2 mb-1.5 font-bold text-xs uppercase tracking-wider text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{t.emergency.allergies} (CONTRAINDICATIONS)</span>
            </div>
            <textarea
              rows={2}
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              placeholder="e.g. Severe Penicillin allergy (anaphylaxis); Sulfa drugs"
              className={`w-full p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isFullScreen 
                  ? 'bg-black text-white border border-red-500' 
                  : 'bg-white text-slate-900 border border-red-300'
              }`}
            />
          </div>

          {/* Emergency Contact */}
          <div className={`p-4 rounded-2xl border ${
            isFullScreen 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2 font-bold text-xs uppercase tracking-wider text-slate-700">
              <Phone className="w-4 h-4 text-teal-600" />
              <span>{t.emergency.emergencyContact}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Contact Name & Relationship..."
                className={`p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isFullScreen ? 'bg-black text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                }`}
              />
              <input
                type="text"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="Phone Number (e.g. +91 90000 00000)..."
                className={`p-2 rounded-xl text-xs font-mono-clinical font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isFullScreen ? 'bg-black text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Auto-filled Active Cabinet Medicines */}
          <div className={`p-4 rounded-2xl border ${
            isFullScreen 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-slate-700">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>{t.emergency.currentMedicines} (AUTO-FILLED)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {cabinetItems.length} active in cabinet
              </span>
            </div>

            <div className="space-y-1.5">
              {cabinetItems.map(item => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isFullScreen ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold">{item.display_name}</span>
                    <span className="ml-1 text-[11px] text-slate-500 font-mono-clinical">
                      ({item.strength_label || 'Standard'})
                    </span>
                  </div>
                  <div className="text-[11px] font-mono-clinical text-slate-500">
                    Exp: {item.expiry_date || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Doctor Instructions */}
          <div className={`p-4 rounded-2xl border ${
            isFullScreen 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2 mb-1.5 font-bold text-xs uppercase tracking-wider text-slate-700">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>{t.emergency.doctorInstructions}</span>
            </div>
            <textarea
              rows={3}
              value={doctorInstructions}
              onChange={e => setDoctorInstructions(e.target.value)}
              placeholder="e.g. Cardiac patient; monitor BP weekly; do not discontinue blood thinners without cardiology consent"
              className={`w-full p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isFullScreen 
                  ? 'bg-black text-white border border-slate-700' 
                  : 'bg-white text-slate-900 border border-slate-300'
              }`}
            />
          </div>

          {/* Save Action Button */}
          <div className="flex justify-end pt-2 no-print">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Emergency Dossier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
