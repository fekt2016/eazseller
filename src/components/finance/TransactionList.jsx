import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGetSellerTransactions } from '../../shared/hooks/useBalance';
import {
  formatTransactionAmount,
  formatTransactionDateShort,
  getTransactionIconType,
  isCreditTransaction,
} from '../../shared/utils/formatTransaction';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { LoadingState, EmptyState } from '../../shared/components/ui/LoadingComponents';
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../../shared/styles/breakpoint';

const ListContainer = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
  }
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-grey-200);
`;

const Title = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const ViewAllLink = styled(Link)`
  font-size: var(--font-size-sm);
  color: var(--color-primary-500);
  text-decoration: none;
  font-weight: var(--font-semibold);
  font-family: var(--font-body);
  transition: color var(--transition-base);
  
  &:hover {
    color: var(--color-primary-600);
    text-decoration: underline;
  }
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-50);
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--color-white-0);
    box-shadow: var(--shadow-sm);
  }
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  
  @media ${devicesMax.sm} {
    width: 100%;
  }
`;

const IconWrapper = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type }) => 
    $type === 'credit' ? 'var(--color-green-100)' : 'var(--color-red-100)'};
  color: ${({ $type }) => 
    $type === 'credit' ? 'var(--color-green-700)' : 'var(--color-red-700)'};
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-size: var(--font-size-base);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-body);
`;

const TransactionDate = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
`;

const TransactionAmount = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: ${({ $type }) => 
    $type === 'credit' ? 'var(--color-green-700)' : 'var(--color-red-700)'};
  font-family: var(--font-heading);
  
  @media ${devicesMax.sm} {
    width: 100%;
    text-align: right;
  }
`;

const TransactionList = ({ limit = 5 }) => {
  const navigate = useNavigate();
  const { data: transactionsData, isLoading, error } = useGetSellerTransactions({ limit });

  const transactions = useMemo(() => {
    return transactionsData?.transactions || transactionsData || [];
  }, [transactionsData]);

  if (isLoading) {
    return (
      <ListContainer>
        <LoadingState message="Loading transactions..." />
      </ListContainer>
    );
  }

  if (error) {
    return (
      <ListContainer>
        <EmptyState>
          <p>Failed to load transactions</p>
        </EmptyState>
      </ListContainer>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <ListContainer>
        <ListHeader>
          <Title>Recent Transactions</Title>
        </ListHeader>
        <EmptyState>
          <p>No transactions yet</p>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <Title>Recent Transactions</Title>
        <ViewAllLink to={PATHS.TRANSACTIONS}>View All →</ViewAllLink>
      </ListHeader>
      <TransactionsList>
        {transactions.slice(0, limit).map((transaction) => {
          const iconType = getTransactionIconType(transaction);
          const isCredit = isCreditTransaction(transaction);
          
          return (
            <TransactionItem 
              key={transaction._id || transaction.id}
              onClick={() => {
                const transactionId = transaction._id || transaction.id;
                if (transactionId) {
                  navigate(`${PATHS.TRANSACTIONS}/${transactionId}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <TransactionInfo>
                <IconWrapper $type={iconType}>
                  {isCredit ? <FaArrowUp /> : <FaArrowDown />}
                </IconWrapper>
                <TransactionDetails>
                  <TransactionDescription>
                    {transaction.description || transaction.reason || 'Transaction'}
                  </TransactionDescription>
                  <TransactionDate>
                    {formatTransactionDateShort(transaction.createdAt || transaction.date)}
                  </TransactionDate>
                </TransactionDetails>
              </TransactionInfo>
              <TransactionAmount $type={iconType}>
                {formatTransactionAmount(transaction)}
              </TransactionAmount>
            </TransactionItem>
          );
        })}
      </TransactionsList>
    </ListContainer>
  );
};

export default TransactionList;

