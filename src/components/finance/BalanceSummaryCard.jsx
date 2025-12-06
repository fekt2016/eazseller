import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const Card = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  ${({ $highlight }) => $highlight && `
    background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
    border: 2px solid var(--color-primary-300);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
  `}
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
  }
`;

const Label = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-body);
  font-weight: var(--font-medium);
`;

const Amount = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  
  ${({ $highlight }) => $highlight && `
    color: var(--color-primary-700);
    font-size: var(--font-size-3xl);
  `}
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-xl);
    
    ${({ $highlight }) => $highlight && `
      font-size: var(--font-size-2xl);
    `}
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const BalanceSummaryCard = ({ label, amount, icon, highlight = false }) => {
  return (
    <Card $highlight={highlight}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <Label>{label}</Label>
      <Amount $highlight={highlight}>GH₵{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Amount>
    </Card>
  );
};

export default BalanceSummaryCard;

