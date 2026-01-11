import api from './api';

const securityApi = {
  // 2FA Management
  enable2FA: async () => {
    const response = await api.post('/seller/enable-2fa');
    return response;
  },

  get2FASetup: async () => {
    const response = await api.get('/seller/2fa/setup');
    return response;
  },

  verify2FA: async (code) => {
    const response = await api.post('/seller/verify-2fa', { code });
    return response;
  },

  disable2FA: async () => {
    const response = await api.post('/seller/disable-2fa');
    return response;
  },

  getBackupCodes: async () => {
    const response = await api.get('/seller/2fa/backup-codes');
    return response;
  },

  regenerateBackupCodes: async () => {
    const response = await api.post('/seller/2fa/regenerate-backup-codes');
    return response;
  },

  // Password Management
  updatePassword: async (currentPassword, newPassword, passwordConfirm) => {
    const response = await api.patch('/seller/me/update-password', {
      currentPassword,
      newPassword,
      passwordConfirm,
    });
    return response;
  },

  // Session Management
  getSessions: async () => {
    const response = await api.get('/seller/me/sessions');
    return response;
  },

  revokeSession: async (sessionId) => {
    const response = await api.delete(`/seller/me/sessions/${sessionId}`);
    return response;
  },

  revokeAllOtherSessions: async () => {
    const response = await api.delete('/seller/me/sessions');
    return response;
  },
};

export default securityApi;

