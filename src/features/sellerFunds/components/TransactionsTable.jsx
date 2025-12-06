import React from 'react';
import styled from 'styled-components';
import { formatDate } from '../../../shared/utils/helpers';
import { devicesMax } from '../../../shared/styles/breakpoint';
import TransactionStatusBadge from '../../../components/finance/transactions/TransactionStatusBadge';
import {
  formatTransactionAmount,
  getTransactionTypeLabel,
} from '../../../shared/utils/formatTransaction';

// Helper to format amount with type
const formatAmount = (amount, type) => {
  const transaction = { amount, type };
  return formatTransactionAmount(transaction);
};

// Helper to get type label
const getTypeLabel = (type, description) => {
  const transaction = { type, description };
  return getTransactionTypeLabel(transaction);
};

/**
 * Transactions Table Component
 * Displays seller transactions in a responsive table
 */
const TransactionsTable = ({ transactions = [], isLoading = false }) => {
  if (isLoading) {
    return <LoadingMessage>Loading transactions...</LoadingMessage>;
  }

  if (!transactions || transactions.length === 0) {
    return <EmptyMessage>No transactions found</EmptyMessage>;
  }

  return (
    <TableContainer>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Date</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id || transaction.id}>
              <TableCell>
                {getTypeLabel(transaction.type, transaction.description)}
              </TableCell>
              <TableCell>
                <AmountCell $type={transaction.type}>
                  {formatAmount(transaction.amount, transaction.type)}
                </AmountCell>
              </TableCell>
              <TableCell>
                <TransactionStatusBadge status={transaction.status} />
              </TableCell>
              <TableCell>
                <DescriptionText>
                  {transaction.description || 'Transaction'}
                </DescriptionText>
              </TableCell>
              <TableCell>{formatDate(transaction.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      {/* Mobile Card View */}
      <MobileCardList>
        {transactions.map((transaction) => (
          <MobileCard key={transaction._id || transaction.id}>
            <CardHeader>
              <CardTitle>{getTypeLabel(transaction.type, transaction.description)}</CardTitle>
              <AmountCell $type={transaction.type}>
                {formatAmount(transaction.amount, transaction.type)}
              </AmountCell>
            </CardHeader>
            <CardContent>
              <InfoRow>
                <InfoLabel>Status:</InfoLabel>
                <InfoValue>
                  <TransactionStatusBadge status={transaction.status} />
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Description:</InfoLabel>
                <InfoValue>{transaction.description || 'Transaction'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Date:</InfoLabel>
                <InfoValue>{formatDate(transaction.createdAt)}</InfoValue>
              </InfoRow>
            </CardContent>
          </MobileCard>
        ))}
      </MobileCardList>
    </TableContainer>
  );
};

export default TransactionsTable;

// Styled Components
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  @media ${devicesMax.md} {
    display: none;
  }
`;

const TableHead = styled.thead`
  background-color: var(--color-grey-50);
  border-bottom: 2px solid var(--color-grey-200);
`;

const TableHeader = styled.th`
  padding: var(--spacing-md);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-grey-200);
  transition: background-color var(--transition-base);

  &:hover {
    background-color: var(--color-grey-50);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
`;

const AmountCell = styled.span`
  font-weight: var(--font-semibold);
  color: ${({ $type }) =>
    $type === 'credit' || $type === 'ORDER_EARNING'
      ? 'var(--color-green-600)'
      : 'var(--color-red-600)'};
`;

const DescriptionText = styled.span`
  color: var(--color-grey-600);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
`;

const LoadingMessage = styled.div`
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-grey-600);
  font-size: var(--font-size-md);
`;

const EmptyMessage = styled.div`
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-grey-600);
  font-size: var(--font-size-md);
`;

// Mobile Styles
const MobileCardList = styled.div`
  display: none;

  @media ${devicesMax.md} {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
`;

const MobileCard = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-grey-200);
`;

const CardTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
`;

const InfoLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  min-width: 100px;
`;

const InfoValue = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-900);
  text-align: right;
  flex: 1;
`;

