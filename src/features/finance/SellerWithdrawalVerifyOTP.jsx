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
  padding: var(--spacing-xl);
`;

const Header = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary);
  text-decoration: none;
  margin-bottom: var(--spacing-md);
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);
`;

const Subtitle = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-base);
`;

const Card = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const WithdrawalInfo = styled.div`
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-grey-200);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
`;

const InfoValue = styled.span`
  color: var(--color-grey-900);
  font-weight: 600;
  font-size: var(--font-size-base);
`;

const AmountValue = styled(InfoValue)`
  font-size: var(--font-size-xl);
  color: var(--color-primary);
`;

const Instructions = styled.div`
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  color: var(--color-blue-900);
  font-size: var(--font-size-sm);
  line-height: 1.6;
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--color-grey-700);
  font-weight: 500;
  font-size: var(--font-size-sm);
`;

const OTPInput = styled.input`
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-xl);
  text-align: center;
  letter-spacing: 0.5rem;
  font-weight: 600;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    letter-spacing: 0;
    color: var(--color-grey-400);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  width: 100%;
`;

const Button = styled.button`
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  min-height: 44px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: var(--color-primary);
  color: white;
  min-width: 150px;

  &:hover:not(:disabled) {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: var(--color-grey-400);
    color: var(--color-grey-600);
  }
`;

const SecondaryButton = styled(Button)`
  background: var(--color-grey-100);
  color: var(--color-grey-700);

  &:hover:not(:disabled) {
    background: var(--color-grey-200);
  }
