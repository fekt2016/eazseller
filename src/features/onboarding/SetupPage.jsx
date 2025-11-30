import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaCreditCard, 
  FaBox,
  FaRocket,
  FaChartLine,
  FaStore,
  FaShieldAlt,
  FaArrowRight
} from 'react-icons/fa';
import useSellerStatus from '../../shared/hooks/useSellerStatus';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import { devicesMax } from '../../shared/styles/breakpoint';

const SetupPage = () => {
  const {
    onboardingStage,
    verification,
    requiredSetup,
    isLoading,
    updateOnboarding,
    isUpdating,
    isSetupComplete,
  } = useSellerStatus();
  const navigate = useNavigate();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Define setup steps - must be before useEffect hooks that use it
  const setupSteps = [
    {
      id: 'business-info',
      label: 'Complete Business Profile',
      description: 'Set up your store information and branding',
      completed: requiredSetup.hasAddedBusinessInfo,
      icon: <FaStore />,
      action: 'Complete your shop profile',
      link: PATHS.STORE_SETTINGS || PATHS.DASHBOARD,
      color: 'var(--color-primary-500)',
    },
    {
      id: 'bank-details',
      label: 'Setup Payment Methods',
      description: 'Add your bank account for receiving payments',
      completed: requiredSetup.hasAddedBankDetails,
      icon: <FaCreditCard />,
      action: 'Add payment information',
      link: PATHS.PAYMENT_REQUESTS || PATHS.DASHBOARD,
      color: 'var(--color-green-700)',
    },
    {
      id: 'contact-verification',
      label: 'Verify Email',
      description: 'Verify your email address',
      completed: verification.emailVerified,
      emailVerified: verification.emailVerified,
      icon: <FaShieldAlt />,
      action: verification.emailVerified 
        ? 'Email verified' 
        : 'Verify email',
      link: `${PATHS.SETTINGS}#verification`,
      color: 'var(--color-blue-700)',
    },
  ];

  // Auto-update onboarding when component mounts or setup changes
  useEffect(() => {
    if (!isLoading && isSetupComplete && onboardingStage === 'profile_incomplete') {
      updateOnboarding();
    }
  }, [isLoading, isSetupComplete, onboardingStage, updateOnboarding]);

  // Show success banner if all steps are complete
  useEffect(() => {
    if (isSetupComplete && onboardingStage === 'pending_verification') {
      setShowSuccessBanner(true);
    }
  }, [isSetupComplete, onboardingStage]);

  // Animate progress bar (3 steps total)
  useEffect(() => {
    const completedCount = setupSteps.filter((step) => step.completed).length;
    const totalSteps = setupSteps.length; // Should be 3
    const targetPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
    
    const timer = setTimeout(() => {
      setAnimatedProgress(targetPercentage);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [setupSteps, requiredSetup, verification]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading setup status..." />
      </PageContainer>
    );
  }

  // Calculate progress (3 steps total)
  const completedCount = setupSteps.filter((step) => step.completed).length;
  const totalSteps = setupSteps.length; // Should be 3
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <PageContainer>
      <ModernHeader $padding="xl" $marginBottom="lg">
        <HeaderContent>
          <TitleSection>
            <WelcomeBadge>
              <FaRocket />
              Welcome to EazShop!
            </WelcomeBadge>
            <MainTitle>Complete Your Seller Setup</MainTitle>
            <Subtitle>Follow these steps to launch your store and start selling</Subtitle>
          </TitleSection>
          
          <ProgressOverview>
            <ProgressStats>
              <ProgressNumber>{completedCount}/{totalSteps}</ProgressNumber>
              <ProgressLabel>Steps Completed</ProgressLabel>
            </ProgressStats>
            <ProgressCircle>
              <CircleProgress $percentage={animatedProgress}>
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="var(--color-primary-100)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 - (339.292 * animatedProgress) / 100}
                />
              </CircleProgress>
              <ProgressText>
                <span>{Math.round(animatedProgress)}%</span>
              </ProgressText>
            </ProgressCircle>
          </ProgressOverview>
        </HeaderContent>

        {/* Progress Bar */}
        <ProgressContainer>
          <ProgressInfo>
            <ProgressStatus>
              {completedCount === totalSteps ? 'Ready to Launch! 🚀' : 'Setup in Progress...'}
            </ProgressStatus>
            <ProgressPercentage>{Math.round(progressPercentage)}% Complete</ProgressPercentage>
          </ProgressInfo>
          <ModernProgressBar>
            <ProgressTrack>
              <ProgressFill $percentage={animatedProgress}>
                <ProgressGlow />
              </ProgressFill>
            </ProgressTrack>
            <ProgressSteps>
              {setupSteps.map((step, index) => (
                <ProgressDot 
                  key={step.id}
                  $completed={step.completed}
                  $active={index === completedCount}
                  $position={(index / (totalSteps - 1)) * 100}
                >
                  {step.completed && <FaCheckCircle />}
                </ProgressDot>
              ))}
            </ProgressSteps>
          </ModernProgressBar>
        </ProgressContainer>
      </ModernHeader>

      {/* Success Banner */}
      {showSuccessBanner && onboardingStage === 'pending_verification' && (
        <SuccessBanner>
          <SuccessContent>
            <SuccessIcon>
              <FaCheckCircle />
            </SuccessIcon>
            <SuccessText>
              <SuccessTitle>Setup Complete! 🎉</SuccessTitle>
              <SuccessMessage>
                Your store is ready for review. We'll notify you once your account is approved and you can start selling.
              </SuccessMessage>
            </SuccessText>
            <Confetti>
              {[...Array(20)].map((_, i) => (
                <ConfettiPiece key={i} $index={i} />
              ))}
            </Confetti>
          </SuccessContent>
        </SuccessBanner>
      )}

      {/* Setup Steps Grid */}
      <Section $marginBottom="xl">
        <SectionHeader $padding="lg" $marginBottom="lg">
          <SectionTitle>Setup Checklist</SectionTitle>
          <SectionSubtitle>Complete all steps to launch your store</SectionSubtitle>
        </SectionHeader>
        
        <StepsGrid>
          {setupSteps.map((step) => (
            <StepCard key={step.id} $completed={step.completed}>
              <StepHeader>
                <StepIcon $completed={step.completed} $color={step.color}>
                  {step.icon}
                </StepIcon>
                <StepStatus $completed={step.completed}>
                  {step.completed ? 'Completed' : 'Pending'}
                </StepStatus>
              </StepHeader>
              
              <StepContent>
                <StepLabel>{step.label}</StepLabel>
                <StepDescription>{step.description}</StepDescription>
                
                {/* Show verification status for contact verification step */}
                {step.id === 'contact-verification' && (
                  <VerificationStatus>
                    <VerificationItem $verified={step.emailVerified}>
                      <FaEnvelope />
                      <span>Email {step.emailVerified ? 'Verified' : 'Not Verified'}</span>
                    </VerificationItem>
                  </VerificationStatus>
                )}
                
                {step.link && !step.disabled ? (
                  <Button
                    as={Link}
                    to={step.link}
                    variant={step.completed ? 'outline' : 'primary'}
                    size="sm"
                    fullWidth
                    gradient={!step.completed}
                  >
                    {step.action}
                    {!step.completed && <FaArrowRight />}
                  </Button>
                ) : (
                  <StepAction $completed={step.completed} $disabled={step.disabled}>
                    {step.action}
                  </StepAction>
                )}
              </StepContent>
              
              {step.completed && (
                <CompletedBadge>
                  <FaCheckCircle />
                </CompletedBadge>
              )}
            </StepCard>
          ))}
        </StepsGrid>
      </Section>

      {/* Next Steps Section */}
      {completedCount === totalSteps && (
        <NextStepsSection>
          <SectionHeader $padding="lg" $marginBottom="md">
            <SectionTitle>What's Next?</SectionTitle>
          </SectionHeader>
          <NextStepsGrid>
            <NextStepCard>
              <NextStepIcon $color="var(--color-primary-500)">
                <FaChartLine />
              </NextStepIcon>
              <NextStepContent>
                <NextStepTitle>View Your Dashboard</NextStepTitle>
                <NextStepDescription>
                  Monitor your sales, orders, and customer insights
                </NextStepDescription>
              </NextStepContent>
            </NextStepCard>
            
            <NextStepCard>
              <NextStepIcon $color="var(--color-green-700)">
                <FaStore />
              </NextStepIcon>
              <NextStepContent>
                <NextStepTitle>Customize Your Store</NextStepTitle>
                <NextStepDescription>
                  Add your branding and customize the look
                </NextStepDescription>
              </NextStepContent>
            </NextStepCard>
          </NextStepsGrid>
        </NextStepsSection>
      )}

      {/* Action Buttons */}
      <ActionSection>
        <Button
          variant="primary"
          size="lg"
          gradient
          onClick={() => {
            updateOnboarding();
            setTimeout(() => {
              navigate(PATHS.DASHBOARD);
            }, 1000);
          }}
          isLoading={isUpdating}
          disabled={!isSetupComplete}
        >
          {isSetupComplete ? (
            <>
              Launch Your Store <FaRocket style={{ marginLeft: '8px' }} />
            </>
          ) : (
            `Complete ${totalSteps - completedCount} more steps to continue`
          )}
        </Button>
        
        <Button
          as={Link}
          to={PATHS.DASHBOARD}
          variant="outline"
          size="lg"
        >
          Preview Dashboard
        </Button>
      </ActionSection>

      {/* SVG Gradient Definition */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-500)" />
            <stop offset="100%" stopColor="var(--color-primary-700)" />
          </linearGradient>
        </defs>
      </svg>
    </PageContainer>
  );
};

export default SetupPage;

// Modern Styled Components
const ModernHeader = styled(PageHeader)`
  background: linear-gradient(135deg, var(--color-white-0) 0%, var(--color-grey-50) 100%);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-2xl);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, var(--color-primary-100) 0%, transparent 70%);
    opacity: 0.6;
  }
`;

const HeaderContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-2xl);
  align-items: start;
  position: relative;
  z-index: 2;
  
  @media ${devicesMax.lg} {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

const WelcomeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-md);
`;

const MainTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: var(--font-bold);
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-primary-600) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  margin: 0;
  line-height: 1.6;
`;

