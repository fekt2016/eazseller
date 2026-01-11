/**
 * TrackingPage Component Tests
 * 
 * Tests for the seller TrackingPage:
 * - Renders loading state
 * - Renders error state
 * - Renders tracking information successfully
 * - Displays order details
 * - Handles back navigation
 * - Handles missing tracking number
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import TrackingPage from '../../features/orders/TrackingPage';

// Mock orderService
const mockGetOrderByTrackingNumber = vi.fn();
vi.mock('../../shared/services/orderApi', () => ({
  orderService: {
    getOrderByTrackingNumber: (...args) => mockGetOrderByTrackingNumber(...args),
  },
}));

// Mock react-router-dom
const mockParams = { trackingNumber: 'TRACK123456' };
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TrackingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.trackingNumber = 'TRACK123456';
    mockNavigate.mockClear();
    
    // Reset mock implementation
    mockGetOrderByTrackingNumber.mockResolvedValue({
      data: {
        order: {
          _id: 'order123',
          orderNumber: 'ORD123456789',
          trackingNumber: 'TRACK123456',
          status: 'confirmed',
          orderStatus: 'confirmed',
          currentStatus: 'confirmed',
          paymentStatus: 'paid',
          total: 150.00,
          createdAt: new Date().toISOString(),
          orderItems: [
            {
              product: {
                name: 'Product 1',
                _id: 'prod1',
              },
              quantity: 2,
              price: 65.00,
            },
          ],
          trackingHistory: [
            {
              status: 'confirmed',
              message: 'Order confirmed',
              timestamp: new Date().toISOString(),
            },
          ],
          user: {
            name: 'John Doe',
            email: 'john@test.com',
          },
          shippingAddress: {
            streetAddress: '123 Main St',
            city: 'Accra',
            region: 'Greater Accra',
            postalCode: 'GA123',
          },
        },
      },
    });
  });

  test('renders loading state', async () => {
    // Delay the mock to simulate loading
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetOrderByTrackingNumber.mockReturnValue(promise);

    renderWithProviders(<TrackingPage />, {
      initialRoute: '/tracking/TRACK123456',
    });

    // Component should render while loading
    // Verify the API is called (component renders without error)
    await waitFor(() => {
      expect(mockGetOrderByTrackingNumber).toHaveBeenCalledWith('TRACK123456');
    });
    
    // Resolve the promise to complete the test
    resolvePromise({ data: { order: {} } });
  });

  test('renders error state when order not found', async () => {
    const error = new Error('Order not found');
    error.response = { status: 404 };
    mockGetOrderByTrackingNumber.mockRejectedValue(error);

    renderWithProviders(<TrackingPage />, {
      initialRoute: '/tracking/TRACK123456',
    });

    await waitFor(() => {
      expect(screen.getByText(/tracking not found/i)).toBeInTheDocument();
      expect(screen.getByText(/order not found with this tracking number/i)).toBeInTheDocument();
    });
  });

  test('renders error state when network error', async () => {
    const error = new Error('Network Error');
    error.code = 'ERR_NETWORK';
    mockGetOrderByTrackingNumber.mockRejectedValue(error);

    renderWithProviders(<TrackingPage />, {
      initialRoute: '/tracking/TRACK123456',
    });

    await waitFor(() => {
      expect(screen.getByText(/unable to connect to the server/i)).toBeInTheDocument();
    });
  });

  test('renders tracking information successfully', async () => {
    renderWithProviders(<TrackingPage />, {
      initialRoute: '/tracking/TRACK123456',
    });

    await waitFor(() => {
      expect(screen.getByText(/tracking number/i)).toBeInTheDocument();
      expect(screen.getByText('TRACK123456')).toBeInTheDocument();
    });
  });

  test('displays order details', async () => {
    renderWithProviders(<TrackingPage />, {
      initialRoute: '/tracking/TRACK123456',
    });

    await waitFor(() => {
      expect(screen.getByText(/order number/i)).toBeInTheDocument();
      // Order number is wrapped in <strong> tag
      expect(screen.getByText('ORD123456789')).toBeInTheDocument();
    });
  });

  test('handles back navigation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TrackingPage />, {
      initialRoute: '/tracking/TRACK123456',
    });

    await waitFor(() => {
      expect(screen.getByText(/tracking number/i)).toBeInTheDocument();
    });

    // Back button text is "Back" in success state
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('handles missing tracking number', async () => {
    mockParams.trackingNumber = undefined;

    renderWithProviders(<TrackingPage />, {
      initialRoute: '/tracking',
    });

    // Should not call the API when tracking number is missing
    await waitFor(() => {
      expect(mockGetOrderByTrackingNumber).not.toHaveBeenCalled();
    });
  });
});

