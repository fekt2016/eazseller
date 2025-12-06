import { useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import TransactionRow from './TransactionRow';
import { LoadingState, EmptyState } from '../../../shared/components/ui/LoadingComponents';
import { devicesMax } from '../../../shared/styles/breakpoint';

const TableContainer = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  @media ${devicesMax.sm} {
    display: block;
  }
`;

const TableHeader = styled.thead`
  background: var(--color-grey-50);
  border-bottom: 2px solid var(--color-grey-200);
  
  @media ${devicesMax.sm} {
    display: none;
  }
`;

const HeaderRow = styled.tr``;

const HeaderCell = styled.th`
  padding: var(--spacing-md);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &:last-child {
    text-align: right;
  }
`;

const TableBody = styled.tbody`
  @media ${devicesMax.sm} {
    display: block;
  }
`;

const TransactionTable = ({ transactions, isLoading, error }) => {
  const navigate = useNavigate();

  const handleRowClick = (transaction) => {
    const transactionId = transaction._id || transaction.id;
    if (transactionId) {
      navigate(`/dashboard/finance/transactions/${transactionId}`);
    }
  };

  if (isLoading) {
    return (
      <TableContainer>
        <LoadingState message="Loading transactions..." />
      </TableContainer>
    );
  }

  if (error) {
    return (
      <TableContainer>
        <EmptyState>
          <p>Failed to load transactions</p>
        </EmptyState>
      </TableContainer>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <p>No transactions found</p>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <HeaderRow>
            <HeaderCell>Type</HeaderCell>
            <HeaderCell>Description</HeaderCell>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Amount</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell style={{ textAlign: 'right' }}>Reference</HeaderCell>
          </HeaderRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction._id || transaction.id}
              transaction={transaction}
              onClick={handleRowClick}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionTable;

