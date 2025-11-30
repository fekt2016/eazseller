/* eslint-disable react/prop-types */
import React from 'react';
import styled from "styled-components";
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaBoxOpen } from "react-icons/fa";
import { spin, pulse, float, fadeIn, shimmer } from '../../styles/animations';

// ============================================
// SPINNER COMPONENTS
// ============================================

// Base Spinner Styles
const BaseSpinner = styled.div`
  display: inline-block;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  border: 2px solid transparent;
`;

// Primary Loading Spinner Component
export const LoadingSpinner = styled(BaseSpinner)`
  width: ${({ size = "md" }) => {
    switch (size) {
      case "sm": return "16px";
      case "lg": return "32px";
      case "xl": return "48px";
      default: return "24px";
    }
  }};
  height: ${({ size = "md" }) => {
    switch (size) {
      case "sm": return "16px";
      case "lg": return "32px";
      case "xl": return "48px";
      default: return "24px";
    }
  }};
  border-top: 2px solid var(--color-primary-500);
  border-right: 2px solid var(--color-primary-500);
  border-bottom: 2px solid var(--color-grey-300);
  border-left: 2px solid var(--color-grey-300);
`;

// Button Spinner Component - Perfect for form submissions
export const ButtonSpinner = styled(BaseSpinner)`
  width: ${({ size = "sm" }) => {
    switch (size) {
      case "sm": return "16px";
      case "md": return "20px";
      case "lg": return "24px";
      default: return "16px";
    }
  }};
  height: ${({ size = "sm" }) => {
    switch (size) {
      case "sm": return "16px";
      case "md": return "20px";
      case "lg": return "24px";
      default: return "16px";
    }
  }};
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid transparent;
  border-left: 2px solid transparent;
`;

// Page Load Spinner Component - For full page loading
export const PageSpinner = styled(BaseSpinner)`
  width: 60px;
  height: 60px;
  border-top: 3px solid var(--color-primary-500);
  border-right: 3px solid var(--color-primary-500);
  border-bottom: 3px solid var(--color-grey-200);
  border-left: 3px solid var(--color-grey-200);
`;

// Dots Spinner Component - For modern UI
export const DotsSpinner = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &::after {
    content: '';
    width: ${({ size = "sm" }) => {
      switch (size) {
        case "sm": return "3px";
        case "md": return "4px";
        case "lg": return "5px";
        default: return "3px";
      }
    }};
    height: ${({ size = "sm" }) => {
      switch (size) {
        case "sm": return "3px";
        case "md": return "4px";
        case "lg": return "5px";
        default: return "3px";
      }
    }};
    border-radius: 50%;
    background: currentColor;
    animation: ${pulse} 1.4s ease-in-out infinite both;
  }
  
  &::before {
    content: '';
    width: ${({ size = "sm" }) => {
      switch (size) {
        case "sm": return "3px";
        case "md": return "4px";
        case "lg": return "5px";
        default: return "3px";
      }
    }};
    height: ${({ size = "sm" }) => {
      switch (size) {
        case "sm": return "3px";
        case "md": return "4px";
        case "lg": return "5px";
        default: return "3px";
      }
    }};
    border-radius: 50%;
    background: currentColor;
    animation: ${pulse} 1.4s ease-in-out 0.2s infinite both;
    margin-right: 4px;
  }
`;

// Pulse Spinner Component - For subtle loading
export const PulseSpinner = styled.div`
  width: ${({ size = "md" }) => {
    switch (size) {
      case "sm": return "20px";
      case "lg": return "40px";
      case "xl": return "60px";
      default: return "30px";
    }
  }};
  height: ${({ size = "md" }) => {
    switch (size) {
      case "sm": return "20px";
      case "lg": return "40px";
      case "xl": return "60px";
      default: return "30px";
    }
  }};
  border-radius: 50%;
  background: var(--color-primary-500);
  animation: ${pulse} 2s infinite ease-in-out;
`;

// ============================================
// SKELETON LOADING COMPONENTS
// ============================================

// Skeleton Loading Component
export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    var(--color-grey-200) 25%,
    var(--color-grey-300) 50%,
    var(--color-grey-200) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: var(--border-radius-md);
  ${({ width = "100%" }) => `width: ${width};`}
  ${({ height = "1rem" }) => `height: ${height};`}
  ${({ circle }) => circle && "border-radius: 50%;"}
`;

// Skeleton Grid Component
export const SkeletonGrid = ({
  count = 6,
  itemHeight = "200px",
  gap = "var(--spacing-md)",
  ...props
}) => {
  return (
    <SkeletonGridWrapper $gap={gap} {...props}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} height={itemHeight} />
      ))}
    </SkeletonGridWrapper>
  );
};

const SkeletonGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ $gap }) => $gap};
  width: 100%;
`;

// Skeleton Card Component
export const SkeletonCard = ({ ...props }) => {
  return (
    <SkeletonCardWrapper {...props}>
      <Skeleton height="200px" />
      <SkeletonCardContent>
        <Skeleton width="70%" height="24px" />
        <Skeleton width="50%" height="16px" />
        <Skeleton width="90%" height="14px" />
        <Skeleton width="90%" height="14px" />
        <Skeleton width="60%" height="14px" />
        <Skeleton width="100%" height="40px" />
      </SkeletonCardContent>
    </SkeletonCardWrapper>
  );
};

const SkeletonCardWrapper = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
`;

const SkeletonCardContent = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

// ============================================
// STATE COMPONENTS (Empty, Error, Success, Loading)
// ============================================

