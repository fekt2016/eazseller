import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styled from 'styled-components';
import { PageHeader, TitleSection, ActionSection } from '../ui/SpacingSystem';
import Button from '../ui/Button';
import TicketStatusBadge from './TicketStatusBadge';
import { PATHS } from '../../../routes/routePaths';

const HeaderContainer = styled.div`
  margin-bottom: 1rem;
`;

const BackButton = styled(Button)`
  margin-bottom: 1rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const TicketTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  
  flex: 1;
  min-width: 0;
  
  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`;

const TicketId = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #6B7280;
  
`;

const DateInfo = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: #6B7280;
  
`;

/**
 * Ticket Header Component
 * Displays ticket title, ID, status, and dates
 */
export default function TicketHeader({ ticket }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <HeaderContainer>
      <BackButton
        variant="ghost"
        size="sm"
        onClick={() => navigate(PATHS.SUPPORT_TICKETS)}
      >
        <FaArrowLeft /> Back to Tickets
      </BackButton>

      <TitleRow>
        <TicketTitle>{ticket?.title || 'Support Ticket'}</TicketTitle>
        {ticket?.status && <TicketStatusBadge status={ticket.status} />}
      </TitleRow>

      {ticket?.ticketNumber && (
        <TicketId>Ticket #{ticket.ticketNumber}</TicketId>
      )}

      <DateInfo>
        {ticket?.createdAt && (
          <span>Created: {formatDate(ticket.createdAt)}</span>
        )}
        {ticket?.updatedAt && ticket.updatedAt !== ticket.createdAt && (
          <span>• Updated: {formatDate(ticket.updatedAt)}</span>
        )}
      </DateInfo>
    </HeaderContainer>
  );
}

