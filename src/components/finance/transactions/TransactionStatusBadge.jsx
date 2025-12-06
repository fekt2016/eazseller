import styled from 'styled-components';
import { getTransactionStatusColor, getTransactionStatusBgColor } from '../../../shared/utils/formatTransaction';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  font-family: var(--font-body);
  text-transform: capitalize;
  background-color: ${({ $status }) => getTransactionStatusBgColor($status)};
  color: ${({ $status }) => getTransactionStatusColor($status)};
`;

const TransactionStatusBadge = ({ status }) => {
  const statusLabel = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  
  return <Badge $status={status}>{statusLabel}</Badge>;
};

export default TransactionStatusBadge;

