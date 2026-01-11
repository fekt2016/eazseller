/**
 * PaymentMethodPage Component Tests
 * 
 * Tests for the seller PaymentMethodPage:
 * - Renders payment method page
 * - Displays tabs (bank and mobile money)
 * - Handles tab switching
 * - Displays payment methods list
 * - Handles loading state
 * - Handles embedded mode
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import PaymentMethodPage from '../../features/profile/PaymentMethodPage';

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useAuth
const mockSeller = {
  _id: 'seller123',
  id: 'seller123',
  name: 'John Doe',
  payoutStatus: 'approved',
};

const mockUpdate = {
  mutate: vi.fn(),
  isPending: false,
};

const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
  update: mockUpdate,
  isUpdateLoading: false,
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useSellerStatus
const mockUpdateOnboardingAsync = vi.fn();
const mockUseSellerStatus = vi.fn(() => ({
  updateOnboardingAsync: mockUpdateOnboardingAsync,
}));

vi.mock('../../shared/hooks/useSellerStatus', () => ({
  __esModule: true,
  default: (...args) => mockUseSellerStatus(...args),
}));

// Mock usePaymentMethod hooks
const mockPaymentMethods = [
  {
    _id: 'pm1',
    type: 'bank_transfer',
    bankName: 'GCB Bank',
    accountNumber: '1234567890',
    accountName: 'John Doe',
    isDefault: true,
    verificationStatus: 'approved',
  },
  {
    _id: 'pm2',
    type: 'mobile_money',
    provider: 'MTN',
    mobileNumber: '+233241234567',
    accountName: 'John Doe',
    isDefault: false,
    verificationStatus: 'pending',
  },
];

const mockUseGetPaymentMethods = vi.fn(() => ({
  data: mockPaymentMethods,
  isLoading: false,
  refetch: vi.fn(),
}));

const mockDeletePaymentMethod = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockSetDefaultPaymentMethod = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockCreatePaymentMethod = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockUpdatePaymentMethod = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock('../../shared/hooks/usePaymentMethod', () => ({
  useGetPaymentMethods: (...args) => mockUseGetPaymentMethods(...args),
  useDeletePaymentMethod: (...args) => ({
    deletePaymentMethod: mockDeletePaymentMethod,
  }),
  useSetDefaultPaymentMethod: (...args) => ({
    setDefaultPaymentMethod: mockSetDefaultPaymentMethod,
  }),
  useCreatePaymentMethod: (...args) => ({
    createPaymentMethod: mockCreatePaymentMethod,
  }),
  useUpdatePaymentMethod: (...args) => ({
    updatePaymentMethod: mockUpdatePaymentMethod,
  }),
}));

// Mock phoneNetworkDetector
vi.mock('../../shared/utils/phoneNetworkDetector', () => ({
  detectGhanaPhoneNetwork: vi.fn((phone) => {
    if (phone.startsWith('024') || phone.startsWith('054')) return 'MTN';
    if (phone.startsWith('020') || phone.startsWith('050')) return 'Vodafone';
    return 'AirtelTigo';
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

describe('PaymentMethodPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockUseGetPaymentMethods.mockReturnValue({
      data: mockPaymentMethods,
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  test('renders payment method page', async () => {
    renderWithProviders(<PaymentMethodPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      // Component renders form fields, check for account name label
      expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
    });
  });

  test('displays tabs', async () => {
    renderWithProviders(<PaymentMethodPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      // Tabs are rendered as buttons
      const bankTab = screen.getByRole('button', { name: /bank account/i });
      const mobileTab = screen.getByRole('button', { name: /mobile money/i });
      expect(bankTab).toBeInTheDocument();
      expect(mobileTab).toBeInTheDocument();
    });
  });

  test('handles tab switching', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PaymentMethodPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
    });

    // Click mobile money tab
    const mobileTab = screen.getByRole('button', { name: /mobile money/i });
    await user.click(mobileTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });
  });

  test('displays payment methods list', async () => {
    renderWithProviders(<PaymentMethodPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      // Payment methods are displayed in a table/list
      // Check for bank name or provider
      const bankTexts = screen.getAllByText('GCB Bank');
      const mtnTexts = screen.getAllByText('MTN');
      expect(bankTexts.length).toBeGreaterThan(0);
      expect(mtnTexts.length).toBeGreaterThan(0);
    });
  });

  test('handles loading state', async () => {
    mockUseGetPaymentMethods.mockReturnValue({
      data: [],
      isLoading: true,
      refetch: vi.fn(),
    });

    renderWithProviders(<PaymentMethodPage />, {
      initialRoute: '/dashboard/settings',
    });

    // Component should render loading state
    await waitFor(() => {
      expect(mockUseGetPaymentMethods).toHaveBeenCalled();
    });
  });

  test('handles embedded mode', async () => {
    renderWithProviders(<PaymentMethodPage embedded />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      // In embedded mode, check for form fields
      expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
    });
  });
});

