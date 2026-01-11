/**
 * Orders Component Tests
 * 
 * Tests for the seller Orders page:
 * - Renders loading state
 * - Renders error state
 * - Renders orders list
 * - Displays stats
 * - Handles search functionality
 * - Handles status filter
 * - Handles date filter
 * - Handles pagination
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import Orders from '../../features/orders/Orders';

// Mock useGetSellerOrders
const mockUseGetSellerOrders = vi.fn(() => ({
  data: { data: { data: { orders: [] } } },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}));

vi.mock('../../shared/hooks/useOrder', () => ({
  useGetSellerOrders: (...args) => mockUseGetSellerOrders(...args),
}));

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

describe('Orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: [] } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  test('renders loading state', async () => {
    mockUseGetSellerOrders.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Orders />, {
      initialRoute: '/dashboard/orders',
    });

    await waitFor(() => {
      expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
    });
  });

  test('renders error state', async () => {
    mockUseGetSellerOrders.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Failed to load orders' },
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Orders />, {
      initialRoute: '/dashboard/orders',
    });

    await waitFor(() => {
      expect(screen.getAllByText(/failed to load orders/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
    });
  });

  test('renders orders list', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        orderNumber: 'ORD123456789',
        status: 'pending',
        currentStatus: 'pending',
        total: 100,
        createdAt: new Date().toISOString(),
        user: {
          name: 'John Doe',
          email: 'john@test.com',
        },
        items: [
          { quantity: 1 },
          { quantity: 2 },
        ],
      },
      {
        _id: 'order2',
        orderNumber: 'ORD987654321',
        status: 'delivered',
        currentStatus: 'delivered',
        total: 200,
        createdAt: new Date().toISOString(),
        user: {
          name: 'Jane Smith',
          email: 'jane@test.com',
        },
        items: [{ quantity: 1 }],
      },
    ];

    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: mockOrders } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Orders />, {
      initialRoute: '/dashboard/orders',
    });

    await waitFor(() => {
      expect(screen.getByText('ORD123456789')).toBeInTheDocument();
      expect(screen.getByText('ORD987654321')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('displays stats cards', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        orderNumber: 'ORD123',
        status: 'pending',
        currentStatus: 'pending',
        total: 100,
        createdAt: new Date().toISOString(),
        user: { name: 'John' },
        items: [{ quantity: 1 }],
      },
      {
        _id: 'order2',
        orderNumber: 'ORD456',
        status: 'delivered',
        currentStatus: 'delivered',
        total: 200,
        createdAt: new Date().toISOString(),
        user: { name: 'Jane' },
        items: [{ quantity: 1 }],
      },
    ];

    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: mockOrders } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Orders />, {
      initialRoute: '/dashboard/orders',
    });

    await waitFor(() => {
      expect(screen.getByText(/total orders/i)).toBeInTheDocument();
      expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/delivered/i).length).toBeGreaterThan(0);
    });
  });

  test('handles search functionality', async () => {
    const user = userEvent.setup();
    const mockOrders = [
      {
        _id: 'order1',
        orderNumber: 'ORD123456789',
        status: 'pending',
        currentStatus: 'pending',
        total: 100,
        createdAt: new Date().toISOString(),
        user: {
          name: 'John Doe',
          email: 'john@test.com',
        },
        items: [{ quantity: 1 }],
      },
      {
        _id: 'order2',
        orderNumber: 'ORD987654321',
        status: 'pending',
        currentStatus: 'pending',
        total: 200,
        createdAt: new Date().toISOString(),
        user: {
          name: 'Jane Smith',
          email: 'jane@test.com',
        },
        items: [{ quantity: 1 }],
      },
    ];

    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: mockOrders } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Orders />, {
      initialRoute: '/dashboard/orders',
    });

    await waitFor(() => {
      expect(screen.getByText('ORD123456789')).toBeInTheDocument();
      expect(screen.getByText('ORD987654321')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by order id or customer name/i);
    await user.type(searchInput, 'ORD123');

    await waitFor(() => {
      expect(screen.getByText('ORD123456789')).toBeInTheDocument();
      expect(screen.queryByText('ORD987654321')).not.toBeInTheDocument();
    });
  });

  test('displays status filter', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        orderNumber: 'ORD123',
        status: 'pending',
        currentStatus: 'pending',
        total: 100,
        createdAt: new Date().toISOString(),
        user: { name: 'John' },
        items: [{ quantity: 1 }],
      },
    ];

    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: mockOrders } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Orders />, {
      initialRoute: '/dashboard/orders',
    });

    await waitFor(() => {
      // Check for status filter options - they should be in the document
      expect(screen.getByRole('option', { name: /all statuses/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /pending/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /delivered/i })).toBeInTheDocument();
    });
  });

  test('renders empty state when no orders', async () => {
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: [] } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Orders />, {
      initialRoute: '/dashboard/orders',
    });

    await waitFor(() => {
      expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
    });
  });
});

