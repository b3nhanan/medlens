import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, IdentifyResult, Medicine } from '../api.ts';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { LabelCheckList } from '../components/LabelCheckList.tsx';
import { ExplainDrawer } from '../components/ExplainDrawer.tsx';
import { GlossaryPopover } from '../components/GlossaryPopover.tsx';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Thermometer, 
  Sun, 
  Droplet, 
  ExternalLink, 
  MessageSquare, 
  PlusCircle, 
  Calendar,
  Layers,
  Building,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const { language, setLanguage, readingLevel, setReadingLevel, t } = useSettings();

  // Load result from router state or sessionStorage fallback
  const [result, setResult] = useState<IdentifyResult | null>(() => {
    if (location.state?.result) return location.state.result;
    const saved = sessionStorage.getItem('medlens_scan_result');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeMedicine, setActiveMedicine] = useState<Medicine | null>(null);
  const [explanation, setExplanation] = useState<any | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  // External Enrichment state
  const [openFdaData, setOpenFdaData] = useState<any | null>(null);
  const [rxNormData, setRxNormData] = useState<any | null>(null);

  // Editable label values
  const [labelValues, setLabelValues] = useState({
    name: '',
    strength: '',
    expiry: '',
    batch: ''
  });

  // Modal & Drawer
  const [isExplainDrawerOpen, setIsExplainDrawerOpen] = useState(false);
  const [isAddCabinetModalOpen, setIsAddCabinetModalOpen] = useState(false);
  const [cabinetNotes, setCabinetNotes] = useState('');
  const [isSavingCabinet, setIsSavingCabinet] = useState(false);

  useEffect(() => {
    if (!result) {
      navigate('/scan');
      return;
    }

    const best = result.best || (result.candidates[0]?.medicine ?? null);
    setActiveMedicine(best);

    setLabelValues({
      name: best ? best.brand_names[0] : (result.extracted.name || ''),
      strength: result.extracted.strength || (best ? best.strength_label : ''),
      expiry: result.extracted.expiry || '',
      batch: result.extracted.batch || ''
    });
  }, [result, navigate]);

  // Load explanation and external lookups when activeMedicine, language, or readingLevel changes
  useEffect(() => {
    if (!activeMedicine) return;

    setLoadingExplain(true);
    api.explain(activeMedicine.id, language, readingLevel)
      .then(exp => setExplanation(exp))
      .catch(() => {})
      .finally(() => setLoadingExplain(false));

    // External enrichments
    api.lookupOpenFda(activeMedicine.generic_name)
      .then(res => setOpenFdaData(res))
      .catch(() => {});

    api.lookupRxNorm(activeMedicine.generic_name)
      .then(res => setRxNormData(res))
      .catch(() => {});
  }, [activeMedicine, language, readingLevel]);

  if (!result || !activeMedicine) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading medicine recognition result...
      </div>
    );
  }

  // Handle inline label editing updates
  const handleUpdateLabelValue = (key: 'name' | 'strength' | 'expiry' | 'batch', val: string) => {
    setLabelValues(prev => ({ ...prev, [key]: val }));
    toast.success(`Updated ${key}`);
  };

  // Switch candidate medicine if user taps a different candidate chip
  const handleSelectCandidate = (cand: Medicine) => {
    setActiveMedicine(cand);
    setLabelValues(prev => ({
      ...prev,
      name: cand.brand_names[0],
      strength: cand.strength_label
    }));
    toast.success(`Selected ${cand.brand_names[0]}`);
  };

  // Expiry status calculation
  const now = new Date();
  let expiryStatus: 'valid' | 'expiring' | 'expired' | 'unverified' = 'unverified';
  let diffDays = 0;
  if (labelValues.expiry) {
    const expDate = new Date(labelValues.expiry);
    diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      expiryStatus = 'expired';
    } else if (diffDays <= 60) {
      expiryStatus = 'expiring';
    } else {
      expiryStatus = 'valid';
    }
  }

  const handleAddToCabinet = async () => {
    if (!activeProfile) return;
    setIsSavingCabinet(true);
    try {
      await api.addCabinetItem({
        profile_id: activeProfile.id,
        medicine_id: activeMedicine.id,
        display_name: labelValues.name || activeMedicine.brand_names[0],
        expiry_date: labelValues.expiry || null,
        expiry_verified: labelValues.expiry ? 1 : 0,
        batch_number: labelValues.batch || null,
        notes: cabinetNotes || null
      });

      toast.success(`${activeMedicine.brand_names[0]} added to ${activeProfile.name}'s cabinet!`);
      setIsAddCabinetModalOpen(false);
      navigate('/cabinet');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save to cabinet');
    } finally {
      setIsSavingCabinet(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      {/* Confidence Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            result.confidence === 'High' ? 'bg-emerald-500' :
            result.confidence === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {result.confidence === 'High' ? t.result.confidenceHigh :
             result.confidence === 'Medium' ? t.result.confidenceMed : t.result.confidenceLow}
          </span>
        </div>
        <span className="font-mono-clinical text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {Math.round(result.confidenceScore * 100)}% Match
        </span>
      </div>

      {/* Alternative Candidate Chips (when confidence isn't High) */}
      {result.candidates.length > 1 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
          <span className="text-[11px] font-bold text-amber-900 block">
            {t.result.candidatePrompt}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.candidates.map(c => (
              <button
                key={c.medicine.id}
                type="button"
                onClick={() => handleSelectCandidate(c.medicine)}
                className={`text-xs px-2.5 py-1 rounded-xl border transition-colors ${
                  activeMedicine.id === c.medicine.id
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100/50'
                }`}
              >
                {c.medicine.brand_names[0]} ({Math.round(c.score * 100)}%)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Medicine Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
              Verified Reference Record
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {activeMedicine.brand_names[0]}
            </h1>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {activeMedicine.generic_name} • {activeMedicine.strength_label}
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
            {activeMedicine.form}
          </span>
        </div>

        {/* Active Ingredients List */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Active Pharmaceutical Ingredients:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeMedicine.ingredients.map(ing => (
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

        {/* Manufacturer & Class Info */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeMedicine.manufacturer}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeMedicine.category}</span>
          </div>
        </div>
      </div>

      {/* Label Verification Checklist with Inline Edits */}
      <LabelCheckList
        checks={result.checks}
        values={labelValues}
        onUpdateValue={handleUpdateLabelValue}
      />

      {/* Expiry Date Card */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              {labelValues.expiry ? `Expiry: ${labelValues.expiry}` : 'Expiry Date Not Verified'}
            </div>
            <div className="text-[11px] text-slate-500">
              {expiryStatus === 'valid' && `Valid for ${diffDays} more days`}
              {expiryStatus === 'expiring' && `Expiring soon (in ${diffDays} days)`}
              {expiryStatus === 'expired' && `Expired ${Math.abs(diffDays)} days ago!`}
              {expiryStatus === 'unverified' && 'Please check packaging and enter date'}
            </div>
          </div>
        </div>

        <div>
          {expiryStatus === 'valid' && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Valid
            </span>
          )}
          {expiryStatus === 'expiring' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              Expiring Soon
            </span>
          )}
          {expiryStatus === 'expired' && (
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Expired
            </span>
          )}
          {expiryStatus === 'unverified' && (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold">
              Unverified
            </span>
          )}
        </div>
      </div>

      {/* "What does this mean?" Card with Language Switcher and Reading Level */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {t.result.whatItMeans}
            </h3>
          </div>

          {/* Reading Level & Language Controls */}
          <div className="flex items-center space-x-2">
            {/* Reading level toggle */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setReadingLevel('simple')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  readingLevel === 'simple' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {t.result.simple}
              </button>
              <button
                type="button"
                onClick={() => setReadingLevel('detailed')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  readingLevel === 'detailed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {t.result.detailed}
              </button>
            </div>

            {/* Language Switcher */}
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>

        {explanation?.translation_notice && (
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200">
            ℹ️ {explanation.translation_notice}
          </div>
        )}

        {loadingExplain ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Simplifying medical information...
          </div>
        ) : (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
            <p className="font-medium text-slate-900 text-sm">
              {explanation?.summary || activeMedicine.used_for_plain}
            </p>

            {/* Ingredients Explained */}
            {explanation?.ingredients_explained && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  How the active ingredients work:
                </span>
                {explanation.ingredients_explained.map((ing: any, i: number) => (
                  <div key={i} className="text-xs">
                    <strong className="text-slate-900">{ing.name}:</strong> {ing.explanation}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Storage Assistant Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-teal-600" />
          <span>{t.result.storage}</span>
        </h3>

        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed border border-slate-100">
          {activeMedicine.storage_text}
        </div>

        {/* Storage Icon Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Refrigerate Flag */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
            activeMedicine.refrigerate
              ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
          }`}>
            <span className="text-lg">🧊</span>
            <span className="text-[10px] mt-1">Refrigerate (2–8°C)</span>
          </div>

          {/* Protect from light */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
            activeMedicine.protect_light
              ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
          }`}>
            <Sun className={`w-5 h-5 ${activeMedicine.protect_light ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1">Protect from Light</span>
          </div>

          {/* Protect from moisture */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
            activeMedicine.protect_moisture
              ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
          }`}>
            <Droplet className={`w-5 h-5 ${activeMedicine.protect_moisture ? 'text-cyan-600' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1">Protect from Moisture</span>
          </div>
        </div>
      </div>

      {/* Warnings & Precautions */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{t.result.warnings}</span>
        </h3>

        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
          {activeMedicine.warnings.map((w, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">•</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>

        {activeMedicine.do_not_use_if.length > 0 && (
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-red-900 block">Do NOT use if:</span>
            {activeMedicine.do_not_use_if.map((item, i) => (
              <div key={i} className="text-red-800">• {item}</div>
            ))}
          </div>
        )}
      </div>

      {/* External Regulatory References (openFDA / RxNorm) */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Regulatory Sources & Clinical Links
          </span>
          <span className="text-[10px] text-slate-400">FDA / RxNav Reference</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* RxNorm Chip */}
          {rxNormData?.available && (
            <a
              href={rxNormData.rxNormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 hover:border-teal-500 transition-colors"
            >
              <span className="font-mono-clinical font-bold">RxNorm ID: {rxNormData.rxcui}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {/* DailyMed Link */}
          {openFdaData?.available && openFdaData.dailyMedUrl && (
            <a
              href={openFdaData.dailyMedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 hover:border-teal-500 transition-colors"
            >
              <span>DailyMed FDA Label</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>

        <p className="text-[10px] text-slate-400 italic leading-snug">
          US sources (openFDA, RxNorm) are used for reference. Indian brand records in this demo are curated locally and must be validated against Indian regulatory records before real-world use.
        </p>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="pt-2 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setIsAddCabinetModalOpen(true)}
          className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.result.addToCabinet}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExplainDrawerOpen(true)}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center space-x-2 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t.result.askMedlens} (Explain Mode)</span>
        </button>
      </div>

      {/* Explain It To Me Drawer */}
      <ExplainDrawer
        isOpen={isExplainDrawerOpen}
        onClose={() => setIsExplainDrawerOpen(false)}
        medicine={activeMedicine}
      />

      {/* Add To Cabinet Modal */}
      {isAddCabinetModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsAddCabinetModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">
              Add to {activeProfile?.name}'s Cabinet
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Name:</label>
                <input
                  type="text"
                  value={labelValues.name}
                  onChange={e => setLabelValues(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expiry Date:</label>
                <input
                  type="date"
                  value={labelValues.expiry}
                  onChange={e => setLabelValues(prev => ({ ...prev, expiry: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-clinical text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Batch Number:</label>
                <input
                  type="text"
                  value={labelValues.batch}
                  onChange={e => setLabelValues(prev => ({ ...prev, batch: e.target.value }))}
                  placeholder="e.g. DL2290"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-clinical text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Personal Notes:</label>
                <textarea
                  rows={2}
                  value={cabinetNotes}
                  onChange={e => setCabinetNotes(e.target.value)}
                  placeholder="e.g. Take with food; prescribed by Dr. Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCabinetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCabinet}
                disabled={isSavingCabinet}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {isSavingCabinet ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
