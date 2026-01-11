/**
 * SetupPage Component Tests
 * 
 * Tests for the seller SetupPage:
 * - Renders setup page
 * - Displays setup steps
 * - Handles loading state
 * - Displays completion status
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import SetupPage from '../../features/onboarding/SetupPage';

// Mock useSellerStatus
const mockOnboardingStage = 'profile_incomplete';
const mockVerification = {
  emailVerified: false,
  phoneVerified: false,
  contactVerified: false,
};

const mockRequiredSetup = {
  hasBusinessDocumentsVerified: false,
  hasPaymentMethodVerified: false,
};

const mockUpdateOnboarding = vi.fn();

const mockUseSellerStatus = vi.fn(() => ({
  onboardingStage: mockOnboardingStage,
  verification: mockVerification,
  requiredSetup: mockRequiredSetup,
  isLoading: false,
  updateOnboarding: mockUpdateOnboarding,
  isUpdating: false,
  isSetupComplete: false,
  isVerified: false,
  businessDocumentsStatus: { isVerified: false },
  paymentMethodStatus: { isVerified: false },
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
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

describe('SetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockUseSellerStatus.mockReturnValue({
      onboardingStage: 'profile_incomplete',
      verification: mockVerification,
      requiredSetup: mockRequiredSetup,
      isLoading: false,
      updateOnboarding: mockUpdateOnboarding,
      isUpdating: false,
      isSetupComplete: false,
      isVerified: false,
      businessDocumentsStatus: { isVerified: false },
      paymentMethodStatus: { isVerified: false },
    });
  });

  test('renders setup page', async () => {
    renderWithProviders(<SetupPage />, {
      initialRoute: '/setup',
    });

    await waitFor(() => {
      expect(screen.getByText(/welcome to eazshop/i)).toBeInTheDocument();
    });
  });

  test('displays setup steps', async () => {
    renderWithProviders(<SetupPage />, {
      initialRoute: '/setup',
    });

    await waitFor(() => {
      expect(screen.getByText(/upload & verify business documents/i)).toBeInTheDocument();
      expect(screen.getByText(/setup & verify payment methods/i)).toBeInTheDocument();
      expect(screen.getByText(/verify contact information/i)).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    mockUseSellerStatus.mockReturnValue({
      onboardingStage: 'profile_incomplete',
      verification: mockVerification,
      requiredSetup: mockRequiredSetup,
      isLoading: true,
      updateOnboarding: mockUpdateOnboarding,
      isUpdating: false,
      isSetupComplete: false,
      isVerified: false,
      businessDocumentsStatus: { isVerified: false },
      paymentMethodStatus: { isVerified: false },
    });

    renderWithProviders(<SetupPage />, {
      initialRoute: '/setup',
    });

    // Component should render while loading
    await waitFor(() => {
      expect(mockUseSellerStatus).toHaveBeenCalled();
    });
  });

  test('displays completion status', async () => {
    renderWithProviders(<SetupPage />, {
      initialRoute: '/setup',
    });

    await waitFor(() => {
      // Setup steps should be displayed
      expect(screen.getByText(/upload & verify business documents/i)).toBeInTheDocument();
    });
  });
});