// Empty State Component
export const EmptyState = ({
  icon = <FaBoxOpen />,
  title = "No data found",
  message = "There's nothing to display at the moment.",
  action,
  ...props
}) => {
  return (
    <EmptyStateWrapper {...props}>
      <EmptyStateIcon>{icon}</EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateMessage>{message}</EmptyStateMessage>
      {action && <EmptyStateAction>{action}</EmptyStateAction>}
    </EmptyStateWrapper>
  );
};

const EmptyStateWrapper = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-muted);
  animation: ${fadeIn} var(--transition-normal) ease-out;
  max-width: 400px;
  margin: 0 auto;
  font-family: var(--font-body);
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
  animation: ${float} 3s var(--transition-bounce) infinite;
  color: var(--color-primary-500);
`;

const EmptyStateTitle = styled.h3`
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
`;

const EmptyStateMessage = styled.p`
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  line-height: 1.6;
`;

const EmptyStateAction = styled.div`
  margin-top: var(--spacing-lg);
`;

// Error State Component
export const ErrorState = ({
  icon = <FaExclamationTriangle />,
  title = "Something went wrong",
  message = "We encountered an error while loading the data.",
  action,
  ...props
}) => {
  return (
    <ErrorStateWrapper {...props}>
      <ErrorStateIcon>{icon}</ErrorStateIcon>
      <ErrorStateTitle>{title}</ErrorStateTitle>
      <ErrorStateMessage>{message}</ErrorStateMessage>
      {action && <ErrorStateAction>{action}</ErrorStateAction>}
    </ErrorStateWrapper>
  );
};

const ErrorStateWrapper = styled(EmptyStateWrapper)`
  color: var(--color-red-600);
`;

const ErrorStateIcon = styled(EmptyStateIcon)`
  color: var(--color-red-600);
`;

const ErrorStateTitle = styled(EmptyStateTitle)`
  color: var(--color-red-600);
`;

const ErrorStateMessage = styled(EmptyStateMessage)`
  color: var(--text-secondary);
`;

const ErrorStateAction = styled(EmptyStateAction)``;

// Success State Component
export const SuccessState = ({
  icon = <FaCheckCircle />,
  title = "Success!",
  message = "The operation was completed successfully.",
  action,
  ...props
}) => {
  return (
    <SuccessStateWrapper {...props}>
      <SuccessStateIcon>{icon}</SuccessStateIcon>
      <SuccessStateTitle>{title}</SuccessStateTitle>
      <SuccessStateMessage>{message}</SuccessStateMessage>
      {action && <SuccessStateAction>{action}</SuccessStateAction>}
    </SuccessStateWrapper>
  );
};

const SuccessStateWrapper = styled(EmptyStateWrapper)`
  color: var(--color-green-700);
`;

const SuccessStateIcon = styled(EmptyStateIcon)`
  color: var(--color-green-700);
`;

const SuccessStateTitle = styled(EmptyStateTitle)`
  color: var(--color-green-700);
`;

const SuccessStateMessage = styled(EmptyStateMessage)`
  color: var(--text-secondary);
`;

const SuccessStateAction = styled(EmptyStateAction)``;

// Loading State Component - Perfect for route loading
export const LoadingState = ({
  message = "Loading...",
  size = "lg",
  spinnerType = "default",
  ...props
}) => {
  const renderSpinner = () => {
    switch (spinnerType) {
      case "dots":
        return <DotsSpinner size="lg" />;
      case "pulse":
        return <PulseSpinner size={size} />;
      default:
        return <LoadingSpinner size={size} />;
    }
  };

  return (
    <LoadingStateWrapper {...props}>
      {renderSpinner()}
      <LoadingMessage>{message}</LoadingMessage>
    </LoadingStateWrapper>
  );
};

const LoadingStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  gap: var(--spacing-lg);
  text-align: center;
  animation: ${fadeIn} var(--transition-normal) ease-out;
  min-height: 200px;
  font-family: var(--font-body);
`;

const LoadingMessage = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  font-family: var(--font-body);
  margin: 0;
`;

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

export const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = false,
  size = "md",
  color = "primary",
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <ProgressBarWrapper $size={size} {...props}>
      {showLabel && (
        <ProgressLabel>
          {Math.round(percentage)}%
        </ProgressLabel>
      )}
      <ProgressTrack>
        <ProgressFill $percentage={percentage} $color={color} />
      </ProgressTrack>
    </ProgressBarWrapper>
  );
};

const ProgressBarWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  
  ${({ $size }) => {
    switch ($size) {
      case "sm":
        return `font-size: var(--font-size-xs);`;
      case "lg":
        return `font-size: var(--font-size-md);`;
      default:
        return `font-size: var(--font-size-sm);`;
    }
  }}
`;

const ProgressLabel = styled.span`
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: inherit;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: ${({ $size }) => {
    switch ($size) {
      case "sm": return "4px";
      case "lg": return "12px";
      default: return "8px";
    }
  }};
  background-color: var(--color-grey-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $percentage }) => `${$percentage}%`};
  background: ${({ $color }) => {
    switch ($color) {
      case "primary":
        return "var(--color-primary-500)";
      case "success":
        return "var(--color-green-700)";
      case "danger":
        return "var(--color-red-600)";
      case "warning":
        return "var(--color-yellow-700)";
      default:
        return "var(--color-primary-500)";
    }
  }};
  border-radius: var(--border-radius-full);
  transition: width 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;
`;

// Export all components
export default {
  LoadingSpinner,
  ButtonSpinner,
  PageSpinner,
  DotsSpinner,
  PulseSpinner,
  Skeleton,
  SkeletonGrid,
  SkeletonCard,
  EmptyState,
  ErrorState,
  SuccessState,
  LoadingState,
  ProgressBar,
};

