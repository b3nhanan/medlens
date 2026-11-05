import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, SafetyAlert } from '../api.ts';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { IngredientOverlapVisual } from '../components/IngredientOverlapVisual.tsx';
import { 
  ShieldAlert, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Info, 
  ArrowRight,
  Pill
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SafetyCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile, setAlertCount } = useProfile();
  const { t } = useSettings();

  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const runCheck = async () => {
    const pid = activeProfile?.id || 1;
    setLoading(true);
    try {
      const res = await api.getSafetyCheck(pid);
      setAlerts(res.alerts);
      setItemCount(res.itemCount);
      setAlertCount(res.alerts.length);
    } catch (err: any) {
      toast.error('Failed to run safety analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, [activeProfile?.id]);

  // Group alerts by type
  const duplicateAlerts = alerts.filter(a => a.type === 'duplicate');
  const interactionAlerts = alerts.filter(a => a.type === 'known');
  const sameClassAlerts = alerts.filter(a => a.type === 'same_class');

  return (
    <div className="p-4 space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.safety.title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-analyzing {itemCount} medicines in {activeProfile?.name}'s cabinet
          </p>
        </div>

        <button
          type="button"
          onClick={runCheck}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t.safety.runCheck}</span>
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center space-y-2">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-500 font-medium">
            Cross-checking active ingredients and pharmacological classes...
          </div>
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-emerald-950">No Clashes Detected</h3>
            <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto leading-relaxed">
              {t.safety.noIssues}
            </p>
          </div>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-6">
          {/* SECTION 1: DUPLICATE ACTIVE INGREDIENTS (HERO FEATURE) */}
          {duplicateAlerts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-900">
                  Duplicate Active Ingredients ({duplicateAlerts.length})
                </h2>
              </div>

              {duplicateAlerts.map(alert => (
                <div key={alert.id} className="space-y-3">
                  {/* Hero Ingredient Overlap Visual SVG */}
                  <IngredientOverlapVisual
                    brandNames={alert.itemNames}
                    sharedIngredient={alert.ingredients[0]}
                  />

                  {/* Plain Language Explanation Box */}
                  <div className="p-4 bg-white rounded-2xl border border-red-200 shadow-xs space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-red-900">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{alert.title}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {alert.explanation}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Source: {alert.source}</span>
                      <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                        High Priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 2: KNOWN DRUG INTERACTIONS */}
          {interactionAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                  Known Drug-Drug Interactions ({interactionAlerts.length})
                </h2>
              </div>

              {interactionAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-4 bg-white rounded-2xl border border-blue-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {alert.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'moderate' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity} interaction
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {alert.explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Source: {alert.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 3: SAME DRUG CLASS PRECAUTIONS */}
          {sameClassAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
                  Same Drug Class Warnings ({sameClassAlerts.length})
                </h2>
              </div>

              {sameClassAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-4 bg-white rounded-2xl border border-purple-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {alert.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
                      Same Class
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {alert.explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    Source: {alert.source}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
