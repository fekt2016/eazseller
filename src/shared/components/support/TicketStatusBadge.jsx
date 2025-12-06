import styled from 'styled-components';
import { STATUS_COLORS } from '../../../pages/support/supportTypes';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  text-transform: capitalize;
  background: ${({ $status }) => {
    const color = STATUS_COLORS[$status] || STATUS_COLORS.open;
    return `${color}15`;
  }};
  color: ${({ $status }) => STATUS_COLORS[$status] || STATUS_COLORS.open};
  font-family: var(--font-body);
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

