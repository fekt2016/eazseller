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
  const [showApproveChoice, setShowApproveChoice] = useState(false);
  const [resolutionType, setResolutionType] = useState('refund');
  const [resolutionNote, setResolutionNote] = useState('');

  const handleApprove = () => {
    if (showApproveChoice) {
      onApprove({ resolutionType, resolutionNote: resolutionType === 'replacement' ? resolutionNote : undefined });
      setShowApproveChoice(false);
      setResolutionNote('');
    } else {
      setShowApproveChoice(true);
    }
  };

  const handleApproveChoice = (type) => {
    setResolutionType(type);
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
      ) : showApproveChoice ? (
        <ApproveChoiceForm>
          <FormLabel>How do you want to resolve this return?</FormLabel>
          <ChoiceRow>
            <ChoiceButton
              type="button"
              $active={resolutionType === 'refund'}
              onClick={() => handleApproveChoice('refund')}
            >
              Approve for refund
            </ChoiceButton>
            <ChoiceButton
              type="button"
              $active={resolutionType === 'replacement'}
              onClick={() => handleApproveChoice('replacement')}
            >
              Offer replacement (new item)
            </ChoiceButton>
          </ChoiceRow>
          {resolutionType === 'replacement' && (
            <>
              <FormLabel>Optional note (e.g. when you will ship the replacement)</FormLabel>
              <StyledTextarea
                rows={2}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. I will ship the replacement within 3 business days"
              />
            </>
          )}
          <FormActions>
            <Button variant="outline" size="md" onClick={() => setShowApproveChoice(false)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? 'Submitting...' : 'Confirm'}
              <FaCheck />
            </Button>
          </FormActions>
        </ApproveChoiceForm>
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
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F1EFE8;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const ApproveChoiceForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChoiceRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ChoiceButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 1rem;
  border: 2px solid ${(p) => (p.$active ? '#E8920A' : '#E5E7EB')};
  border-radius: 9px;
  background: ${(p) => (p.$active ? '#FFFDF9' : '#FFFFFF')};
  color: ${(p) => (p.$active ? '#D97706' : '#374151')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
  &:hover {
    border-color: #E8920A;
    background: #FFFDF9;
  }
`;

const RejectForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
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
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.9rem;
  
  color: #111827;
  background-color: #FFFFFF;
  transition: all 0.12s;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #FEF3C7;
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

