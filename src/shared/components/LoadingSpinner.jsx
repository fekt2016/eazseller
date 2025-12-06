/* eslint-disable react/prop-types */
import React from 'react';
import styled, { css } from "styled-components";
import { spin } from '../styles/animations';

// Base Spinner Styles
const BaseSpinner = styled.div`
  display: inline-block;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  border: 2px solid transparent;
`;

// Primary Loading Spinner Component - GLOBAL STANDARD
const Spinner = styled(BaseSpinner)`
  width: ${({ $size = "md" }) => {
    switch ($size) {
      case "sm":
        return "16px";
      case "lg":
        return "32px";
      case "xl":
        return "48px";
      default:
        return "24px";
    }
  }};
  height: ${({ $size = "md" }) => {
    switch ($size) {
      case "sm":
        return "16px";
      case "lg":
        return "32px";
      case "xl":
        return "48px";
      default:
        return "24px";
    }
  }};
  border-top: 2px solid ${({ $color, theme }) => 
    $color || 
    (theme?.colors?.primary) || 
    'var(--color-primary-500)' || 
    'var(--primary)' || 
    '#3b82f6'
  };
  border-right: 2px solid ${({ $color, theme }) => 
    $color || 
    (theme?.colors?.primary) || 
    'var(--color-primary-500)' || 
    'var(--primary)' || 
    '#3b82f6'
  };
  border-bottom: 2px solid ${({ $color, theme }) => 
    $color ? 'transparent' : 
    (theme?.colors?.grey?.[300]) || 
    'var(--color-grey-300)' || 
    'var(--gray-300)' || 
    '#d1d5db'
  };
  border-left: 2px solid ${({ $color, theme }) => 
    $color ? 'transparent' : 
    (theme?.colors?.grey?.[300]) || 
    'var(--color-grey-300)' || 
    'var(--gray-300)' || 
    '#d1d5db'
  };
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ $centered, $fullScreen }) => {
    if ($fullScreen) {
      return css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        z-index: 1000;
      `;
    }
    if ($centered) {
      return css`
        min-height: 100vh;
        width: 100%;
      `;
    }
    return '';
  }}
`;

/**
 * Global LoadingSpinner Component - SINGLE SOURCE OF TRUTH
 * 
 * This is the SINGLE SOURCE OF TRUTH for all loading spinners across the application.
 * All other spinner components should be deprecated and replaced with this one.
 * 
 * @param {string} size - Spinner size: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} color - Spinner color (CSS color value)
 * @param {boolean} centered - Center the spinner in its container
 * @param {boolean} fullScreen - Show as full-screen overlay
 * @param {string} ariaLabel - Accessibility label (default: "Loading...")
 * 
 * @example
 * <LoadingSpinner size="sm" /> // For buttons
 * <LoadingSpinner size="md" centered /> // For page sections
 * <LoadingSpinner size="lg" fullScreen /> // For full-page loading
 * <LoadingSpinner size="md" color="#ff0000" /> // Custom color
 */
function LoadingSpinner({ 
  size = "md", 
  color, 
  centered = false, 
  fullScreen = false,
  ariaLabel = "Loading...",
  ...props 
}) {
  return (
    <Container 
      $centered={centered} 
      $fullScreen={fullScreen}
      role="status" 
      aria-live="polite"
      {...props}
    >
      <Spinner 
        $size={size} 
        $color={color} 
        aria-label={ariaLabel}
      />
    </Container>
  );
}

// Export as default for convenience
export default LoadingSpinner;

// Also export as named export for flexibility
export { LoadingSpinner };

// Export ButtonSpinner for backward compatibility (deprecated - use LoadingSpinner size="sm")
export const ButtonSpinner = styled(BaseSpinner)`
  width: ${({ size = "sm" }) => {
    switch (size) {
      case "sm":
        return "16px";
      case "md":
        return "20px";
      case "lg":
        return "24px";
      default:
        return "16px";
    }
  }};
  height: ${({ size = "sm" }) => {
    switch (size) {
      case "sm":
        return "16px";
      case "md":
        return "20px";
      case "lg":
        return "24px";
      default:
        return "16px";
    }
  }};
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid transparent;
  border-left: 2px solid transparent;
`;

// Export PageSpinner for backward compatibility (deprecated - use LoadingSpinner size="lg" fullScreen)
export const PageSpinner = styled(BaseSpinner)`
  width: 60px;
  height: 60px;
  border-top: 3px solid var(--primary);
  border-right: 3px solid var(--primary);
  border-bottom: 3px solid var(--gray-200);
  border-left: 3px solid var(--gray-200);
`;

// Export SpinnerContainer for backward compatibility
export const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  
  ${({ fullScreen }) => fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    z-index: 1000;
  `}
`;

// Export LoadingContainer as alias for SpinnerContainer (backward compatibility)
export const LoadingContainer = SpinnerContainer;
