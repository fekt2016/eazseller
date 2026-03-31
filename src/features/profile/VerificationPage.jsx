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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.375rem' }}>
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoBox = styled.div`
  padding: 0.85rem 1rem;
  background: #EFF6FF;
  border: 0.5px solid #BFDBFE;
  border-left: 3px solid #3B82F6;
  border-radius: 9px;
  color: #1D4ED8;

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const VerificationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
`;

const OtpInput = styled.input`
  height: 52px;
  padding: 0 1rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5rem;
  font-family: ui-monospace, 'Courier New', monospace;
  color: #111827;
  background: #F9F8F5;
  outline: none;
  max-width: 300px;

  &:focus { border-color: #E8920A; background: #FFFFFF; }
  &::placeholder { letter-spacing: 0.3rem; color: #D1D5DB; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ResendContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.3rem;
`;

const ResendText = styled.span`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #9CA3AF;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #E8920A;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 0.12s;

  &:hover:not(:disabled) { opacity: 0.8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorText = styled.span`
  color: #EF4444;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  background: #D1FAE5;
  border: 0.5px solid #A7F3D0;
  border-left: 3px solid #10B981;
  border-radius: 9px;
  color: #065F46;

  svg { flex-shrink: 0; margin-top: 0.1rem; }
`;

const SuccessTitle = styled.h4`
  margin: 0 0 0.2rem;
  font-size: 0.875rem;
  font-weight: 600;
`;

const SuccessText = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 22px;
  padding: 0 0.6rem;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const UnverifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 22px;
  padding: 0 0.6rem;
  background: #FEE2E2;
  color: #991B1B;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

