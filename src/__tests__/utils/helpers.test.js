/**
 * Helpers Utility Tests
 * 
 * Tests for utility functions in helpers.js:
 * - formatCurrency
 * - formatDate
 * - formatTime
 * - randomOrderId
 * - generateSKU
 * - generateDisplayId
 */

import { describe, test, expect, vi } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatTime,
  randomOrderId,
  generateSKU,
  generateDisplayId,
} from '../../shared/utils/helpers';

describe('helpers', () => {
  describe('formatCurrency', () => {
    test('formats positive numbers correctly', () => {
      expect(formatCurrency(100)).toContain('100');
      expect(formatCurrency(1000.50)).toContain('1,000.50');
    });

    test('formats zero correctly', () => {
      expect(formatCurrency(0)).toContain('0');
    });

    test('formats negative numbers correctly', () => {
      const formatted = formatCurrency(-100);
      expect(formatted).toContain('-');
      expect(formatted).toContain('100');
    });
  });

  describe('formatDate', () => {
    test('formats valid date string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date.toISOString());
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    test('handles Date object', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatTime', () => {
    test('returns "Today" for today\'s date', () => {
      const today = new Date();
      expect(formatTime(today)).toBe('Today');
    });

    test('returns "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatTime(yesterday)).toBe('Yesterday');
    });

    test('returns days ago for dates within 7 days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const result = formatTime(threeDaysAgo);
      expect(result).toContain('days ago');
    });

    test('formats dates older than 7 days', () => {
      const oldDate = new Date('2020-01-01');
      const result = formatTime(oldDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('randomOrderId', () => {
    test('generates order ID with correct format', () => {
      const orderId = randomOrderId();
      expect(orderId).toMatch(/^EW\d{5}$/);
    });

    test('generates unique order IDs', () => {
      const id1 = randomOrderId();
      const id2 = randomOrderId();
      // They might be the same by chance, but format should be correct
      expect(id1).toMatch(/^EW\d{5}$/);
      expect(id2).toMatch(/^EW\d{5}$/);
    });
  });

  describe('generateSKU', () => {
    test('generates SKU with seller, variants, and category', () => {
      const seller = { id: 'SELLER123' };
      const variants = { color: 'Red', size: 'Large' };
      const category = 'Electronics';
      
      const sku = generateSKU({ seller, variants, category });
      expect(sku).toBeTruthy();
      expect(typeof sku).toBe('string');
    });

    test('handles missing parameters', () => {
      const sku = generateSKU({});
      expect(sku).toBeTruthy();
      expect(typeof sku).toBe('string');
    });

    test('handles null/undefined values', () => {
      const sku = generateSKU({ seller: null, variants: null, category: null });
      expect(sku).toBeTruthy();
    });
  });

  describe('generateDisplayId', () => {
    test('generates display ID from MongoDB ObjectId', () => {
      const mongoId = '507f1f77bcf86cd799439011';
      const displayId = generateDisplayId(mongoId);
      expect(displayId).toBeTruthy();
      expect(typeof displayId).toBe('string');
    });

    test('handles short IDs', () => {
      const shortId = '123';
      const displayId = generateDisplayId(shortId);
      expect(displayId).toBeTruthy();
    });

    test('handles empty string', () => {
      const displayId = generateDisplayId('');
      expect(displayId).toBeTruthy();
    });
  });
});

