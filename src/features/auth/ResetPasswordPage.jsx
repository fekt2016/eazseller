import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from '../../shared/hooks/useAuth';
import { ButtonSpinner, LoadingButton } from '../../shared/components/ButtonSpinner';
import logger from '../../shared/utils/logger';
import './ForgotPasswordPage.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPasswordWithToken } = useAuth();
  const { mutateAsync: resetPassword, isPending, error } = resetPasswordWithToken;

  // Check if token exists in URL
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const validatePasswords = () => {
    if (state.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (state.newPassword !== state.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate("/forgot-password");
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    try {
      const data = await resetPassword({
        token,
        newPassword: state.newPassword,
        confirmPassword: state.confirmPassword,
      });
      logger.log("Password reset successful:", data);
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      // Navigation is handled by the success state button
    } catch (err) {
      logger.error("Error resetting password:", err);
      // Error is already handled by React Query's onError in the mutation
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">EazSeller</div>
            <h1>Password Reset Successful</h1>
            <p className="subtitle">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
          </div>

          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>Your password has been successfully reset.</p>
          </div>

          <LoadingButton
            onClick={() => navigate("/login")}
            fullWidth
          >
            Go to Login
          </LoadingButton>
        </div>
      </div>
    );
  }

  // No token state
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">EazSeller</div>
            <h1>Invalid Link</h1>
            <p className="subtitle">
              The reset link is invalid or has expired.
            </p>
          </div>

          <div className="error-message">
            This password reset link is invalid or has expired. Please request a new one.
          </div>

          <LoadingButton
            onClick={() => navigate("/forgot-password")}
            fullWidth
          >
            Request New Reset Link
          </LoadingButton>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">EazSeller</div>
          <h1>Set New Password</h1>
          <p className="subtitle">
            Please enter your new password. It must be at least 8 characters long.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error.message || "Failed to reset password. The link may have expired. Please request a new one."}
          </div>
        )}
        {passwordError && <div className="error-message">{passwordError}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="form-input"
              type="password"
              id="newPassword"
              name="newPassword"
              value={state.newPassword}
              onChange={(e) => {
                setState({ ...state, newPassword: e.target.value });
                if (passwordError) setPasswordError("");
              }}
              placeholder="••••••••"
              required
              minLength="8"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="form-input"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={state.confirmPassword}
              onChange={(e) => {
                setState({ ...state, confirmPassword: e.target.value });
                if (passwordError) setPasswordError("");
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <LoadingButton
            type="submit"
            disabled={
              isPending ||
              !state.newPassword ||
              !state.confirmPassword
            }
            fullWidth
          >
            {isPending ? <ButtonSpinner /> : "Reset Password"}
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

