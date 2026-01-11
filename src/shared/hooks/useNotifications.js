import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationApi from '../services/notificationApi';

/**
 * Hook to get notification settings
 */
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['seller-notification-settings'],
    queryFn: async () => {
      const response = await notificationApi.getSettings();
      return response.data?.data?.settings || {
        email: {
          orderUpdates: true,
          paymentNotifications: true,
          productAlerts: true,
          accountSecurity: true,
          marketingEmails: false,
        },
        push: {
          orderUpdates: true,
          newMessages: true,
          systemAlerts: true,
        },
        sms: {
          criticalAlerts: true,
          securityNotifications: true,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update notification settings
 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => notificationApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-notification-settings'] });
    },
  });
};

