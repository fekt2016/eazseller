/**
 * Fetches platform tax rates (VAT, NHIL, GETFund) for seller product form.
 * Used to show "total with tax" beside price input. Backend uses same rates for product save.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderApi';

const TAX_RATES_QUERY_KEY = ['platform', 'taxRates'];

const toRate = (v) => {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n > 1 ? n / 100 : n;
};

export function usePlatformTaxRates(options = {}) {
  const query = useQuery({
    queryKey: TAX_RATES_QUERY_KEY,
    queryFn: async () => {
      const data = await orderService.getTaxRates();
      const raw = data?.data?.taxRates ?? data?.taxRates ?? null;
      if (!raw || typeof raw !== 'object') return null;
      return {
        vatRate: toRate(raw.vatRate) ?? 0.125,
        nhilRate: toRate(raw.nhilRate) ?? 0.025,
        getfundRate: toRate(raw.getfundRate) ?? 0.025,
      };
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const taxRates = query.data ?? null;
  const vatRate = taxRates?.vatRate ?? 0.125;
  const nhilRate = taxRates?.nhilRate ?? 0.025;
  const getfundRate = taxRates?.getfundRate ?? 0.025;
  const totalTaxRate = vatRate + nhilRate + getfundRate;

  /** Base price (excl. tax) → customer price (incl. VAT + NHIL + GETFund) */
  const addTaxToBase = useCallback((basePrice) => {
    const base = parseFloat(basePrice);
    if (base == null || base <= 0 || Number.isNaN(base)) return null;
    return Math.round(base * (1 + totalTaxRate) * 100) / 100;
  }, [totalTaxRate]);

  return {
    taxRates,
    addTaxToBase,
    totalTaxRate,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export default usePlatformTaxRates;
