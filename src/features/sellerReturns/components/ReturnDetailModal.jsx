import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaShoppingCart, FaUser, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { formatDate } from '../../../shared/utils/helpers';
import ApproveRejectReturnButtons from './ApproveRejectReturnButtons';

// Helper to format currency with GHS symbol
const formatGHS = (value) => {
  return `GH₵${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Return Detail Modal Component
 * Displays full return details in a modal
 */
const ReturnDetailModal = ({
  returnItem,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}) => {
  if (!returnItem) return null;

  const refundAmount = returnItem.refundAmount || returnItem.amount || 0;
  const isApproved = returnItem.status === 'APPROVED' || returnItem.status === 'REFUNDED';
  const isRejected = returnItem.status === 'REJECTED';

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
          >
            <ModalHeader>
              <ModalTitle>Return Details</ModalTitle>
              <CloseButton onClick={onClose} aria-label="Close">
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalContent>
              {/* Return Status Banner */}
              {isApproved && (
                <StatusBanner $type="success">
                  <strong>Return Approved</strong>
                  <p>Refund of {formatGHS(refundAmount)} will be deducted from your next payout.</p>
                </StatusBanner>
              )}

              {isRejected && (
                <StatusBanner $type="error">
                  <strong>Return Rejected</strong>
                  {returnItem.rejectionReason && (
                    <p>Reason: {returnItem.rejectionReason}</p>
                  )}
                </StatusBanner>
              )}

              {/* Order Information */}
              <InfoSection>
                <SectionTitle>
                  <FaShoppingCart /> Order Information
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Order ID:</InfoLabel>
                    <InfoValue>
                      #{returnItem.order?.orderNumber || returnItem.orderId?.slice(-8) || 'N/A'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Order Date:</InfoLabel>
                    <InfoValue>{formatDate(returnItem.order?.createdAt || returnItem.orderDate)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Product:</InfoLabel>
                    <InfoValue>{returnItem.product?.name || returnItem.productName || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Quantity:</InfoLabel>
                    <InfoValue>{returnItem.quantity || 1}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoSection>

              {/* Buyer Information */}
              <InfoSection>
                <SectionTitle>
                  <FaUser /> Buyer Information
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Name:</InfoLabel>
                    <InfoValue>{returnItem.buyer?.name || returnItem.user?.name || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Email:</InfoLabel>
                    <InfoValue>{returnItem.buyer?.email || returnItem.user?.email || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Phone:</InfoLabel>
                    <InfoValue>{returnItem.buyer?.phone || returnItem.user?.phone || 'N/A'}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoSection>

              {/* Return Details */}
              <InfoSection>
                <SectionTitle>
                  <FaCalendarAlt /> Return Details
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Return Status:</InfoLabel>
                    <StatusBadge $status={returnItem.status?.toLowerCase()}>
                      {returnItem.status || 'PENDING'}
                    </StatusBadge>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Date Requested:</InfoLabel>
                    <InfoValue>{formatDate(returnItem.createdAt)}</InfoValue>
                  </InfoItem>
                  <InfoItem $fullWidth>
                    <InfoLabel>Return Reason:</InfoLabel>
                    <ReasonBox>{returnItem.reason || 'No reason provided'}</ReasonBox>
                  </InfoItem>
                  {returnItem.description && (
                    <InfoItem $fullWidth>
                      <InfoLabel>Additional Notes:</InfoLabel>
                      <ReasonBox>{returnItem.description}</ReasonBox>
                    </InfoItem>
                  )}
                </InfoGrid>
              </InfoSection>

              {/* Refund Information */}
              <InfoSection>
                <SectionTitle>
                  <FaDollarSign /> Refund Information
                </SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Refund Amount:</InfoLabel>
                    <RefundAmount>{formatGHS(refundAmount)}</RefundAmount>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Original Amount:</InfoLabel>
                    <InfoValue>
                      {formatGHS(returnItem.order?.totalPrice || returnItem.originalAmount || 0)}
                    </InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoSection>

              {/* Photos */}
              {returnItem.photos && returnItem.photos.length > 0 && (
                <InfoSection>
                  <SectionTitle>
                    <FaImage /> Return Photos
                  </SectionTitle>
                  <PhotoGrid>
                    {returnItem.photos.map((photo, index) => (
                      <PhotoItem key={index}>
                        <PhotoImage src={photo} alt={`Return photo ${index + 1}`} />
                      </PhotoItem>
                    ))}
                  </PhotoGrid>
                </InfoSection>
              )}

              {/* Action Buttons */}
              {returnItem.status === 'PENDING' && (
                <ApproveRejectReturnButtons
                  onApprove={() => onApprove(returnItem)}
                  onReject={() => onReject(returnItem)}
                  isApproving={isApproving}
                  isRejecting={isRejecting}
                />
              )}
            </ModalContent>
          </ModalContainer>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReturnDetailModal;

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

const ModalContainer = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1001;
  display: flex;
  flex-direction: column;
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
  font-size: var(--font-size-xl);
  font-weight: var(--font-semibold);
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

const StatusBanner = styled.div`
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  background-color: ${({ $type }) =>
    $type === 'success' ? 'var(--color-green-50)' : 'var(--color-red-50)'};
  border: 1px solid
    ${({ $type }) => ($type === 'success' ? 'var(--color-green-200)' : 'var(--color-red-200))')};

  strong {
    display: block;
    color: ${({ $type }) =>
      $type === 'success' ? 'var(--color-green-800)' : 'var(--color-red-800)'};
    margin-bottom: var(--spacing-xs);
  }

  p {
    margin: 0;
    color: ${({ $type }) =>
      $type === 'success' ? 'var(--color-green-700)' : 'var(--color-red-700)'};
    font-size: var(--font-size-sm);
  }
`;

const InfoSection = styled.div`
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-md) 0;

  svg {
    color: var(--color-primary-500);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};
`;

const InfoLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
`;

const InfoValue = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-900);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  white-space: nowrap;
  width: fit-content;

  background-color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return 'var(--color-green-100)';
      case 'pending':
        return 'var(--color-yellow-100)';
      case 'rejected':
        return 'var(--color-red-100)';
      default:
        return 'var(--color-grey-100)';
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return 'var(--color-green-700)';
      case 'pending':
        return 'var(--color-yellow-700)';
      case 'rejected':
        return 'var(--color-red-700)';
      default:
        return 'var(--color-grey-700)';
    }
  }};
`;

const ReasonBox = styled.div`
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  font-size: var(--font-size-sm);
  color: var(--color-grey-900);
  line-height: 1.6;
  white-space: pre-wrap;
`;

const RefundAmount = styled.span`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
`;

const PhotoItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--color-grey-200);
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform var(--transition-base);

  &:hover {
    transform: scale(1.05);
  }
`;

