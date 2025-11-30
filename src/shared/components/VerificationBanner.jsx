import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import useSellerStatus from '../hooks/useSellerStatus';
import { PATHS } from '../../routes/routePaths';
import Button from './ui/Button';

/**
 * Banner component to show verification status in dashboard
 * Only shows if seller is not verified
 */
const VerificationBanner = () => {
  const { onboardingStage, isVerified, isLoading } = useSellerStatus();

  // Don't show if loading or already verified
  if (isLoading || isVerified) {
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
  background: linear-gradient(135deg, var(--color-yellow-50), var(--color-yellow-100));
  border: 2px solid var(--color-yellow-300);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const IconWrapper = styled.div`
  font-size: 1.5rem;
  color: var(--color-yellow-700);
  flex-shrink: 0;
`;

const BannerText = styled.div`
  flex: 1;
  min-width: 200px;
`;

const BannerTitle = styled.h4`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-yellow-900);
`;

const BannerMessage = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-yellow-800);
  line-height: 1.5;
`;

