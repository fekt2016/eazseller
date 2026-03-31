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
  border-top: 2px solid #E8920A;
  border-right: 2px solid #E8920A;
  border-bottom: 2px solid #E5E7EB;
  border-left: 2px solid #E5E7EB;
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
  border-top: 3px solid #E8920A;
  border-right: 3px solid #E8920A;
  border-bottom: 3px solid #F1EFE8;
  border-left: 3px solid #F1EFE8;
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
  background: #E8920A;
  animation: ${pulse} 2s infinite ease-in-out;
`;

// ============================================
// SKELETON LOADING COMPONENTS
// ============================================

// Skeleton Loading Component
export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    #F1EFE8 25%,
    #E5E7EB 50%,
    #F1EFE8 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${({ circle, $radius }) => circle ? '50%' : $radius || '9px'};
  flex-shrink: 0;
  ${({ width = "100%" }) => `width: ${width};`}
  ${({ height = "1rem" }) => `height: ${height};`}
`;

// Skeleton Grid Component
export const SkeletonGrid = ({
  count = 6,
  itemHeight = "200px",
  gap = "1rem",
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
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  
  border: 1px solid #F1EFE8;
`;

const SkeletonCardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// ============================================
// PAGE-LEVEL SKELETON LAYOUTS
// ============================================

// Row of KPI / stat card skeletons — for dashboards and summary sections
export const SkeletonStatCards = ({ count = 4 }) => (
  <SkeletonStatGrid $count={count}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStatBox key={i}>
        <Skeleton width="40%" height="11px" />
        <Skeleton width="55%" height="26px" />
        <Skeleton width="45%" height="11px" />
      </SkeletonStatBox>
    ))}
  </SkeletonStatGrid>
);

const SkeletonStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count}, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonStatBox = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

// Table / list skeleton — for orders, transactions, tickets, variants, etc.
export const SkeletonTableRows = ({ count = 6, hasImage = false }) => (
  <SkeletonTableBox>
    <SkeletonTHead>
      {hasImage && <Skeleton width="44px" height="11px" />}
      <Skeleton width="25%" height="11px" />
      <Skeleton width="15%" height="11px" />
      <Skeleton width="12%" height="11px" />
      <Skeleton width="12%" height="11px" />
      <Skeleton width="8%" height="11px" />
    </SkeletonTHead>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonTRow key={i}>
        {hasImage && <Skeleton width="44px" height="44px" $radius="9px" />}
        <Skeleton width="30%" height="14px" />
        <Skeleton width="18%" height="14px" />
        <Skeleton width="14%" height="22px" $radius="20px" />
        <Skeleton width="14%" height="22px" $radius="20px" />
        <Skeleton width="10%" height="14px" />
      </SkeletonTRow>
    ))}
  </SkeletonTableBox>
);

const SkeletonTableBox = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const SkeletonTHead = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
  background: #FAFAF9;
`;

const SkeletonTRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 0.5px solid #F9F8F5;

  &:last-child {
    border-bottom: none;
  }
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
  padding: 1rem;
  color: #9CA3AF;
  animation: ${fadeIn} 0.12s ease-out;
  max-width: 400px;
  margin: 0 auto;
  
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  animation: ${float} 3s 0.12s infinite;
  color: #E8920A;
`;

const EmptyStateTitle = styled.h3`
  color: #6B7280;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  
`;

const EmptyStateMessage = styled.p`
  color: #9CA3AF;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  line-height: 1.6;
`;

const EmptyStateAction = styled.div`
  margin-top: 1rem;
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
  color: #A32D2D;
`;

const ErrorStateIcon = styled(EmptyStateIcon)`
  color: #A32D2D;
`;

const ErrorStateTitle = styled(EmptyStateTitle)`
  color: #A32D2D;
`;

const ErrorStateMessage = styled(EmptyStateMessage)`
  color: #6B7280;
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
  color: #3B6D11;
`;

const SuccessStateIcon = styled(EmptyStateIcon)`
  color: #3B6D11;
`;

const SuccessStateTitle = styled(EmptyStateTitle)`
  color: #3B6D11;
`;

const SuccessStateMessage = styled(EmptyStateMessage)`
  color: #6B7280;
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
  padding: 1rem;
  gap: 1rem;
  text-align: center;
  animation: ${fadeIn} 0.12s ease-out;
  min-height: 200px;
  
`;

const LoadingMessage = styled.p`
  color: #6B7280;
  font-size: 1.1rem;
  font-weight: 500;
  
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
  gap: 1rem;
  
  ${({ $size }) => {
    switch ($size) {
      case "sm":
        return `font-size: 0.8rem;`;
      case "lg":
        return `font-size: 0.9rem;`;
      default:
        return `font-size: 0.875rem;`;
    }
  }}
`;

const ProgressLabel = styled.span`
  font-weight: 600;
  color: #6B7280;
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
  background-color: #F1EFE8;
  border-radius: ;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $percentage }) => `${$percentage}%`};
  background: ${({ $color }) => {
    switch ($color) {
      case "primary":
        return "#E8920A";
      case "success":
        return "#3B6D11";
      case "danger":
        return "#A32D2D";
      case "warning":
        return "#854F0B";
      default:
        return "#E8920A";
    }
  }};
  border-radius: ;
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
  SkeletonStatCards,
  SkeletonTableRows,
  EmptyState,
  ErrorState,
  SuccessState,
  LoadingState,
  ProgressBar,
};

