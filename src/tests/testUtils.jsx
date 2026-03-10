import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { MOCK_SELLER } from './mocks/mockData';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  });

export const mockAuthValue = {
  seller: MOCK_SELLER,
  isLoading: false,
  isError: false,
  login: vi.fn(),
  logout: vi.fn(),
  refetchAuth: vi.fn(),
};

export const mockPendingSeller = { ...MOCK_SELLER, status: 'pending', isVerified: false };
export const mockSuspendedSeller = { ...MOCK_SELLER, status: 'suspended' };

export const renderWithProviders = (
  ui,
  { seller = MOCK_SELLER, initialEntries = ['/'], queryClient = null, ...renderOptions } = {}
) => {
  const client = queryClient || createTestQueryClient();
  if (seller) client.setQueryData(['sellerAuth'], seller);
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: client,
  };
};

export const renderUnauthenticated = (ui, options) =>
  renderWithProviders(ui, { ...options, seller: null });

export const renderAsPendingSeller = (ui, options) =>
  renderWithProviders(ui, { ...options, seller: mockPendingSeller });
