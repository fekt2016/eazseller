import React from 'react';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import useAuth from '../../../shared/hooks/useAuth';
import { LoadingState } from '../../../shared/components/ui/LoadingComponents';

const AccountTab = () => {
  const { seller, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Loading account information..." />;
  }

  if (!seller) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Container>
      <Header>
        <Title>Account Information</Title>
        <Description>
          View your account details and status
        </Description>
      </Header>

      {/* Basic Information */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <FaUser />
          </SectionIcon>
          <SectionTitle>Basic Information</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <InfoRow>
            <InfoLabel>Name</InfoLabel>
            <InfoValue>{seller.name || seller.shopName || 'N/A'}</InfoValue>
          </InfoRow>
          {seller.shopName && seller.name && (
            <InfoRow>
              <InfoLabel>Shop Name</InfoLabel>
              <InfoValue>{seller.shopName}</InfoValue>
            </InfoRow>
          )}
          <InfoRow>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>
              {seller.email || 'N/A'}
              {seller.verification?.emailVerified ? (
                <VerifiedBadge>
                  <FaCheckCircle />
                  Verified
                </VerifiedBadge>
              ) : (
                <UnverifiedBadge>
                  <FaTimesCircle />
                  Unverified
                </UnverifiedBadge>
              )}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Phone</InfoLabel>
            <InfoValue>
              {seller.phone ? `+${seller.phone}` : 'N/A'}
              {seller.verification?.phoneVerified ? (
                <VerifiedBadge>
                  <FaCheckCircle />
                  Verified
                </VerifiedBadge>
              ) : seller.phone ? (
                <UnverifiedBadge>
                  <FaTimesCircle />
                  Unverified
                </UnverifiedBadge>
              ) : null}
            </InfoValue>
          </InfoRow>
        </SectionContent>
      </Section>

      {/* Account Status */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <FaCheckCircle />
          </SectionIcon>
          <SectionTitle>Account Status</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <InfoRow>
            <InfoLabel>Status</InfoLabel>
            <StatusBadge $status={seller.status || 'pending'}>
              {seller.status || 'pending'}
            </StatusBadge>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Business Verified</InfoLabel>
            <InfoValue>
              {seller.verification?.businessVerified ? (
                <VerifiedBadge>
                  <FaCheckCircle />
                  Verified
                </VerifiedBadge>
              ) : (
                <UnverifiedBadge>
                  <FaTimesCircle />
                  Not Verified
                </UnverifiedBadge>
              )}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Onboarding Stage</InfoLabel>
            <InfoValue>
              {seller.onboardingStage || 'profile_incomplete'}
            </InfoValue>
          </InfoRow>
        </SectionContent>
      </Section>

      {/* Account Activity */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <FaClock />
          </SectionIcon>
          <SectionTitle>Account Activity</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <InfoRow>
            <InfoLabel>
              <FaCalendar />
              Account Created
            </InfoLabel>
            <InfoValue>{formatDate(seller.createdAt)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>
              <FaClock />
              Last Login
            </InfoLabel>
            <InfoValue>{formatDateTime(seller.lastLogin)}</InfoValue>
          </InfoRow>
        </SectionContent>
      </Section>
    </Container>
  );
};

export default AccountTab;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
`;

const Title = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
`;

const Description = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-primary-100);
  border-radius: var(--border-radius-md);
  color: var(--color-primary-600);
  font-size: var(--font-size-lg);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  color: var(--color-grey-700);
  flex-shrink: 0;

  svg {
    font-size: var(--font-size-md);
    color: var(--color-grey-500);
  }
`;

const InfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-md);
  color: var(--color-grey-900);
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const VerifiedBadge = styled.span`
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

const UnverifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px var(--spacing-xs);
  background: var(--color-red-100);
  color: var(--color-red-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);

  svg {
    font-size: var(--font-size-xs);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  text-transform: capitalize;
  background: ${props => {
    if (props.$status === 'active') return 'var(--color-green-100)';
    if (props.$status === 'pending') return 'var(--color-yellow-100)';
    if (props.$status === 'suspended') return 'var(--color-red-100)';
    return 'var(--color-grey-100)';
  }};
  color: ${props => {
    if (props.$status === 'active') return 'var(--color-green-700)';
    if (props.$status === 'pending') return 'var(--color-yellow-700)';
    if (props.$status === 'suspended') return 'var(--color-red-700)';
    return 'var(--color-grey-700)';
  }};
`;

