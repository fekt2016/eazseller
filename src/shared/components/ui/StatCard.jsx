import styled from "styled-components";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { SpacingProps } from "./SpacingSystem";

const StatCardContainer = styled.div`
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 12px;
  ${SpacingProps}
  transition: all 0.3s ease;
  
  &:hover {
    
    transform: translateY(-2px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatIcon = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#E8920A';
      case 'success': return '#3B6D11';
      case 'warning': return '#854F0B';
      case 'danger': return '#A32D2D';
      default: return '#F9F8F5';
    }
  }};
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#E8920A';
      case 'success': return '#3B6D11';
      case 'warning': return '#854F0B';
      case 'danger': return '#A32D2D';
      default: return '#6B7280';
    }
  }};
  font-size: 1.6rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $positive }) => 
    $positive ? '#3B6D11' : '#A32D2D'};
  
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

