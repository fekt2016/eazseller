/**
 * Image Compressor Utility Tests
 * 
 * Tests for compressImage function:
 * - Function exists and is callable
 * - Accepts file parameter
 * - Returns a promise
 */

import { describe, test, expect } from 'vitest';
import { compressImage } from '../../shared/utils/imageCompressor';

describe('imageCompressor', () => {
  test('compressImage function exists', () => {
    expect(typeof compressImage).toBe('function');
  });

  test('compressImage accepts file parameter', () => {
    const file = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    
    // Function should accept file without throwing
    expect(() => {
      compressImage(file);
    }).not.toThrow();
  });

  test('compressImage returns a promise', () => {
    const file = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const result = compressImage(file);
    
    expect(result).toBeInstanceOf(Promise);
  });

  test('compressImage accepts options parameter', () => {
    const file = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    
    // Function should accept options without throwing
    expect(() => {
      compressImage(file, { quality: 0.8, maxWidth: 1024, maxHeight: 1024 });
    }).not.toThrow();
  });
});

