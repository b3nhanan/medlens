import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Medicine } from '../api.ts';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { ExplainDrawer } from '../components/ExplainDrawer.tsx';
import { GlossaryPopover } from '../components/GlossaryPopover.tsx';
import { 
  ArrowLeft, 
  Sparkles, 
  Thermometer, 
  Sun, 
  Droplet, 
  AlertTriangle, 
  ExternalLink, 
  MessageSquare, 
  PlusCircle, 
  Building, 
  Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const { language, setLanguage, readingLevel, setReadingLevel, t } = useSettings();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [explanation, setExplanation] = useState<any | null>(null);
  const [openFdaData, setOpenFdaData] = useState<any | null>(null);
  const [rxNormData, setRxNormData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add modal inputs
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getMedicineById(id)
      .then(med => {
        setMedicine(med);
        // Lookups
        api.explain(med.id, language, readingLevel)
          .then(exp => setExplanation(exp))
          .catch(() => {});
        api.lookupOpenFda(med.generic_name)
          .then(res => setOpenFdaData(res))
          .catch(() => {});
        api.lookupRxNorm(med.generic_name)
          .then(res => setRxNormData(res))
          .catch(() => {});
      })
      .catch(err => {
        toast.error('Medicine record not found');
        navigate('/cabinet');
      })
      .finally(() => setLoading(false));
  }, [id, language, readingLevel, navigate]);

  if (loading || !medicine) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading verified medicine details...
      </div>
    );
  }

  const handleAddToCabinet = async () => {
    if (!activeProfile) return;
    try {
      await api.addCabinetItem({
        profile_id: activeProfile.id,
        medicine_id: medicine.id,
        display_name: medicine.brand_names[0],
        expiry_date: expiryDate || null,
        expiry_verified: expiryDate ? 1 : 0,
        batch_number: batchNumber || null,
        notes: notes || null
      });
      toast.success(`${medicine.brand_names[0]} added to ${activeProfile.name}'s cabinet`);
      setIsAddModalOpen(false);
      navigate('/cabinet');
    } catch (err: any) {
      toast.error('Failed to add medicine');
    }
  };

  return (
    <div className="p-4 space-y-5">
      {/* Back Header */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Medicine Dossier
        </span>
      </div>

      {/* Main Identity Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
              Verified Medical Record
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {medicine.brand_names[0]}
            </h1>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {medicine.generic_name} • {medicine.strength_label}
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
            {medicine.form}
          </span>
        </div>

        {/* Active Ingredients List with Glossary Popover */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Active Ingredients (Tap term for plain meaning):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {medicine.ingredients.map(ing => (
              <span
                key={ing.name}
                className="inline-flex items-center px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold"
              >
                <GlossaryPopover term={ing.name}>
                  {ing.name}
                </GlossaryPopover>
                <span className="ml-1 text-[11px] font-mono-clinical font-semibold text-teal-700">
                  ({ing.strength})
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{medicine.manufacturer}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{medicine.category}</span>
          </div>
        </div>
      </div>

      {/* "What Does This Mean?" Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">{t.result.whatItMeans}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {explanation?.summary || medicine.used_for_plain}
        </p>

        {explanation?.ingredients_explained && (
          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Mechanism:
            </span>
            {explanation.ingredients_explained.map((ing: any, i: number) => (
              <div key={i} className="text-xs text-slate-700">
                <strong className="text-slate-900">{ing.name}:</strong> {ing.explanation}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage Assistant */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-teal-600" />
          <span>Storage Instructions</span>
        </h3>
        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed border border-slate-100">
          {medicine.storage_text}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
            medicine.refrigerate ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
          }`}>
            <span className="text-lg">🧊</span>
            <span className="text-[10px] mt-1">Refrigerate (2–8°C)</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
            medicine.protect_light ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
          }`}>
            <Sun className={`w-5 h-5 ${medicine.protect_light ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1">Protect from Light</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
            medicine.protect_moisture ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
          }`}>
            <Droplet className={`w-5 h-5 ${medicine.protect_moisture ? 'text-cyan-600' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1">Protect Moisture</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Warnings & Contraindications</span>
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {medicine.warnings.map((w, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">•</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* External References */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
        <div className="font-bold text-slate-700">Regulatory Links:</div>
        <div className="flex flex-wrap gap-2">
          {rxNormData?.available && (
            <a
              href={rxNormData.rxNormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800"
            >
              <span className="font-mono-clinical font-bold">RxNorm: {rxNormData.rxcui}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
          {openFdaData?.available && openFdaData.dailyMedUrl && (
            <a
              href={openFdaData.dailyMedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800"
            >
              <span>DailyMed Package Insert</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add to {activeProfile?.name}'s Cabinet</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExplainOpen(true)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Questions About {medicine.brand_names[0]}</span>
        </button>
      </div>

      {/* Explain Drawer */}
      <ExplainDrawer
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        medicine={medicine}
      />

      {/* Add Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-3.5"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900">Add to Cabinet</h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expiry Date:</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-clinical text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Batch Number:</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  placeholder="e.g. DL992"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-clinical text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Take with food"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCabinet}
                className="px-4 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
