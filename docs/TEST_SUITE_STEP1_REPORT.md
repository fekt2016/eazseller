# STEP 1 — Test Setup Findings (EazSeller)

## Q1. Is Vitest or Jest installed?
- [x] **Vitest** (preferred for Vite apps)
- [ ] Jest
- [ ] Neither

**Finding:** Vitest ^4.0.18 is in `devDependencies`. A separate `vitest.config.js` exists with `globals: true`, `environment: 'jsdom'`, `setupFiles: ['./src/__tests__/setup.js']`, and coverage (v8).

---

## Q2. Is @testing-library/react installed?
- [x] **Yes**
- [ ] No

**Finding:** `@testing-library/react` ^16.3.2, `@testing-library/jest-dom` ^6.9.1, and `@testing-library/user-event` ^14.6.1 are installed.

---

## Q3. Are any test files already present?
- [x] **Yes** — list below
- [ ] No

**Existing tests (under `src/__tests__/`):**
- `__tests__/setup.js`
- `__tests__/mocks/server.js`, `__tests__/mocks/handlers.js`
- `__tests__/utils/testUtils.jsx`, `helpers.test.js`, `phoneNetworkDetector.test.js`, `logger.test.js`, `imageCompressor.test.js`, `formatTransaction.test.js`
- `__tests__/pages/`: AuthPage, Dashboard, Products, AddProduct, EditProduct, Orders, OrderDetail, ForgotPasswordPage, ResetPasswordPage, PaymentMethodPage, BusinessProfilePage, UnifiedWalletPage, WithdrawalsPage, etc.
- `__tests__/components/`: StatCard, ResponsiveDataTable, Button
- No `src/tests/` directory (spec requests new suite under `src/tests/`).

---

## Q4. Is there a test setup file?
- [x] **Yes** — path: `src/__tests__/setup.js`
- [ ] No

**Finding:** Setup file runs before all tests: imports `@testing-library/jest-dom`, cleanup, MSW server (dynamic import), `window.location` mock, timer tracking, and suppresses `console.warn`/`console.error`. No `matchMedia`/`IntersectionObserver`/`ResizeObserver` mocks in current setup.

---

## Q5. Is MSW (Mock Service Worker) installed?
- [ ] Yes
- [x] **No** (as direct dependency)

**Finding:** `msw` is **not** listed in `package.json` dependencies or devDependencies. It appears in `package-lock.json` (likely from a previous install or transitive). The codebase uses MSW in `src/__tests__/mocks/server.js` and `handlers.js`. **MSW should be installed explicitly.**

---

## Summary
- Use **Vitest**; add/keep **test:run** script; optionally add **@vitest/ui**.
- Install **msw** as a devDependency.
- New suite will live under **src/tests/** per spec, with its own setup, mocks, and 15 test files; Vitest will be configured to run this suite (and optionally include/exclude existing `__tests__`).