`;

const ErrorMessage = styled.div`
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  color: var(--color-red-700);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const SuccessMessage = styled.div`
  background: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  color: var(--color-green-700);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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
  console.log('[VERIFY OTP] Request sent:', { withdrawalId, otp: '***' + otp.slice(-2) });
  
  // Ensure token is in request headers
  const token = typeof window !== 'undefined' ? (
    localStorage.getItem('seller_token') || 
    localStorage.getItem('sellerAccessToken') ||
    localStorage.getItem('seller_jwt') ||
    null
  ) : null;
  
  // Prepare request config with explicit Authorization header
  const config = {
    headers: {},
    withCredentials: true
  };
  
  // Add Authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[VERIFY OTP] Authorization header added from localStorage');
  } else {
    console.warn('[VERIFY OTP] ⚠️ No token found in localStorage - relying on cookie');
  }
  
  console.log('[VERIFY OTP] Axios headers:', {
    hasAuthorization: !!config.headers.Authorization,
    withCredentials: config.withCredentials
  });
  
  try {
    const response = await api.post(
      `/seller/payout/request/${withdrawalId}/verify-otp`,
      { otp },
      config
    );
    
    console.log('[VERIFY OTP] RESPONSE:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('[VERIFY OTP] ERROR:', JSON.parse(JSON.stringify({
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      paystackError: error.response?.data?.paystack,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? 'Bearer ***' : 'missing'
        }
      }
    })));
    
    // Log Paystack error from backend if available
    if (error.response?.data?.paystack) {
      console.error('[VERIFY OTP] 🔥 PAYSTACK ERROR FROM BACKEND:', error.response.data.paystack);
      console.error('[VERIFY OTP] 🔥 PAYSTACK ERROR (STRINGIFIED):', JSON.stringify(error.response.data.paystack, null, 2));
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

/**
 * Handle Paystack redirect
 * DISABLED: All redirects disabled for debugging
 */
const handlePaystackRedirect = (authorizationUrl) => {
  console.log('[VERIFY OTP] Paystack redirect URL:', authorizationUrl);
  
  if (!authorizationUrl) {
    console.warn('[VERIFY OTP] ⚠️ No authorization URL found');
    return false;
  }
  
  // DISABLED: All redirects disabled for debugging
  console.warn('[VERIFY OTP] 🛑 PAYSTACK REDIRECT DISABLED FOR DEBUGGING');
  console.warn('[VERIFY OTP] Authorization URL that would be used:', authorizationUrl);
  toast.info('Paystack redirect URL detected (redirect disabled for debugging)');
  
  // Return false to indicate redirect was not performed
  return false;
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
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ VERIFY OTP SUCCESS RESPONSE:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(JSON.parse(JSON.stringify(data)));
      console.log('═══════════════════════════════════════════════════════════');
      
      // Check for Paystack redirect
      const authorizationUrl = extractAuthorizationUrl(data);
      
      if (authorizationUrl) {
        console.log('[VERIFY OTP] Paystack redirect URL detected:', authorizationUrl);
        console.log('[VERIFY OTP] ⚠️ Redirect DISABLED - will show URL in console instead');
        const redirected = handlePaystackRedirect(authorizationUrl);
        console.log('[VERIFY OTP] Paystack redirect was requested but disabled - continuing to show success state');
      }
      
      // No redirect required - success
      toast.success('OTP verified successfully! Your withdrawal is being processed.');
      
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequest', withdrawalId] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      
      // COMMENTED OUT: Don't redirect so we can see the success state
      // setTimeout(() => {
      //   navigate(PATHS.WITHDRAWALS);
      // }, 2000);
      console.log('[VERIFY OTP] ✅ Success - redirect DISABLED for debugging');
    },
    
    onError: (error) => {
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ FULL OTP ERROR OBJECT:');
      console.error('═══════════════════════════════════════════════════════════');
      console.error(JSON.parse(JSON.stringify(error)));
      console.error('═══════════════════════════════════════════════════════════');
      
      console.error('❌ RESPONSE STATUS:', error.response?.status);
      console.error('❌ RESPONSE DATA:', error.response?.data);
      console.error('❌ RESPONSE DATA (STRINGIFIED):', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ PAYSTACK ERROR (from backend):', error.response?.data?.paystack);
      console.error('❌ REQUEST HEADERS:', error.config?.headers);
      console.error('❌ REQUEST URL:', error.config?.url);
      console.error('❌ REQUEST METHOD:', error.config?.method);
      console.error('❌ REQUEST BASE URL:', error.config?.baseURL);
      console.error('❌ FULL ERROR MESSAGE:', error.message);
      console.error('❌ ERROR STACK:', error.stack);
      
      // Log backend error message if available
      if (error.response?.data?.message) {
        console.error('❌ BACKEND ERROR MESSAGE:', error.response.data.message);
      }
      if (error.response?.data?.paystack) {
        console.error('❌ PAYSTACK ERROR DETAILS:', JSON.stringify(error.response.data.paystack, null, 2));
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
      const statusCode = error.response?.status;
      
      // Check if it's a true authentication error
      if (isTrueAuthError(error)) {
        console.error('═══════════════════════════════════════════════════════════');
        console.error('[VERIFY OTP] 🚨 TRUE AUTHENTICATION ERROR - Token invalid/expired');
        console.error('═══════════════════════════════════════════════════════════');
        console.error('[VERIFY OTP] Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          fullError: error
        });
        const authError = 'Your session has expired. Please log in again.';
        setError(authError);
        toast.error(authError);
        
        // COMMENTED OUT: Don't redirect so we can see the error
        // ALL REDIRECTS TO LOGIN ARE DISABLED FOR DEBUGGING
        // setTimeout(() => {
        //   navigate(PATHS.LOGIN);
        // }, 2000);
        console.warn('[VERIFY OTP] ⚠️ Redirect to login DISABLED for debugging - error will remain visible');
        console.warn('[VERIFY OTP] ⚠️ NO REDIRECT WILL OCCUR - You can inspect the error on this page');
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
      console.log('[RESEND OTP] ✅ Success:', data);
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
      console.error('[RESEND OTP] ❌ Error:', error);
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
    
    // ADD DIAGNOSTIC LOGGING BEFORE MUTATION
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔎 VERIFY OTP STARTED:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log({ 
      withdrawalId, 
      otp: '***' + otp.slice(-2),
      otpLength: otp.length,
      timestamp: new Date().toISOString()
    });
    console.log('═══════════════════════════════════════════════════════════');
    
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
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <LoadingSpinner size={32} />
            <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-grey-600)' }}>
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
            <div style={{ marginTop: 'var(--spacing-sm)', fontWeight: '600', color: 'var(--color-orange-700)' }}>
              ⚠️ Your PIN has expired. Please click "Resend PIN" to receive a new one.
            </div>
          )}
          {resendMutation.isSuccess && (
            <div style={{ marginTop: 'var(--spacing-sm)', fontWeight: '600', color: 'var(--color-green-700)' }}>
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
                <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)' }}>
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
                borderColor: 'var(--color-orange-500)',
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
                background: 'var(--color-orange-500)',
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
