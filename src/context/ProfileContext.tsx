import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, Profile } from '../api.ts';

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfileId: (id: number) => void;
  refreshProfiles: () => Promise<void>;
  loading: boolean;
  alertCount: number;
  setAlertCount: (count: number) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<number>(() => {
    const saved = localStorage.getItem('medlens_active_profile_id');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  const refreshProfiles = async () => {
    try {
      const list = await api.getProfiles();
      setProfiles(list);
      // If current activeProfileId doesn't exist in list, pick first
      if (list.length > 0 && !list.some(p => p.id === activeProfileId)) {
        setActiveProfileIdState(list[0].id);
        localStorage.setItem('medlens_active_profile_id', String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfiles();
  }, []);

  const setActiveProfileId = (id: number) => {
    setActiveProfileIdState(id);
    localStorage.setItem('medlens_active_profile_id', String(id));
  };

  // Poll or check alert count for active profile
  useEffect(() => {
    if (!activeProfileId) return;
    let isMounted = true;
    api.getSafetyCheck(activeProfileId)
      .then(res => {
        if (isMounted) {
          setAlertCount(res.alerts.length);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || null;

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        setActiveProfileId,
        refreshProfiles,
        loading,
        alertCount,
        setAlertCount
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
