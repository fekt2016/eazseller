import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaSpinner, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../shared/services/api';
import { PATHS } from '../../routes/routePaths';

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
  min-height: 44px; /* Ensure button is always visible and clickable */

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: var(--color-primary);
  color: white;
  min-width: 150px; /* Ensure button has minimum width */

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

// API functions
const verifyOTP = async (withdrawalId, otp) => {
  const response = await api.post(`/seller/payout/request/${withdrawalId}/verify-otp`, { otp });
  return response.data;
};

const resendOTP = async (withdrawalId, reason = 'transfer') => {
  // Paystack only accepts 'transfer' or 'disable_otp'
  // We always use 'transfer' for resending OTP
  const response = await api.post(`/seller/payout/request/${withdrawalId}/resend-otp`, { reason: 'transfer' });
  return response.data;
};

const getWithdrawalRequest = async (withdrawalId) => {
  const response = await api.get(`/seller/payout/requests`);
  const requests = response.data?.data?.withdrawalRequests || response.data?.withdrawalRequests || [];
  return requests.find(req => req._id === withdrawalId || req.id === withdrawalId);
};

export default function SellerWithdrawalVerifyOTP() {
  const { withdrawalId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // Fetch withdrawal request
  const { data: withdrawal, isLoading, error: fetchError } = useQuery({
    queryKey: ['withdrawalRequest', withdrawalId],
    queryFn: () => getWithdrawalRequest(withdrawalId),
    enabled: !!withdrawalId,
  });

  // Verify OTP mutation
  const verifyMutation = useMutation({
    mutationFn: (otpValue) => verifyOTP(withdrawalId, otpValue),
    onSuccess: (data) => {
      toast.success('OTP verified successfully! Your withdrawal is being processed.');
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequest', withdrawalId] });
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      
      // Force immediate refetch to update UI instantly
      queryClient.refetchQueries({ 
        queryKey: ['payoutBalance'],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: ['withdrawalRequests'],
        type: 'active'
      });
      
      // Redirect to withdrawals page after 2 seconds
      setTimeout(() => {
        navigate(PATHS.WITHDRAWALS);
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
      const errorData = error.response?.data;
      
      // Check if OTP is expired
      const expired = errorMessage.toLowerCase().includes('expired') || 
                     errorMessage.toLowerCase().includes('expire') ||
                     errorData?.code === 'OTP_EXPIRED' ||
                     errorData?.isExpired === true;
      
      setIsOtpExpired(expired);
      setError(errorMessage);
      setOtp(''); // Clear OTP input on error
      
      if (expired) {
        toast.error('OTP has expired. Please click "Resend PIN" to receive a new OTP.');
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: (reason) => resendOTP(withdrawalId, reason),
    onSuccess: () => {
      toast.success('PIN has been resent to your phone/email. Please check and enter the new PIN.');
      setError('');
      setOtp('');
      setIsOtpExpired(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    verifyMutation.mutate(otp);
  };

  // Format payment method
  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';
    return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format payment details
  const formatPaymentDetails = (details, method) => {
    if (!details) return 'N/A';
    
    if (method === 'bank') {
      return `${details.accountName || 'N/A'} - ${details.accountNumber || 'N/A'} (${details.bankName || 'N/A'})`;
    } else if (['mtn_momo', 'vodafone_cash', 'airtel_tigo_money'].includes(method)) {
      return `${details.accountName || 'N/A'} - ${details.phone || 'N/A'}`;
    }
    return 'N/A';
  };

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

  // Check if withdrawal is in correct status
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
        <WithdrawalInfo>
          <InfoRow>
            <InfoLabel>Amount Requested</InfoLabel>
            <AmountValue>GH₵{(withdrawal.amountRequested || withdrawal.amount)?.toFixed(2) || '0.00'}</AmountValue>
          </InfoRow>
          {withdrawal.withholdingTax > 0 && (
            <>
              <InfoRow>
                <InfoLabel>Withholding Tax ({(withdrawal.withholdingTaxRate || 0) * 100}%)</InfoLabel>
                <AmountValue style={{ color: '#f59e0b' }}>GH₵{withdrawal.withholdingTax.toFixed(2)}</AmountValue>
              </InfoRow>
              <InfoRow style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <InfoLabel style={{ fontWeight: 600 }}>Amount You'll Receive</InfoLabel>
                <AmountValue style={{ color: '#10b981', fontWeight: 700, fontSize: '1.25rem' }}>
                  GH₵{(withdrawal.amountPaidToSeller || (withdrawal.amountRequested || withdrawal.amount) - withdrawal.withholdingTax).toFixed(2)}
                </AmountValue>
              </InfoRow>
            </>
          )}
          <InfoRow>
            <InfoLabel>Payment Method</InfoLabel>
            <InfoValue>{formatPaymentMethod(withdrawal.paymentMethod || withdrawal.payoutMethod)}</InfoValue>
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

        <Instructions>
          <strong>Instructions:</strong> Paystack has sent a 6-digit PIN to your phone number or email address. 
          Please enter the PIN below to complete the withdrawal transfer.
          {isOtpExpired && (
            <div style={{ marginTop: 'var(--spacing-sm)', fontWeight: '600', color: 'var(--color-orange-700)' }}>
              ⚠️ Your PIN has expired. Please click "Resend PIN" to receive a new one.
            </div>
          )}
        </Instructions>

        {error && (
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

        {verifyMutation.isSuccess && (
          <SuccessMessage>
            <FaCheckCircle />
            OTP verified successfully! Redirecting...
          </SuccessMessage>
        )}

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
              disabled={otp.length !== 6 || verifyMutation.isPending || verifyMutation.isSuccess}
              title={otp.length !== 6 ? 'Please enter a 6-digit PIN' : 'Click to verify OTP'}
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
              onClick={() => {
                // Paystack only accepts 'transfer' or 'disable_otp'
                // We always use 'transfer' for resending OTP
                // Internal reason tracking is handled on backend
                resendMutation.mutate('transfer');
              }}
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

