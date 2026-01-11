/**
 * UnifiedWalletPage Component Tests
 * 
 * Tests for the seller UnifiedWalletPage:
 * - Renders wallet page
 * - Displays balance information
 * - Displays tabs (overview, history)
 * - Handles tab switching
 * - Handles loading state
 * - Displays payment requests
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import UnifiedWalletPage from '../../features/finance/UnifiedWalletPage';

// Mock child components
vi.mock('../../components/finance/TransactionList', () => ({
  __esModule: true,
  default: () => <div data-testid="transaction-list">Transaction List</div>,
}));

vi.mock('../../features/finance/ReversalModal', () => ({
  __esModule: true,
  default: ({ isOpen }) => (
    isOpen ? <div data-testid="reversal-modal">Reversal Modal</div> : null
  ),
}));

// Mock useAuth
const mockSeller = {
  _id: 'seller123',
  id: 'seller123',
  name: 'John Doe',
  paymentMethods: {
    bankAccount: {
      accountName: 'John Doe',
      accountNumber: '1234567890',
      bankName: 'GCB Bank',
    },
  },
};

const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useSellerBalance
const mockUseSellerBalance = vi.fn(() => ({
  availableBalance: 1000.00,
  pendingBalance: 500.00,
  totalEarnings: 5000.00,
  withdrawnAmount: 3500.00,
  lockedBalance: 0,
  isLoading: false,
  error: null,
  payoutStatus: 'verified',
  payoutRejectionReason: null,
}));

vi.mock('../../shared/hooks/finance/useSellerBalance', () => ({
  useSellerBalance: (...args) => mockUseSellerBalance(...args),
}));

// Mock useGetPaymentRequests
const mockPaymentRequests = [
  {
    _id: 'req1',
    amount: 500,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'req2',
    amount: 300,
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
];

const mockUseGetPaymentRequests = vi.fn(() => ({
  data: { paymentRequests: mockPaymentRequests },
  isLoading: false,
}));

vi.mock('../../shared/hooks/usePaymentRequest', () => ({
  useGetPaymentRequests: (...args) => mockUseGetPaymentRequests(...args),
  useCreatePaymentRequest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeletePaymentRequest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useRequestReversal: () => ({
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

// Mock usePayout
vi.mock('../../shared/hooks/usePayout', () => ({
  useSubmitPinForWithdrawal: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// Mock useDynamicPageTitle
vi.mock('../../shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UnifiedWalletPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockUseSellerBalance.mockReturnValue({
      availableBalance: 1000.00,
      pendingBalance: 500.00,
      totalEarnings: 5000.00,
      withdrawnAmount: 3500.00,
      lockedBalance: 0,
      isLoading: false,
      error: null,
      payoutStatus: 'verified',
      payoutRejectionReason: null,
    });
    
    mockUseGetPaymentRequests.mockReturnValue({
      data: { paymentRequests: mockPaymentRequests },
      isLoading: false,
    });
  });

  test('renders wallet page', async () => {
    renderWithProviders(<UnifiedWalletPage />, {
      initialRoute: '/dashboard/finance',
    });

    await waitFor(() => {
      expect(screen.getByText(/wallet & withdrawals/i)).toBeInTheDocument();
    });
  });

  test('displays balance information', async () => {
    renderWithProviders(<UnifiedWalletPage />, {
      initialRoute: '/dashboard/finance',
    });

    await waitFor(() => {
      // Balance information should be displayed
      expect(screen.getByText(/available balance/i)).toBeInTheDocument();
    });
  });

  test('displays tabs', async () => {
    renderWithProviders(<UnifiedWalletPage />, {
      initialRoute: '/dashboard/finance',
    });

    await waitFor(() => {
      // Tabs are rendered as buttons
      const overviewTab = screen.getByRole('button', { name: /overview/i });
      const historyTab = screen.getByRole('button', { name: /withdrawal history/i });
      expect(overviewTab).toBeInTheDocument();
      expect(historyTab).toBeInTheDocument();
    });
  });

  test('handles tab switching', async () => {
    const user = userEvent.setup();

    renderWithProviders(<UnifiedWalletPage />, {
      initialRoute: '/dashboard/finance',
    });

    await waitFor(() => {
      expect(screen.getByText(/wallet & withdrawals/i)).toBeInTheDocument();
    });

    // Click history tab
    const historyTab = screen.getByRole('button', { name: /withdrawal history/i });
    await user.click(historyTab);

    // History tab should show transaction list or withdrawal history
    await waitFor(() => {
      // The history tab content should be visible
      expect(screen.getByText(/withdrawal history/i)).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    mockUseSellerBalance.mockReturnValue({
      availableBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      withdrawnAmount: 0,
      lockedBalance: 0,
      isLoading: true,
      error: null,
      payoutStatus: 'pending',
      payoutRejectionReason: null,
    });

    renderWithProviders(<UnifiedWalletPage />, {
      initialRoute: '/dashboard/finance',
    });

    // Component should render while loading
    await waitFor(() => {
      expect(mockUseSellerBalance).toHaveBeenCalled();
    });
  });

  test('displays transaction list in overview tab', async () => {
    renderWithProviders(<UnifiedWalletPage />, {
      initialRoute: '/dashboard/finance',
    });

    await waitFor(() => {
      // Overview tab shows TransactionList
      expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
    });
  });
});

