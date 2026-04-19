/**
 * Vitest Setup File
 * 
 * This file runs before all tests to configure the testing environment.
 * 
 * Purpose:
 * - Set up global test utilities
 * - Configure MSW (Mock Service Worker) for API mocking
 * - Set up test environment variables
 * - Ensure proper cleanup to prevent test hanging
 * 
 * IMPORTANT: This file uses ES modules (import) for Vitest compatibility.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server.js';

// Set up environment variables for tests
process.env.VITE_API_URL = 'http://localhost:4000/api/v1';
process.env.NODE_ENV = 'test';

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    origin: 'http://localhost:5173',
    href: 'http://localhost:5173',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Global timer tracking for test hanging issues
const activeTimers = new Set();
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;
const originalClearTimeout = global.clearTimeout;
const originalClearInterval = global.clearInterval;

global.setTimeout = (...args) => {
  const timer = originalSetTimeout(...args);
  activeTimers.add(timer);
  return timer;
};

global.setInterval = (...args) => {
  const timer = originalSetInterval(...args);
  activeTimers.add(timer);
  return timer;
};

global.clearTimeout = (timer) => {
  activeTimers.delete(timer);
  originalClearTimeout(timer);
};

global.clearInterval = (timer) => {
  activeTimers.delete(timer);
  originalClearInterval(timer);
};

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers and clean up after each test
afterEach(async () => {
  if (server) {
    try {
      server.resetHandlers();
    } catch (error) {
      // Ignore reset errors
    }
  }
  
  // Clear all active timers
  activeTimers.forEach((timer) => originalClearTimeout(timer));
  activeTimers.clear();

  // Ensure all React Testing Library cleanup is done
  cleanup();
});

// Clean up after all tests
afterAll(() => {
  if (server) {
    try {
      server.close();
    } catch (error) {
      // Ignore close errors
    }
  }
});

// Suppress console warnings in tests (optional)
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

