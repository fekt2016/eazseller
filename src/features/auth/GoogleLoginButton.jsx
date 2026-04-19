import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import api from "../../shared/services/api";
import { PATHS } from "../../routes/routePaths";
import styled from "styled-components";
import { toast } from "react-toastify";
import logger from "../../shared/utils/logger";

/**
 * Google OAuth login/signup button for the seller app.
 * Renders a visible "Google" button. Uses SDK when clientId is set;
 * otherwise shows a disabled placeholder so the UI is clear.
 */
export default function GoogleLoginButton({ appType = "seller", onComplete, className }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;

      if (!credential) {
        toast.error("Google login failed. Please try again.");
        return;
      }

      const response = await api.post("/auth/google", {
        token: credential,
        appType,
      });

      if (import.meta.env.DEV) {
        logger.debug("[Seller GoogleLogin] Google auth success", {
          appType,
          status: response?.status,
        });
      }

      if (onComplete) {
        onComplete(response.data);
      } else {
        // Full page load so cookie is sent; redirect to dashboard so seller is signed in there
        window.location.href = PATHS.DASHBOARD;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google login failed.");
    }
  };

  if (!clientId) {
    return (
      <GoogleButtonPlaceholder
        className={className}
        type="button"
        onClick={() => window.alert("Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.")}
        title="Google sign-in not configured"
      >
        <FcGoogle size={18} />
        <span>Google</span>
      </GoogleButtonPlaceholder>
    );
  }

  return (
    <GoogleButtonWrap className={className}>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => toast.error("Google login failed. Please try again.")}
        useOneTap={false}
        size="large"
      />
    </GoogleButtonWrap>
  );
}

const GoogleButtonWrap = styled.div`
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;

  & > div {
    width: 100% !important;
  }
  iframe {
    min-width: 120px;
  }
`;

const GoogleButtonPlaceholder = styled.button`
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #cbd5e1;
  }
`;

