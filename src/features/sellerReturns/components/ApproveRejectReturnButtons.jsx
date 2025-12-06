import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
// Input is a styled component defined below

/**
 * Approve/Reject Return Buttons Component
 * Handles approval and rejection actions with optional notes
 */
const ApproveRejectReturnButtons = ({
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = () => {
    onApprove();
  };

  const handleReject = () => {
    if (showRejectForm) {
      onReject({ reason: rejectionReason });
      setShowRejectForm(false);
      setRejectionReason('');
    } else {
      setShowRejectForm(true);
    }
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectionReason('');
  };

  return (
    <ActionsContainer>
      {showRejectForm ? (
        <RejectForm>
          <FormLabel>Rejection Reason (Required)</FormLabel>
          <StyledTextarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this return..."
          />
          <FormActions>
            <Button
              variant="outline"
              size="md"
              onClick={handleCancelReject}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
              <FaTimes />
            </Button>
          </FormActions>
        </RejectForm>
      ) : (
        <ButtonGroup>
          <Button
            variant="primary"
            size="md"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? 'Approving...' : 'Approve Return'}
            <FaCheck />
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleReject}
            disabled={isApproving || isRejecting}
          >
            Reject Return
            <FaTimes />
          </Button>
        </ButtonGroup>
      )}
    </ActionsContainer>
  );
};

export default ApproveRejectReturnButtons;

// Styled Components
const ActionsContainer = styled.div`
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const RejectForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const FormLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  margin-bottom: var(--spacing-xs);
`;

const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background-color: var(--color-white-0);
  transition: all var(--transition-base);
  resize: vertical;
  margin-bottom: var(--spacing-sm);

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

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

