/**
 * BusinessProfilePage Component Tests
 * 
 * Tests for the seller BusinessProfilePage:
 * - Renders business profile page
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
import BusinessProfilePage from '../../features/profile/BusinessProfilePage';

// Mock useAuth
const mockSeller = {
  _id: 'seller123',
  id: 'seller123',
  name: 'John Doe',
  shopName: 'Test Shop',
  shopDescription: 'Test Description',
  shopLocation: {
    street: '123 Main St',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
  },
  digitalAddress: 'GA-123-4567',
  socialMediaLinks: {
    facebook: 'https://facebook.com/test',
    instagram: 'https://instagram.com/test',
  },
};

const mockUpdate = vi.fn();
const mockIsUpdateLoading = false;

const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
  update: mockUpdate,
  isUpdateLoading: mockIsUpdateLoading,
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

// Mock imageCompressor
vi.mock('../../shared/utils/imageCompressor', () => ({
  compressImage: vi.fn((file) => Promise.resolve(file)),
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

describe('BusinessProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockUseAuth.mockReturnValue({
      seller: mockSeller,
      update: mockUpdate,
      isUpdateLoading: false,
    });
  });

  test('renders business profile page', async () => {
    renderWithProviders(<BusinessProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      // Component renders form fields, check for shop name label
      expect(screen.getByLabelText(/shop name/i)).toBeInTheDocument();
    });
  });

  test('displays form fields', async () => {
    renderWithProviders(<BusinessProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/shop name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shop description/i)).toBeInTheDocument();
    });
  });

  test('loads existing seller data', async () => {
    renderWithProviders(<BusinessProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      const shopNameInput = screen.getByLabelText(/shop name/i);
      expect(shopNameInput).toHaveValue('Test Shop');
    });
  });

  test('handles embedded mode', async () => {
    renderWithProviders(<BusinessProfilePage embedded />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByText(/business profile/i)).toBeInTheDocument();
    });
  });

  test('displays location fields', async () => {
    renderWithProviders(<BusinessProfilePage />, {
      initialRoute: '/dashboard/settings',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/street/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
    });
  });
});

