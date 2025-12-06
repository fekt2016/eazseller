import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
  formatTransactionAmount,
  formatTransactionDateShort,
  getTransactionIconType,
  getOrderReference,
  getWithdrawalReference,
  isCreditTransaction,
} from '../../../shared/utils/formatTransaction';
import TransactionStatusBadge from './TransactionStatusBadge';
import { PATHS } from '../../../routes/routePaths';
import { devicesMax } from '../../../shared/styles/breakpoint';

const Row = styled.tr`
  cursor: pointer;
  transition: all var(--transition-base);
  border-bottom: 1px solid var(--color-grey-200);
  
  &:hover {
    background: var(--color-grey-50);
  }
  
  @media ${devicesMax.sm} {
    display: block;
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    background: var(--color-white-0);
  }
`;

const Cell = styled.td`
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  font-family: var(--font-body);
  color: var(--color-grey-700);
  
  @media ${devicesMax.sm} {
    display: block;
    padding: var(--spacing-xs) 0;
    border: none;
    
    &::before {
      content: attr(data-label) ': ';
      font-weight: var(--font-semibold);
      color: var(--color-grey-600);
      margin-right: var(--spacing-xs);
    }
  }
`;

const IconCell = styled(Cell)`
  width: 4rem;
  
  @media ${devicesMax.sm} {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
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

const DescriptionCell = styled(Cell)`
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  max-width: 300px;
  
  @media ${devicesMax.sm} {
    max-width: 100%;
  }
`;

const AmountCell = styled(Cell)`
  font-weight: var(--font-bold);
  font-family: var(--font-heading);
  color: ${({ $type }) => 
    $type === 'credit' ? 'var(--color-green-700)' : 'var(--color-red-700)'};
  text-align: right;
  
  @media ${devicesMax.sm} {
    text-align: left;
  }
`;

const ReferenceCell = styled(Cell)`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
`;

const TransactionRow = ({ transaction, onClick }) => {
  const navigate = useNavigate();
  const iconType = getTransactionIconType(transaction);
  const isCredit = isCreditTransaction(transaction);
  const orderRef = getOrderReference(transaction);
  const withdrawalRef = getWithdrawalReference(transaction);
  const transactionId = transaction._id || transaction.id;
  
  const handleClick = (e) => {
    // Don't navigate if clicking on a link inside the row
    if (e.target.closest('a')) {
      return;
    }
    
    if (onClick) {
      onClick(transaction);
    } else if (transactionId) {
      navigate(`${PATHS.TRANSACTIONS}/${transactionId}`);
    }
  };

  return (
    <Row onClick={handleClick}>
      <IconCell data-label="Type">
        <IconWrapper $type={iconType}>
          {isCredit ? <FaArrowUp /> : <FaArrowDown />}
        </IconWrapper>
      </IconCell>
      <DescriptionCell data-label="Description">
        {transaction.description || 'Transaction'}
      </DescriptionCell>
      <Cell data-label="Date">
        {formatTransactionDateShort(transaction.createdAt)}
      </Cell>
      <AmountCell $type={iconType} data-label="Amount">
        {formatTransactionAmount(transaction)}
      </AmountCell>
      <Cell data-label="Status">
        <TransactionStatusBadge status={transaction.status} />
      </Cell>
      <ReferenceCell data-label="Reference">
        {orderRef && (
          <Link 
            to={`/dashboard/orders/${transaction.sellerOrder?.order?._id || transaction.orderId}`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'var(--color-primary-500)', textDecoration: 'none' }}
          >
            {orderRef}
          </Link>
        )}
        {withdrawalRef && (
          <Link 
            to={`/dashboard/finance/withdrawals`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'var(--color-primary-500)', textDecoration: 'none' }}
          >
            #{withdrawalRef}
          </Link>
        )}
        {!orderRef && !withdrawalRef && '-'}
      </ReferenceCell>
    </Row>
  );
};

export default TransactionRow;

