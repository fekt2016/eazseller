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
  background: #FFFFFF;
  border-radius: 12px;
  
  border: 1px solid #F1EFE8;
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
  background-color: #F9F8F5;
  border-bottom: 2px solid #F1EFE8;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #F1EFE8;
  transition: background-color 0.12s;

  &:hover {
    background-color: #F9F8F5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
`;

const AmountCell = styled.span`
  font-weight: 600;
  color: ${({ $type }) =>
    $type === 'credit' || $type === 'ORDER_EARNING'
      ? '#3B6D11'
      : '#A32D2D'};
`;

const DescriptionText = styled.span`
  color: #6B7280;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
`;

const LoadingMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
`;

const EmptyMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
`;

// Mobile Styles
const MobileCardList = styled.div`
  display: none;

  @media ${devicesMax.md} {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const MobileCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem;
  
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F1EFE8;
`;

const CardTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 100px;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #111827;
  text-align: right;
  flex: 1;
`;

