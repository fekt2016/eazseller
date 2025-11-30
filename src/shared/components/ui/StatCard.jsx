import styled from "styled-components";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { SpacingProps } from "./SpacingSystem";

const StatCardContainer = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  ${SpacingProps}
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
`;

const StatTitle = styled.h3`
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatIcon = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return 'var(--color-primary-100)';
      case 'success': return 'var(--color-green-100)';
      case 'warning': return 'var(--color-yellow-100)';
      case 'danger': return 'var(--color-red-100)';
      default: return 'var(--color-grey-100)';
    }
  }};
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return 'var(--color-primary-600)';
      case 'success': return 'var(--color-green-700)';
      case 'warning': return 'var(--color-yellow-700)';
      case 'danger': return 'var(--color-red-600)';
      default: return 'var(--color-grey-600)';
    }
  }};
  font-size: 1.6rem;
`;

const StatValue = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-xs);
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: ${({ $positive }) => 
    $positive ? 'var(--color-green-700)' : 'var(--color-red-600)'};
  font-family: var(--font-body);
`;

/**
 * StatCard Component
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} change - Change percentage (e.g., "+12%")
 * @param {string} variant - Color variant: 'primary' | 'success' | 'warning' | 'danger'
 * @param {ReactNode} icon - Icon component
 * @param {string} $padding - Spacing prop for padding
 */
export default function StatCard({ 
  title, 
  value, 
  change, 
  variant = 'primary',
  icon,
  $padding = 'lg',
  ...props 
}) {
  const isPositive = change && change.startsWith('+');
  
  return (
    <StatCardContainer $padding={$padding} {...props}>
      <StatHeader>
        <StatTitle>{title}</StatTitle>
        {icon && <StatIcon $variant={variant}>{icon}</StatIcon>}
      </StatHeader>
      <StatValue>{value}</StatValue>
      {change && (
        <StatChange $positive={isPositive}>
          {isPositive ? <FaArrowUp /> : <FaArrowDown />}
          {change}
        </StatChange>
      )}
    </StatCardContainer>
  );
}

