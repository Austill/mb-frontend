import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentUser,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  exportUserData as apiExportUserData,
  deleteAccount as apiDeleteAccount,
} from '@/services/authService';

export default function useUser() {
  const { toast } = useToast();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (err) {
      console.error('Failed to fetch user', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: any) => {
    try {
      const updated = await apiUpdateProfile(payload);
      setUser((prev) => ({ ...(prev || {}), ...updated }));
      toast({ title: 'Success', description: 'Profile updated' });
      return updated;
    } catch (err: any) {
      console.error('updateProfile error', err);
      toast({ title: 'Error', description: err?.message || 'Failed to update profile', variant: 'destructive' });
      throw err;
    }
  }, [toast]);

  const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const res = await apiChangePassword(data);
      toast({ title: 'Success', description: 'Password changed' });
      return res;
    } catch (err: any) {
      console.error('changePassword error', err);
      toast({ title: 'Error', description: err?.message || 'Failed to change password', variant: 'destructive' });
      throw err;
    }
  }, [toast]);

  const exportData = useCallback(async () => {
    try {
      const blobRes = await apiExportUserData();
      return blobRes;
    } catch (err: any) {
      console.error('exportData error', err);
      toast({ title: 'Error', description: 'Failed to export data', variant: 'destructive' });
      throw err;
    }
  }, [toast]);

  const removeAccount = useCallback(async () => {
    try {
      await apiDeleteAccount();
      toast({ title: 'Account Deleted', description: 'Your account has been removed' });
    } catch (err: any) {
      console.error('deleteAccount error', err);
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
      throw err;
    }
  }, [toast]);

  return {
    user,
    setUser,
    isLoading,
    refresh,
    updateProfile,
    changePassword,
    exportData,
    removeAccount,
  };
}