const ProgressOverview = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    text-align: center;
  }
`;

const ProgressStats = styled.div`
  text-align: center;
`;

const ProgressNumber = styled.div`
  font-size: 2.5rem;
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
  line-height: 1;
`;

const ProgressLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-weight: var(--font-medium);
  margin-top: var(--spacing-xs);
`;

const ProgressCircle = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const CircleProgress = styled.svg`
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
  
  circle {
    transition: stroke-dashoffset 0.8s ease-in-out;
  }
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  span {
    font-size: 1.5rem;
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
  }
`;

const ProgressContainer = styled.div`
  margin-top: var(--spacing-xl);
  position: relative;
  z-index: 2;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const ProgressStatus = styled.span`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-800);
`;

const ProgressPercentage = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-weight: var(--font-medium);
`;

const ModernProgressBar = styled.div`
  position: relative;
  height: 12px;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-grey-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background: linear-gradient(90deg, 
    var(--color-primary-500) 0%, 
    var(--color-primary-600) 50%,
    var(--color-primary-700) 100%);
  border-radius: var(--border-radius-full);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
`;

const ProgressGlow = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6));
  animation: shimmer 2s infinite;
  
  @keyframes shimmer {
    0% { transform: translateX(-20px); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(0); opacity: 0; }
  }
