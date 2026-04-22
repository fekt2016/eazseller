import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import useSellerStatus from '../hooks/useSellerStatus';
import { PATHS } from '../../routes/routePaths';
import Button from './ui/Button';

/**
 * Banner component to show verification status in dashboard
 * Only shows if seller is not verified or if all 3 verifications are not complete
 */
const VerificationBanner = () => {
  const { 
    isVerified, 
    isLoading,
    isSetupComplete,
    verification,
    requiredSetup,
    businessDocumentsStatus,
    paymentMethodStatus,
  } = useSellerStatus();

  // Check if all 3 verifications are individually complete
  const allDocumentsVerified = requiredSetup?.hasBusinessDocumentsVerified || businessDocumentsStatus?.isVerified || false;
  const contactVerified = verification?.contactVerified || verification?.emailVerified || false;
  const paymentMethodVerified = requiredSetup?.hasPaymentMethodVerified || paymentMethodStatus?.isVerified || false;
  const allThreeVerificationsComplete = allDocumentsVerified && contactVerified && paymentMethodVerified;

  // Don't show if loading, already verified, setup is complete, or all 3 verifications are complete
  if (isLoading || isVerified || isSetupComplete || allThreeVerificationsComplete) {
    return null;
  }

  return (
    <BannerContainer>
      <BannerContent>
        <IconWrapper>
          <FaExclamationTriangle />
        </IconWrapper>
        <BannerText>
          <BannerTitle>Your account is not fully verified</BannerTitle>
          <BannerMessage>
            Complete setup to unlock selling features and start receiving orders.
          </BannerMessage>
        </BannerText>
        <Button
          as={Link}
          to={PATHS.SETUP}
          variant="primary"
          size="sm"
        >
          Continue Setup
          <FaArrowRight style={{ marginLeft: '0.5rem' }} />
        </Button>
      </BannerContent>
    </BannerContainer>
  );
};

export default VerificationBanner;

// Styled Components
const BannerContainer = styled.div`
  background: linear-gradient(135deg, #854F0B, #854F0B);
  border: 2px solid #854F0B;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const IconWrapper = styled.div`
  font-size: 1.5rem;
  color: #854F0B;
  flex-shrink: 0;
`;

const BannerText = styled.div`
  flex: 1;
  min-width: 200px;
`;

const BannerTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #854F0B;
`;

const BannerMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #854F0B;
  line-height: 1.5;
`;

