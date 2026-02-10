import { useQuery } from '@tanstack/react-query';
import { getActivePromotions } from '../services/promotionalDiscountsApi';

/**
 * Fetches active admin promotions (from promotional-discounts/public) for seller product form.
 * Returns { data: promotions[], isLoading, error } where each promotion has { key, title, discountPercent }.
 */
export default function useActivePromotions() {
  return useQuery({
    queryKey: ['activePromotions'],
    queryFn: getActivePromotions,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
