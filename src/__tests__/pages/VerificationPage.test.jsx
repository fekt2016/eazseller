/**
 * VerificationPage Component Tests
 * 
 * Tests for the seller VerificationPage:
 * - Renders verification page
 * - Displays email verification section
 * - Handles sending email OTP
 * - Handles email verification
 * - Handles embedded mode
 * - Displays verification status
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import VerificationPage from '../../features/profile/VerificationPage';

// Mock onboardingApi
const mockSendEmailVerificationOtp = vi.fn();
const mockVerifyEmail = vi.fn();

vi.mock('../../shared/services/onboardingApi', () => ({
  __esModule: true,
  default: {
    sendEmailVerificationOtp: (...args) => mockSendEmailVerificationOtp(...args),
    verifyEmail: (...args) => mockVerifyEmail(...args),
  },
}));

// Mock useAuth
const mockSeller = {
  _id: 'seller123',
  id: 'seller123',
  name: 'John Doe',
  email: 'john@test.com',
};

const mockRefetchAuth = vi.fn();

const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
  refetchAuth: mockRefetchAuth,
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useSellerStatus
const mockVerification = {
  emailVerified: false,
};

const mockRefetch = vi.fn();

const mockUseSellerStatus = vi.fn(() => ({
  verification: mockVerification,
  refetch: mockRefetch,
}));

vi.mock('../../shared/hooks/useSellerStatus', () => ({
  __esModule: true,
  default: (...args) => mockUseSellerStatus(...args),
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

describe('VerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockSendEmailVerificationOtp.mockResolvedValue({ data: { success: true } });
    mockVerifyEmail.mockResolvedValue({ data: { success: true } });
    
    mockUseAuth.mockReturnValue({
      seller: mockSeller,
      refetchAuth: mockRefetchAuth,
    });
    
    mockUseSellerStatus.mockReturnValue({
      verification: mockVerification,
      refetch: mockRefetch,
    });
  });

  test('renders verification page', async () => {
    renderWithProviders(<VerificationPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      // Component renders email verification section
      expect(screen.getByText(/email verification/i)).toBeInTheDocument();
    });
  });

  test('displays email verification section', async () => {
    renderWithProviders(<VerificationPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByText(/email verification/i)).toBeInTheDocument();
    });
  });

  test('displays verification status', async () => {
    renderWithProviders(<VerificationPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      // Should show not verified badge when email is not verified
      expect(screen.getByText(/not verified/i)).toBeInTheDocument();
    });
  });

  test('handles sending email OTP', async () => {
    const user = userEvent.setup();

    renderWithProviders(<VerificationPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByText(/email verification/i)).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockSendEmailVerificationOtp).toHaveBeenCalled();
    });
  });

  test('handles email verification', async () => {
    const user = userEvent.setup();

    renderWithProviders(<VerificationPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByText(/email verification/i)).toBeInTheDocument();
    });

    // Send OTP first
    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockSendEmailVerificationOtp).toHaveBeenCalled();
    }, { timeout: 3000 });

    // After OTP is sent, the form should appear
    await waitFor(() => {
      const otpInput = screen.getByPlaceholderText('000000');
      expect(otpInput).toBeInTheDocument();
    }, { timeout: 3000 });

    // Enter OTP
    const otpInput = screen.getByPlaceholderText('000000');
    await user.type(otpInput, '123456');

    // Verify
    const verifyButton = screen.getByRole('button', { name: /verify email/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalled();
    });
  });

  test('handles embedded mode', async () => {
    renderWithProviders(<VerificationPage embedded />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByText(/email verification/i)).toBeInTheDocument();
    });
  });
});

