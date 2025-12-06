import styled from 'styled-components';
import { PRIORITY_COLORS } from '../../../pages/support/supportTypes';
import TicketStatusBadge from './TicketStatusBadge';

const MetaContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const MetaLabel = styled.span`
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  color: var(--color-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-body);
`;

const MetaValue = styled.span`
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  color: var(--color-grey-900);
  font-family: var(--font-body);
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  text-transform: capitalize;
  background: ${({ $priority }) => {
    const color = PRIORITY_COLORS[$priority] || PRIORITY_COLORS.medium;
    return `${color}15`;
  }};
  color: ${({ $priority }) => PRIORITY_COLORS[$priority] || PRIORITY_COLORS.medium};
  font-family: var(--font-body);
  width: fit-content;
`;

/**
 * Ticket Meta Component
 * Displays ticket metadata (order ID, user, priority, category)
 */
export default function TicketMeta({ ticket }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MetaContainer>
      {ticket?.ticketNumber && (
        <MetaItem>
          <MetaLabel>Ticket ID</MetaLabel>
          <MetaValue>#{ticket.ticketNumber}</MetaValue>
        </MetaItem>
      )}
      
      {ticket?.status && (
        <MetaItem>
          <MetaLabel>Status</MetaLabel>
          <TicketStatusBadge status={ticket.status} />
        </MetaItem>
      )}
      
      {ticket?.priority && (
        <MetaItem>
          <MetaLabel>Priority</MetaLabel>
          <PriorityBadge $priority={ticket.priority}>
            {ticket.priority}
          </PriorityBadge>
        </MetaItem>
      )}
      
      {ticket?.department && (
        <MetaItem>
          <MetaLabel>Department</MetaLabel>
          <MetaValue>{ticket.department}</MetaValue>
        </MetaItem>
      )}
      
      {ticket?.relatedOrderId && (
        <MetaItem>
          <MetaLabel>Order ID</MetaLabel>
          <MetaValue>{ticket.relatedOrderId}</MetaValue>
        </MetaItem>
      )}
      
      {ticket?.userId && (
        <MetaItem>
          <MetaLabel>Reported By</MetaLabel>
          <MetaValue>
            {ticket.userId?.name || ticket.userId?.email || 'User'}
          </MetaValue>
        </MetaItem>
      )}
      
      {ticket?.createdAt && (
        <MetaItem>
          <MetaLabel>Created</MetaLabel>
          <MetaValue>{formatDate(ticket.createdAt)}</MetaValue>
        </MetaItem>
      )}
      
      {ticket?.updatedAt && (
        <MetaItem>
          <MetaLabel>Last Updated</MetaLabel>
          <MetaValue>{formatDate(ticket.updatedAt)}</MetaValue>
        </MetaItem>
      )}
    </MetaContainer>
  );
}

