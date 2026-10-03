import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, ENDPOINTS } from '../../services/api';

export interface BusinessProfile {
  id?: string;
  name?: string;
  companyName?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logo?: string;
  signature?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  terms?: string;
  isDefault?: boolean;
  [key: string]: any;
}

export interface ProfileContextValue {
  profile: BusinessProfile | null;
  allProfiles: BusinessProfile[];
  loading: boolean;
  error: string | null;
  setProfile: (profile: BusinessProfile | null) => void;
  switchProfile: (profileId: string) => Promise<void>;
  reloadProfiles: () => Promise<void>;
  updateProfile: (updatedProfile: BusinessProfile) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reloadProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<BusinessProfile[]>(ENDPOINTS.PROFILES);
      const profilesArray = Array.isArray(data) ? data : [];
      setAllProfiles(profilesArray);
      if (profilesArray.length > 0) {
        const active = profilesArray.find((p) => p.isDefault) || profilesArray[0];
        setProfile(active);
      } else {
        try {
          const single = await apiClient.get<BusinessProfile>(ENDPOINTS.PROFILE);
          setProfile(single || null);
          if (single) setAllProfiles([single]);
        } catch {
          setProfile(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load business profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadProfiles();
  }, []);

  const switchProfile = async (profileId: string) => {
    const selected = allProfiles.find((p) => p.id === profileId);
    if (selected) {
      setProfile(selected);
    }
  };

  const updateProfile = async (updatedProfile: BusinessProfile) => {
    try {
      await apiClient.post(ENDPOINTS.PROFILE, updatedProfile);
      setProfile(updatedProfile);
      await reloadProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        allProfiles,
        loading,
        error,
        setProfile,
        switchProfile,
        reloadProfiles,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
