/**
 * ForgotPasswordPage Component Tests
 * 
 * Tests for the unified email-only password reset flow:
 * - Renders forgot password form correctly
 * - Validates email input
 * - Handles password reset request
 * - Shows success state after submission
 * - Handles errors gracefully
 * - Handles loading state
 * - Navigates to login after success
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import ForgotPasswordPage from '../../features/auth/ForgotPasswordPage';
import { toast } from 'react-toastify';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

// Mock useAuth
const mockRequestPasswordReset = {
  mutateAsync: vi.fn(async (email) => {
    // Simulate async behavior - return a promise that resolves
    return new Promise((resolve) => {
      queueMicrotask(() => {
        resolve({ success: true, message: 'Reset email sent' });
      });
    });
  }),
  isPending: false,
  error: null,
};

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    requestPasswordReset: mockRequestPasswordReset,
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

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockRequestPasswordReset.mutateAsync.mockClear();
    mockRequestPasswordReset.isPending = false;
    mockRequestPasswordReset.error = null;
  });

  test('renders forgot password form correctly', async () => {
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your\.email@example\.com|email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    
    // Button should be disabled when email is empty
    expect(submitButton).toBeDisabled();
    
    // Try to submit empty form
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).not.toHaveBeenCalled();
    });
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com|email address/i);
    const form = emailInput.closest('form');

    // Type invalid email (no @ symbol)
    await user.type(emailInput, 'invalid-email');
    
    // Use fireEvent.submit to bypass HTML5 validation and trigger our custom validation
    fireEvent.submit(form);

    // Component validates email format and shows toast error
    // The validation happens before mutateAsync is called
    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address');
    }, { timeout: 2000 });
  });

  test('handles password reset request successfully', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com|email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).toHaveBeenCalledWith('test@example.com');
    });
  });

  test('shows success state after submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com|email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).toHaveBeenCalled();
    });

    // Wait for success state - use more specific selector for heading
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check for success message text (may be split across elements)
    await waitFor(() => {
      expect(screen.getByText(/if an account exists/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('handles loading state', async () => {
    // Create a new mock with isPending: true
    const useAuth = vi.mocked((await import('../../shared/hooks/useAuth')).default);
    useAuth.mockReturnValue({
      requestPasswordReset: {
        mutateAsync: mockRequestPasswordReset.mutateAsync,
        isPending: true,
        error: null,
      },
    });

    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    // When loading, button should be disabled
    await waitFor(() => {
      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });
    
    // Reset mock for other tests
    useAuth.mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset,
    });
  });

  test('normalizes email to lowercase', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com|email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'TEST@EXAMPLE.COM');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).toHaveBeenCalledWith('test@example.com');
    });
  });

  test('trims email whitespace', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    // Get form elements before any state changes
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your\.email@example\.com|email address/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com|email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    // Type email with whitespace
    await user.clear(emailInput);
    await user.type(emailInput, '  test@example.com  ');
    await user.click(submitButton);

    // Component should trim and normalize email before calling mutateAsync
    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).toHaveBeenCalledWith('test@example.com');
    });
  });

  test('navigates to login after viewing success message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    // Get form elements before submission
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your\.email@example\.com|email address/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com|email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).toHaveBeenCalled();
    });

    // Wait for success state - use heading selector
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    }, { timeout: 2000 });

    // Find and click "Back to Login" button (it's a LoadingButton)
    const loginButton = screen.getByRole('button', { name: /back to login/i });
    await user.click(loginButton);
    
    // Navigation should be called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 1000 });
  });

  test('displays generic success message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />, {
      initialRoute: '/forgot-password',
    });

    // Get form elements before submission
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your\.email@example\.com|email address/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com|email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Wait for mutation to be called and success callback to execute
    await waitFor(() => {
      expect(mockRequestPasswordReset.mutateAsync).toHaveBeenCalled();
    });

    // Toast success should be called in the onSuccess callback
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('If an account exists, a reset email has been sent.');
    }, { timeout: 2000 });
  });
});
