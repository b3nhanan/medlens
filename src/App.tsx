import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProfileProvider } from './context/ProfileContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { AppShell } from './components/AppShell.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { ScanPage } from './pages/ScanPage.tsx';
import { ResultPage } from './pages/ResultPage.tsx';
import { MedicineDetailPage } from './pages/MedicineDetailPage.tsx';
import { CabinetPage } from './pages/CabinetPage.tsx';
import { SafetyCheckPage } from './pages/SafetyCheckPage.tsx';
import { RemindersPage } from './pages/RemindersPage.tsx';
import { EmergencyCardPage } from './pages/EmergencyCardPage.tsx';

export default function App() {
  return (
    <SettingsProvider>
      <ProfileProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/medicine/:id" element={<MedicineDetailPage />} />
              <Route path="/cabinet" element={<CabinetPage />} />
              <Route path="/safety" element={<SafetyCheckPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/emergency" element={<EmergencyCardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '12px',
                borderRadius: '12px',
                padding: '10px 14px',
              },
              success: {
                iconTheme: {
                  primary: '#14B8A6',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </BrowserRouter>
      </ProfileProvider>
    </SettingsProvider>
  );
}
