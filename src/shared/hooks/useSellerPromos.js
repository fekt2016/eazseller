import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import sellerPromoApi from '../services/sellerPromoApi';

const toArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

export const useSellerPromos = ({ tab = 'active', page = 1, limit = 12 } = {}) =>
  useQuery({
    queryKey: ['seller-promos', tab, page, limit],
    queryFn: () => sellerPromoApi.getSellerPromos({ tab, page, limit }),
    staleTime: 60 * 1000,
  });

export const useSellerPromo = (promoId) =>
  useQuery({
    queryKey: ['seller-promo', promoId],
    queryFn: () => sellerPromoApi.getSellerPromo(promoId),
    enabled: Boolean(promoId),
  });

export const useSellerPromoEligibleProducts = (promoId, params = {}) =>
  useQuery({
    queryKey: ['seller-promo-eligible-products', promoId, params],
    queryFn: () => sellerPromoApi.getSellerPromoEligibleProducts(promoId, params),
    enabled: Boolean(promoId),
  });

export const useSubmitSellerPromoProducts = (promoId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      sellerPromoApi.submitSellerPromoProducts(promoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-promo', promoId] });
      queryClient.invalidateQueries({
        queryKey: ['seller-promo-eligible-products', promoId],
      });
      queryClient.invalidateQueries({ queryKey: ['seller-my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-promos'] });
    },
  });
};

export const useMyPromoSubmissions = ({ status, promoId, page = 1, limit = 20 } = {}) =>
  useQuery({
    queryKey: ['seller-my-submissions', status, promoId, page, limit],
    queryFn: () =>
      sellerPromoApi.getMyPromoSubmissions({ status, promoId, page, limit }),
  });

export const useWithdrawSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId) => sellerPromoApi.withdrawSubmission(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-promos'] });
      queryClient.invalidateQueries({ queryKey: ['seller-promo'] });
    },
  });
};

export const useUpdateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, payload }) =>
      sellerPromoApi.updateSubmission(submissionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['seller-promos'] });
      queryClient.invalidateQueries({ queryKey: ['seller-promo'] });
    },
  });
};

export const usePendingSubmissionsCount = () => {
  const query = useMyPromoSubmissions({ status: 'pending', page: 1, limit: 1 });

  const pendingCount = useMemo(() => {
    const data = query.data || {};
    if (typeof data.pendingCount === 'number') return data.pendingCount;
    if (typeof data.total === 'number') return data.total;
    const rows = toArray(data, ['items', 'submissions', 'results']);
    return rows.length;
  }, [query.data]);

  return {
    ...query,
    pendingCount,
  };
};

export const sellerPromoSelectors = {
  promos: (data) => toArray(data, ['promos', 'items', 'results']),
  eligibleProducts: (data) =>
    toArray(data, [
      'eligibleProducts',
      'products',
      'items',
      'results',
      'rows',
    ]),
  submissions: (data) => toArray(data, ['submissions', 'items', 'results']),
};

// Backward-compatible aliases for older imports.
export const useSubmitPromoProducts = useSubmitSellerPromoProducts;
export const useSellerPromoSubmissions = (promoId, params = {}) =>
  useMyPromoSubmissions({ ...params, promoId });
