/**
 * SettingsPage Component Tests
 * 
 * Tests for the seller SettingsPage:
 * - Renders settings page
 * - Displays all tabs
 * - Defaults to profile tab
 * - Handles tab switching
 * - Renders correct tab content
 * - Handles URL hash navigation
 * - Handles back navigation
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import SettingsPage from '../../features/settings/SettingsPage';

// Mock child components
vi.mock('../../features/profile/BusinessProfilePage', () => ({
  __esModule: true,
  default: ({ embedded }) => (
    <div data-testid="business-profile-page">
      Business Profile Page {embedded && '(Embedded)'}
    </div>
  ),
}));

vi.mock('../../features/profile/PaymentMethodPage', () => ({
  __esModule: true,
  default: ({ embedded }) => (
    <div data-testid="payment-method-page">
      Payment Method Page {embedded && '(Embedded)'}
    </div>
  ),
}));

vi.mock('../../features/profile/VerificationPage', () => ({
  __esModule: true,
  default: ({ embedded }) => (
    <div data-testid="verification-page">
      Verification Page {embedded && '(Embedded)'}
    </div>
  ),
}));

vi.mock('../../features/settings/tabs/SecurityTab', () => ({
  __esModule: true,
  default: () => <div data-testid="security-tab">Security Tab</div>,
}));

vi.mock('../../features/settings/tabs/NotificationsTab', () => ({
  __esModule: true,
  default: () => <div data-testid="notifications-tab">Notifications Tab</div>,
}));

vi.mock('../../features/settings/tabs/AccountTab', () => ({
  __esModule: true,
  default: () => <div data-testid="account-tab">Account Tab</div>,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/dashboard/settings', hash: '' };

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.hash = '';
    mockNavigate.mockClear();
  });

  test('renders settings page', async () => {
    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
      expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
    });
  });

  test('displays all tabs', async () => {
    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByText('Business Profile')).toBeInTheDocument();
      expect(screen.getByText('Payment Methods')).toBeInTheDocument();
      expect(screen.getByText('Verification')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  test('defaults to profile tab', async () => {
    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByTestId('business-profile-page')).toBeInTheDocument();
    });
  });

  test('handles tab switching', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByTestId('business-profile-page')).toBeInTheDocument();
    });

    // Click Security tab
    const securityTab = screen.getByText('Security');
    await user.click(securityTab);

    await waitFor(() => {
      expect(screen.getByTestId('security-tab')).toBeInTheDocument();
      expect(screen.queryByTestId('business-profile-page')).not.toBeInTheDocument();
    });
  });

  test('renders payment methods tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    const paymentTab = screen.getByText('Payment Methods');
    await user.click(paymentTab);

    await waitFor(() => {
      expect(screen.getByTestId('payment-method-page')).toBeInTheDocument();
    });
  });

  test('renders verification tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    const verificationTab = screen.getByText('Verification');
    await user.click(verificationTab);

    await waitFor(() => {
      expect(screen.getByTestId('verification-page')).toBeInTheDocument();
    });
  });

  test('renders notifications tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    const notificationsTab = screen.getByText('Notifications');
    await user.click(notificationsTab);

    await waitFor(() => {
      expect(screen.getByTestId('notifications-tab')).toBeInTheDocument();
    });
  });

  test('renders account tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    const accountTab = screen.getByText('Account');
    await user.click(accountTab);

    await waitFor(() => {
      expect(screen.getByTestId('account-tab')).toBeInTheDocument();
    });
  });

  test('handles back navigation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, {
      initialRoute: '/dashboard/settings',
    });

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});


