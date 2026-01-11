# Test Setup Plan for EazSeller

## Step 1: Install Dependencies

### Testing Libraries
- `vitest` - Test runner (works with Vite)
- `@testing-library/react` - React Testing Library for web
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `msw` - Mock Service Worker for API mocking
- `@vitest/ui` - Test UI (optional)

### React Query Testing
- Already have `@tanstack/react-query`
- Need to ensure proper QueryClient setup in tests

### Router Testing
- `react-router-dom` already installed
- Need to wrap components with `MemoryRouter` in tests

## Step 2: Create Test Infrastructure

### Files to Create:
1. `vitest.config.js` - Vitest configuration
2. `src/__tests__/setup.js` - Test setup file
3. `src/__tests__/mocks/server.js` - MSW server setup
4. `src/__tests__/mocks/handlers.js` - MSW request handlers
5. `src/__tests__/utils/testUtils.jsx` - Test utilities
6. `src/__tests__/auth/useAuth.test.js` - Auth tests
7. `src/__tests__/guards/SellerProtectedRoute.test.js` - Route guard tests

## Step 3: Test Patterns (from Saysaysellerapp)

### Standardized Patterns:
- Fresh QueryClient per test
- Comprehensive cleanup in `afterEach`
- No `setTimeout` in cleanup (use `queueMicrotask`)
- Consistent `beforeEach` order
- QueryClient configuration standardized
- MSW lifecycle properly managed

## Step 4: Key Differences from React Native

### React Web vs React Native:
- Use `@testing-library/react` instead of `@testing-library/react-native`
- Use `@testing-library/jest-dom` for DOM matchers
- Use `jsdom` environment (default for Vitest)
- No need to mock React Native modules
- Use `MemoryRouter` from `react-router-dom` instead of `NavigationContainer`

## Step 5: Critical Tests to Add

1. **Authentication Tests:**
   - Login flow
   - Logout flow
   - 401 handling
   - Cookie-based auth verification

2. **Route Guard Tests:**
   - SellerProtectedRoute redirect logic
   - Unauthenticated access blocking

3. **Setup Page Tests:**
   - Setup completion logic
   - Document verification
   - Payment method verification

4. **Product Creation Guard:**
   - Block unverified sellers
   - Allow verified sellers

5. **Wallet/Withdrawal Tests:**
   - Payout method verification
   - Withdrawal blocking logic



