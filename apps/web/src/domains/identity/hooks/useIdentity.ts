import { useState, useCallback } from 'react';
import { apiClient, ENDPOINTS } from '@free-gst/api-client';

export interface UserProfileState {
  name: string;
  email: string;
  phone: string;
  designation: string;
  language: string;
  dateFormat: string;
  timeZone: string;
  twoFactorEnabled: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Billing Operator' | 'Accountant / CA' | 'Viewer';
  status: 'Active' | 'Invited';
  lastActive: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Vishal Patel (You)',
    email: 'vishal760063@gmail.com',
    role: 'Owner',
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: '2',
    name: 'Ramesh Sharma',
    email: 'ramesh.accounts@enterprise.in',
    role: 'Accountant / CA',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    id: '3',
    name: 'Priya Mehta',
    email: 'priya.billing@enterprise.in',
    role: 'Billing Operator',
    status: 'Invited',
    lastActive: 'Pending accept',
  },
];

export function useIdentity() {
  const [userProfile, setUserProfile] = useState<UserProfileState>({
    name: 'Vishal Patel',
    email: 'vishal760063@gmail.com',
    phone: '+91 98765 43210',
    designation: 'Founder & Managing Director',
    language: 'en-IN',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Kolkata',
    twoFactorEnabled: false,
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [loading, setLoading] = useState(false);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfileState>) => {
    setLoading(true);
    try {
      setUserProfile((prev) => ({ ...prev, ...updates }));
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteMember = useCallback(async (name: string, email: string, role: TeamMember['role']) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      role,
      status: 'Invited',
      lastActive: 'Invite Sent',
    };
    setTeamMembers((prev) => [...prev, newMember]);
    return newMember;
  }, []);

  const removeMember = useCallback(async (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    userProfile,
    teamMembers,
    loading,
    updateUserProfile,
    inviteMember,
    removeMember,
  };
}

export default useIdentity;
