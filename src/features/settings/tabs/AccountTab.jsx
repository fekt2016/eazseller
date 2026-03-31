import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaClock, FaCheckCircle, FaTimesCircle, FaPowerOff } from 'react-icons/fa';
import useAuth from '../../../shared/hooks/useAuth';
import { LoadingState } from '../../../shared/components/ui/LoadingComponents';
import authApi from '../../../shared/services/authApi';
import { toast } from 'react-toastify';
import { ConfirmationModal } from '../../../shared/components/modal/ConfirmationModal';
import { PATHS } from '../../../routes/routePaths';

const AccountTab = () => {
  const navigate = useNavigate();
  const { seller, isLoading, refetchAuth } = useAuth();

  const [deactivating, setDeactivating] = React.useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);

  const handleDeactivate = async () => {
    setDeactivating(true);
    setShowDeactivateModal(false);
    try {
      await authApi.updateMyStatus('deactive');
      toast.success('Account deactivated.');
      await authApi.logout();
      if (refetchAuth) refetchAuth();
      navigate(PATHS.LOGIN, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to deactivate account.');
    } finally {
      setDeactivating(false);
    }
  };

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
    <>
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
                {seller.phone ? `${seller.phone}` : 'N/A'}
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
            <InfoRow>
              <InfoLabel>ID Proof Status</InfoLabel>
              <InfoValue>
                {(() => {
                  const isVerified = seller.verification?.idVerified;
                  const hasDocument = seller.verificationDocuments?.idProof;
                  const idProofStatus = seller.verificationDocuments?.idProof?.status;

                  if (isVerified) {
                    return (
                      <VerifiedBadge>
                        <FaCheckCircle />
                        Verified
                      </VerifiedBadge>
                    );
                  }

                  if (hasDocument) {
                    return (
                      <StatusBadge $status="pending">
                        <FaClock style={{ marginRight: '4px' }} />
                        {idProofStatus}
                      </StatusBadge>
                    );
                  }

                  return (
                    <UnverifiedBadge>
                      <FaTimesCircle />
                      Not Submitted
                    </UnverifiedBadge>
                  );
                })()}
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
            <SectionTitle>Business Status</SectionTitle>
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

        {/* Deactivate account (seller can only set status to deactive) */}
        {seller.status === 'active' && (
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaPowerOff />
              </SectionIcon>
              <SectionTitle>Deactivate account</SectionTitle>
            </SectionHeader>
            <SectionContent>
              <Description>
                Deactivate your seller account. You will be logged out. To reactivate, contact support.
              </Description>
              <DeactivateButton type="button" onClick={() => setShowDeactivateModal(true)} disabled={deactivating}>
                {deactivating ? 'Deactivating...' : 'Deactivate account'}
              </DeactivateButton>
            </SectionContent>
          </Section>
        )}
      </Container>

      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Account"
        message="Deactivate your seller account? You will be logged out. Contact support to reactivate."
        confirmText="Deactivate"
        confirmColor="#ef4444"
      />
    </>
  );
};

export default AccountTab;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-bottom: 1rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const Title = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #9CA3AF;
  line-height: 1.5;
  margin: 0;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #FDF3E3;
  border-radius: 9px;
  color: #E8920A;
  font-size: 1rem;
  flex-shrink: 0;
`;

const SectionTitle = styled.h2`
  font-size: 0.975rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0.9rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6B7280;
  flex-shrink: 0;

  svg { color: #9CA3AF; }
`;

const InfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
  text-align: right;

  @media (max-width: 768px) { text-align: left; }
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 20px;
  padding: 0 0.5rem;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const UnverifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 20px;
  padding: 0 0.5rem;
  background: #FEE2E2;
  color: #991B1B;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.65rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${(p) => {
    if (p.$status === 'active') return '#D1FAE5';
    if (p.$status === 'pending') return '#FEF3C7';
    if (p.$status === 'suspended') return '#FEE2E2';
    if (p.$status === 'deactive') return '#F3F4F6';
    return '#F3F4F6';
  }};
  color: ${(p) => {
    if (p.$status === 'active') return '#065F46';
    if (p.$status === 'pending') return '#92400E';
    if (p.$status === 'suspended') return '#991B1B';
    if (p.$status === 'deactive') return '#6B7280';
    return '#374151';
  }};
`;

const DeactivateButton = styled.button`
  height: 36px;
  padding: 0 1.1rem;
  background: #F3F4F6;
  color: #374151;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
  align-self: flex-start;

  &:hover:not(:disabled) { background: #FEE2E2; color: #991B1B; border-color: #FECACA; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;