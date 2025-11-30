import api from './api';

const onboardingApi = {
  // Get seller onboarding status
  getStatus: async () => {
    const response = await api.get('/seller/status');
    return response;
  },

  // Update onboarding status
  updateOnboarding: async () => {
    const response = await api.patch('/seller/update-onboarding');
    return response;
  },

  // Send verification OTP for email
  sendEmailVerificationOtp: async () => {
    const response = await api.post('/seller/send-verification-email');
    return response;
  },

  // Verify email with OTP
  verifyEmail: async (otp) => {
    const response = await api.post('/seller/verify-email', { otp });
    return response;
  },

};

export default onboardingApi;

