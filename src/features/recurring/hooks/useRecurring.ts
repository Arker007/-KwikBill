import { useState, useEffect, useCallback } from 'react';
import {
  getAllRecurring,
  saveRecurring,
  deleteRecurring,
  getAllClients,
  getProfile,
} from '../../../store';
import { belongsToProfile, isUnassignedToBusiness } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';
import { RecurringTemplate } from '../types';

export function useRecurring() {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recs, cls, prof] = await Promise.all([
        getAllRecurring(),
        getAllClients(),
        getProfile().catch(() => null),
      ]);
      setOwnerProfile(prof);
      setTemplates((recs || []).filter((r: any) => belongsToProfile(r, prof)));
      setClients(cls || []);
    } catch {
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unassignedTemplates = templates.filter(isUnassignedToBusiness);

  const assignUnassignedTemplates = async () => {
    await Promise.all(
      unassignedTemplates.map(r =>
        saveRecurring({
          ...r,
          ownerGstin: ownerProfile?.gstin || '',
          ownerName: ownerProfile?.businessName || '',
        })
      )
    );
    await loadData();
  };

  const getDueTemplates = () => {
    const today = new Date().toISOString().split('T')[0];
    return templates.filter(t => t.active !== false && t.nextDate && t.nextDate <= today);
  };

  return {
    templates,
    clients,
    ownerProfile,
    loading,
    unassignedTemplates,
    dueTemplates: getDueTemplates(),
    assignUnassignedTemplates,
    reload: loadData,
  };
}