`;

const ProgressSteps = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
`;

const ProgressDot = styled.div.attrs(props => ({
  style: {
    left: `${props.$position}%`,
  }
}))`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => 
    props.$completed ? 'var(--color-primary-500)' : 
    props.$active ? 'var(--color-white-0)' : 'var(--color-grey-300)'};
  border: 3px solid ${props => 
    props.$completed ? 'var(--color-primary-500)' : 
    props.$active ? 'var(--color-primary-500)' : 'var(--color-grey-300)'};
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    color: var(--color-white-0);
    font-size: 12px;
  }
`;

const SuccessBanner = styled.div`
  background: linear-gradient(135deg, var(--color-green-500) 0%, var(--color-green-600) 100%);
  color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
`;

const SuccessContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 2;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    text-align: center;
  }
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  flex-shrink: 0;
`;

const SuccessText = styled.div`
  flex: 1;
`;

const SuccessTitle = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
`;

const SuccessMessage = styled.p`
  margin: 0;
  font-size: var(--font-size-md);
  opacity: 0.95;
  line-height: 1.6;
`;

const Confetti = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const ConfettiPiece = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${props => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    return colors[props.$index % colors.length];
  }};
  border-radius: 1px;
  top: -10px;
  left: ${props => (props.$index * 5)}%;
  animation: confettiFall ${props => 1 + (props.$index * 0.1)}s ease-in forwards;
  
  @keyframes confettiFall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-xs) 0;
