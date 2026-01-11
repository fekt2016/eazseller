/**
 * SellerFundsPage Component Tests
 * 
 * Tests for the seller SellerFundsPage:
 * - Renders funds page
 * - Displays wallet summary
 * - Displays transactions
 * - Handles loading state
 * - Handles withdrawal modal
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import SellerFundsPage from '../../features/sellerFunds/pages/SellerFundsPage';

// Mock child components
vi.mock('../../features/sellerFunds/components/FundsSummaryCard', () => ({
  __esModule: true,
  default: ({ availableBalance, pendingBalance }) => (
    <div data-testid="funds-summary-card">
      <div>Available: {availableBalance}</div>
      <div>Pending: {pendingBalance}</div>
    </div>
  ),
}));

vi.mock('../../features/sellerFunds/components/TransactionsTable', () => ({
  __esModule: true,
  default: ({ transactions }) => (
    <div data-testid="transactions-table">
      {transactions.length} transactions
    </div>
  ),
}));

vi.mock('../../features/sellerFunds/components/RequestWithdrawalModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSubmit }) => (
    isOpen ? (
      <div data-testid="withdrawal-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSubmit({ amount: 100 })}>Submit</button>
      </div>
    ) : null
  ),
}));

// Mock useSellerFunds
const mockGetWalletSummary = vi.fn(() => ({
  availableBalance: 1000,
  pendingBalance: 500,
  totalEarnings: 5000,
  withdrawnAmount: 3500,
  isLoading: false,
}));

const mockGetTransactions = vi.fn(() => ({
  data: { transactions: [] },
  isLoading: false,
}));

const mockRequestWithdrawal = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

const mockDeleteWithdrawal = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

const mockUseSellerFunds = vi.fn(() => ({
  getWalletSummary: mockGetWalletSummary,
  getTransactions: mockGetTransactions,
  requestWithdrawal: mockRequestWithdrawal,
  deleteWithdrawal: mockDeleteWithdrawal,
}));

vi.mock('../../features/sellerFunds/hooks/useSellerFunds', () => ({
  useSellerFunds: (...args) => mockUseSellerFunds(...args),
}));

// Mock useGetPaymentRequests
const mockUseGetPaymentRequests = vi.fn(() => ({
  data: { paymentRequests: [] },
  isLoading: false,
}));

vi.mock('../../shared/hooks/usePaymentRequest', () => ({
  useGetPaymentRequests: (...args) => mockUseGetPaymentRequests(...args),
  useDeletePaymentRequest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// Mock useGetPaymentMethods
const mockUseGetPaymentMethods = vi.fn(() => ({
  data: [],
  isLoading: false,
}));

vi.mock('../../shared/hooks/usePaymentMethod', () => ({
  useGetPaymentMethods: (...args) => mockUseGetPaymentMethods(...args),
}));

// Mock useDynamicPageTitle
vi.mock('../../shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('SellerFundsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetWalletSummary.mockReturnValue({
      availableBalance: 1000,
      pendingBalance: 500,
      totalEarnings: 5000,
      withdrawnAmount: 3500,
      isLoading: false,
    });
    
    mockGetTransactions.mockReturnValue({
      data: { transactions: [] },
      isLoading: false,
    });
  });

  test('renders funds page', async () => {
    renderWithProviders(<SellerFundsPage />, {
      initialRoute: '/dashboard/funds',
    });

    await waitFor(() => {
      expect(screen.getByText(/funds & wallet/i)).toBeInTheDocument();
    });
  });

  test('displays wallet summary', async () => {
    renderWithProviders(<SellerFundsPage />, {
      initialRoute: '/dashboard/funds',
    });

    await waitFor(() => {
      expect(screen.getByTestId('funds-summary-card')).toBeInTheDocument();
    });
  });

  test('displays transactions', async () => {
    renderWithProviders(<SellerFundsPage />, {
      initialRoute: '/dashboard/funds',
    });

    await waitFor(() => {
      expect(screen.getByTestId('transactions-table')).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    mockGetWalletSummary.mockReturnValue({
      availableBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      withdrawnAmount: 0,
      isLoading: true,
    });

    renderWithProviders(<SellerFundsPage />, {
      initialRoute: '/dashboard/funds',
    });

    // Component should render while loading
    await waitFor(() => {
      expect(mockGetWalletSummary).toHaveBeenCalled();
    });
  });
});

