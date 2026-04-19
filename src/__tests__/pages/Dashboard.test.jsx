/**
 * Dashboard Component Tests
 * 
 * Tests for the seller Dashboard component:
 * - Renders loading state
 * - Renders error state
 * - Renders with data
 * - Displays stats cards
 * - Time filter functionality
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import Dashboard from '../../features/products/Dashboard';

// Mock useAuth
const mockSeller = {
  id: 'seller123',
  _id: 'seller123',
  name: 'Test Seller',
  email: 'seller@test.com',
};

const mockUseAuth = vi.fn(() => ({
  seller: mockSeller,
  isLoading: false,
  error: null,
}));

vi.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useProduct
const mockUseGetAllProductBySeller = vi.fn(() => ({
  data: { data: { data: [] } },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}));

const mockUseProduct = vi.fn(() => ({
  useGetAllProductBySeller: mockUseGetAllProductBySeller,
}));

vi.mock('../../shared/hooks/useProduct', () => ({
  __esModule: true,
  default: (...args) => mockUseProduct(...args),
}));

// Mock useOrder
const mockUseGetSellerOrders = vi.fn(() => ({
  data: { data: { data: { orders: [] } } },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}));

vi.mock('../../shared/hooks/useOrder', () => ({
  useGetSellerOrders: (...args) => mockUseGetSellerOrders(...args),
}));

// Mock useSellerAnalytics
const mockUseSellerRevenueAnalytics = vi.fn(() => ({
  data: { data: { summary: { totalRevenue: 0 }, dailyRevenue: [], trend: 0 } },
  isLoading: false,
}));
const mockUseSellerOrderStatusAnalytics = vi.fn(() => ({
  data: { statusBreakdown: {}, totalOrders: 0 },
  isLoading: false,
}));
const mockUseSellerTopProducts = vi.fn(() => ({
  data: { data: { topSellingProducts: [] } },
  isLoading: false,
}));
const mockUseSellerTrafficAnalytics = vi.fn(() => ({
  data: { data: { totalViews: 0, uniqueVisitors: 0, totalOrders: 0, conversionRate: 0 } },
  isLoading: false,
}));

vi.mock('../../shared/hooks/useSellerAnalytics', () => ({
  useSellerRevenueAnalytics: (...args) => mockUseSellerRevenueAnalytics(...args),
  useSellerOrderStatusAnalytics: (...args) =>
    mockUseSellerOrderStatusAnalytics(...args),
  useSellerTopProducts: (...args) => mockUseSellerTopProducts(...args),
  useSellerTrafficAnalytics: (...args) => mockUseSellerTrafficAnalytics(...args),
}));

// Keep legacy mock for compatibility in case older imports remain
const mockUseGetSellerProductViews = vi.fn(() => ({
  data: { data: { views: [] } },
  isLoading: false,
  error: null,
}));

const mockUseAnalytics = vi.fn(() => ({
  useGetSellerProductViews: mockUseGetSellerProductViews,
}));

vi.mock('../../shared/hooks/useAnalytics', () => ({
  __esModule: true,
  default: (...args) => mockUseAnalytics(...args),
}));

// Mock useSellerBalance
const mockUseSellerBalance = vi.fn(() => ({
  availableBalance: 1000,
  pendingBalance: 0,
  totalEarnings: 5000,
  withdrawnAmount: 0,
  lockedBalance: 0,
  isLoading: false,
  error: null,
}));

vi.mock('../../shared/hooks/finance/useSellerBalance', () => ({
  useSellerBalance: (...args) => mockUseSellerBalance(...args),
}));

// Mock VerificationBanner
vi.mock('../../shared/components/VerificationBanner', () => ({
  __esModule: true,
  default: () => <div data-testid="verification-banner">Verification Banner</div>,
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks to default values
    mockUseAuth.mockReturnValue({
      seller: mockSeller,
      isLoading: false,
      error: null,
    });
    
    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: [] } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: [] } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    mockUseGetSellerProductViews.mockReturnValue({
      data: { data: { views: [] } },
      isLoading: false,
      error: null,
    });
    mockUseSellerRevenueAnalytics.mockReturnValue({
      data: { data: { summary: { totalRevenue: 0 }, dailyRevenue: [], trend: 0 } },
      isLoading: false,
    });
    mockUseSellerOrderStatusAnalytics.mockReturnValue({
      data: { statusBreakdown: {}, totalOrders: 0 },
      isLoading: false,
    });
    mockUseSellerTopProducts.mockReturnValue({
      data: { data: { topSellingProducts: [] } },
      isLoading: false,
    });
    mockUseSellerTrafficAnalytics.mockReturnValue({
      data: { data: { totalViews: 0, uniqueVisitors: 0, totalOrders: 0, conversionRate: 0 } },
      isLoading: false,
    });
    
    mockUseSellerBalance.mockReturnValue({
      availableBalance: 1000,
      pendingBalance: 0,
      totalEarnings: 5000,
      withdrawnAmount: 0,
      lockedBalance: 0,
      isLoading: false,
      error: null,
    });
  });

  test('renders loading state', async () => {
    mockUseGetSellerOrders.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Dashboard />, {
      initialRoute: '/dashboard',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });

  test('renders error state when no data available', async () => {
    mockUseGetSellerOrders.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Failed to load orders' },
      refetch: vi.fn(),
    });
    
    renderWithProviders(<Dashboard />, {
      initialRoute: '/dashboard',
    });

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load orders/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard with data', async () => {
    const mockProducts = [
      {
        _id: 'prod1',
        name: 'Product 1',
        price: 100,
        stock: 10,
      },
    ];
    
    const mockOrders = [
      {
        _id: 'order1',
        orderNumber: 'ORD123456789',
        status: 'delivered',
        currentStatus: 'delivered',
        total: 100,
        createdAt: new Date().toISOString(),
        orderDate: new Date().toISOString(),
      },
    ];

    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: mockProducts } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: mockOrders } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<Dashboard />, {
      initialRoute: '/dashboard',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    });
  });

  test('displays verification banner', async () => {
    // Provide data so component renders dashboard
    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: [{ _id: 'prod1', name: 'Product 1' }] } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: [{ _id: 'order1', orderNumber: 'ORD123', createdAt: new Date().toISOString(), orderDate: new Date().toISOString() }] } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<Dashboard />, {
      initialRoute: '/dashboard',
    });

    await waitFor(() => {
      expect(screen.getByTestId('verification-banner')).toBeInTheDocument();
    });
  });

  test('displays time filter buttons', async () => {
    // Provide data so component renders dashboard
    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: [{ _id: 'prod1', name: 'Product 1' }] } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: [{ _id: 'order1', orderNumber: 'ORD123', createdAt: new Date().toISOString(), orderDate: new Date().toISOString() }] } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<Dashboard />, {
      initialRoute: '/dashboard',
    });

    await waitFor(() => {
      // Check for welcome heading first to ensure dashboard rendered
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    // Check for filter buttons - use getAllByText to handle multiple instances
    expect(screen.getAllByText(/today/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/this week/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/this month/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/this year/i).length).toBeGreaterThan(0);
  });

  test('changes time filter when button is clicked', async () => {
    const user = userEvent.setup();
    // Provide data so component renders dashboard
    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: [{ _id: 'prod1', name: 'Product 1' }] } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: [{ _id: 'order1', orderNumber: 'ORD123', createdAt: new Date().toISOString(), orderDate: new Date().toISOString() }] } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<Dashboard />, {
      initialRoute: '/dashboard',
    });

    await waitFor(() => {
      expect(screen.getAllByText(/this week/i).length).toBeGreaterThan(0);
    });

    const [weekButton] = screen.getAllByText(/this week/i);
    await user.click(weekButton);

    // Button should still be in document
    expect(screen.getAllByText(/this week/i).length).toBeGreaterThan(0);
  });

  test('renders stats cards', async () => {
    // Provide data so component renders dashboard
    mockUseGetAllProductBySeller.mockReturnValue({
      data: { data: { data: [{ _id: 'prod1', name: 'Product 1' }] } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    
    mockUseGetSellerOrders.mockReturnValue({
      data: { data: { data: { orders: [{ _id: 'order1', orderNumber: 'ORD123', createdAt: new Date().toISOString(), orderDate: new Date().toISOString() }] } } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<Dashboard />, {
      initialRoute: '/dashboard',
    });

    await waitFor(() => {
      expect(screen.getByText(/available balance/i)).toBeInTheDocument();
      expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/total orders/i)).toBeInTheDocument();
    });
  });
});

