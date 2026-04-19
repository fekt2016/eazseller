import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { PATHS } from '../../../routes/routePaths';
import { formatMobileNetworkLabel } from '../../../shared/constants/banksList';

const maskLast4 = (value) => {
  if (!value) return '';
  const s = String(value);
  return s.length <= 4 ? s : `•••• ${s.slice(-4)}`;
};

/**
 * Summary line for the seller's single saved payment method (read-only).
 */
const getSingleMethodSummary = (method) => {
  if (!method) return '';
  if (method.type === 'bank_transfer') {
    const bankName = method.bankName || 'Bank';
    const raw = method.accountNumber || '';
    const masked = maskLast4(raw.replace(/\s/g, '') || raw);
    return `${bankName} — ${masked}`;
  }
  if (method.type === 'mobile_money') {
    const networkLabel =
      formatMobileNetworkLabel(method.provider || method.network || '') ||
      method.provider ||
      method.network ||
      'Network';
    const num = method.mobileNumber || method.phone || '';
    return `${networkLabel} — ${maskLast4(num.replace(/\D/g, '') || num)}`;
  }
  if (method.type === 'cash_pickup') {
    const loc = method.cashPickup?.location || method.pickupLocation || 'Pickup';
    const contact = method.cashPickup?.contactName || method.contactName || '';
    return contact ? `${loc} — ${contact}` : loc;
  }
  return method.name || method.accountName || 'Payment method';
};

// Helper to format currency with GHS symbol
const formatGHS = (value) => {
  return (
    'GH\u20B5' +
    parseFloat(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

/**
 * Request Withdrawal Modal Component
 * Seller has at most one payment method; shown read-only with link to Settings.
 */
const RequestWithdrawalModal = ({
  isOpen,
  onClose,
  onSubmit,
  availableBalance = 0,
  paymentMethods = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});

  const singleMethod = paymentMethods.length > 0 ? paymentMethods[0] : null;

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setErrors({});
    }
  }, [isOpen]);

  const goToPaymentSettings = () => {
    onClose();
    navigate(PATHS.PAYMENT_METHODS);
  };

  const validate = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(amount) > availableBalance) {
      newErrors.amount = `Amount cannot exceed available balance of ${formatGHS(availableBalance)}`;
    } else if (parseFloat(amount) < 10) {
      newErrors.amount = 'Minimum withdrawal amount is GH\u20B510';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singleMethod) return;
    if (!validate()) return;

    // Map PaymentMethod doc → backend paymentRequest enum.
    // Backend accepts: 'bank' | 'mtn_momo' | 'telecel_cash' | 'at_money'
    //                  | 'vodafone_cash' | 'airtel_tigo_money' | 'cash'
    const PROVIDER_TO_METHOD = {
      MTN: 'mtn_momo',
      Telecel: 'telecel_cash',
      AT: 'at_money',
      Vodafone: 'vodafone_cash',
      AirtelTigo: 'airtel_tigo_money',
    };

    let backendPaymentMethod = null;
    if (singleMethod.type === 'bank_transfer') {
      backendPaymentMethod = 'bank';
    } else if (singleMethod.type === 'mobile_money') {
      backendPaymentMethod = PROVIDER_TO_METHOD[singleMethod.provider] || 'mtn_momo';
    } else if (singleMethod.type === 'cash_pickup') {
      backendPaymentMethod = 'cash';
    } else {
      backendPaymentMethod = singleMethod.type;
    }

    onSubmit({
      amount: parseFloat(amount),
      paymentMethodId: singleMethod._id ?? singleMethod.id,
      paymentMethod: backendPaymentMethod,
    });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: null }));
      }
    }
  };

  const amountNum = amount === '' ? 0 : parseFloat(amount);
  const canSubmit =
    Boolean(singleMethod) &&
    !isLoading &&
    amountNum >= 10 &&
    amountNum <= availableBalance;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <ModalContainer
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onSubmit={handleSubmit}
            as="form"
          >
            <ModalHeader>
              <ModalTitle>
                <FaMoneyBillWave /> Request Withdrawal
              </ModalTitle>
              <CloseButton onClick={onClose} aria-label="Close" type="button">
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalContent>
              <BalanceInfo>
                <BalanceLabel>Available Balance:</BalanceLabel>
                <BalanceAmount>{formatGHS(availableBalance)}</BalanceAmount>
              </BalanceInfo>

              <FormGroup>
                <FormLabel htmlFor="amount">
                  Withdrawal Amount <Required>*</Required>
                </FormLabel>
                <StyledInput
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  $hasError={!!errors.amount}
                  disabled={isLoading}
                />
                {errors.amount && <ErrorText>{errors.amount}</ErrorText>}
                <HelperText>{`Minimum: GH\u20B510`}</HelperText>
              </FormGroup>

              {singleMethod ? (
                <FormGroup>
                  <FormLabel>Payment method</FormLabel>
                  <ReadOnlyMethodText>{getSingleMethodSummary(singleMethod)}</ReadOnlyMethodText>
                  <TextLinkButton
                    type="button"
                    onClick={goToPaymentSettings}
                    disabled={isLoading}
                  >
                    Change in Settings
                  </TextLinkButton>
                </FormGroup>
              ) : (
                <InfoMessage>
                  You haven&apos;t added a payment method yet. Go to Settings → Payment Methods
                  to add one.{' '}
                  <TextLinkButton
                    type="button"
                    onClick={goToPaymentSettings}
                    disabled={isLoading}
                    $inline
                  >
                    Open Payment Methods
                  </TextLinkButton>
                </InfoMessage>
              )}
            </ModalContent>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!canSubmit}>
                {isLoading ? 'Submitting...' : 'Request Withdrawal'}
              </Button>
            </ModalFooter>
          </ModalContainer>
        </>
      )}
    </AnimatePresence>
  );
};

