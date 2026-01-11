/**
 * AddProduct Component Tests
 * 
 * Tests for the seller AddProduct page:
 * - Renders add product page
 * - Displays product form
 * - Handles form submission
 * - Navigates on success
 * - Handles back navigation
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import AddProduct from '../../features/products/AddProduct';

// Mock ProductForm
vi.mock('../../shared/components/forms/ProductForm', () => ({
  __esModule: true,
  default: ({ onSubmit, isSubmitting }) => (
    <div data-testid="product-form">
      <button 
        onClick={() => onSubmit({ 
          name: 'Test Product', 
          price: 100,
          brand: 'Test Brand',
          description: 'Test Description',
          parentCategory: 'cat123',
          subCategory: 'subcat123',
          productType: 'simple',
          stock: 10,
          imageCover: new File([''], 'test.jpg', { type: 'image/jpeg' }),
          images: [],
          variants: [],
        })}
        disabled={isSubmitting}
      >
        Submit Product
      </button>
    </div>
  ),
}));

// Mock useAuth
const mockSeller = { _id: 'seller123', id: 'seller123', name: 'Test Seller' };
const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useProduct
const mockCreateProduct = {
  mutate: vi.fn((formData, options) => {
    // Simulate successful mutation
    if (options?.onSuccess) {
      options.onSuccess({ data: { product: { _id: 'prod123' } } });
    }
  }),
  isPending: false,
  error: null,
};

const mockUseProduct = vi.fn(() => ({
  createProduct: mockCreateProduct,
}));

vi.mock('../../shared/hooks/useProduct', () => ({
  __esModule: true,
  default: (...args) => mockUseProduct(...args),
}));

// Mock imageCompressor
vi.mock('../../shared/utils/imageCompressor', () => ({
  compressImage: vi.fn((file) => Promise.resolve(file)),
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

describe('AddProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockCreateProduct.mutate.mockImplementation((formData, options) => {
      if (options?.onSuccess) {
        options.onSuccess({ data: { product: { _id: 'prod123' } } });
      }
    });
  });

  test('renders add product page', async () => {
    renderWithProviders(<AddProduct />, {
      initialRoute: '/dashboard/products/add',
    });

    await waitFor(() => {
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });
  });

  test('handles form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AddProduct />, {
      initialRoute: '/dashboard/products/add',
    });

    await waitFor(() => {
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit Product');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateProduct.mutate).toHaveBeenCalled();
    });
  });

  test('navigates on successful product creation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AddProduct />, {
      initialRoute: '/dashboard/products/add',
    });

    await waitFor(() => {
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit Product');
    await user.click(submitButton);

    // The mutate function calls onSuccess callback which navigates
    await waitFor(() => {
      expect(mockCreateProduct.mutate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/products');
    });
  });
});

