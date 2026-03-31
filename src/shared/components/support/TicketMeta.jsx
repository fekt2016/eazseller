import styled from 'styled-components';
import { PRIORITY_COLORS } from '../../../pages/support/supportTypes';
import TicketStatusBadge from './TicketStatusBadge';

const MetaContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #F9F8F5;
  border-radius: 9px;
  border: 1px solid #F1EFE8;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MetaLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
`;

const MetaValue = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #111827;
  
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ $priority }) => {
    const color = PRIORITY_COLORS[$priority] || PRIORITY_COLORS.medium;
    return `${color}15`;
  }};
  color: ${({ $priority }) => PRIORITY_COLORS[$priority] || PRIORITY_COLORS.medium};
  
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

