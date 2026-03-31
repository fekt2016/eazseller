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
import { FaArrowDown, FaArrowUp, FaExchangeAlt } from 'react-icons/fa';
import { SkeletonTableRows, EmptyState } from '../../shared/components/ui/LoadingComponents';
import { PATHS } from '../../routes/routePaths';

const ListContainer = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.1rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ViewAllLink = styled(Link)`
  font-size: 0.775rem;
  color: #E8920A;
  text-decoration: none;
  font-weight: 500;

  &:hover { text-decoration: underline; }
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.8rem 1.1rem;
  border-bottom: 0.5px solid #F1EFE8;
  cursor: pointer;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: #FFFDF9; }
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
  background: ${({ $type }) => $type === 'credit' ? '#DCFCE7' : '#FEE2E2'};
  color: ${({ $type }) => $type === 'credit' ? '#15803D' : '#B91C1C'};
`;

const TxDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const TxDescription = styled.div`
  font-size: 0.825rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TxDate = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 0.1rem;
`;

const TxAmount = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $type }) => $type === 'credit' ? '#15803D' : '#B91C1C'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const TransactionList = ({ limit = 5 }) => {
  const navigate = useNavigate();
  const { data: transactionsData, isLoading, error } = useGetSellerTransactions({ limit });

  const transactions = useMemo(() => {
    return transactionsData?.transactions || transactionsData || [];
  }, [transactionsData]);

  if (isLoading) {
    return <SkeletonTableRows count={5} />;
  }

  if (error || !transactions || transactions.length === 0) {
    return (
      <ListContainer>
        <ListHeader>
          <Title>Recent Transactions</Title>
        </ListHeader>
        <EmptyState message="No transactions yet" />
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <Title>Recent Transactions</Title>
        <ViewAllLink to={PATHS.TRANSACTIONS}>View all →</ViewAllLink>
      </ListHeader>
      <TransactionsList>
        {transactions.slice(0, limit).map((transaction) => {
          const iconType = getTransactionIconType(transaction);
          const isCredit = isCreditTransaction(transaction);
          const transactionId = transaction._id || transaction.id;

          return (
            <TransactionItem
              key={transactionId}
              onClick={() => transactionId && navigate(`${PATHS.TRANSACTIONS}/${transactionId}`, { state: { transaction } })}
            >
              <IconWrap $type={iconType}>
                {isCredit ? <FaArrowUp /> : <FaArrowDown />}
              </IconWrap>
              <TxDetails>
                <TxDescription>
                  {transaction.description || transaction.reason || 'Transaction'}
                </TxDescription>
                <TxDate>
                  {formatTransactionDateShort(transaction.createdAt || transaction.date)}
                </TxDate>
              </TxDetails>
              <TxAmount $type={iconType}>
                {formatTransactionAmount(transaction)}
              </TxAmount>
            </TransactionItem>
          );
        })}
      </TransactionsList>
    </ListContainer>
  );
};

export default TransactionList;
