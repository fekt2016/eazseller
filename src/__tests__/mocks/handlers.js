/**
 * MSW Request Handlers
 * 
 * Mock handlers for all API endpoints used in the app.
 * These handlers simulate realistic backend responses.
 * 
 * CRITICAL: These handlers simulate cookie-based authentication.
 * - No localStorage tokens
 * - Cookies are simulated via response headers
 * - 401 responses indicate unauthenticated state
 */

import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:4000/api/v1';

// Mock seller data
const mockSeller = {
  _id: 'seller123',
  id: 'seller123',
  email: 'seller@test.com',
  phone: '+233123456789',
  name: 'Test Seller',
  shopName: 'Test Shop',
  role: 'seller',
  status: 'active',
  emailVerified: true,
  phoneVerified: true,
};

// Mock seller status data
const mockSellerStatus = {
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
  businessDocumentsStatus: {
    isVerified: true,
    businessCertStatus: 'verified',
    idProofStatus: 'verified',
    addresProofStatus: 'verified',
  },
  paymentMethodStatus: {
    isVerified: true,
    hasAdded: true,
  },
};

// Track authentication state (simulates cookie)
let isAuthenticated = false;
let currentSeller = null;

/**
 * Helper to check if request is authenticated
 * In real app, this would check cookies
 */
const checkAuth = (request) => {
  // Check for cookie in request headers
  const cookies = request.headers.get('cookie') || '';
  const hasAuthCookie = cookies.includes('seller_jwt') || cookies.includes('jwt');
  
  // Also check if we've set authentication state in tests
  return hasAuthCookie || isAuthenticated;
};

/**
 * Helper to set authentication state (for tests)
 */
export const setAuthenticated = (seller = mockSeller) => {
  isAuthenticated = true;
  currentSeller = seller;
};

/**
 * Helper to clear authentication state (for tests)
 */
export const clearAuthenticated = () => {
  isAuthenticated = false;
  currentSeller = null;
};

export const handlers = [
  /**
   * Authentication Endpoints
   */
  
  // GET /seller/me - Get current seller
  http.get(`${API_BASE}/seller/me`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'You are not logged in! Please log in to get access.' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: {
        data: currentSeller || mockSeller,
      },
    });
  }),

  // POST /seller/login - Login
  http.post(`${API_BASE}/seller/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;
    
    // Simulate login validation
    if (email === 'seller@test.com' && password === 'password123') {
      setAuthenticated(mockSeller);
      
      // Set cookie in response (simulated)
      return HttpResponse.json(
        {
          status: 'success',
          message: 'Login successful',
          user: mockSeller,
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'seller_jwt=mock-jwt-token; Path=/; HttpOnly',
          },
        }
      );
    }
    
    return HttpResponse.json(
      { status: 'fail', message: 'Invalid email or password' },
      { status: 401 }
    );
  }),

  // POST /seller/logout - Logout
  http.post(`${API_BASE}/seller/logout`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'You are not logged in!' },
        { status: 401 }
      );
    }
    
    clearAuthenticated();
    
    return HttpResponse.json(
      { status: 'success', message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': 'seller_jwt=; Path=/; HttpOnly; Max-Age=0',
        },
      }
    );
  }),

  // POST /seller/send-otp - Send OTP
  http.post(`${API_BASE}/seller/send-otp`, async ({ request }) => {
    const body = await request.json();
    const { loginId } = body;
    
    // Always succeed for testing
    return HttpResponse.json({
      status: 'success',
      message: 'OTP sent successfully',
      sessionId: 'otp-session-123',
    });
  }),

  // POST /seller/verify-otp - Verify OTP
  http.post(`${API_BASE}/seller/verify-otp`, async ({ request }) => {
    const body = await request.json();
    const { sessionId, otp, password } = body;
    
    // Simulate OTP verification
    if (otp === '123456') {
      setAuthenticated(mockSeller);
      
      return HttpResponse.json(
        {
          status: 'success',
          message: 'OTP verified successfully',
          user: mockSeller,
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'seller_jwt=mock-jwt-token; Path=/; HttpOnly',
          },
        }
      );
    }
    
    return HttpResponse.json(
      { status: 'fail', message: 'Invalid OTP' },
      { status: 401 }
    );
  }),

  /**
   * Seller Status Endpoints
   */
  
  // GET /seller/status - Get seller onboarding status
  http.get(`${API_BASE}/seller/status`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: mockSellerStatus,
    });
  }),

  /**
   * Product Endpoints
   */
  
  // GET /seller/product - Get seller products
  http.get(`${API_BASE}/seller/product`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: {
        products: [],
      },
    });
  }),

  // POST /product - Create product
  http.post(`${API_BASE}/product`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Simulate successful product creation
    return HttpResponse.json(
      { status: 'success', message: 'Product created successfully' },
      { status: 201 }
    );
  }),

  /**
   * Payout Endpoints
   */
  
  // GET /seller/payout/balance - Get seller payout balance
  http.get(`${API_BASE}/seller/payout/balance`, ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      status: 'success',
      data: {
        balance: 1000,
        withdrawableBalance: 500,
        pendingBalance: 300,
        lockedBalance: 200,
        totalRevenue: 1500,
        totalWithdrawn: 1000,
        payoutStatus: 'verified',
      },
    });
  }),

  // POST /seller/payout/withdrawal-requests - Create withdrawal request
  http.post(`${API_BASE}/seller/payout/withdrawal-requests`, async ({ request }) => {
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { status: 'fail', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { amount, paymentMethod } = body;
    
    if (amount > 500) {
      return HttpResponse.json(
        { status: 'fail', message: 'Amount exceeds withdrawable balance' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(
      { status: 'success', message: 'Withdrawal request created' },
      { status: 201 }
    );
  }),
];



