/**
 * ResetPasswordPage Component Tests
 * 
 * Tests for the password reset with token flow:
 * - Renders reset password form correctly with token
 * - Shows error state when no token
 * - Validates password length (min 8 characters)
 * - Validates password match
 * - Handles successful password reset
 * - Shows success state
 * - Navigates to login on success
 * - Handles API errors gracefully
 * - Shows loading state during request
 * - Button disabled when fields empty
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import ResetPasswordPage from '../../features/auth/ResetPasswordPage';
import { toast } from 'react-toastify';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

// Mock useAuth
const mockResetPasswordWithToken = {
  mutateAsync: vi.fn(async ({ token, newPassword, confirmPassword }) => {
    // Simulate async behavior - return a promise that resolves
    return new Promise((resolve) => {
      queueMicrotask(() => {
        resolve({ success: true, message: 'Password reset successful' });
      });
    });
  }),
  isPending: false,
  error: null,
};

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    resetPasswordWithToken: mockResetPasswordWithToken,
  })),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../shared/utils/logger', () => ({
  __esModule: true,
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSearchParams.delete('token');
    mockResetPasswordWithToken.mutateAsync.mockClear();
    mockResetPasswordWithToken.isPending = false;
    mockResetPasswordWithToken.error = null;
  });

  test('renders reset password form correctly with token', async () => {
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  test('shows error state when no token in URL', async () => {
    // No token set in searchParams
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /invalid link/i })).toBeInTheDocument();
      expect(screen.getByText(/this password reset link is invalid or has expired/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /request new reset link/i })).toBeInTheDocument();
    });
  });

  test('navigates to forgot-password when no token', async () => {
    // No token set
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    }, { timeout: 1000 });
  });

  test('validates password minimum length', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const form = newPasswordInput.closest('form');

    await user.type(newPasswordInput, 'short');
    await user.type(confirmPasswordInput, 'short');
    
    // Use fireEvent.submit to bypass HTML5 validation
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
      expect(mockResetPasswordWithToken.mutateAsync).not.toHaveBeenCalled();
    });
  });

  test('validates password match', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const form = newPasswordInput.closest('form');

    await user.type(newPasswordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');
    
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(mockResetPasswordWithToken.mutateAsync).not.toHaveBeenCalled();
    });
  });

  test('button is disabled when fields are empty', async () => {
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    expect(submitButton).toBeDisabled();
  });

  test('handles successful password reset', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockResetPasswordWithToken.mutateAsync).toHaveBeenCalledWith({
        token: 'valid-reset-token-123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });
    });

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /password reset successful/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('shows success state with navigation button', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /password reset successful/i })).toBeInTheDocument();
    }, { timeout: 2000 });

    // Check for navigation button
    const loginButton = screen.getByRole('button', { name: /go to login/i });
    expect(loginButton).toBeInTheDocument();
    
    await user.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles API errors gracefully', async () => {
    mockSearchParams.set('token', 'valid-reset-token-123');
    mockResetPasswordWithToken.error = { message: 'Token expired or invalid' };

    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    await waitFor(() => {
      expect(screen.getByText(/token expired or invalid/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during request', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    // Update mock to return isPending: true
    const useAuth = vi.mocked((await import('../../shared/hooks/useAuth')).default);
    useAuth.mockReturnValue({
      resetPasswordWithToken: {
        mutateAsync: mockResetPasswordWithToken.mutateAsync,
        isPending: true,
        error: null,
      },
    });

    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    
    // Button should be disabled when loading
    await waitFor(() => {
      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });
    
    // Reset mock
    useAuth.mockReturnValue({
      resetPasswordWithToken: mockResetPasswordWithToken,
    });
  });

  test('clears password error when user starts typing', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password?token=valid-reset-token-123',
    });

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const form = newPasswordInput.closest('form');

    // Trigger validation error
    await user.type(newPasswordInput, 'short');
    await user.type(confirmPasswordInput, 'short');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });

    // Start typing in new password field - should clear error
    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'new');

    await waitFor(() => {
      expect(screen.queryByText(/password must be at least 8 characters long/i)).not.toBeInTheDocument();
    });
  });

  test('navigates to forgot-password when request new reset link clicked', async () => {
    const user = userEvent.setup();
    // No token - shows error state
    renderWithProviders(<ResetPasswordPage />, {
      initialRoute: '/reset-password',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /request new reset link/i })).toBeInTheDocument();
    });

    const requestButton = screen.getByRole('button', { name: /request new reset link/i });
    await user.click(requestButton);

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });
});


