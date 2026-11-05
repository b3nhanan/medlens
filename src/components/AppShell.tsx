import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { 
  Home, 
  Camera, 
  Archive, 
  ShieldAlert, 
  Clock, 
  Settings, 
  ChevronDown, 
  HeartPulse,
  Pill
} from 'lucide-react';
import { SettingsModal } from './SettingsModal.tsx';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profiles, activeProfile, setActiveProfileId, alertCount } = useProfile();
  const { setIsSettingsOpen, t } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/40 via-slate-100 to-slate-200 flex justify-center items-start lg:py-6">
      {/* Phone container shell */}
      <div className="w-full max-w-[480px] min-h-screen lg:min-h-[880px] bg-white flex flex-col lg:rounded-[40px] lg:shadow-2xl lg:border lg:border-slate-300/80 overflow-hidden relative">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Pill className="w-4 h-4 transform -rotate-45" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Med<span className="text-teal-600">Lens</span>
              </span>
            </div>
          </div>

          {/* Right actions: Profile Switcher & Settings */}
          <div className="flex items-center space-x-2">
            {/* Emergency quick link */}
            <button
              type="button"
              onClick={() => navigate('/emergency')}
              className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Emergency Medicine Card"
              aria-label="Emergency Card"
            >
              <HeartPulse className="w-4 h-4" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <select
                value={activeProfile?.id || 1}
                onChange={e => setActiveProfileId(parseInt(e.target.value, 10))}
                className="appearance-none pl-7 pr-6 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition-colors"
                aria-label="Switch active family profile"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {/* Profile avatar dot */}
              <div
                className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full pointer-events-none"
                style={{ backgroundColor: activeProfile?.avatar_color || '#0D9488' }}
              />
              <ChevronDown className="absolute right-1.5 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Settings Gear */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
          {children}

          {/* Persistent Non-Negotiable Medical Safety Disclaimer Footer */}
          <footer className="mt-8 px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <div className="inline-flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-slate-600 leading-tight">
              <span>⚠️</span>
              <span>
                {t.disclaimer}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              MedLens Demo • US openFDA / RxNorm reference & local clinical data
            </div>
          </footer>
        </main>

        {/* Bottom Tab Bar (5 tabs) */}
        <nav className="fixed bottom-0 lg:absolute left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.nav.home}</span>
          </NavLink>

          {/* Scan */}
          <NavLink
            to="/scan"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Camera className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.nav.scan}</span>
          </NavLink>

          {/* Cabinet */}
          <NavLink
            to="/cabinet"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Archive className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.nav.cabinet}</span>
          </NavLink>

          {/* Safety Check with Pulsing Alert Dot */}
          <NavLink
            to="/safety"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <ShieldAlert className="w-5 h-5 mb-0.5" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 text-[8px] font-bold text-white items-center justify-center">
                    {alertCount}
                  </span>
                </span>
              )}
            </div>
            <span className="text-[10px]">{t.nav.safety}</span>
          </NavLink>

          {/* Reminders */}
          <NavLink
            to="/reminders"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.nav.reminders}</span>
          </NavLink>
        </nav>

        {/* Global Settings Modal */}
        <SettingsModal />
      </div>
    </div>
  );
};
