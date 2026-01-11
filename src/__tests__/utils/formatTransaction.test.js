/**
 * Format Transaction Utility Tests
 * 
 * Tests for transaction formatting functions:
 * - formatTransactionAmount
 * - getTransactionTypeLabel
 * - getTransactionStatusColor
 */

import { describe, test, expect } from 'vitest';
import {
  formatTransactionAmount,
  getTransactionTypeLabel,
  getTransactionStatusColor,
} from '../../shared/utils/formatTransaction';

describe('formatTransaction', () => {
  describe('formatTransactionAmount', () => {
    test('formats credit transaction correctly', () => {
      const transaction = { amount: 100, type: 'credit' };
      const formatted = formatTransactionAmount(transaction);
      expect(formatted).toContain('+');
      expect(formatted).toContain('GH₵');
      expect(formatted).toContain('100');
    });

    test('formats debit transaction correctly', () => {
      const transaction = { amount: -50, type: 'debit' };
      const formatted = formatTransactionAmount(transaction);
      expect(formatted).toContain('-');
      expect(formatted).toContain('GH₵');
      expect(formatted).toContain('50');
    });

    test('handles positive amount as credit', () => {
      const transaction = { amount: 200 };
      const formatted = formatTransactionAmount(transaction);
      expect(formatted).toContain('+');
    });

    test('handles zero amount', () => {
      const transaction = { amount: 0 };
      const formatted = formatTransactionAmount(transaction);
      expect(formatted).toContain('GH₵');
      expect(formatted).toContain('0.00');
    });
  });

  describe('getTransactionTypeLabel', () => {
    test('returns "Order Earning" for order transactions', () => {
      const transaction = { description: 'Order payment', type: 'credit' };
      expect(getTransactionTypeLabel(transaction)).toBe('Order Earning');
    });

    test('returns "Withdrawal" for withdrawal transactions', () => {
      const transaction = { description: 'Withdrawal request', type: 'debit' };
      expect(getTransactionTypeLabel(transaction)).toBe('Withdrawal');
    });

    test('returns "Refund" for refund transactions', () => {
      const transaction = { description: 'Refund processed', type: 'debit' };
      expect(getTransactionTypeLabel(transaction)).toBe('Refund');
    });

    test('returns "Credit" for generic credit', () => {
      const transaction = { type: 'credit' };
      expect(getTransactionTypeLabel(transaction)).toBe('Credit');
    });

    test('returns "Debit" for generic debit', () => {
      const transaction = { type: 'debit' };
      expect(getTransactionTypeLabel(transaction)).toBe('Debit');
    });
  });

  describe('getTransactionStatusColor', () => {
    test('returns correct color for completed status', () => {
      const color = getTransactionStatusColor('completed');
      expect(color).toBe('var(--color-green-700)');
    });

    test('returns correct color for pending status', () => {
      const color = getTransactionStatusColor('pending');
      expect(color).toBe('var(--color-yellow-700)');
    });

    test('returns correct color for failed status', () => {
      const color = getTransactionStatusColor('failed');
      expect(color).toBe('var(--color-red-700)');
    });

    test('returns default color for unknown status', () => {
      const color = getTransactionStatusColor('unknown');
      expect(color).toBe('var(--color-grey-700)');
    });

    test('handles null/undefined status', () => {
      const color = getTransactionStatusColor(null);
      expect(color).toBe('var(--color-grey-700)');
    });
  });
});