export default RequestWithdrawalModal;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled(motion.form)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  background: #FFFFFF;
  border-radius: 12px;

  z-index: 1001;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #F1EFE8;
  background: #F9F8F5;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;

  svg {
    color: #E8920A;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #6B7280;
  cursor: pointer;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  transition: all 0.12s;

  &:hover {
    background: #F1EFE8;
    color: #111827;
  }
`;

const ModalContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #FFFDF9;
  border-radius: 9px;
  margin-bottom: 1rem;
  border: 1px solid #FDE68A;
`;

const BalanceLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #D97706;
`;

const BalanceAmount = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #D97706;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const Required = styled.span`
  color: #A32D2D;
`;

const ErrorText = styled.span`
  font-size: 0.8rem;
  color: #A32D2D;
  margin-top: calc(1rem * -1);
`;

const HelperText = styled.span`
  font-size: 0.8rem;
  color: #6B7280;
  margin-top: calc(1rem * -1);
`;

const ReadOnlyMethodText = styled.div`
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background-color: #F9FAFB;
`;

const TextLinkButton = styled.button`
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: #E8920A;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: #D97706;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(p) =>
    p.$inline &&
    `
    display: inline;
    align-self: unset;
    margin-left: 0.25rem;
    vertical-align: baseline;
  `}
`;

const InfoMessage = styled.div`
  padding: 1rem;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 9px;
  font-size: 0.875rem;
  color: #1E40AF;
  margin-bottom: 1rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #F1EFE8;
  background: #F9F8F5;

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 1rem;
  border: 1px solid ${(props) => (props.$hasError ? '#EF4444' : '#E5E7EB')};
  border-radius: 9px;
  font-size: 0.9rem;

  color: #111827;
  background-color: #FFFFFF;
  transition: all 0.12s;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? '#EF4444' : '#E8920A')};
    box-shadow: 0 0 0 3px ${(props) => (props.$hasError ? '#FCEBEB' : '#FEF3C7')};
  }

  &:disabled {
    background-color: #F9F8F5;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: #D1D5DB;
  }
`;
