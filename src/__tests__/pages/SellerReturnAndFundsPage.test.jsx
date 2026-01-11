/**
 * SellerReturnAndFundsPage Component Tests
 * 
 * Tests for the seller SellerReturnAndFundsPage:
 * - Renders returns page
 * - Displays returns list
 * - Handles filtering
 * - Handles loading state
 * - Handles error state
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import SellerReturnAndFundsPage from '../../features/sellerReturns/pages/SellerReturnAndFundsPage';

// Mock child components
vi.mock('../../features/sellerReturns/components/ReturnListTable', () => ({
  __esModule: true,
  default: ({ returns, onViewReturn }) => (
    <div data-testid="return-list-table">
      {returns.map((ret) => (
        <div key={ret._id} onClick={() => onViewReturn(ret)}>
          {ret.orderNumber}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../../features/sellerReturns/components/ReturnDetailModal', () => ({
  __esModule: true,
  default: ({ isOpen, returnItem, onApprove, onReject, onClose }) => (
    isOpen ? (
      <div data-testid="return-detail-modal">
        <div>Return: {returnItem?.orderNumber}</div>
        <button onClick={() => onApprove(returnItem)}>Approve</button>
        <button onClick={() => onReject(returnItem)}>Reject</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

// Mock useSellerReturns
const mockReturns = [
  {
    _id: 'return1',
    orderNumber: 'ORD123',
    status: 'pending',
    reason: 'Defective product',
  },
  {
    _id: 'return2',
    orderNumber: 'ORD456',
    status: 'approved',
    reason: 'Wrong size',
  },
];

const mockGetAllSellerReturns = vi.fn(() => ({
  data: mockReturns,
  isLoading: false,
  error: null,
}));

const mockApproveReturn = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

const mockRejectReturn = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

const mockUseSellerReturns = vi.fn(() => ({
  getAllSellerReturns: mockGetAllSellerReturns,
  approveReturn: mockApproveReturn,
  rejectReturn: mockRejectReturn,
}));

vi.mock('../../features/sellerReturns/hooks/useSellerReturns', () => ({
  useSellerReturns: (...args) => mockUseSellerReturns(...args),
}));

// Mock useDynamicPageTitle
vi.mock('../../shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('SellerReturnAndFundsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetAllSellerReturns.mockReturnValue({
      data: mockReturns,
      isLoading: false,
      error: null,
    });
    
    mockApproveReturn.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });
    
    mockRejectReturn.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });
  });

  test('renders returns page', async () => {
    renderWithProviders(<SellerReturnAndFundsPage />, {
      initialRoute: '/dashboard/returns',
    });

    await waitFor(() => {
      expect(screen.getByText(/returns management/i)).toBeInTheDocument();
    });
  });

  test('displays returns list', async () => {
    renderWithProviders(<SellerReturnAndFundsPage />, {
      initialRoute: '/dashboard/returns',
    });

    await waitFor(() => {
      expect(screen.getByTestId('return-list-table')).toBeInTheDocument();
      expect(screen.getByText('ORD123')).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    mockGetAllSellerReturns.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<SellerReturnAndFundsPage />, {
      initialRoute: '/dashboard/returns',
    });

    // Component should render loading state
    await waitFor(() => {
      expect(screen.getByText(/loading returns/i)).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    mockGetAllSellerReturns.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    renderWithProviders(<SellerReturnAndFundsPage />, {
      initialRoute: '/dashboard/returns',
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load returns/i)).toBeInTheDocument();
    });
  });

  test('displays empty state when no returns', async () => {
    mockGetAllSellerReturns.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SellerReturnAndFundsPage />, {
      initialRoute: '/dashboard/returns',
    });

    await waitFor(() => {
      expect(screen.getByText(/no returns found matching your criteria/i)).toBeInTheDocument();
    });
  });
});

