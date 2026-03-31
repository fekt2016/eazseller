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
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
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
  padding: 1rem;
  border-bottom: 1px solid #F1EFE8;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
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
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #F9F8F5;
    color: #111827;
  }
`;

const ModalBody = styled.div`
  padding: 1rem;
`;

const WarningBox = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  border-radius: 9px;
  margin-bottom: 1rem;
  color: #7C2D12;

  svg {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  div {
    flex: 1;

    strong {
      display: block;
      margin-bottom: 1rem;
    }

    p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const Required = styled.span`
  color: #DC2626;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #F9F8F5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #D1D5DB;
  }
`;

const HelpText = styled.span`
  font-size: 0.8rem;
  color: #9CA3AF;
`;

const ErrorMessage = styled.div`
  color: #DC2626;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CancelButton = styled(Button)`
  background: #F9F8F5;
  color: #374151;

  &:hover:not(:disabled) {
    background: #F1EFE8;
  }
`;

const ConfirmButton = styled(Button)`
  background: #E8920A;
  color: #FFFFFF;

  &:hover:not(:disabled) {
    background: #C2410C;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

