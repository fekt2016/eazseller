import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaSpinner, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../shared/services/api';
import { PATHS } from '../../routes/routePaths';

// ============================================
// STYLED COMPONENTS (Preserved from original)
// ============================================

const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: #E8920A;
  text-decoration: none;
  margin-bottom: 1rem;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.375rem;
`;

const Subtitle = styled.p`
  color: #6B7280;
  font-size: 1rem;
`;

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const WithdrawalInfo = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #F1EFE8;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #6B7280;
  font-size: 0.875rem;
`;

const InfoValue = styled.span`
  color: #111827;
  font-weight: 600;
  font-size: 1rem;
`;

const AmountValue = styled(InfoValue)`
  font-size: 1.1rem;
  color: #E8920A;
`;

const Instructions = styled.div`
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 9px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #1E3A5F;
  font-size: 0.875rem;
  line-height: 1.6;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
`;

const OTPInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 9px;
  font-size: 1.1rem;
  text-align: center;
  letter-spacing: 0.5rem;
  font-weight: 600;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #E8920A;
  }

  &::placeholder {
    letter-spacing: 0;
    color: #D1D5DB;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 9px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: #E8920A;
  color: white;
  min-width: 150px;

  &:hover:not(:disabled) {
    background: #D97706;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: #D1D5DB;
    color: #6B7280;
  }
`;

const SecondaryButton = styled(Button)`
  background: #F9F8F5;
  color: #374151;

  &:hover:not(:disabled) {
    background: #F1EFE8;
  }
`;

const ErrorMessage = styled.div`
  background: #FCEBEB;
  border: 1px solid #FECACA;
  border-radius: 9px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #A32D2D;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuccessMessage = styled.div`
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 9px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #3B6D11;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch withdrawal request by ID
 */
const getWithdrawalRequest = async (withdrawalId) => {
  const response = await api.get(`/seller/payout/requests`);
  const requests = response.data?.data?.withdrawalRequests || response.data?.withdrawalRequests || [];
  return requests.find(req => req._id === withdrawalId || req.id === withdrawalId);
};

/**
 * Verify OTP for withdrawal
 * Ensures Authorization header is always sent
 */
const verifyOTP = async (withdrawalId, otp) => {
  if (import.meta.env.DEV) {
    console.debug('[VERIFY OTP] Request sent');
  }

  // SECURITY: Cookie-only authentication - no token storage
  // Cookies are automatically sent via withCredentials: true in api.js
  // Backend reads from req.cookies.seller_jwt

  try {
    const response = await api.post(
      `/seller/payout/request/${withdrawalId}/verify-otp`,
      { otp }
    );

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[VERIFY OTP] Error:', error.message, error.response?.status);
    }

    throw error;
  }
};

/**
 * Resend OTP for withdrawal
 */
