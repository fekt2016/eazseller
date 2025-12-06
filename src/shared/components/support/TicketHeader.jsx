import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styled from 'styled-components';
import { PageHeader, TitleSection, ActionSection } from '../ui/SpacingSystem';
import Button from '../ui/Button';
import TicketStatusBadge from './TicketStatusBadge';
import { PATHS } from '../../../routes/routePaths';

const HeaderContainer = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const BackButton = styled(Button)`
  margin-bottom: var(--spacing-md);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-sm);
`;

const TicketTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;
  font-family: var(--font-heading);
  flex: 1;
  min-width: 0;
  
  @media (max-width: 640px) {
    font-size: var(--font-size-xl);
  }
`;

const TicketId = styled.span`
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  color: var(--color-grey-600);
  font-family: var(--font-body);
`;

const DateInfo = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
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

