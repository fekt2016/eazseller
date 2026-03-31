/**
 * AuthPage Component Tests
 * 
 * Tests for the login and signup authentication page:
 * - Renders login form by default
 * - Renders signup form when register tab is clicked
 * - Handles login with email/password
 * - Handles registration
 * - Validates form fields
 * - Handles errors
 * - Tab switching between login and signup
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import AuthPage from '../../features/auth/AuthPage';

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
const mockLoginMutation = vi.fn();
const mockVerify2FALoginMutation = vi.fn();
const mockSendOtpMutation = vi.fn();
const mockVerifyOtpMutation = vi.fn();
const mockRegisterMutation = vi.fn(async () => ({ data: { success: true } }));
const mockResendOtp = vi.fn();

const mockUseAuth = vi.fn(() => ({
  login: {
    mutate: mockLoginMutation,
    isPending: false,
    error: null,
  },
  verify2FALogin: {
    mutate: mockVerify2FALoginMutation,
    isPending: false,
    error: null,
  },
  sendOtp: {
    mutate: mockSendOtpMutation,
    isPending: false,
    error: null,
  },
  verifyOtp: {
    mutate: mockVerifyOtpMutation,
    isPending: false,
    error: null,
  },
  register: {
    mutateAsync: mockRegisterMutation,
    isPending: false,
    error: null,
  },
  verifyAccount: {
    mutate: vi.fn(),
    isPending: false,
    error: null,
  },
  resendOtp: {
    mutate: mockResendOtp,
    isPending: false,
    error: null,
  },
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock react-spinners
vi.mock('react-spinners', () => ({
  PropagateLoader: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock GoogleLoginButton (requires GoogleOAuthProvider)
vi.mock('../../features/auth/GoogleLoginButton', () => {
  const React = require('react');
  return {
    default: () => React.createElement('div', { 'data-testid': 'google-login' }, 'Google Sign In'),
  };
});

// Mock PATHS
vi.mock('../../routes/routePaths', () => ({
  PATHS: {
    DASHBOARD: '/dashboard',
    FORGOT_PASSWORD: '/forgot-password',
  },
}));

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockLoginMutation.mockClear();
    mockRegisterMutation.mockClear();
    mockLoginMutation.mockImplementation((data, options) => {
      // Simulate success callback
      queueMicrotask(() => {
        if (options?.onSuccess) {
          options.onSuccess({ success: true, seller: { id: 'seller123', email: data.email } });
        }
      });
    });
    mockRegisterMutation.mockResolvedValue({ data: { success: true, requiresVerification: false } });
  });

  test('renders login form by default', async () => {
    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your\.email@example\.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 20000);

  test('switches to signup tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    // Click signup tab
    const signupTab = screen.getByText(/register/i);
    await user.click(signupTab);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your seller account/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  test('switches back to login tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    // Switch to signup
    const signupTab = screen.getByText(/register/i);
    await user.click(signupTab);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your seller account/i })).toBeInTheDocument();
    });

    // Switch back to login
    const loginTab = screen.getByText(/login/i);
    await user.click(loginTab);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'seller@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledWith(
        {
          email: 'seller@test.com',
          password: 'password123',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    }, { timeout: 2000 });

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 2000 });
  });

  test('validates email format on login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    const emailInput = screen.getByPlaceholderText(/your\.email@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const form = emailInput.closest('form');

    // Type invalid email
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    
    // Use fireEvent.submit to bypass HTML5 validation
    fireEvent.submit(form);

    await waitFor(() => {
      // Should not call login mutation with invalid email
      expect(mockLoginMutation).not.toHaveBeenCalled();
    });
  });

  test('button is disabled when login fields are empty', async () => {
    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  test('renders registration form with all fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialRoute: '/signup',
    });

    // Click signup tab if not already active
    const signupTab = screen.getByText(/register/i);
    await user.click(signupTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your shop name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/024\s*123\s*4567/i)).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<AuthPage />, {
      initialRoute: '/signup',
    });

    const signupTab = screen.getByText(/register/i);
    await user.click(signupTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
    });

    // Fill form using fireEvent for speed (user.type is slow with many fields)
    const nameInput = screen.getByPlaceholderText(/enter your full name/i);
    const phoneInput = screen.getByPlaceholderText(/024\s*123\s*4567/i);
    const shopInput = screen.getByPlaceholderText(/enter your shop name/i);
    const locationInput = screen.getByPlaceholderText(/e\.g\. Nima/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInputs = screen.getAllByPlaceholderText(/enter your password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm your password/i);

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test Seller' } });
    fireEvent.change(phoneInput, { target: { name: 'contactNumber', value: '0241234567' } });
    fireEvent.change(shopInput, { target: { name: 'shopName', value: 'Test Shop' } });
    fireEvent.change(locationInput, { target: { name: 'location', value: 'Accra' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'seller@test.com' } });
    fireEvent.change(passwordInputs[0], { target: { name: 'password', value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { name: 'passwordConfirm', value: 'Password123!' } });

    await user.click(screen.getByRole('checkbox', { name: /agree.*privacy|privacy.*terms/i }));

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterMutation).toHaveBeenCalled();
    }, { timeout: 5000 });
  }, 15000);

  test('validates password match on registration', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<AuthPage />, {
      initialRoute: '/signup',
    });

    // Click signup tab
    const signupTab = screen.getByText(/register/i);
    await user.click(signupTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByPlaceholderText(/enter your password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const form = passwordInput.closest('form');

    // Type mismatched passwords (meet complexity: 8+ chars, digit, special)
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password456!');
    
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(mockRegisterMutation).not.toHaveBeenCalled();
    }, { timeout: 5000 });
  }, 20000);

  test('displays error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockUseAuth.mockReturnValue({
      login: {
        mutate: mockLoginMutation,
        isPending: false,
        error: { message: errorMessage, response: { data: { message: errorMessage } } },
      },
      verify2FALogin: {
        mutate: mockVerify2FALoginMutation,
        isPending: false,
        error: null,
      },
      sendOtp: {
        mutate: mockSendOtpMutation,
        isPending: false,
        error: null,
      },
      verifyOtp: {
        mutate: mockVerifyOtpMutation,
        isPending: false,
        error: null,
      },
      register: {
        mutateAsync: mockRegisterMutation,
        isPending: false,
        error: null,
      },
      verifyAccount: {
        mutate: vi.fn(),
        isPending: false,
        error: null,
      },
      resendOtp: {
        mutate: mockResendOtp,
        isPending: false,
        error: null,
      },
    });

    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });

  test('displays error message on registration failure', async () => {
    const errorMessage = 'Email already exists';
    mockUseAuth.mockReturnValue({
      login: {
        mutate: mockLoginMutation,
        isPending: false,
        error: null,
      },
      verify2FALogin: {
        mutate: mockVerify2FALoginMutation,
        isPending: false,
        error: null,
      },
      sendOtp: {
        mutate: mockSendOtpMutation,
        isPending: false,
        error: null,
      },
      verifyOtp: {
        mutate: mockVerifyOtpMutation,
        isPending: false,
        error: null,
      },
      register: {
        mutateAsync: mockRegisterMutation,
        isPending: false,
        error: { message: errorMessage, response: { data: { message: errorMessage } } },
      },
      verifyAccount: {
        mutate: vi.fn(),
        isPending: false,
        error: null,
      },
      resendOtp: {
        mutate: mockResendOtp,
        isPending: false,
        error: null,
      },
    });

    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, {
      initialRoute: '/signup',
    });

    // Click signup tab to show register form and error
    const signupTab = screen.getByText(/register/i);
    await user.click(signupTab);

    expect(screen.getAllByText(new RegExp(errorMessage, 'i')).length).toBeGreaterThanOrEqual(1);
  });

  test('renders forgot password link', async () => {
    renderWithProviders(<AuthPage />, {
      initialRoute: '/login',
    });

    await waitFor(() => {
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });
  });
});

