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
  transition: all 0.12s;
  border-bottom: 1px solid #F1EFE8;
  
  &:hover {
    background: #F9F8F5;
  }
  
  @media ${devicesMax.sm} {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #F1EFE8;
    border-radius: 9px;
    padding: 1rem;
    background: #FFFFFF;
  }
`;

const Cell = styled.td`
  padding: 1rem;
  font-size: 1rem;
  
  color: #374151;
  
  @media ${devicesMax.sm} {
    display: block;
    padding: 1rem 0;
    border: none;
    
    &::before {
      content: attr(data-label) ': ';
      font-weight: 600;
      color: #6B7280;
      margin-right: 1rem;
    }
  }
`;

const IconCell = styled(Cell)`
  width: 4rem;
  
  @media ${devicesMax.sm} {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
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
    $type === 'credit' ? '#DCFCE7' : '#FEE2E2'};
  color: ${({ $type }) =>
    $type === 'credit' ? '#15803D' : '#B91C1C'};
`;

const DescriptionCell = styled(Cell)`
  font-weight: 600;
  color: #111827;
  max-width: 300px;
  
  @media ${devicesMax.sm} {
    max-width: 100%;
  }
`;

const AmountCell = styled(Cell)`
  font-weight: 700;
  
  color: ${({ $type }) => 
    $type === 'credit' ? '#3B6D11' : '#A32D2D'};
  text-align: right;
  
  @media ${devicesMax.sm} {
    text-align: left;
  }
`;

const ReferenceCell = styled(Cell)`
  font-size: 0.875rem;
  color: #6B7280;
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
      navigate(`${PATHS.TRANSACTIONS}/${transactionId}`, { state: { transaction } });
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
            style={{ color: '#E8920A', textDecoration: 'none' }}
          >
            {orderRef}
          </Link>
        )}
        {withdrawalRef && (
          <Link 
            to={`/dashboard/finance/withdrawals`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: '#E8920A', textDecoration: 'none' }}
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

