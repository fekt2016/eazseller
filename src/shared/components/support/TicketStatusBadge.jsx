import styled from 'styled-components';
import { STATUS_COLORS } from '../../../pages/support/supportTypes';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ $status }) => {
    const color = STATUS_COLORS[$status] || STATUS_COLORS.open;
    return `${color}15`;
  }};
  color: ${({ $status }) => STATUS_COLORS[$status] || STATUS_COLORS.open};
  
`;

/**
 * Ticket Status Badge Component
 * Displays ticket status with appropriate color coding
 */
export default function TicketStatusBadge({ status }) {
  return (
    <Badge $status={status}>
      {status?.replace('_', ' ') || 'Unknown'}
    </Badge>
  );
}

