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
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SummaryCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1rem;
  
  border: 1px solid #F1EFE8;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #F1EFE8;
  transition: all 0.12s;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};

  &:hover {
    
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 12px;
  background-color: ${({ $color }) => {
    switch ($color) {
      case 'primary':
        return '#FEF3C7';
      case 'success':
        return '#DCFCE7';
      case 'warning':
        return '#FAEEDA';
      case 'error':
        return '#FCEBEB';
      case 'info':
        return '#E6F1FB';
      default:
        return '#F9F8F5';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'primary':
        return '#E8920A';
      case 'success':
        return '#3B6D11';
      case 'warning':
        return '#D97706';
      case 'error':
        return '#A32D2D';
      case 'info':
        return '#185FA5';
      default:
        return '#6B7280';
    }
  }};
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
`;

const CardDescription = styled.span`
  font-size: 0.8rem;
  color: #9CA3AF;
`;

const LoadingCard = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
`;

