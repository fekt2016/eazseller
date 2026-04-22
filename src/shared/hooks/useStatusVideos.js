import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import statusApi from '../services/statusApi';

const STATUS_QUERY_KEY = ['seller-status-videos'];

export const useMyStatusVideos = (enabled = true) =>
  useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: async () => {
      const response = await statusApi.getMyStatuses();
      return response?.data?.items || [];
    },
    enabled,
  });

export const useCreateStatusVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: statusApi.createStatus,
    onSuccess: () => {
      toast.success('Status video posted');
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to post status video'
      );
    },
  });
};

export const useDeleteStatusVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: statusApi.deleteStatus,
    onSuccess: () => {
      toast.success('Status video deleted');
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete status video'
      );
    },
  });
};

export const useRepostStatusVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: statusApi.repostStatus,
    onSuccess: () => {
      toast.success('Status reposted');
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to repost status video'
      );
    },
  });
};

