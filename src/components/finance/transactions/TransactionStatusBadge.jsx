import styled from 'styled-components';
import { getTransactionStatusColor, getTransactionStatusBgColor } from '../../../shared/utils/formatTransaction';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${({ $status }) => getTransactionStatusBgColor($status)};
  color: ${({ $status }) => getTransactionStatusColor($status)};
`;

const TransactionStatusBadge = ({ status }) => {
  const statusLabel = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  
  return <Badge $status={status}>{statusLabel}</Badge>;
};

export default TransactionStatusBadge;

