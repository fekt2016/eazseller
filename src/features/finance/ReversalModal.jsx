import { useState } from 'react';
import { FaTimes, FaUndo, FaExclamationTriangle } from 'react-icons/fa';
import styled from 'styled-components';
import Button from '../../shared/components/ui/Button';

const ReversalModal = ({ isOpen, onClose, onConfirm, request, isLoading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for reversal');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long');
      return;
    }

    setError('');
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaUndo /> Request Withdrawal Reversal
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <WarningBox>
            <FaExclamationTriangle />
            <div>
              <strong>Are you sure you want to reverse this withdrawal?</strong>
              <p>
                The amount of <strong>GH₵{request?.amountRequested || request?.amount?.toFixed(2)}</strong> will be 
                refunded to your available balance. This action cannot be undone.
              </p>
            </div>
          </WarningBox>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="reason">
                Reason for Reversal <Required>*</Required>
              </Label>
              <TextArea
                id="reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="Please provide a detailed reason for reversing this withdrawal (minimum 10 characters)..."
                rows={4}
                disabled={isLoading}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <HelpText>Minimum 10 characters required</HelpText>
            </FormGroup>

            <ButtonGroup>
              <CancelButton type="button" onClick={handleClose} disabled={isLoading}>
                Cancel
              </CancelButton>
              <ConfirmButton type="submit" disabled={isLoading || !reason.trim()}>
                {isLoading ? 'Processing...' : 'Confirm Reversal'}
              </ConfirmButton>
            </ButtonGroup>
          </Form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ReversalModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
`;

const ModalContent = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-grey-900);
  margin: 0;
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
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;

  &:hover {
    background: var(--color-grey-100);
    color: var(--color-grey-900);
  }
`;

const ModalBody = styled.div`
  padding: var(--spacing-lg);
`;

const WarningBox = styled.div`
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-orange-50);
  border: 1px solid var(--color-orange-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  color: var(--color-orange-900);

  svg {
    font-size: var(--font-size-xl);
    flex-shrink: 0;
    margin-top: 2px;
  }

  div {
    flex: 1;

    strong {
      display: block;
      margin-bottom: var(--spacing-xs);
    }

    p {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-grey-700);
`;

const Required = styled.span`
  color: var(--color-red-600);
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--color-blue-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const HelpText = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
`;

const ErrorMessage = styled.div`
  color: var(--color-red-600);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-md);
`;

const CancelButton = styled(Button)`
  background: var(--color-grey-100);
  color: var(--color-grey-700);

  &:hover:not(:disabled) {
    background: var(--color-grey-200);
  }
`;

const ConfirmButton = styled(Button)`
  background: var(--color-orange-600);
  color: var(--color-white-0);

  &:hover:not(:disabled) {
    background: var(--color-orange-700);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

