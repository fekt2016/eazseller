import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
// Input and Select are styled components defined below
// Helper to format currency with GHS symbol
const formatGHS = (value) => {
  return `GH₵${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Request Withdrawal Modal Component
 * Allows sellers to request withdrawals
 */
const RequestWithdrawalModal = ({
  isOpen,
  onClose,
  onSubmit,
  availableBalance = 0,
  paymentMethods = [],
  isLoading = false,
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setAmount('');
      setPaymentMethod('bank');
      setSelectedPaymentMethodId('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(amount) > availableBalance) {
      newErrors.amount = `Amount cannot exceed available balance of ${formatGHS(availableBalance)}`;
    } else if (parseFloat(amount) < 10) {
      newErrors.amount = 'Minimum withdrawal amount is GH₵10';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    if (paymentMethod === 'bank' && !selectedPaymentMethodId && paymentMethods.length > 0) {
      newErrors.selectedPaymentMethodId = 'Please select a bank account';
    }

    if (paymentMethod === 'mobile' && !selectedPaymentMethodId && paymentMethods.length > 0) {
      newErrors.selectedPaymentMethodId = 'Please select a mobile money account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        amount: parseFloat(amount),
        paymentMethod,
        paymentMethodId: selectedPaymentMethodId || null,
      });
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: null }));
      }
    }
  };

  const filteredPaymentMethods = paymentMethods.filter(
    (method) =>
      (paymentMethod === 'bank' && method.type === 'bank') ||
      (paymentMethod === 'mobile' && method.type === 'mobileMoney')
  );

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
              {/* Available Balance Info */}
              <BalanceInfo>
                <BalanceLabel>Available Balance:</BalanceLabel>
                <BalanceAmount>{formatGHS(availableBalance)}</BalanceAmount>
              </BalanceInfo>

              {/* Amount Input */}
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
                <HelperText>Minimum: GH₵10</HelperText>
              </FormGroup>

              {/* Payment Method Selection */}
              <FormGroup>
                <FormLabel htmlFor="paymentMethod">
                  Payment Method <Required>*</Required>
                </FormLabel>
                <StyledSelect
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setSelectedPaymentMethodId('');
                    setErrors((prev) => ({ ...prev, paymentMethod: null, selectedPaymentMethodId: null }));
                  }}
                  disabled={isLoading}
                >
                  <option value="">Select payment method</option>
                  <option value="bank">Bank Account</option>
                  <option value="mobile">Mobile Money</option>
                </StyledSelect>
                {errors.paymentMethod && <ErrorText>{errors.paymentMethod}</ErrorText>}
              </FormGroup>

              {/* Payment Method Selection (Bank/Mobile) */}
              {paymentMethod && filteredPaymentMethods.length > 0 && (
                <FormGroup>
                  <FormLabel htmlFor="selectedPaymentMethodId">
                    Select {paymentMethod === 'bank' ? 'Bank Account' : 'Mobile Money Account'}
                  </FormLabel>
                  <StyledSelect
                    id="selectedPaymentMethodId"
                    value={selectedPaymentMethodId}
                    onChange={(e) => {
                      setSelectedPaymentMethodId(e.target.value);
                      setErrors((prev) => ({ ...prev, selectedPaymentMethodId: null }));
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Select an account</option>
                    {filteredPaymentMethods.map((method) => (
                      <option key={method._id} value={method._id}>
                        {paymentMethod === 'bank'
                          ? `${method.bankAccount?.bankName || 'Bank'} - ${method.bankAccount?.accountNumber || ''}`
                          : `${method.mobileMoney?.network || 'Network'} - ${method.mobileMoney?.phone || ''}`}
                      </option>
                    ))}
                  </StyledSelect>
                  {errors.selectedPaymentMethodId && (
                    <ErrorText>{errors.selectedPaymentMethodId}</ErrorText>
                  )}
                </FormGroup>
              )}

              {paymentMethod && filteredPaymentMethods.length === 0 && (
                <InfoMessage>
                  No {paymentMethod === 'bank' ? 'bank accounts' : 'mobile money accounts'} found.
                  Please add a payment method in Settings.
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
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
              >
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

// Styled Components
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
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
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
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;

  svg {
    color: var(--color-primary-500);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);

  &:hover {
    background: var(--color-grey-200);
    color: var(--color-grey-900);
  }
`;

const ModalContent = styled.div`
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-primary-50);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-primary-200);
`;

const BalanceLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-primary-700);
`;

const BalanceAmount = styled.span`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary-700);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const FormLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
`;

const Required = styled.span`
  color: var(--color-red-600);
`;

const ErrorText = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-red-600);
  margin-top: calc(var(--spacing-xs) * -1);
`;

const HelperText = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  margin-top: calc(var(--spacing-xs) * -1);
`;

const InfoMessage = styled.div`
  padding: var(--spacing-md);
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-blue-800);
  margin-bottom: var(--spacing-md);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid ${props => props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background-color: var(--color-white-0);
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? 'var(--color-red-500)' : 'var(--color-primary-500)'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'var(--color-red-100)' : 'var(--color-primary-100)'};
  }

  &:disabled {
    background-color: var(--color-grey-100);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background-color: var(--color-white-0);
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:disabled {
    background-color: var(--color-grey-100);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

