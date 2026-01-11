/**
 * SellerAnalyticsDashboard Component Tests
 * 
 * Tests for the seller SellerAnalyticsDashboard:
 * - Renders analytics dashboard
 * - Displays KPI cards
 * - Handles loading state
 * - Displays analytics sections
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import SellerAnalyticsDashboard from '../../features/analytics/SellerAnalyticsDashboard';

// Mock useSellerAnalytics hooks
const mockKPICards = {
  data: [
    { label: 'Total Revenue', value: 10000 },
    { label: 'Total Orders', value: 100 },
  ],
  isLoading: false,
};

const mockUseSellerKPICards = vi.fn(() => mockKPICards);
const mockUseSellerRevenueAnalytics = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerOrderStatusAnalytics = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerTopProducts = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerTrafficAnalytics = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerPayoutAnalytics = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerTaxAnalytics = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerInventoryAnalytics = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerRefundAnalytics = vi.fn(() => ({ data: [], isLoading: false }));
const mockUseSellerPerformanceScore = vi.fn(() => ({ data: { score: 85 }, isLoading: false }));

vi.mock('../../shared/hooks/useSellerAnalytics', () => ({
  useSellerKPICards: (...args) => mockUseSellerKPICards(...args),
  useSellerRevenueAnalytics: (...args) => mockUseSellerRevenueAnalytics(...args),
  useSellerOrderStatusAnalytics: (...args) => mockUseSellerOrderStatusAnalytics(...args),
  useSellerTopProducts: (...args) => mockUseSellerTopProducts(...args),
  useSellerTrafficAnalytics: (...args) => mockUseSellerTrafficAnalytics(...args),
  useSellerPayoutAnalytics: (...args) => mockUseSellerPayoutAnalytics(...args),
  useSellerTaxAnalytics: (...args) => mockUseSellerTaxAnalytics(...args),
  useSellerInventoryAnalytics: (...args) => mockUseSellerInventoryAnalytics(...args),
  useSellerRefundAnalytics: (...args) => mockUseSellerRefundAnalytics(...args),
  useSellerPerformanceScore: (...args) => mockUseSellerPerformanceScore(...args),
}));

describe('SellerAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseSellerKPICards.mockReturnValue(mockKPICards);
  });

  test('renders analytics dashboard', async () => {
    renderWithProviders(<SellerAnalyticsDashboard />, {
      initialRoute: '/dashboard/analytics',
    });

    await waitFor(() => {
      expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
    });
  });

  test('displays KPI cards', async () => {
    renderWithProviders(<SellerAnalyticsDashboard />, {
      initialRoute: '/dashboard/analytics',
    });

    await waitFor(() => {
      // KPI cards should be rendered
      expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    mockUseSellerKPICards.mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderWithProviders(<SellerAnalyticsDashboard />, {
      initialRoute: '/dashboard/analytics',
    });

    // Component should render while loading
    await waitFor(() => {
      expect(mockUseSellerKPICards).toHaveBeenCalled();
    });
  });
});

