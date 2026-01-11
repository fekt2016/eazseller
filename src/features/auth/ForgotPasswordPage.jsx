import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from '../../shared/hooks/useAuth';
import { ButtonSpinner, LoadingButton } from '../../shared/components/ButtonSpinner';
import logger from '../../shared/utils/logger';
import './ForgotPasswordPage.css';

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
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const data = await requestReset(normalizedEmail);
      logger.log("Password reset request sent:", data);
      setIsSubmitted(true);
      toast.success('If an account exists, a reset email has been sent.');
    } catch (err) {
      logger.error("Error requesting password reset:", err);
      // Error is already handled by React Query's onError in the mutation
    }
  };

  // Success state - show confirmation message
  if (isSubmitted) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">EazSeller</div>
            <h1>Check Your Email</h1>
            <p className="subtitle">
              We've sent password reset instructions to your inbox.
            </p>
          </div>

          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>
              If an account exists with <strong>{email}</strong>, we've sent password reset instructions.
            </p>
            <div className="info-box">
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the reset link in the email</li>
                <li>The link expires in 10 minutes</li>
              </ul>
            </div>
          </div>

          <LoadingButton
            onClick={() => navigate("/login")}
            fullWidth
          >
            Back to Login
          </LoadingButton>

          <button
            className="resend-link"
            onClick={() => setIsSubmitted(false)}
          >
            Didn't receive the email? Try again
          </button>
        </div>
      </div>
    );
  }

  // Form state - show email input
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">EazSeller</div>
          <h1>Reset Your Password</h1>
          <p className="subtitle">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error.message || "Failed to send reset email. Please try again."}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              autoFocus
            />
          </div>

          <LoadingButton
            type="submit"
            disabled={isPending || !email.trim()}
            fullWidth
          >
            {isPending ? <ButtonSpinner /> : "Send Reset Link"}
          </LoadingButton>
        </form>

        <div className="signup-section">
          <span className="signup-text">Remember your password?</span>
          <Link className="signup-link" to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
