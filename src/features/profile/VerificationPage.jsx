import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaPaperPlane, FaClock } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import useSellerStatus from '../../shared/hooks/useSellerStatus';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import onboardingApi from '../../shared/services/onboardingApi';
import { useMutation } from '@tanstack/react-query';

const VerificationPage = ({ embedded = false }) => {
  const { seller, refetchAuth } = useAuth();
  const { verification, refetch } = useSellerStatus();
  const navigate = useNavigate();

  // Email verification state
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState('ready'); // 'ready', 'sent', 'verifying'
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailError, setEmailError] = useState('');

  // Email verification mutation
  const sendEmailOtp = useMutation({
    mutationFn: async () => {
      const response = await onboardingApi.sendEmailVerificationOtp();
      return response;
    },
    onSuccess: () => {
      setEmailStep('sent');
      setEmailCountdown(120); // 2 minutes
      setEmailError('');
    },
    onError: (error) => {
      setEmailError(error.response?.data?.message || 'Failed to send verification code');
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async (otp) => {
      const response = await onboardingApi.verifyEmail(otp);
      return response;
    },
    onSuccess: async () => {
      // ✅ CRITICAL: Invalidate sellerStatus after email verification
      await refetch(); // This invalidates sellerStatus
      await refetchAuth(); // This invalidates sellerAuth
      setEmailStep('ready');
      setEmailOtp('');
      setEmailError('');
    },
    onError: (error) => {
      setEmailError(error.response?.data?.message || 'Invalid verification code');
    },
  });


  // Countdown timer
  useEffect(() => {
    let timer;
    if (emailCountdown > 0) {
      timer = setInterval(() => {
        setEmailCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailCountdown]);

  const handleEmailOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setEmailOtp(value);
    if (emailError) setEmailError('');
  };

  const handleSendEmailOtp = () => {
    sendEmailOtp.mutate();
  };

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    if (emailOtp.length !== 6) {
      setEmailError('Please enter a 6-digit code');
      return;
    }
    verifyEmail.mutate(emailOtp);
  };

  const handleResendEmailOtp = () => {
    setEmailStep('ready');
    setEmailOtp('');
    handleSendEmailOtp();
  };

  if (!seller) {
    return <LoadingState message="Loading seller information..." />;
  }

  const content = (
    <>
      {!embedded && (
        <PageHeader $padding="lg" $marginBottom="lg">
          <TitleSection>
            <h1>Verify Your Email</h1>
            <p>Verify your email address to complete your account setup</p>
          </TitleSection>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate(PATHS.DASHBOARD)}
          >
            <FaArrowLeft /> Back to Dashboard
          </Button>
        </PageHeader>
      )}

      {/* Email Verification Section */}
      <Section $marginBottom="lg">
        <SectionHeader $padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <FaEnvelope />
            <h3>Email Verification</h3>
            {verification.emailVerified ? (
              <VerifiedBadge>
                <FaCheckCircle /> Verified
              </VerifiedBadge>
            ) : (
              <UnverifiedBadge>
                <FaTimesCircle /> Not Verified
              </UnverifiedBadge>
            )}
          </div>
        </SectionHeader>
        <FormContent>
          {verification.emailVerified ? (
            <SuccessMessage>
              <FaCheckCircle size={24} />
              <div>
                <SuccessTitle>Email Verified</SuccessTitle>
                <SuccessText>Your email address ({seller.email}) has been verified</SuccessText>
              </div>
            </SuccessMessage>
          ) : (
            <>
              <InfoBox>
                <p>
                  <strong>Verify your email:</strong> {seller.email}
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginTop: 'var(--spacing-xs)' }}>
                  We'll send a 6-digit verification code to your email address
                </p>
              </InfoBox>

              {emailStep === 'ready' && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSendEmailOtp}
                  isLoading={sendEmailOtp.isPending}
                  disabled={sendEmailOtp.isPending}
                >
                  <FaPaperPlane /> Send Verification Code
                </Button>
              )}

              {emailStep === 'sent' && (
                <VerificationForm onSubmit={handleVerifyEmail}>
                  <FormGroup>
                    <Label>Enter 6-digit code</Label>
                    <OtpInput
                      type="text"
                      value={emailOtp}
                      onChange={handleEmailOtpChange}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                    />
                    {emailError && <ErrorText>{emailError}</ErrorText>}
                  </FormGroup>

                  <ButtonGroup>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={verifyEmail.isPending}
                      disabled={verifyEmail.isPending || emailOtp.length !== 6}
                    >
                      Verify Email
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={() => {
                        setEmailStep('ready');
                        setEmailOtp('');
                        setEmailError('');
                      }}
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>

                  <ResendContainer>
                    {emailCountdown > 0 ? (
                      <ResendText>
                        <FaClock /> Resend code in {Math.floor(emailCountdown / 60)}:
                        {(emailCountdown % 60).toString().padStart(2, '0')}
                      </ResendText>
                    ) : (
                      <ResendButton
                        type="button"
                        onClick={handleResendEmailOtp}
                        disabled={sendEmailOtp.isPending}
                      >
                        Resend Code
                      </ResendButton>
                    )}
                  </ResendContainer>
                </VerificationForm>
              )}
            </>
          )}
        </FormContent>
      </Section>

    </>
  );

  if (embedded) {
    return content;
  }

  return <PageContainer>{content}</PageContainer>;
};

export default VerificationPage;

// Styled Components
const FormContent = styled.div`
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const InfoBox = styled.div`
  padding: var(--spacing-md);
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  color: var(--color-blue-700);

  p {
    margin: 0;
    font-size: var(--font-size-sm);
  }
`;

const VerificationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
`;

const OtpInput = styled.input`
  padding: var(--spacing-md);
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  text-align: center;
  letter-spacing: 0.5rem;
  font-family: 'Courier New', monospace;
  color: var(--color-grey-900);
  transition: all 0.2s ease;
  max-width: 300px;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &::placeholder {
    letter-spacing: 0.3rem;
    color: var(--color-grey-400);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const ResendContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-sm);
`;

const ResendText = styled.span`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);

  svg {
    color: var(--color-grey-500);
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: var(--color-primary-700);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: var(--color-red-600);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: var(--border-radius-md);
  color: var(--color-green-700);

  svg {
    color: var(--color-green-600);
    flex-shrink: 0;
  }
`;

const SuccessTitle = styled.h4`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
`;

const SuccessText = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-green-100);
  color: var(--color-green-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);

  svg {
    color: var(--color-green-600);
  }
`;

const UnverifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-red-100);
  color: var(--color-red-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);

  svg {
    color: var(--color-red-600);
  }
`;

