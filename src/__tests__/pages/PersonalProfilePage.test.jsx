/**
 * PersonalProfilePage Component Tests
 * 
 * Tests for the seller PersonalProfilePage:
 * - Renders personal profile page
 * - Displays form fields
 * - Loads existing seller data
 * - Handles form submission
 * - Handles embedded mode
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import PersonalProfilePage from '../../features/profile/PersonalProfilePage';

// Mock useAuth
const mockSeller = {
  _id: 'seller123',
  id: 'seller123',
  name: 'John Doe',
  email: 'john@test.com',
  phone: '+233241234567',
};

const mockUpdate = {
  mutate: vi.fn(),
  isPending: false,
};

const mockRefetchAuth = vi.fn();

const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
  update: mockUpdate,
  isUpdateLoading: false,
  refetchAuth: mockRefetchAuth,
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
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

describe('PersonalProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockUseAuth.mockReturnValue({
      seller: mockSeller,
      update: mockUpdate,
      isUpdateLoading: false,
      refetchAuth: mockRefetchAuth,
    });
  });

  test('renders personal profile page', async () => {
    renderWithProviders(<PersonalProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  test('displays form fields', async () => {
    renderWithProviders(<PersonalProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });
  });

  test('loads existing seller data', async () => {
    renderWithProviders(<PersonalProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveValue('John Doe');
    });
  });

  test('handles embedded mode', async () => {
    renderWithProviders(<PersonalProfilePage embedded />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  test('displays save button', async () => {
    renderWithProviders(<PersonalProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Save button should be present
    const submitButton = screen.getByRole('button', { name: /save/i });
    expect(submitButton).toBeInTheDocument();
  });
});

