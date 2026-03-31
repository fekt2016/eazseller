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
  const statusUpper = (returnItem.status || '').toUpperCase();
  const isApproved = statusUpper === 'APPROVED' || statusUpper === 'REFUNDED' || statusUpper === 'COMPLETED';
  const isRejected = statusUpper === 'REJECTED';

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
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

              {/* Action Buttons - show when return is not yet approved or rejected */}
              {!isApproved && !isRejected && (
                <ApproveRejectReturnButtons
                  onApprove={(payload) => onApprove(returnItem, payload)}
                  onReject={(payload) => onReject(returnItem, payload)}
                  isApproving={isApproving}
                  isRejecting={isRejecting}
                />
              )}
            </ModalContent>
          </ModalContainer>
        </Overlay>
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
`;

const ModalContainer = styled(motion.div)`
  width: 90%;
  max-width: 800px;
  max-height: min(90vh, calc(100vh - 4rem));
  background: #FFFFFF;
  border-radius: 12px;
  
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: auto;

  @media (max-width: 768px) {
    width: 95%;
    max-height: min(95vh, calc(100vh - 4rem));
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
  font-size: 1.25rem;
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

const StatusBanner = styled.div`
  padding: 1rem;
  border-radius: 9px;
  margin-bottom: 1rem;
  background-color: ${({ $type }) =>
    $type === 'success' ? '#3B6D11' : '#FCEBEB'};
  border: 1px solid
    ${({ $type }) => ($type === 'success' ? '#BBF7D0' : '#FECACA')};

  strong {
    display: block;
    color: ${({ $type }) =>
      $type === 'success' ? '#3B6D11' : '#A32D2D'};
    margin-bottom: 1rem;
  }

  p {
    margin: 0;
    color: ${({ $type }) =>
      $type === 'success' ? '#3B6D11' : '#A32D2D'};
    font-size: 0.875rem;
  }
`;

const InfoSection = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F1EFE8;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;

  svg {
    color: #E8920A;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #111827;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1rem 1rem;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  width: fit-content;

  background-color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return '#DCFCE7';
      case 'pending':
        return '#FAEEDA';
      case 'rejected':
        return '#FCEBEB';
      default:
        return '#F9F8F5';
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return '#3B6D11';
      case 'pending':
        return '#854F0B';
      case 'rejected':
        return '#A32D2D';
      default:
        return '#374151';
    }
  }};
`;

const ReasonBox = styled.div`
  padding: 1rem;
  background: #F9F8F5;
  border-radius: 9px;
  border: 1px solid #F1EFE8;
  font-size: 0.875rem;
  color: #111827;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const RefundAmount = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #E8920A;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const PhotoItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 9px;
  overflow: hidden;
  border: 1px solid #F1EFE8;
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.12s;

  &:hover {
    transform: scale(1.05);
  }
`;

