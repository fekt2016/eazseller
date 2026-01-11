/**
 * Products Component Tests
 * 
 * Tests for the seller Products page:
 * - Renders loading state
 * - Renders empty state when no products
 * - Renders products list
 * - Handles search functionality
 * - Handles category filter
 * - Renders add product button
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import Products from '../../features/products/Products';

// Mock useAuth
const mockSeller = {
  _id: 'seller123',
  id: 'seller123',
  name: 'Test Seller',
  email: 'seller@test.com',
};

const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
  isLoading: false,
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useProduct
const mockDeleteProduct = {
  mutateAsync: vi.fn(async () => ({ success: true })),
  isPending: false,
  error: null,
};

const mockUseGetAllProductBySeller = vi.fn(() => ({
  data: { data: { data: [] } },
  isLoading: false,
  error: null,
}));

const mockUseProduct = vi.fn(() => ({
  useGetAllProductBySeller: mockUseGetAllProductBySeller,
  deleteProduct: mockDeleteProduct,
}));

vi.mock('../../shared/hooks/useProduct', () => ({
  __esModule: true,
  default: (...args) => mockUseProduct(...args),
}));

// Mock window.confirm and alert
global.window.confirm = vi.fn(() => true);
global.window.alert = vi.fn();

// Mock react-router-dom Link
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

describe('Products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      seller: mockSeller,
      isLoading: false,
    });
    
    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: [] } },
      isLoading: false,
      error: null,
    });
    
    mockDeleteProduct.mutateAsync.mockResolvedValue({ success: true });
    global.window.confirm.mockReturnValue(true);
  });

  test('renders loading state', async () => {
    mockUseGetAllProductBySeller.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    
    renderWithProviders(<Products />, {
      initialRoute: '/dashboard/products',
    });

    await waitFor(() => {
      expect(screen.getByText(/loading products/i)).toBeInTheDocument();
    });
  });

  test('renders empty state when no products', async () => {
    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: [] } },
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<Products />, {
      initialRoute: '/dashboard/products',
    });

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      expect(screen.getByText(/you haven't added any products yet/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add your first product/i })).toBeInTheDocument();
    });
  });

  test('renders products list', async () => {
    const mockProducts = [
      {
        _id: 'prod1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        defaultPrice: 100,
        stock: 10,
        totalStock: 10,
        imageCover: 'image1.jpg',
      },
      {
        _id: 'prod2',
        name: 'Product 2',
        description: 'Description 2',
        price: 200,
        defaultPrice: 200,
        stock: 20,
        totalStock: 20,
        imageCover: 'image2.jpg',
      },
    ];

    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: mockProducts } },
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<Products />, {
      initialRoute: '/dashboard/products',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();
      expect(screen.getAllByText('Product 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Product 2').length).toBeGreaterThan(0);
    });
  });

  test('renders add product button', async () => {
    const mockProducts = [
      {
        _id: 'prod1',
        name: 'Product 1',
        price: 100,
        stock: 10,
      },
    ];

    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: mockProducts } },
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<Products />, {
      initialRoute: '/dashboard/products',
    });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /add product/i })).toBeInTheDocument();
    });
  });

  test('handles search functionality', async () => {
    const user = userEvent.setup();
    const mockProducts = [
      {
        _id: 'prod1',
        name: 'Product One',
        description: 'Description 1',
        price: 100,
        stock: 10,
      },
      {
        _id: 'prod2',
        name: 'Product Two',
        description: 'Description 2',
        price: 200,
        stock: 20,
      },
    ];

    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: mockProducts } },
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<Products />, {
      initialRoute: '/dashboard/products',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Product One').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Product Two').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/search products/i);
    await user.type(searchInput, 'One');

    await waitFor(() => {
      expect(screen.getAllByText('Product One').length).toBeGreaterThan(0);
      expect(screen.queryByText('Product Two')).not.toBeInTheDocument();
    });
  });

  test('displays category filter', async () => {
    const mockProducts = [
      {
        _id: 'prod1',
        name: 'Product 1',
        price: 100,
        stock: 10,
      },
    ];

    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: mockProducts } },
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<Products />, {
      initialRoute: '/dashboard/products',
    });

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /all categories/i })).toBeInTheDocument();
    });
  });
});

