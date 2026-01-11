/**
 * DiscountProducts Component Tests
 * 
 * Tests for the seller DiscountProducts page:
 * - Renders discount products page
 * - Displays tabs (discounts and coupons)
 * - Handles tab switching
 * - Displays discounts list
 * - Handles search functionality
 * - Handles status filtering
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import DiscountProducts from '../../features/products/DiscountProducts';

// Mock child components
vi.mock('../../shared/components/modal/DiscountModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="discount-modal">Discount Modal</div> : null
  ),
}));

vi.mock('../../shared/components/modal/CouponBatchModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="coupon-modal">Coupon Modal</div> : null
  ),
}));

vi.mock('../../shared/components/CouponTab', () => ({
  __esModule: true,
  default: () => <div data-testid="coupon-tab">Coupon Tab</div>,
}));

vi.mock('../../shared/components/modal/ConfirmationModal', () => ({
  ConfirmationModal: ({ isOpen }) => (
    isOpen ? <div data-testid="confirmation-modal">Confirmation Modal</div> : null
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
const mockProductData = {
  data: {
    data: [
      {
        _id: 'prod1',
        name: 'Product 1',
        parentCategory: { _id: 'cat1', name: 'Category 1' },
      },
      {
        _id: 'prod2',
        name: 'Product 2',
        parentCategory: { _id: 'cat1', name: 'Category 1' },
      },
    ],
  },
};

const mockUseGetAllProductBySeller = vi.fn(() => ({
  data: mockProductData,
}));

const mockUseProduct = vi.fn(() => ({
  useGetAllProductBySeller: mockUseGetAllProductBySeller,
}));

vi.mock('../../shared/hooks/useProduct', () => ({
  __esModule: true,
  default: (...args) => mockUseProduct(...args),
}));

// Mock useDiscount
const mockDiscounts = [
  {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011', // Component uses discount.id
    name: 'Summer Sale',
    code: 'SUMMER20',
    type: 'percentage',
    discountType: 'percentage',
    discountValue: 20,
    value: 20,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    active: true,
    products: [],
  },
  {
    _id: '507f1f77bcf86cd799439012',
    id: '507f1f77bcf86cd799439012', // Component uses discount.id
    name: 'Winter Sale',
    code: 'WINTER50',
    type: 'fixed',
    discountType: 'fixed',
    discountValue: 50,
    value: 50,
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    active: false,
    products: [],
  },
];

const mockDiscountData = {
  data: {
    data: {
      discounts: mockDiscounts,
    },
  },
};

const mockUseGetsellerDiscount = vi.fn(() => ({
  data: mockDiscountData,
}));

const mockCreateDiscount = {
  mutate: vi.fn(),
  isPending: false,
};

const mockDeleteDiscount = {
  mutate: vi.fn(),
  isPending: false,
};

const mockUpdateDiscount = {
  mutate: vi.fn(),
  isPending: false,
};

const mockUseCreateDiscount = vi.fn(() => ({
  createDiscount: mockCreateDiscount,
}));

const mockUseDeleteDiscount = vi.fn(() => ({
  deleteDiscount: mockDeleteDiscount,
}));

const mockUseUpdateDiscount = vi.fn(() => ({
  updateDiscount: mockUpdateDiscount,
}));

vi.mock('../../shared/hooks/useDiscount', () => ({
  useGetsellerDiscount: (...args) => mockUseGetsellerDiscount(...args),
  useCreateDiscount: (...args) => mockUseCreateDiscount(...args),
  useDeleteDiscount: (...args) => mockUseDeleteDiscount(...args),
  useUpdateDiscount: (...args) => mockUseUpdateDiscount(...args),
}));

describe('DiscountProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseGetAllProductBySeller.mockReturnValue({
      data: mockProductData,
    });
    
    mockUseGetsellerDiscount.mockReturnValue({
      data: mockDiscountData,
    });
  });

  test('renders discount products page', async () => {
    renderWithProviders(<DiscountProducts />, {
      initialRoute: '/dashboard/products/discount',
    });

    await waitFor(() => {
      expect(screen.getByText(/promotion management/i)).toBeInTheDocument();
    });
  });

  test('displays tabs', async () => {
    renderWithProviders(<DiscountProducts />, {
      initialRoute: '/dashboard/products/discount',
    });

    await waitFor(() => {
      // Tabs are rendered as buttons - use getAllByRole since there might be multiple buttons
      const discountTabs = screen.getAllByRole('button', { name: /discounts/i });
      const couponTabs = screen.getAllByRole('button', { name: /coupons/i });
      expect(discountTabs.length).toBeGreaterThan(0);
      expect(couponTabs.length).toBeGreaterThan(0);
    });
  });

  test('handles tab switching', async () => {
    const user = userEvent.setup();

    renderWithProviders(<DiscountProducts />, {
      initialRoute: '/dashboard/products/discount',
    });

    await waitFor(() => {
      expect(screen.getByText(/promotion management/i)).toBeInTheDocument();
    });

    // Click coupons tab
    const couponsTab = screen.getByRole('button', { name: /coupons/i });
    await user.click(couponsTab);

    await waitFor(() => {
      expect(screen.getByTestId('coupon-tab')).toBeInTheDocument();
    });
  });

  test('displays discounts list', async () => {
    renderWithProviders(<DiscountProducts />, {
      initialRoute: '/dashboard/products/discount',
    });

    await waitFor(() => {
      expect(screen.getByText('Summer Sale')).toBeInTheDocument();
      expect(screen.getByText('Winter Sale')).toBeInTheDocument();
    });
  });

  test('handles search functionality', async () => {
    const user = userEvent.setup();

    renderWithProviders(<DiscountProducts />, {
      initialRoute: '/dashboard/products/discount',
    });

    await waitFor(() => {
      expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'Summer');

    await waitFor(() => {
      expect(screen.getByText('Summer Sale')).toBeInTheDocument();
      expect(screen.queryByText('Winter Sale')).not.toBeInTheDocument();
    });
  });
});