const resendOTP = async (withdrawalId) => {
  const response = await api.post(`/seller/payout/request/${withdrawalId}/resend-otp`, {
    reason: 'transfer'
  });
  return response.data;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatPaymentMethod = (method) => {
  if (!method) return 'N/A';
  return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatPaymentDetails = (details, method) => {
  if (!details) return 'N/A';

  if (method === 'bank') {
    return `${details.accountName || 'N/A'} - ${details.accountNumber || 'N/A'} (${details.bankName || 'N/A'})`;
  } else if (['mtn_momo', 'vodafone_cash', 'airtel_tigo_money'].includes(method)) {
    return `${details.accountName || 'N/A'} - ${details.phone || 'N/A'}`;
  }
  return 'N/A';
};

/**
 * Check if error is a true authentication error
 * Only returns true if backend explicitly says token is invalid/expired
 */
const isTrueAuthError = (error) => {
  if (!error.response || error.response.status !== 401) {
    return false;
  }

  const errorMessage = (error.response?.data?.message || '').toLowerCase();
  const authErrorKeywords = [
    'not authenticated',
    'not logged in',
    'token expired',
    'invalid token',
    'session expired',
    'unauthorized'
  ];

  // Only consider it auth error if message contains auth keywords
  // AND doesn't contain OTP-related keywords
  const hasAuthKeyword = authErrorKeywords.some(keyword => errorMessage.includes(keyword));
  const hasOtpKeyword = errorMessage.includes('otp') || errorMessage.includes('pin');

  return hasAuthKeyword && !hasOtpKeyword;
};

/**
 * Extract authorization URL from response
 * Checks multiple possible locations
 */
const extractAuthorizationUrl = (data) => {
  return data?.data?.authorization_url ||
    data?.data?.redirect_url ||
    data?.authorization_url ||
    data?.redirect_url ||
    null;
};

const handlePaystackRedirect = (authorizationUrl) => {
  if (!authorizationUrl) {
    if (import.meta.env.DEV) {
      console.warn('[VERIFY OTP] No authorization URL found');
    }
    return false;
  }

  toast.info('Redirecting to Paystack for authorization...');
  window.location.href = authorizationUrl;

  return true;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function SellerWithdrawalVerifyOTP() {
  // ============================================
  // STATE
  // ============================================
  const { withdrawalId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================
  const { data: withdrawal, isLoading, error: fetchError } = useQuery({
    queryKey: ['withdrawalRequest', withdrawalId],
    queryFn: () => getWithdrawalRequest(withdrawalId),
    enabled: !!withdrawalId,
    retry: 1,
  });

  // ============================================
  // OTP VERIFICATION MUTATION
  // ============================================
  const verifyMutation = useMutation({
    mutationFn: (otpValue) => verifyOTP(withdrawalId, otpValue),

    onSuccess: (data) => {
      // Check for Paystack redirect
      const authorizationUrl = extractAuthorizationUrl(data);

      if (authorizationUrl) {
        handlePaystackRedirect(authorizationUrl);
      }

      // No redirect required - success
      toast.success('OTP verified successfully! Your withdrawal is being processed.');

      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequest', withdrawalId] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });

      // Redirect to withdrawals page so we can see the success state
      setTimeout(() => {
        navigate(PATHS.WITHDRAWALS);
      }, 2000);
    },

    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('[VERIFY OTP] Error:', error.message, error.response?.status);
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';

      // Check if it's a true authentication error
      if (isTrueAuthError(error)) {
        if (import.meta.env.DEV) {
          console.error('[VERIFY OTP] Auth error:', error.response?.status, error.response?.data?.message);
        }
        const authError = 'Your session has expired. Please log in again.';
        setError(authError);
        toast.error(authError);

        // Redirect to login
        setTimeout(() => {
          navigate(PATHS.LOGIN);
        }, 2000);
        return;
      }

      // Handle OTP-specific errors
      const errorData = error.response?.data || {};
      const paystackError = errorData.paystack || {};
      const errorCode = errorData.errorCode || errorData.code;

      // Check for OTP session expired (abandoned transfer)
      const isSessionExpired = errorCode === 'OTP_SESSION_EXPIRED' ||
        errorCode === 'TRANSFER_ABANDONED' ||
        errorMessage.toLowerCase().includes('session has expired') ||
        errorMessage.toLowerCase().includes('transfer was abandoned');

      // Check for "Transfer is not currently awaiting OTP" error
      const isNotAwaitingOtp = errorMessage.toLowerCase().includes('not currently awaiting otp') ||
        errorMessage.toLowerCase().includes('not awaiting otp') ||
        errorCode === 'TRANSFER_NOT_AWAITING_OTP' ||
        paystackError.message?.toLowerCase().includes('not currently awaiting otp');

      const isExpired = errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('expire') ||
        errorCode === 'OTP_EXPIRED' ||
        errorData.isExpired === true;

      const isInvalid = errorMessage.toLowerCase().includes('invalid') ||
        errorMessage.toLowerCase().includes('incorrect') ||
        errorCode === 'OTP_INVALID' ||
        errorData.isInvalid === true;

      // If session expired, mark as expired and disable verify button
      if (isSessionExpired) {
        setIsOtpExpired(true);
        setError('Your OTP session has expired. Click Resend PIN to restart the transfer.');
        toast.error('Your OTP session has expired. Click "Resend PIN" to restart the transfer.', {
          duration: 5000,
        });
        setOtp(''); // Clear OTP on error
        return; // Early return - don't process other errors
      }

      setIsOtpExpired(isExpired || isNotAwaitingOtp);
      setError(errorMessage);
      setOtp(''); // Clear OTP on error

      if (isNotAwaitingOtp) {
        const suggestion = errorData.suggestion || 'Please try clicking "Resend PIN" to get a new OTP.';
        toast.error('This OTP is no longer valid. ' + suggestion);
        setError(errorMessage + '. ' + suggestion);
      } else if (isExpired) {
        toast.error('OTP has expired. Please click "Resend PIN" to receive a new OTP.');
      } else if (isInvalid) {
        toast.error('Invalid OTP. Please check and try again.');
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // ============================================
  // RESEND OTP MUTATION
  // ============================================
  const resendMutation = useMutation({
    mutationFn: () => resendOTP(withdrawalId),

    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.debug('[RESEND OTP] Success');
      }
      toast.success('PIN has been resent to your phone/email. Please check and enter the new PIN.');

      // Clear all error states
      setError('');
      setOtp('');
      setIsOtpExpired(false);

      // Reset verify mutation state
      verifyMutation.reset();

      // Invalidate queries to refresh withdrawal data
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequest', withdrawalId] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
    },

    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('[RESEND OTP] Error:', error.message);
      }
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError(''); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    // Clear previous errors
    setError('');
    setIsOtpExpired(false);

    // Trigger mutation
    verifyMutation.mutate(otp);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <LoadingSpinner size={32} />
            <p style={{ marginTop: '1rem', color: '#6B7280' }}>
              Loading withdrawal details...
            </p>
          </div>
        </Card>
      </PageContainer>
    );
  }

  // ============================================
  // ERROR STATE - Request not found
  // ============================================
  if (fetchError || !withdrawal) {
    return (
      <PageContainer>
        <Card>
          <ErrorMessage>
            <FaExclamationCircle />
            {fetchError?.message || 'Withdrawal request not found'}
          </ErrorMessage>
          <BackLink to={PATHS.WITHDRAWALS}>
            <FaArrowLeft /> Back to Withdrawals
          </BackLink>
        </Card>
      </PageContainer>
    );
  }

  // ============================================
  // ERROR STATE - Wrong status
  // ============================================
  if (withdrawal.status !== 'awaiting_paystack_otp' && withdrawal.status !== 'processing') {
    return (
      <PageContainer>
        <Card>
          <ErrorMessage>
            <FaExclamationCircle />
            This withdrawal is not awaiting OTP verification. Current status: {withdrawal.status}
          </ErrorMessage>
          <BackLink to={PATHS.WITHDRAWALS}>
            <FaArrowLeft /> Back to Withdrawals
          </BackLink>
        </Card>
      </PageContainer>
    );
  }

  // ============================================
  // MAIN UI RENDER
  // ============================================
  return (
    <PageContainer>
      <Header>
        <BackLink to={PATHS.WITHDRAWALS}>
          <FaArrowLeft /> Back to Withdrawals
        </BackLink>
        <Title>Verify OTP</Title>
        <Subtitle>Enter the OTP sent to your phone/email to complete the withdrawal</Subtitle>
      </Header>

      <Card>
        {/* Withdrawal Information */}
        <WithdrawalInfo>
          <InfoRow>
            <InfoLabel>Amount Requested</InfoLabel>
            <AmountValue>
              GH₵{(withdrawal.amountRequested || withdrawal.amount)?.toFixed(2) || '0.00'}
            </AmountValue>
          </InfoRow>

          {withdrawal.withholdingTax > 0 && (
            <>
              <InfoRow>
                <InfoLabel>Withholding Tax ({(withdrawal.withholdingTaxRate || 0) * 100}%)</InfoLabel>
                <AmountValue style={{ color: '#f59e0b' }}>
                  GH₵{withdrawal.withholdingTax.toFixed(2)}
                </AmountValue>
              </InfoRow>
              <InfoRow style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <InfoLabel style={{ fontWeight: 600 }}>Amount You'll Receive</InfoLabel>
                <AmountValue style={{ color: '#10b981', fontWeight: 700, fontSize: '1.25rem' }}>
                  GH₵{(withdrawal.amountPaidToSeller ||
                    (withdrawal.amountRequested || withdrawal.amount) - withdrawal.withholdingTax).toFixed(2)}
                </AmountValue>
              </InfoRow>
            </>
          )}

          <InfoRow>
            <InfoLabel>Payment Method</InfoLabel>
            <InfoValue>
              {formatPaymentMethod(withdrawal.paymentMethod || withdrawal.payoutMethod)}
            </InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Payment Details</InfoLabel>
            <InfoValue>
              {formatPaymentDetails(
                withdrawal.paymentDetails,
                withdrawal.paymentMethod || withdrawal.payoutMethod
              )}
            </InfoValue>
          </InfoRow>
        </WithdrawalInfo>

        {/* Instructions */}
        <Instructions>
          <strong>Instructions:</strong> Paystack has sent a 6-digit PIN to your phone number or email address.
          Please enter the PIN below to complete the withdrawal transfer.
          {isOtpExpired && !resendMutation.isSuccess && (
            <div style={{ marginTop: '0.5rem', fontWeight: '600', color: '#854F0B' }}>
              ⚠️ Your PIN has expired. Please click "Resend PIN" to receive a new one.
            </div>
          )}
          {resendMutation.isSuccess && (
            <div style={{ marginTop: '0.5rem', fontWeight: '600', color: '#3B6D11' }}>
              ✅ New PIN has been sent! Please check your phone/email and enter the new PIN.
            </div>
          )}
        </Instructions>

        {/* Error Message - Hide if resend was successful */}
        {error && !resendMutation.isSuccess && (
          <ErrorMessage>
            <FaExclamationCircle />
            <div style={{ flex: 1 }}>
              {error}
              {isOtpExpired && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Click the "Resend PIN" button below to receive a new PIN.
                </div>
              )}
            </div>
          </ErrorMessage>
        )}

        {/* Success Message */}
        {verifyMutation.isSuccess && !extractAuthorizationUrl(verifyMutation.data) && (
          <SuccessMessage>
            <FaCheckCircle />
            OTP verified successfully! Redirecting...
          </SuccessMessage>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="otp">Enter 6-Digit PIN</Label>
            <OTPInput
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              disabled={verifyMutation.isPending || verifyMutation.isSuccess}
              autoFocus
              style={isOtpExpired ? {
                borderColor: '#E8920A',
                borderWidth: '2px',
              } : {}}
            />
          </FormGroup>

          <ButtonGroup>
            <PrimaryButton
              type="submit"
              disabled={otp.length !== 6 || verifyMutation.isPending || verifyMutation.isSuccess || isOtpExpired}
              title={
                isOtpExpired
                  ? 'OTP session expired. Click Resend PIN to restart.'
                  : otp.length !== 6
                    ? 'Please enter a 6-digit PIN'
                    : 'Click to verify OTP'
              }
              style={isOtpExpired ? {
                opacity: 0.5,
                cursor: 'not-allowed',
              } : {}}
            >
              {verifyMutation.isPending ? (
                <>
                  <LoadingSpinner /> Verifying...
                </>
              ) : (
                <>
                  <FaCheckCircle /> {otp.length === 6 ? 'Verify OTP' : `Verify OTP (${otp.length}/6)`}
                </>
              )}
            </PrimaryButton>

            <SecondaryButton
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending || verifyMutation.isPending || verifyMutation.isSuccess}
              style={isOtpExpired ? {
                background: '#E8920A',
                color: 'white',
                fontWeight: '600',
              } : {}}
            >
              {resendMutation.isPending ? (
                <>
                  <LoadingSpinner /> Sending...
                </>
              ) : (
                <>
                  <FaRedo /> {isOtpExpired ? 'Resend PIN' : 'Resend OTP'}
                </>
              )}
            </SecondaryButton>
          </ButtonGroup>
        </form>
      </Card>
    </PageContainer>
  );
}
