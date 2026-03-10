import { http, HttpResponse } from 'msw';
import {
  MOCK_SELLER,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_DASHBOARD_STATS,
} from './mockData.js';

const BASE_URL = 'http://localhost:4000/api/v1';

export const handlers = [
  // ── AUTH ─────────────────────────────────
  http.get(`${BASE_URL}/seller/me`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        data: MOCK_SELLER,
        seller: MOCK_SELLER,
      },
    });
  }),

  http.post(`${BASE_URL}/seller/login`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Login successful',
    });
  }),

  http.post(`${BASE_URL}/seller/logout`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }),

  http.post(`${BASE_URL}/seller/forgot-password`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'If an account exists, you will receive an email with instructions.',
    });
  }),

  // ── PRODUCTS (seller/me/products and product) ─────────────────────────────
  http.get(`${BASE_URL}/seller/me/products`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        products: MOCK_PRODUCTS,
        total: MOCK_PRODUCTS.length,
        page: 1,
        totalPages: 1,
      },
    });
  }),

  http.post(`${BASE_URL}/product`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { product: MOCK_PRODUCTS[0] },
    }, { status: 201 });
  }),

  http.patch(`${BASE_URL}/product/:id`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { product: MOCK_PRODUCTS[0] },
    });
  }),

  http.delete(`${BASE_URL}/product/:id`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Product deleted',
    });
  }),

  http.delete(`${BASE_URL}/seller/me/products/:id`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Product deleted',
    });
  }),

  // ── ORDERS ───────────────────────────────
  http.get(`${BASE_URL}/order/get-seller-orders`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        orders: MOCK_ORDERS,
        total: MOCK_ORDERS.length,
        page: 1,
        totalPages: 1,
      },
    });
  }),

  http.get(`${BASE_URL}/order/seller-order/:orderId`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { order: MOCK_ORDERS[0] },
    });
  }),

  http.patch(`${BASE_URL}/order/:id/status`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { order: MOCK_ORDERS[0] },
    });
  }),

  // ── DASHBOARD / ANALYTICS ────────────────────────────
  http.get(`${BASE_URL}/seller/analytics/kpi`, () => {
    return HttpResponse.json({
      status: 'success',
      data: MOCK_DASHBOARD_STATS,
    });
  }),

  // ── FINANCE / WALLET ──────────────────────────────
  http.get(`${BASE_URL}/seller/me/balance`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        balance: 500,
        currency: 'GHS',
        pendingBalance: 120,
        withdrawableBalance: 380,
      },
    });
  }),

  http.get(`${BASE_URL}/seller/me/transactions`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { transactions: [], total: 0 },
    });
  }),

  http.post(`${BASE_URL}/seller/withdrawals`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Withdrawal initiated',
    });
  }),

  // ── SELLER STATUS (for ProtectedRoute / onboarding) ─────────────────────────────
  http.get(`${BASE_URL}/seller/status`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        onboardingStage: 'verified',
        verification: {
          emailVerified: true,
          phoneVerified: true,
          contactVerified: true,
        },
        requiredSetup: {
          hasPaymentMethodVerified: true,
          hasBusinessDocumentsVerified: true,
        },
        businessDocumentsStatus: { isVerified: true },
        paymentMethodStatus: { isVerified: true, hasAdded: true },
      },
    });
  }),

  // ── PROFILE / PAYMENT METHODS ─────────────────────────────
  http.get(`${BASE_URL}/seller/profile/:sellerId`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { seller: MOCK_SELLER },
    });
  }),

  http.patch(`${BASE_URL}/seller/updateMe`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { seller: MOCK_SELLER },
    });
  }),

  http.get(`${BASE_URL}/paymentmethod/me`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { paymentMethods: [] },
    });
  }),

  http.post(`${BASE_URL}/paymentmethod`, () => {
    return HttpResponse.json({
      status: 'success',
      data: { paymentMethod: {} },
    }, { status: 201 });
  }),
];
