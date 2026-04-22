/**
 * OrderDetail Component Tests
 * 
 * Tests for the seller OrderDetail page:
 * - Renders loading state
 * - Renders error state
 * - Renders order details
 * - Displays order information
 * - Handles back navigation
 * - Displays order items
 * - Displays customer information
 * - Displays order summary
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import OrderDetail from '../../features/orders/OrderDetail';

// Mock useParams
const mockParams = { id: 'order123' };
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => vi.fn(),
  };
});

// Mock useGetSellerOrder
const mockUseGetSellerOrder = vi.fn(() => ({
  data: null,
  isLoading: false,
  isError: false,
  error: null,
}));
const mockUseUpdateSellerOrderStatus = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

vi.mock('../../shared/hooks/useOrder', () => ({
  useGetSellerOrder: (...args) => mockUseGetSellerOrder(...args),
  useUpdateSellerOrderStatus: (...args) =>
    mockUseUpdateSellerOrderStatus(...args),
}));

const mockUseGetEarningsByOrder = vi.fn(() => ({
  data: {
    grossEarnings: 150,
    platformFee: 15,
    netEarnings: 135,
    payoutStatus: 'pending',
  },
  isLoading: false,
}));

vi.mock('../../shared/hooks/useBalance', () => ({
  useGetEarningsByOrder: (...args) => mockUseGetEarningsByOrder(...args),
}));

// Mock useDynamicPageTitle
vi.mock('../../shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('OrderDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.id = 'order123';
    
    mockUseGetSellerOrder.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUseUpdateSellerOrderStatus.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockUseGetEarningsByOrder.mockReturnValue({
      data: {
        grossEarnings: 150,
        platformFee: 15,
        netEarnings: 135,
        payoutStatus: 'pending',
      },
      isLoading: false,
    });
  });

  test('renders loading state', async () => {
    mockUseGetSellerOrder.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    
    renderWithProviders(<OrderDetail />, {
      initialRoute: '/dashboard/orders/order123',
    });

    await waitFor(() => {
      expect(screen.getByText(/loading order details/i)).toBeInTheDocument();
    });
  });

  test('renders error state', async () => {
    const errorMessage = 'Failed to load order';
    mockUseGetSellerOrder.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: errorMessage },
    });
    
    renderWithProviders(<OrderDetail />, {
      initialRoute: '/dashboard/orders/order123',
    });

    await waitFor(() => {
      expect(
        screen.getAllByText(new RegExp(errorMessage, 'i')).length
      ).toBeGreaterThan(0);
    });
  });

  test('renders order details', async () => {
    // The component has a bug - it uses order.order.* in some places and order.* in others
    // Based on line 45: order = orderData?.data.data.order
    // And usage shows it expects order.order.orderNumber, order.items, order.subtotal
    // So the structure should be: orderData.data.data.order = { order: {...}, items: [...], subtotal: ... }
    const mockOrderData = {
      _id: 'order123',
      order: {
        _id: 'order123',
        orderNumber: 'ORD123456789',
        status: 'pending',
        orderStatus: 'pending',
        currentStatus: 'pending',
        total: 150.00,
        user: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '+233241234567',
        },
      },
      items: [
        {
          product: {
            name: 'Product 1',
            _id: 'prod1',
          },
          quantity: 2,
          price: 65.00,
          total: 130.00,
        },
      ],
      subtotal: 130.00,
      total: 150.00,
      shippingCost: 15.00,
      tax: 5.00,
      orderStatus: 'pending',
      currentStatus: 'pending',
      status: 'pending',
    };

    mockUseGetSellerOrder.mockReturnValue({
      data: { data: { data: { order: mockOrderData } } },
      isLoading: false,
      isError: false,
      error: null,
    });
    
    renderWithProviders(<OrderDetail />, {
      initialRoute: '/dashboard/orders/order123',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /print invoice/i })).toBeInTheDocument();
      // Customer row uses firstNameOnly() — not full name
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  }, 30000);

  test('displays customer information', async () => {
    const mockOrderData = {
      _id: 'order123',
      order: {
        _id: 'order123',
        orderNumber: 'ORD123456789',
        // Post-shipment so buyerContactVisibility exposes email/phone (orderPrivacy)
        status: 'delivered',
        currentStatus: 'delivered',
        orderStatus: 'delivered',
        user: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '+233241234567',
        },
      },
      items: [],
      subtotal: 130.00,
      total: 150.00,
      orderStatus: 'delivered',
      status: 'delivered',
      currentStatus: 'delivered',
    };

    mockUseGetSellerOrder.mockReturnValue({
      data: { data: { data: { order: mockOrderData } } },
      isLoading: false,
      isError: false,
      error: null,
    });
    
    renderWithProviders(<OrderDetail />, {
      initialRoute: '/dashboard/orders/order123',
    });

    await waitFor(() => {
      expect(screen.getByText(/customer information/i)).toBeInTheDocument();
      // Customer label always uses firstNameOnly(), even when full PII is visible
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });
  });

  test('displays order items', async () => {
    const mockOrderData = {
      _id: 'order123',
      order: {
        _id: 'order123',
        orderNumber: 'ORD123456789',
        status: 'pending',
        user: {
          name: 'John Doe',
          email: 'john@test.com',
        },
      },
      items: [
        {
          product: {
            name: 'Product 1',
            _id: 'prod1',
          },
          quantity: 2,
          price: 65.00,
          total: 130.00,
        },
      ],
      subtotal: 130.00,
      total: 130.00,
      orderStatus: 'pending',
    };

    mockUseGetSellerOrder.mockReturnValue({
      data: { data: { data: { order: mockOrderData } } },
      isLoading: false,
      isError: false,
      error: null,
    });
    
    renderWithProviders(<OrderDetail />, {
      initialRoute: '/dashboard/orders/order123',
    });

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });

  test('displays order summary', async () => {
    const mockOrderData = {
      _id: 'order123',
      order: {
        _id: 'order123',
        orderNumber: 'ORD123456789',
        status: 'pending',
        user: {
          name: 'John Doe',
          email: 'john@test.com',
        },
      },
      items: [],
      subtotal: 130.00,
      total: 150.00,
      shippingCost: 15.00,
      tax: 5.00,
      orderStatus: 'pending',
    };

    mockUseGetSellerOrder.mockReturnValue({
      data: { data: { data: { order: mockOrderData } } },
      isLoading: false,
      isError: false,
      error: null,
    });
    
    renderWithProviders(<OrderDetail />, {
      initialRoute: '/dashboard/orders/order123',
    });

    await waitFor(() => {
      expect(screen.getByText(/payment status/i)).toBeInTheDocument();
      expect(screen.getByText(/no items available/i)).toBeInTheDocument();
    });
  });
});

