/**
 * Phone Network Detector Utility Tests
 * 
 * Tests for detectGhanaPhoneNetwork function:
 * - Detects MTN numbers
 * - Detects Telecel (Vodafone) numbers
 * - Detects AirtelTigo numbers
 * - Handles different phone formats
 * - Validates phone numbers
 */

import { describe, test, expect } from 'vitest';
import { detectGhanaPhoneNetwork } from '../../shared/utils/phoneNetworkDetector';

describe('phoneNetworkDetector', () => {
  describe('detectGhanaPhoneNetwork', () => {
    test('detects MTN network correctly', () => {
      const result = detectGhanaPhoneNetwork('0241234567');
      expect(result.network).toBe('MTN');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('0241234567');
    });

    test('detects Telecel network correctly', () => {
      const result = detectGhanaPhoneNetwork('0271234567');
      expect(result.network).toBe('Telecel');
      expect(result.isValid).toBe(true);
    });

    test('detects AirtelTigo network correctly', () => {
      const result = detectGhanaPhoneNetwork('0261234567');
      expect(result.network).toBe('AirtelTigo');
      expect(result.isValid).toBe(true);
    });

    test('handles international format (233)', () => {
      const result = detectGhanaPhoneNetwork('233241234567');
      expect(result.network).toBe('MTN');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('0241234567');
    });

    test('handles format with + prefix', () => {
      const result = detectGhanaPhoneNetwork('+233241234567');
      expect(result.network).toBe('MTN');
      expect(result.isValid).toBe(true);
    });

    test('handles format with spaces', () => {
      const result = detectGhanaPhoneNetwork('024 123 4567');
      expect(result.network).toBe('MTN');
      expect(result.isValid).toBe(true);
    });

    test('returns invalid for invalid phone number', () => {
      const result = detectGhanaPhoneNetwork('12345');
      expect(result.isValid).toBe(false);
      expect(result.network).toBe(null);
    });

    test('handles null input', () => {
      const result = detectGhanaPhoneNetwork(null);
      expect(result.isValid).toBe(false);
      expect(result.network).toBe(null);
    });

    test('handles empty string', () => {
      const result = detectGhanaPhoneNetwork('');
      expect(result.isValid).toBe(false);
      expect(result.network).toBe(null);
    });

    test('handles non-string input', () => {
      const result = detectGhanaPhoneNetwork(1234567890);
      expect(result.isValid).toBe(false);
      expect(result.network).toBe(null);
    });
  });
});

