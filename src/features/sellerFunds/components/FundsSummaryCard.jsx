import React from 'react';
import styled from 'styled-components';
import { FaWallet, FaClock, FaDollarSign, FaArrowDown, FaCalendarAlt } from 'react-icons/fa';
import { formatCurrency } from '../../../shared/utils/helpers';

// Helper to format currency with GHS symbol
const formatGHS = (value) => {
  return `GH₵${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Funds Summary Card Component
 * Displays seller wallet summary with key financial metrics
 */
const FundsSummaryCard = ({
  availableBalance = 0,
  pendingBalance = 0,
  totalEarnings = 0,
  totalRefunds = 0,
  nextPayoutDate = null,
  isLoading = false,
}) => {
  if (isLoading) {
    return <LoadingCard>Loading wallet summary...</LoadingCard>;
  }

  return (
    <SummaryGrid>
      <SummaryCard>
        <CardIcon $color="primary">
          <FaWallet />
        </CardIcon>
        <CardContent>
          <CardLabel>Available Balance</CardLabel>
          <CardValue>{formatGHS(availableBalance)}</CardValue>
          <CardDescription>Ready for withdrawal</CardDescription>
        </CardContent>
      </SummaryCard>

      <SummaryCard>
        <CardIcon $color="warning">
          <FaClock />
        </CardIcon>
        <CardContent>
          <CardLabel>Pending Balance</CardLabel>
          <CardValue>{formatGHS(pendingBalance)}</CardValue>
          <CardDescription>Awaiting clearance</CardDescription>
        </CardContent>
      </SummaryCard>

      <SummaryCard>
        <CardIcon $color="success">
          <FaDollarSign />
        </CardIcon>
        <CardContent>
          <CardLabel>Total Earnings</CardLabel>
          <CardValue>{formatGHS(totalEarnings)}</CardValue>
          <CardDescription>All-time revenue</CardDescription>
        </CardContent>
      </SummaryCard>

      <SummaryCard>
        <CardIcon $color="error">
          <FaArrowDown />
        </CardIcon>
        <CardContent>
          <CardLabel>Total Refunds</CardLabel>
          <CardValue>{formatGHS(totalRefunds)}</CardValue>
          <CardDescription>Deducted from earnings</CardDescription>
        </CardContent>
      </SummaryCard>

      {nextPayoutDate && (
        <SummaryCard $fullWidth>
          <CardIcon $color="info">
            <FaCalendarAlt />
          </CardIcon>
          <CardContent>
            <CardLabel>Next Payout Date</CardLabel>
            <CardValue>{new Date(nextPayoutDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</CardValue>
            <CardDescription>Estimated payout schedule</CardDescription>
          </CardContent>
        </SummaryCard>
      )}
    </SummaryGrid>
  );
};

export default FundsSummaryCard;

// Styled Components
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const SummaryCard = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: var(--border-radius-lg);
  background-color: ${({ $color }) => {
    switch ($color) {
      case 'primary':
        return 'var(--color-primary-100)';
      case 'success':
        return 'var(--color-green-100)';
      case 'warning':
        return 'var(--color-yellow-100)';
      case 'error':
        return 'var(--color-red-100)';
      case 'info':
        return 'var(--color-blue-100)';
      default:
        return 'var(--color-grey-100)';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'primary':
        return 'var(--color-primary-600)';
      case 'success':
        return 'var(--color-green-600)';
      case 'warning':
        return 'var(--color-yellow-600)';
      case 'error':
        return 'var(--color-red-600)';
      case 'info':
        return 'var(--color-blue-600)';
      default:
        return 'var(--color-grey-600)';
    }
  }};
  font-size: var(--font-size-xl);
  flex-shrink: 0;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const CardLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardValue = styled.span`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  line-height: 1.2;
`;

const CardDescription = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
`;

const LoadingCard = styled.div`
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-grey-600);
  font-size: var(--font-size-md);
`;

