import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { PropagateLoader } from "react-spinners";
import useAuth from '../../shared/hooks/useAuth';
import logger from '../../shared/utils/logger';
import Logo from '../../shared/components/Logo';

// Animations
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.98); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset } = useAuth();
  const { mutateAsync: requestReset, isPending, error } = requestPasswordReset;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return;
    }

    try {
      const data = await requestReset(normalizedEmail);
      logger.log("Password reset request sent:", data);
      setIsSubmitted(true);
    } catch (err) {
      logger.error("Error requesting password reset:", err);
    }
  };

  // Success state - show confirmation message
  if (isSubmitted) {
    return (
      <Container>
        <AuthCard>
          <LogoContainer>
            <Logo />
          </LogoContainer>
          
          <SuccessIcon>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#10b981" opacity="0.1"/>
              <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </SuccessIcon>

          <Title>Check Your Email</Title>
          <Subtitle>
            We've sent password reset instructions to your inbox.
          </Subtitle>

          <SuccessMessage>
            <SuccessText>
              If an account exists with <strong>{email}</strong>, we've sent password reset instructions.
            </SuccessText>
            
            <InfoBox>
              <InfoTitle>What's next?</InfoTitle>
              <InfoList>
                <InfoItem>Check your email inbox (and spam folder)</InfoItem>
                <InfoItem>Click the reset link in the email</InfoItem>
                <InfoItem>The link expires in 10 minutes</InfoItem>
              </InfoList>
            </InfoBox>
          </SuccessMessage>

          <SubmitButton onClick={() => navigate("/login")}>
            Back to Login
          </SubmitButton>

          <ResendButton onClick={() => setIsSubmitted(false)}>
            Didn't receive the email? Try again
          </ResendButton>
        </AuthCard>
      </Container>
    );
  }

  // Form state - show email input
  return (
    <Container>
      <AuthCard>
        <LogoContainer>
          <Logo />
        </LogoContainer>

        <Title>Reset Your Password</Title>
        <Subtitle>
          Enter your email to receive password reset instructions
        </Subtitle>

        {error && (
          <ErrorBanner>
            <ErrorIconSmall>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </ErrorIconSmall>
            <ErrorText>{error.message || "Failed to send reset email. Please try again."}</ErrorText>
          </ErrorBanner>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              autoFocus
            />
          </InputGroup>

          <SubmitButton
            type="submit"
            disabled={isPending || !email.trim()}
          >
            {isPending ? (
              <PropagateLoader color="#ffffff" size={10} />
            ) : (
              "Send Reset Link"
            )}
          </SubmitButton>
        </Form>

        <FooterText>
          Remember your password?{" "}
          <FooterLink to="/login">Back to Login</FooterLink>
        </FooterText>
      </AuthCard>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  font-family: var(--font-body);
  padding: 2rem;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 196, 0, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 3rem;
  }
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 3.5rem;
  width: 100%;
  max-width: 480px;
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 20px;
    max-width: 100%;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  animation: ${slideIn} 0.5s ease-out 0.1s both;
`;

const Title = styled.h2`
  text-align: center;
  color: #0f172a;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 1.75rem;
  letter-spacing: -0.3px;
  line-height: 1.3;
  animation: ${slideIn} 0.5s ease-out 0.2s both;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 400;
  animation: ${slideIn} 0.5s ease-out 0.3s both;
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  animation: ${slideIn} 0.3s ease-out;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  line-height: 1.5;
`;

const ErrorIconSmall = styled.div`
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: #dc2626;
  display: flex;
  align-items: center;
`;

const ErrorText = styled.span`
  flex: 1;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${slideIn} 0.5s ease-out 0.4s both;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 400;
  color: #334155;
  letter-spacing: 0.01em;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  color: #0f172a;
  font-weight: 400;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 
      0 0 0 4px rgba(255, 196, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.04);
    transform: scale(1.01);
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: white;
  border: none;
  padding: 0.9375rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(255, 196, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 20px rgba(255, 196, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.15);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const FooterText = styled.p`
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
  animation: ${slideIn} 0.5s ease-out 0.5s both;
`;

const FooterLink = styled(Link)`
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-block;

  &:hover {
    color: var(--color-primary-700);
    background: rgba(255, 196, 0, 0.08);
  }
`;

const SuccessIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  animation: ${scaleIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  animation: ${slideIn} 0.5s ease-out 0.4s both;
`;

const SuccessText = styled.p`
  color: #166534;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.6;
  font-weight: 400;

  strong {
    font-weight: 600;
    color: #15803d;
  }
`;

const InfoBox = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #bbf7d0;
`;

const InfoTitle = styled.p`
  color: #166534;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.li`
  color: #15803d;
  font-size: 0.8125rem;
  font-weight: 400;
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.5;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #22c55e;
    font-weight: 700;
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary-600);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 400;
  border-radius: 8px;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    color: var(--color-primary-700);
    background: rgba(255, 196, 0, 0.08);
  }
`;
