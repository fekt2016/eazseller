import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import securityApi from '../services/securityApi';
import useAuth from './useAuth';

/**
 * Hook for 2FA management
 */
export const use2FA = () => {
  const queryClient = useQueryClient();
  const { seller } = useAuth();

  // Get 2FA status from seller data
  const is2FAEnabled = seller?.twoFactorEnabled || false;

  // Enable 2FA mutation
  const enable2FA = useMutation({
    mutationFn: async () => {
      const response = await securityApi.enable2FA();
      return response.data; // Return the data from axios response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
    },
  });

  // Get 2FA setup data
  const get2FASetup = useQuery({
    queryKey: ['2fa-setup'],
    queryFn: () => securityApi.get2FASetup(),
    enabled: false, // Only fetch when explicitly called
    retry: false,
  });

  // Verify 2FA mutation
  const verify2FA = useMutation({
    mutationFn: (code) => securityApi.verify2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
      queryClient.invalidateQueries({ queryKey: ['2fa-setup'] });
    },
  });

  // Disable 2FA mutation
  const disable2FA = useMutation({
    mutationFn: () => securityApi.disable2FA(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
    },
  });

  // Get backup codes
  const getBackupCodes = useQuery({
    queryKey: ['2fa-backup-codes'],
    queryFn: async () => {
      const response = await securityApi.getBackupCodes();
      return response.data; // Return the data from axios response
    },
    enabled: false, // Only fetch when explicitly called
    retry: false,
  });

  // Regenerate backup codes mutation
  const regenerateBackupCodes = useMutation({
    mutationFn: () => securityApi.regenerateBackupCodes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-backup-codes'] });
    },
  });

  return {
    is2FAEnabled,
    enable2FA,
    get2FASetup,
    verify2FA,
    disable2FA,
    getBackupCodes,
    regenerateBackupCodes,
  };
};

/**
 * Hook for password management
 */
export const usePasswordChange = () => {
  const queryClient = useQueryClient();

  const changePassword = useMutation({
    mutationFn: ({ currentPassword, newPassword, passwordConfirm }) =>
      securityApi.updatePassword(currentPassword, newPassword, passwordConfirm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
    },
  });

  return {
    changePassword,
    isChanging: changePassword.isPending,
    changeError: changePassword.error,
  };
};

/**
 * Hook for session management
 */
export const useSessions = () => {
  const queryClient = useQueryClient();

  // Get active sessions
  const getSessions = useQuery({
    queryKey: ['seller-sessions'],
    queryFn: async () => {
      const response = await securityApi.getSessions();
      return response.data; // Return the data from axios response
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Revoke specific session
  const revokeSession = useMutation({
    mutationFn: (sessionId) => securityApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-sessions'] });
    },
  });

  // Revoke all other sessions
  const revokeAllOtherSessions = useMutation({
    mutationFn: () => securityApi.revokeAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-sessions'] });
    },
  });

  return {
    sessions: getSessions.data?.data?.sessions || [],
    isLoading: getSessions.isLoading,
    isError: getSessions.isError,
    error: getSessions.error,
    refetch: getSessions.refetch,
    revokeSession,
    revokeAllOtherSessions,
  };
};

