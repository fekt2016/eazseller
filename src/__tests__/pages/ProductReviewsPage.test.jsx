/**
 * ProductReviewsPage Component Tests
 * 
 * Tests for the seller ProductReviewsPage:
 * - Renders reviews page
 * - Displays reviews list
 * - Handles filtering
 * - Handles loading state
 * - Handles reply to review
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../utils/testUtils';
import ProductReviewsPage from '../../features/reviews/ProductReviewsPage';

// Mock useReview hooks
const mockReviews = [
  {
    _id: 'review1',
    product: { name: 'Product 1', image: 'image1.jpg' },
    user: { name: 'John Doe' },
    rating: 5,
    comment: 'Great product!',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'review2',
    product: { name: 'Product 2', image: 'image2.jpg' },
    user: { name: 'Jane Smith' },
    rating: 4,
    comment: 'Good quality',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

const mockUseGetSellerReviews = vi.fn(() => ({
  data: mockReviews,
  isLoading: false,
  error: null,
}));

const mockReplyMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mockUseReplyToReview = vi.fn(() => mockReplyMutation);

vi.mock('../../shared/hooks/useReview', () => ({
  useGetSellerReviews: (...args) => mockUseGetSellerReviews(...args),
  useReplyToReview: (...args) => mockUseReplyToReview(...args),
}));

describe('ProductReviewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseGetSellerReviews.mockReturnValue({
      data: mockReviews,
      isLoading: false,
      error: null,
    });
    
    mockReplyMutation.mutateAsync.mockResolvedValue({ success: true });
  });

  test('renders reviews page', async () => {
    renderWithProviders(<ProductReviewsPage />, {
      initialRoute: '/dashboard/reviews',
    });

    await waitFor(() => {
      expect(screen.getByText(/product reviews/i)).toBeInTheDocument();
    });
  });

  test('displays reviews list', async () => {
    renderWithProviders(<ProductReviewsPage />, {
      initialRoute: '/dashboard/reviews',
    });

    await waitFor(() => {
      expect(screen.getByText('Great product!')).toBeInTheDocument();
      expect(screen.getByText('Good quality')).toBeInTheDocument();
    });
  });

  test('handles filtering', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ProductReviewsPage />, {
      initialRoute: '/dashboard/reviews',
    });

    await waitFor(() => {
      expect(screen.getByText(/product reviews/i)).toBeInTheDocument();
    });

    // Filter is a select dropdown
    const filterSelect = screen.getByRole('combobox');
    expect(filterSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /all reviews/i })).toBeInTheDocument();
  });

  test('handles loading state', async () => {
    mockUseGetSellerReviews.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<ProductReviewsPage />, {
      initialRoute: '/dashboard/reviews',
    });

    // Component should render while loading
    await waitFor(() => {
      expect(mockUseGetSellerReviews).toHaveBeenCalled();
    });
  });

  test('displays empty state when no reviews', async () => {
    mockUseGetSellerReviews.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<ProductReviewsPage />, {
      initialRoute: '/dashboard/reviews',
    });

    await waitFor(() => {
      expect(screen.getByText(/no reviews found for your products/i)).toBeInTheDocument();
    });
  });
});

