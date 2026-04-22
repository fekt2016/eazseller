import { useState } from "react";
import styled from "styled-components";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../shared/hooks/useAuth";
import { PATHS } from "../../routes/routePaths";
import { ButtonSpinner } from "../../shared/components/ButtonSpinner";
import { ErrorState } from "../../shared/components/ui/LoadingComponents";

const Container = styled.div`
  max-width: 480px;
  margin: 4rem auto;
  padding: 3rem 2.5rem;
  background: #FFFFFF;
  border-radius: 1.6rem;
  
`;

const Title = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: #111827;
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: #6B7280;
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
  color: #1F2937;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  border-radius: 0.8rem;
  border: 1px solid #E5E7EB;
  font-size: 1.4rem;
  outline: none;

  &:focus {
    border-color: #E8920A;
    box-shadow: 0 0 0 1px #FDE68A;
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
  color: #E8920A;
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
    #E8920A,
    #D97706
  );
  color: #FFFFFF;
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
  color: #6B7280;
  text-align: center;
`;

const SmallLink = styled(Link)`
  color: #E8920A;
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
          // Show success toast notification
          toast.success("Email verified successfully! Redirecting to login...", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Show info message
          setInfoMessage(
            "Email verified successfully. Redirecting you to the login page..."
          );
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate(PATHS.LOGIN);
          }, 2000);
        },
        onError: (error) => {
          // Error toast is handled by the error display below
          // But we can add a toast here too if needed
          const errorMessage = error?.response?.data?.message || error?.message || "Verification failed. Please try again.";
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
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

  const resendMsg = resendError?.response?.data?.message ?? resendError?.message;
  const isResendNetworkError =
    resendError &&
    (resendError.message === "Network Error" ||
      resendError.code === "ERR_NETWORK" ||
      !resendError.response);
  const combinedError =
    localError ||
    verifyError?.response?.data?.message ||
    verifyError?.message ||
    (isResendNetworkError
      ? "Could not reach the server to resend the code. Check your internet connection and try again."
      : resendMsg) ||
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
        <p style={{ color: "#3B6D11", marginBottom: "1rem" }}>
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
            <span style={{ fontSize: "1.2rem", color: "#9CA3AF" }}>
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

