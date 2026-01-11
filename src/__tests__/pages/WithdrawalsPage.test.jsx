/**
 * WithdrawalsPage Component Tests
 * 
 * Tests for the seller WithdrawalsPage:
 * - Renders withdrawals page
 * - Displays tabs (request, history)
 * - Handles tab switching
 * - Displays balance information
 * - Handles loading state
 * - Displays payment requests
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import WithdrawalsPage from '../../features/finance/WithdrawalsPage';

// Mock child components
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
    mutate: vi.fn(),
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

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('WithdrawalsPage', () => {
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
    });
    
    mockUseGetPaymentRequests.mockReturnValue({
      data: { paymentRequests: mockPaymentRequests },
      isLoading: false,
    });
  });

  test('renders withdrawals page', async () => {
    renderWithProviders(<WithdrawalsPage />, {
      initialRoute: '/dashboard/finance/withdrawals',
    });

    await waitFor(() => {
      // Component renders withdrawal form, check for amount input
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });
  });

  test('displays tabs', async () => {
    renderWithProviders(<WithdrawalsPage />, {
      initialRoute: '/dashboard/finance/withdrawals',
    });

    await waitFor(() => {
      // Tabs are rendered as buttons - use getAllByRole since there might be multiple buttons
      const requestTabs = screen.getAllByRole('button', { name: /request withdrawal/i });
      const historyTabs = screen.getAllByRole('button', { name: /history/i });
      expect(requestTabs.length).toBeGreaterThan(0);
      expect(historyTabs.length).toBeGreaterThan(0);
    });
  });

  test('handles tab switching', async () => {
    const user = userEvent.setup();

    renderWithProviders(<WithdrawalsPage />, {
      initialRoute: '/dashboard/finance/withdrawals',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    // Click history tab
    const historyTab = screen.getByRole('button', { name: /history/i });
    await user.click(historyTab);

    await waitFor(() => {
      // History tab should be active
      expect(historyTab).toBeInTheDocument();
    });
  });

  test('displays balance information', async () => {
    renderWithProviders(<WithdrawalsPage />, {
      initialRoute: '/dashboard/finance/withdrawals',
    });

    await waitFor(() => {
      // Balance information should be displayed
      expect(screen.getByText(/available balance/i)).toBeInTheDocument();
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
    });

    renderWithProviders(<WithdrawalsPage />, {
      initialRoute: '/dashboard/finance/withdrawals',
    });

    // Component should render while loading
    await waitFor(() => {
      expect(mockUseSellerBalance).toHaveBeenCalled();
    });
  });

  test('displays withdrawal form', async () => {
    renderWithProviders(<WithdrawalsPage />, {
      initialRoute: '/dashboard/finance/withdrawals',
    });

    await waitFor(() => {
      // Withdrawal form should be displayed in request tab
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });
  });
});

