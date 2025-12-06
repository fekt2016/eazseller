import styled from 'styled-components';
import { FaUser, FaUserShield } from 'react-icons/fa';
import TicketAttachments from './TicketAttachments';
import { EmptyState } from '../ui/LoadingComponents';

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: ${({ $isSeller }) => ($isSeller ? 'flex-end' : 'flex-start')};
  max-width: 75%;
  
  @media (max-width: 640px) {
    max-width: 90%;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
`;

const Avatar = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background: ${({ $isSeller }) =>
    $isSeller ? 'var(--color-primary-100)' : 'var(--color-grey-200)'};
  color: ${({ $isSeller }) =>
    $isSeller ? 'var(--color-primary-600)' : 'var(--color-grey-700)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
`;

const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const MessageSender = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const MessageTime = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  font-family: var(--font-body);
`;

const MessageContent = styled.div`
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: ${({ $isSeller }) =>
    $isSeller ? 'var(--color-primary-500)' : 'var(--color-grey-100)'};
  color: ${({ $isSeller }) =>
    $isSeller ? 'var(--color-white-0)' : 'var(--color-grey-900)'};
  font-size: var(--font-size-md);
  line-height: 1.6;
  font-family: var(--font-body);
  word-wrap: break-word;
`;

const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Ticket Message Thread Component
 * Displays all messages in a ticket conversation
 */
export default function TicketMessageThread({ messages = [], currentUserRole = 'seller' }) {
  if (!messages || messages.length === 0) {
    return (
      <MessagesContainer>
        <EmptyState
          title="No messages yet"
          message="Say hello to start the conversation!"
        />
      </MessagesContainer>
    );
  }

  return (
    <MessagesContainer>
      {messages.map((message) => {
        const isSeller = message.senderRole === 'seller' || message.senderRole === currentUserRole;
        const senderName = message.senderName || (isSeller ? 'You' : 'Support Team');
        const isAdmin = message.senderRole === 'admin';

        return (
          <MessageBubble key={message._id || message.id} $isSeller={isSeller}>
            <MessageHeader>
              <Avatar $isSeller={isSeller}>
                {isAdmin ? <FaUserShield /> : <FaUser />}
              </Avatar>
              <MessageInfo>
                <MessageSender>{senderName}</MessageSender>
                <MessageTime>{formatDate(message.createdAt)}</MessageTime>
              </MessageInfo>
            </MessageHeader>
            <MessageContent $isSeller={isSeller}>
              {message.message || message.content}
            </MessageContent>
            {message.attachments && message.attachments.length > 0 && (
              <TicketAttachments attachments={message.attachments} />
            )}
          </MessageBubble>
        );
      })}
    </MessagesContainer>
  );
}

