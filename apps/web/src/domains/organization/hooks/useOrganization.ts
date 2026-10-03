import { useState, useEffect, useCallback } from 'react';
import { apiClient, ENDPOINTS } from '@free-gst/api-client';
import { getProfile, saveProfile, getAllProfiles, saveBusinessProfile, deleteBusinessProfile } from '@/store';
import { BusinessProfileData } from '@/features/settings/types';
import { detectCountryFromBrowser } from '@/shared/utils';

export function useOrganization() {
  const [profile, setProfile] = useState<BusinessProfileData>({
    businessName: '',
    brandName: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: detectCountryFromBrowser(),
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    logo: '',
    logoHeight: 48,
    signature: '',
    upiId: '',
    googleClientId: '',
    googleDriveFolder: 'GST Billing Invoices',
  });

  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfileData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<BusinessProfileData>(ENDPOINTS.PROFILE).catch(() => getProfile());
      if (data) setProfile(data);
    } catch {
      const fallback = await getProfile();
      if (fallback) setProfile(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBusinessProfiles = useCallback(async () => {
    try {
      const list = await apiClient.get<BusinessProfileData[]>(ENDPOINTS.PROFILES).catch(() => getAllProfiles());
      if (Array.isArray(list)) setBusinessProfiles(list);
    } catch {
      const fallback = await getAllProfiles();
      if (Array.isArray(fallback)) setBusinessProfiles(fallback);
    }
  }, []);

  const updateProfile = useCallback(async (updated: BusinessProfileData) => {
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.PROFILE, updated).catch(() => saveProfile(updated));
      setProfile(updated);
    } catch {
      await saveProfile(updated);
      setProfile(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfileAsWorkspace = useCallback(async (bp: BusinessProfileData) => {
    try {
      await saveBusinessProfile(bp);
      await fetchBusinessProfiles();
    } catch {
      /* ignore */
    }
  }, [fetchBusinessProfiles]);

  const removeBusinessProfile = useCallback(async (id?: string) => {
    if (!id) return;
    try {
      await deleteBusinessProfile(id);
      await fetchBusinessProfiles();
    } catch {
      /* ignore */
    }
  }, [fetchBusinessProfiles]);

  useEffect(() => {
    fetchProfile();
    fetchBusinessProfiles();
  }, [fetchProfile, fetchBusinessProfiles]);

  return {
    profile,
    setProfile,
    businessProfiles,
    loading,
    fetchProfile,
    fetchBusinessProfiles,
    updateProfile,
    saveProfileAsWorkspace,
    removeBusinessProfile,
  };
}

export default useOrganization;
