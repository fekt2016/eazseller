import styled from 'styled-components';
import { FaUser, FaUserShield } from 'react-icons/fa';
import TicketAttachments from './TicketAttachments';
import { EmptyState } from '../ui/LoadingComponents';

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: ${({ $isSeller }) => ($isSeller ? 'flex-end' : 'flex-start')};
  max-width: 75%;
  
  @media (max-width: 640px) {
    max-width: 90%;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background: ${({ $isSeller }) =>
    $isSeller ? '#E8920A' : '#F1EFE8'};
  color: ${({ $isSeller }) =>
    $isSeller ? '#E8920A' : '#374151'};
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
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  
`;

const MessageTime = styled.span`
  font-size: 0.8rem;
  color: #6B7280;
  
`;

const MessageContent = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ $isSeller }) =>
    $isSeller ? '#E8920A' : '#F9F8F5'};
  color: ${({ $isSeller }) =>
    $isSeller ? '#FFFFFF' : '#111827'};
  font-size: 0.9rem;
  line-height: 1.6;
  
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

