import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaRedo, FaTimesCircle } from 'react-icons/fa';
import styled from 'styled-components';
import { PageContainer, Section } from '../../shared/components/ui/SpacingSystem';
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

const DetailContainer = styled(PageContainer)`
  min-height: 100vh;
  background: var(--color-grey-50);
`;

const ContentSection = styled(Section)`
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
`;

const StatusActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-lg);
`;

const StatusActionLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  display: flex;
  align-items: center;
  font-family: var(--font-body);
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
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-lg)',
            color: 'var(--color-grey-600)',
            fontFamily: 'var(--font-body)'
          }}>
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
            style={{ background: 'var(--color-green-700)' }}
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
            style={{ background: 'var(--color-red-600)' }}
          >
            <FaTimesCircle /> Close Ticket
          </Button>
        )}
      </StatusActions>
    </DetailContainer>
  );
}

