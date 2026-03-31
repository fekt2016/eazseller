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
  gap: 1rem;
  padding: 1rem;
  background: #FFFFFF;
  border-radius: 9px;
  border: 2px solid ${props => props.$isCurrent ? '#E8920A' : '#6B7280'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$isCurrent ? '#E8920A' : '#6B7280'};
    
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const DeviceInfo = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
`;

const DeviceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #6B7280;
  border-radius: 9px;
  color: #6B7280;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const DeviceDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const DeviceName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CurrentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 2px 1rem;
  background: #3B6D11;
  color: #3B6D11;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;

  svg {
    font-size: 0.8rem;
  }
`;

const DeviceMeta = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
`;

const RevokeButton = styled(Button)`
  flex-shrink: 0;
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #6B7280;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: 0.8rem;
  color: #6B7280;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #6B7280;
`;

