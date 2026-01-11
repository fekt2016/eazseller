/**
 * Logger Utility Tests
 * 
 * Tests for logger utility:
 * - Debug logs only in development
 * - Info logs only in development
 * - Warn logs always
 * - Error logs always
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock console methods
const consoleDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('logger', () => {
  let logger;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Import logger fresh for each test
    const loggerModule = await import('../../shared/utils/logger');
    logger = loggerModule.default;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('debug logs in development', () => {
    logger.debug('Debug message');
    // In test environment (development), debug should log
    expect(consoleDebug).toHaveBeenCalledWith('Debug message');
  });

  test('info logs in development', () => {
    logger.info('Info message');
    // In test environment (development), info should log
    expect(consoleInfo).toHaveBeenCalledWith('Info message');
  });

  test('warn always logs', () => {
    logger.warn('Warning message');
    expect(consoleWarn).toHaveBeenCalledWith('Warning message');
  });

  test('error always logs', () => {
    logger.error('Error message');
    expect(consoleError).toHaveBeenCalledWith('Error message');
  });

  test('logger methods accept multiple arguments', () => {
    logger.info('Message', { key: 'value' }, 123);
    expect(consoleInfo).toHaveBeenCalledWith('Message', { key: 'value' }, 123);
  });

  test('logger methods can be called multiple times', () => {
    logger.warn('Warning 1');
    logger.warn('Warning 2');
    expect(consoleWarn).toHaveBeenCalledTimes(2);
  });
});

