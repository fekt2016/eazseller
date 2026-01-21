import { useState } from "react";
import styled from "styled-components";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import useAuth from "../../shared/hooks/useAuth";
import { PATHS } from "../../routes/routePaths";
import { ButtonSpinner } from "../../shared/components/ButtonSpinner";
import { ErrorState } from "../../shared/components/ui/LoadingComponents";

const Container = styled.div`
  max-width: 480px;
  margin: 4rem auto;
  padding: 3rem 2.5rem;
  background: var(--color-white-0);
  border-radius: 1.6rem;
  box-shadow: var(--shadow-lg);
`;

const Title = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: var(--color-grey-900);
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Label = styled.label`
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--color-grey-800);
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  border-radius: 0.8rem;
  border: 1px solid var(--color-grey-300);
  font-size: 1.4rem;
  outline: none;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 1px var(--color-primary-200);
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 1.3rem;
  color: var(--color-primary-600);
  cursor: pointer;
  text-decoration: underline;
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(
    135deg,
    var(--color-primary-500),
    var(--color-primary-700)
  );
  color: var(--color-white-0);
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const HelperText = styled.p`
  margin-top: 1.5rem;
  font-size: 1.3rem;
  color: var(--color-grey-600);
  text-align: center;
`;

const SmallLink = styled(Link)`
  color: var(--color-primary-600);
  text-decoration: underline;
`;

function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const navigate = useNavigate();
  const { verifyAccount, resendOtp } = useAuth();
  const {
    mutate: verifyAccountMutation,
    isPending: isVerifying,
    error: verifyError,
  } = verifyAccount;
  const {
    mutate: resendOtpMutation,
    isPending: isResending,
    error: resendError,
  } = resendOtp;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    setInfoMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail || !trimmedOtp) {
      setLocalError("Please provide both email and verification code.");
      return;
    }

    verifyAccountMutation(
      { email: trimmedEmail, otp: trimmedOtp },
      {
        onSuccess: () => {
          // Show a short success message, then redirect to login
          setInfoMessage(
            "Email verified successfully. Redirecting you to the login page..."
          );
          setTimeout(() => {
            navigate(PATHS.LOGIN);
          }, 1500);
        },
      }
    );
  };

  const handleResend = () => {
    setLocalError("");
    setInfoMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setLocalError("Please enter your email to resend the code.");
      return;
    }

    // resendOtpMutation expects an object { email }
    resendOtpMutation({ email: trimmedEmail }, {
      onSuccess: () => {
        setInfoMessage("A new verification code has been sent to your email.");
      },
    });
  };

  const combinedError =
    localError ||
    verifyError?.response?.data?.message ||
    verifyError?.message ||
    resendError?.response?.data?.message ||
    resendError?.message ||
    "";

  return (
    <Container>
      <Title>Verify your seller email</Title>
      <Subtitle>
        Enter the 6-digit verification code we sent to your email to activate
        your seller account.
      </Subtitle>

      {combinedError && (
        <ErrorState title="Verification Failed" message={combinedError} />
      )}

      {infoMessage && (
        <p style={{ color: "var(--color-green-600)", marginBottom: "1rem" }}>
          {infoMessage}
        </p>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <InputGroup>
          <Label>Email address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            autoComplete="email"
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Verification code (OTP)</Label>
          <Input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
            }
            placeholder="6-digit code"
            inputMode="numeric"
            required
          />
          <ActionsRow>
            <span style={{ fontSize: "1.2rem", color: "var(--color-grey-500)" }}>
              Didn&apos;t receive the code?
            </span>
            <ResendLink type="button" onClick={handleResend} disabled={isResending}>
              {isResending ? "Resending..." : "Resend code"}
            </ResendLink>
          </ActionsRow>
        </InputGroup>

        <SubmitButton type="submit" disabled={isVerifying}>
          {isVerifying && <ButtonSpinner size={16} />}
          {isVerifying ? "Verifying..." : "Verify email"}
        </SubmitButton>
      </Form>

      <HelperText>
        Already verified?{" "}
        <SmallLink to={PATHS.LOGIN}>Go back to login</SmallLink>
      </HelperText>
    </Container>
  );
}

export default VerifyAccountPage;