`;

const SectionSubtitle = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin: 0;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div`
  background: var(--color-white-0);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  border: 2px solid ${props => 
    props.$completed ? 'var(--color-green-200)' : 'var(--color-grey-200)'};
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: ${props => 
      props.$completed ? 'var(--color-green-300)' : 'var(--color-primary-200)'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => 
      props.$completed ? 
      'linear-gradient(90deg, var(--color-green-500), var(--color-green-600))' :
      'linear-gradient(90deg, var(--color-grey-300), var(--color-grey-400))'};
  }
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
`;

const StepIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-lg);
  background: ${props => 
    props.$completed ? props.$color : 'var(--color-grey-100)'};
  color: ${props => 
    props.$completed ? 'var(--color-white-0)' : 'var(--color-grey-500)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
`;

const StepStatus = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: ${props => 
    props.$completed ? 'var(--color-green-600)' : 'var(--color-grey-500)'};
  background: ${props => 
    props.$completed ? 'var(--color-green-50)' : 'var(--color-grey-100)'};
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const StepLabel = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
  line-height: 1.4;
`;

const StepDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin: 0;
  line-height: 1.5;
`;

const StepAction = styled.span`
  font-size: var(--font-size-sm);
  color: ${props => 
    props.$disabled ? 'var(--color-grey-400)' : 
    props.$completed ? 'var(--color-green-600)' : 'var(--color-grey-600)'};
  font-style: ${props => (props.$disabled ? 'italic' : 'normal')};
  font-weight: ${props => (props.$completed ? 'var(--font-semibold)' : 'normal')};
  padding: var(--spacing-sm) 0;
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  color: var(--color-green-500);
  font-size: 1.5rem;
`;

const NextStepsSection = styled(Section)`
  background: linear-gradient(135deg, var(--color-grey-50) 0%, var(--color-white-0) 100%);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-grey-200);
`;

const NextStepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
`;

const NextStepCard = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const NextStepIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-lg);
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const NextStepContent = styled.div`
  flex: 1;
`;

const NextStepTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-xs) 0;
`;

const NextStepDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin: 0;
  line-height: 1.5;
`;

const VerificationStatus = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
`;

const VerificationItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: ${props => props.$verified ? 'var(--color-green-700)' : 'var(--color-grey-600)'};
  font-weight: ${props => props.$verified ? 'var(--font-semibold)' : 'var(--font-normal)'};

  svg {
    color: ${props => props.$verified ? 'var(--color-green-600)' : 'var(--color-grey-500)'};
    font-size: var(--font-size-md);
  }
`;

const ActionSection = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-grey-200);
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;