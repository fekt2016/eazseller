import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaRedo, FaTimesCircle } from 'react-icons/fa';
import styled from 'styled-components';
import { LoadingState, ErrorState } from '../../shared/components/ui/LoadingComponents';
import Button from '../../shared/components/ui/Button';
import { useTicketDetail, useReplyToTicket } from '../../shared/hooks/useSupport';
import { supportService } from '../../shared/services/supportApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import TicketHeader from '../../shared/components/support/TicketHeader';
import TicketMeta from '../../shared/components/support/TicketMeta';
import TicketMessageThread from '../../shared/components/support/TicketMessageThread';
import TicketReplyBox from '../../shared/components/support/TicketReplyBox';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';

const DetailContainer = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const ContentSection = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.25rem;
`;

const StatusActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
`;

const StatusActionLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  margin-right: 0.25rem;
`;

/**
 * Seller Ticket Detail Page
 * Full ticket detail view with messages, reply box, and status controls
 */
export default function SellerTicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const {
    data: ticketData,
    isLoading,
    isError,
    error,
  } = useTicketDetail(id);

  const ticket = ticketData?.data?.ticket || ticketData?.ticket;
  const messages = ticket?.messages || [];

  // Update page title when ticket loads
  useDynamicPageTitle({
    title: 'Ticket Details - Seller Dashboard',
    dynamicTitle: ticket?.title 
      ? `${ticket.title} - Ticket Details`
      : 'Ticket Details',
    description: 'View and manage your support ticket',
  });

  const replyMutation = useReplyToTicket();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }) => {
      // Note: Backend currently only allows admins to update status directly
      // Sellers can request status changes via reply messages
      // This sends a message requesting the status change
      const response = await supportService.replyToTicket(ticketId, {
        message: `[Status Update Request] Please update ticket status to: ${status}`,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      toast.success(`Status update request sent. Support team will review and update the ticket.`);
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setIsUpdatingStatus(false);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update ticket status. Please try again.';
      toast.error(errorMessage);
      setIsUpdatingStatus(false);
    },
  });

  const handleReply = ({ message, attachments }) => {
    replyMutation.mutate({
      ticketId: id,
      replyData: { message, attachments },
    });
  };

  const handleStatusUpdate = (newStatus) => {
    if (!id) return;
    setIsUpdatingStatus(true);
    updateStatusMutation.mutate({ ticketId: id, status: newStatus });
  };

  const canReply = ticket?.status !== 'closed' && ticket?.status !== 'resolved';
  const canResolve = ticket?.status === 'open' || ticket?.status === 'in_progress';
  const canReopen = ticket?.status === 'resolved' || ticket?.status === 'closed';
  const canClose = ticket?.status !== 'closed';

  if (isLoading) {
    return (
      <DetailContainer>
        <LoadingState message="Loading ticket details..." />
      </DetailContainer>
    );
  }

  if (isError) {
    // Handle 403 - Wrong role (user logged in as buyer instead of seller)
    if (error?.response?.status === 403) {
      const errorMessage = error?.response?.data?.message || '';
      if (errorMessage.includes('Required role: seller')) {
        return (
          <DetailContainer>
            <ErrorState
              title="Access Denied"
              message="You are logged in as a buyer. Please log out and log in as a seller to access support tickets."
              action={
                <Button variant="primary" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              }
            />
          </DetailContainer>
        );
      }
    }
    
    return (
      <DetailContainer>
        <ErrorState
          title="Ticket not found"
          message={
            error?.response?.status === 404
              ? 'This ticket does not exist or you do not have permission to view it.'
              : error?.response?.status === 403
              ? 'You are not authorized to view this ticket. Please ensure you are logged in as a seller.'
              : error?.message || 'Failed to load ticket details. Please try again.'
          }
          action={
            <Button variant="primary" onClick={() => navigate(PATHS.SUPPORT_TICKETS || '/dashboard/support/tickets')}>
              Back to Tickets
            </Button>
          }
        />
      </DetailContainer>
    );
  }

  if (!ticket) {
    return (
      <DetailContainer>
        <ErrorState
          title="Ticket not found"
          message="Unable to load ticket information."
          action={
            <Button variant="primary" onClick={() => navigate(PATHS.SUPPORT_TICKETS)}>
              Back to Tickets
            </Button>
          }
        />
      </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      <TicketHeader ticket={ticket} />

      <ContentSection>
        <TicketMeta ticket={ticket} />
      </ContentSection>

      <ContentSection>
        <TicketMessageThread messages={messages} currentUserRole="seller" />
      </ContentSection>

      {canReply && (
        <TicketReplyBox
          onSubmit={handleReply}
          isLoading={replyMutation.isPending}
          disabled={isUpdatingStatus}
        />
      )}

      {!canReply && (
        <ContentSection>
          <div style={{ textAlign: 'center', padding: '1rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
            This ticket is {ticket.status}. You cannot reply to closed or resolved tickets.
          </div>
        </ContentSection>
      )}

      <StatusActions>
        <StatusActionLabel>Ticket Actions:</StatusActionLabel>
        {canResolve && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusUpdate('resolved')}
            disabled={isUpdatingStatus || updateStatusMutation.isPending}
            isLoading={isUpdatingStatus && updateStatusMutation.isPending}
            style={{ background: '#15803D' }}
          >
            <FaCheckCircle /> Mark as Resolved
          </Button>
        )}
        {canReopen && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusUpdate('open')}
            disabled={isUpdatingStatus || updateStatusMutation.isPending}
            isLoading={isUpdatingStatus && updateStatusMutation.isPending}
          >
            <FaRedo /> Reopen Ticket
          </Button>
        )}
        {canClose && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleStatusUpdate('closed')}
            disabled={isUpdatingStatus || updateStatusMutation.isPending}
            isLoading={isUpdatingStatus && updateStatusMutation.isPending}
            style={{ background: '#DC2626' }}
          >
            <FaTimesCircle /> Close Ticket
          </Button>
        )}
      </StatusActions>
    </DetailContainer>
  );
}

