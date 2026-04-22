import React from 'react';
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import MySubmissionsPage from '../../features/promos/MySubmissionsPage';

const mockUseMyPromoSubmissions = vi.fn();
const mockUseSellerPromos = vi.fn();
const mockUseSellerPromo = vi.fn();
const mockUseWithdrawSubmission = vi.fn();
const mockUseUpdateSubmission = vi.fn();

vi.mock('../../shared/hooks/useSellerPromos', () => ({
  sellerPromoSelectors: {
    submissions: (data) => data?.submissions || [],
    promos: (data) => data?.promos || [],
  },
  useMyPromoSubmissions: (...args) => mockUseMyPromoSubmissions(...args),
  useSellerPromos: (...args) => mockUseSellerPromos(...args),
  useSellerPromo: (...args) => mockUseSellerPromo(...args),
  useWithdrawSubmission: (...args) => mockUseWithdrawSubmission(...args),
  useUpdateSubmission: (...args) => mockUseUpdateSubmission(...args),
}));

const submissionRows = [
  {
    _id: 'submission-1',
    status: 'pending',
    promo: {
      _id: 'promo-1',
      name: 'Back to School',
      status: 'scheduled',
      startDate: '2099-01-01T00:00:00.000Z',
      endDate: '2099-01-31T00:00:00.000Z',
      minDiscountPercent: 5,
    },
    product: {
      _id: 'product-1',
      name: 'Test Backpack',
      price: 150,
    },
    discountType: 'percentage',
    discountValue: 10,
    submittedAt: '2026-01-10T10:00:00.000Z',
  },
];

const setViewportWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('MySubmissionsPage responsive layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseMyPromoSubmissions.mockReturnValue({
      data: { submissions: submissionRows },
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseSellerPromos.mockReturnValue({
      data: { promos: [{ _id: 'promo-1', name: 'Back to School' }] },
    });
    mockUseSellerPromo.mockReturnValue({ data: { promo: { minDiscountPercent: 5 } } });
    mockUseWithdrawSubmission.mockReturnValue({ mutateAsync: vi.fn() });
    mockUseUpdateSubmission.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  afterEach(() => {
    setViewportWidth(1024);
  });

  test('renders desktop table layout on wide screens', async () => {
    setViewportWidth(1200);

    renderWithProviders(<MySubmissionsPage />, {
      initialRoute: '/dashboard/my-submissions',
    });

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /promo/i })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Back to School' })
      ).toBeInTheDocument();
    });
  });

  test('renders mobile card layout on narrow screens', async () => {
    setViewportWidth(375);

    renderWithProviders(<MySubmissionsPage />, {
      initialRoute: '/dashboard/my-submissions',
    });

    await waitFor(() => {
      expect(screen.queryByRole('columnheader', { name: /promo/i })).not.toBeInTheDocument();
      expect(screen.getByText('Test Backpack')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit submission for/i })).toBeInTheDocument();
    });
  });
});
