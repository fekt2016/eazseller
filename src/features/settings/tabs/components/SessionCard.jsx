import React from 'react';
import styled from 'styled-components';
import { FaDesktop, FaMobile, FaTablet, FaTrash, FaCheckCircle } from 'react-icons/fa';
import Button from '../../../../shared/components/ui/Button';
// Simple date formatting without date-fns dependency
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
};

const SessionCard = ({ session, onRevoke, isCurrentDevice }) => {
  const getDeviceIcon = () => {
    const deviceType = session.deviceType?.toLowerCase() || '';
    if (deviceType.includes('mobile') || deviceType.includes('phone')) {
      return <FaMobile />;
    } else if (deviceType.includes('tablet')) {
      return <FaTablet />;
    }
    return <FaDesktop />;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return new Date(date).toLocaleString();
    }
  };

  return (
    <Card $isCurrent={isCurrentDevice}>
      <Header>
        <DeviceInfo>
          <DeviceIcon>{getDeviceIcon()}</DeviceIcon>
          <DeviceDetails>
            <DeviceName>
              {session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}
              {isCurrentDevice && (
                <CurrentBadge>
                  <FaCheckCircle />
                  Current Device
                </CurrentBadge>
              )}
            </DeviceName>
            <DeviceMeta>
              {session.device || session.deviceType || 'Unknown Device'} • {session.ipAddress || 'Unknown IP'}
            </DeviceMeta>
          </DeviceDetails>
        </DeviceInfo>
        {!isCurrentDevice && (
          <RevokeButton
            variant="ghost"
            size="sm"
            onClick={() => onRevoke(session.sessionId)}
          >
            <FaTrash />
            Revoke
          </RevokeButton>
        )}
      </Header>
      
      <Footer>
        <InfoItem>
          <InfoLabel>Last Active:</InfoLabel>
          <InfoValue>{formatDate(session.lastActivity)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Login Time:</InfoLabel>
          <InfoValue>{formatDate(session.loginTime)}</InfoValue>
        </InfoItem>
        {session.location && session.location !== 'Unknown' && (
          <InfoItem>
            <InfoLabel>Location:</InfoLabel>
            <InfoValue>{session.location}</InfoValue>
          </InfoItem>
        )}
      </Footer>
    </Card>
  );
};

export default SessionCard;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  border: 2px solid ${props => props.$isCurrent ? 'var(--color-primary-500)' : 'var(--color-grey-200)'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$isCurrent ? 'var(--color-primary-600)' : 'var(--color-grey-300)'};
    box-shadow: var(--shadow-sm);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
`;

const DeviceInfo = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
`;

const DeviceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-grey-100);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-600);
  font-size: var(--font-size-xl);
  flex-shrink: 0;
`;

const DeviceDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
`;

const DeviceName = styled.div`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const CurrentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px var(--spacing-xs);
  background: var(--color-green-100);
  color: var(--color-green-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);

  svg {
    font-size: var(--font-size-xs);
  }
`;

const DeviceMeta = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
`;

const RevokeButton = styled(Button)`
  flex-shrink: 0;
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-grey-200);
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
  font-weight: var(--font-medium);
`;

const InfoValue = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
`;

