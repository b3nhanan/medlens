import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { api, CabinetItem } from '../api.ts';
import { 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  BellRing, 
  Archive, 
  AlertTriangle, 
  HeartPulse, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile, alertCount } = useProfile();
  const { t } = useSettings();

  const [cabinetItems, setCabinetItems] = useState<CabinetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pid = activeProfile?.id || 1;
    let isMounted = true;
    api.getCabinet(pid)
      .then(items => {
        if (isMounted) setCabinetItems(items);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [activeProfile?.id]);

  // Compute live statistics
  const now = new Date();
  const totalCount = cabinetItems.length;
  let expiringSoonCount = 0;
  let expiredCount = 0;

  for (const item of cabinetItems) {
    if (item.expiry_date) {
      const expDate = new Date(item.expiry_date);
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expiredCount++;
      } else if (diffDays <= 60) {
        expiringSoonCount++;
      }
    }
  }

  const steps = [
    { title: t.home.stepScan, icon: Camera, color: 'bg-teal-500 text-white' },
    { title: t.home.stepRecognise, icon: Sparkles, color: 'bg-blue-500 text-white' },
    { title: t.home.stepUnderstand, icon: CheckCircle2, color: 'bg-emerald-500 text-white' },
    { title: t.home.stepOrganise, icon: Layers, color: 'bg-purple-500 text-white' },
    { title: t.home.stepStayInformed, icon: BellRing, color: 'bg-amber-500 text-white' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Patient & Family Medicine Assistant</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight leading-snug">
          {t.home.heroTitle}
        </h1>
        
        <p className="mt-2 text-xs text-slate-300 leading-relaxed max-w-sm">
          {t.home.heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/scan')}
            className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-600 active:scale-98 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>{t.home.scanButton}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/scan?tab=demo')}
            className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 border border-white/20 transition-all"
          >
            <span>{t.home.demoButton}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* 5-Step Concept Flow Strip */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.home.howItWorks}
          </h2>
          <span className="text-[10px] text-teal-600 font-semibold">5-Stage Intelligence</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              className="flex flex-col items-center text-center p-1.5"
            >
              <div className={`w-8 h-8 rounded-xl ${step.color} flex items-center justify-center shadow-xs mb-1.5`}>
                <step.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">
                {step.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Profile Live Dashboard Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cabinet Status ({activeProfile?.name})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/cabinet')}
            className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Medicines */}
          <div
            onClick={() => navigate('/cabinet')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400">
              <Archive className="w-4 h-4 text-teal-600" />
              <span className="text-[10px] font-semibold text-slate-500">Cabinet</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-slate-900 font-mono-clinical">
                {totalCount}
              </div>
              <div className="text-xs font-medium text-slate-600">
                {t.home.summaryTotal}
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div
            onClick={() => navigate('/cabinet?filter=expiring')}
            className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-600">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">≤ 60 days</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-amber-900 font-mono-clinical">
                {expiringSoonCount}
              </div>
              <div className="text-xs font-medium text-amber-800">
                {t.home.summaryExpiring}
              </div>
            </div>
          </div>

          {/* Expired */}
          <div
            onClick={() => navigate('/cabinet?filter=expired')}
            className="p-3.5 bg-red-50/60 rounded-2xl border border-red-200 shadow-xs hover:border-red-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase text-red-700">Urgent</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-red-900 font-mono-clinical">
                {expiredCount}
              </div>
              <div className="text-xs font-medium text-red-800">
                {t.home.summaryExpired}
              </div>
            </div>
          </div>

          {/* Duplicate Active Ingredient Alerts */}
          <div
            onClick={() => navigate('/safety')}
            className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
              alertCount > 0 
                ? 'bg-rose-50/80 border-rose-300 hover:border-rose-500' 
                : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className={`w-4 h-4 ${alertCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span className={`text-[10px] font-bold uppercase ${alertCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {alertCount > 0 ? 'Safety Alert' : 'All Clear'}
              </span>
            </div>
            <div className="mt-2">
              <div className={`text-2xl font-black font-mono-clinical ${alertCount > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
                {alertCount}
              </div>
              <div className={`text-xs font-medium ${alertCount > 0 ? 'text-rose-800 font-bold' : 'text-emerald-800'}`}>
                {alertCount > 0 ? 'Overdose / Clash Risks' : 'No Active Clashes'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          {t.home.quickLinks}
        </h2>

        {/* Emergency Medicine Card link */}
        <div
          onClick={() => navigate('/emergency')}
          className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wide">
                {t.home.emergencyCard}
              </div>
              <div className="text-[11px] text-white/80">
                Allergies, emergency contact & active prescriptions
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white" />
        </div>

        {/* Daily Schedule Reminder link */}
        <div
          onClick={() => navigate('/reminders')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-teal-400 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Medication Schedule & Caregiver Log
              </div>
              <div className="text-[11px] text-slate-500">
                Morning, Afternoon & Evening timeline with taken status
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Positioning Statement Callout */}
      <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-xs text-teal-900 leading-relaxed">
        <div className="font-extrabold text-teal-950 mb-1">About MedLens:</div>
        {t.positioning}
      </div>
    </div>
  );
};
