import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { SkeletonTableRows } from '../components/ui/LoadingComponents';

import {
  FaSearch,
  FaEnvelope,
  FaPlus,
  FaCopy,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import { formatDate } from '../utils/helpers';
import { useGetSellerCoupon, useDeleteCoupon } from '../hooks/useCoupon';
import CouponBatchModal from "./modal/CouponBatchModal";
import SendCouponModal from "./modal/SendCouponModal";
import { toast } from 'react-toastify';
import { ConfirmationModal } from './modal/ConfirmationModal';

const CouponTab = ({
  couponSearchTerm,
  setCouponSearchTerm,
  isActiveTab = true,
}) => {
  // Open SendCouponModal
  const openSendCouponModal = (couponCode, batchId) => {
    setSendCouponModal({ couponCode, batchId });
  };
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedBatchId, setCopiedBatchId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeStatus, setActiveStatus] = useState("all");
  const [sendCouponModal, setSendCouponModal] = useState(null);

  // Reset modal state when tab becomes inactive
  useEffect(() => {
    if (!isActiveTab) {
      setIsModalOpen(false);
      setSelectedBatch(null);
    }
  }, [isActiveTab]);

  // Use the hook to fetch coupon data
  const { data: couponData, isLoading } = useGetSellerCoupon();
  const { couponDeleteMutation } = useDeleteCoupon();
  console.log("couponData", couponData);

  // Extract coupon batches from API response
  const couponBatches = useMemo(() => {
    return couponData?.data?.batches || [];
  }, [couponData]);

  const toggleBatch = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const handleCopyCode = (code, batchId) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setCopiedBatchId(batchId);
    setTimeout(() => {
      setCopiedCode(null);
      setCopiedBatchId(null);
    }, 2000);
  };

  const handleCopyBatch = (batch) => {
    const couponCodes = batch.coupons.map((coupon) => coupon.code).join("\n");
    navigator.clipboard.writeText(couponCodes);
    setCopiedBatchId(batch._id);
    setTimeout(() => setCopiedBatchId(null), 2000);
  };

  const [batchToDelete, setBatchToDelete] = useState(null);

  const handleDeleteBatch = async (batchId) => {
    setBatchToDelete(batchId);
  };

  const handleConfirmDeleteBatch = async () => {
    const batchId = batchToDelete;
    setBatchToDelete(null);
    try {
      couponDeleteMutation(batchId);
    } catch (error) {
      console.error("Failed to delete batch:", error);
      toast.error("Failed to delete batch. Please try again.");
    }
  };

  const openCreateModal = () => {
    setSelectedBatch(null);
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBatch(null);
  };
  const filteredBatches = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return couponBatches.filter((batch) => {
      const validFrom = new Date(batch.validFrom).toISOString().split("T")[0];
      const expiresAt = new Date(batch.expiresAt).toISOString().split("T")[0];

      // Determine batch status
      const isActive = today >= validFrom && today <= expiresAt;
      const isUpcoming = today < validFrom;
      const isExpired = today > expiresAt;

      // Status filtering
      if (activeStatus !== "all") {
        if (activeStatus === "active" && !isActive) return false;
        if (activeStatus === "inactive" && (isUpcoming || isExpired))
          return false;
        if (activeStatus === "upcoming" && !isUpcoming) return false;
        if (activeStatus === "expired" && !isExpired) return false;
      }

      // Search term filtering
      if (couponSearchTerm) {
        const term = couponSearchTerm.toLowerCase();
        if (
          !batch.name.toLowerCase().includes(term) &&
          !batch.code.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [couponBatches, activeStatus, couponSearchTerm]);

  return (
    <Container>
      <Header>
        <ControlsContainer>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search coupon by name or code..."
              value={couponSearchTerm}
              onChange={(e) => setCouponSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FilterContainer>
            <StatusSelect
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </StatusSelect>
          </FilterContainer>
        </ControlsContainer>
        <CreateButton onClick={openCreateModal}>
          <FaPlus /> Create Coupon Batch
        </CreateButton>
      </Header>

      {isLoading ? (
        <SkeletonTableRows count={6} />
      ) : filteredBatches.length === 0 ? (
        <EmptyState>
          <h3>No coupon batches found</h3>
          <p>Try creating your first batch</p>
          <CreateButton onClick={openCreateModal}>
            <FaPlus /> Create Coupon Batch
          </CreateButton>
        </EmptyState>
      ) : (
        <BatchesContainer>
          {filteredBatches.map((batch) => (
            <BatchCard key={batch._id}>
              <BatchHeader onClick={() => toggleBatch(batch._id)}>
                <HeaderContent>
                  <BatchName>
                    {batch.name}
                    {expandedBatch === batch._id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </BatchName>

                  <BatchInfo>
                    <InfoItem>
                      <Label>Created:</Label>
                      <Value>{formatDate(batch.createdAt)}</Value>
                    </InfoItem>
                    <InfoItem>
                      <Label>Valid:</Label>
                      <Value>
                        {formatDate(batch.validFrom)} -{" "}
                        {formatDate(batch.expiresAt)}
                      </Value>
                    </InfoItem>
                  </BatchInfo>
                </HeaderContent>

                <BatchActions>
                  <BatchDiscount>
                    {batch.discountType === "percentage"
                      ? `${batch.discountValue}% Off`
                      : `GH₵${batch.discountValue} Off`}
                  </BatchDiscount>

                  <ActionButton
                    title="Edit batch"
                    onClick={(e) => {
                      console.log("batch", batch);
                      e.stopPropagation();
                      openEditModal(batch);
                    }}
                  >
                    <FaEdit />
                  </ActionButton>

                  <ActionButton
                    title="Delete batch"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBatch(batch._id);
                    }}
                  >
                    <FaTrash />
                  </ActionButton>
                </BatchActions>
              </BatchHeader>

              {expandedBatch === batch._id && (
                <BatchDetails>
                  <StatsContainer>
                    <StatItem>
                      <StatLabel>Total Coupons</StatLabel>
                      <StatValue>{batch.coupons.length}</StatValue>
                    </StatItem>

                    <StatItem>
                      <StatLabel>Used</StatLabel>
                      <StatValue>
                        {batch.coupons.filter((c) => c.used).length}
                      </StatValue>
                    </StatItem>

                    <StatItem>
                      <StatLabel>Max Usage</StatLabel>
                      <StatValue>{batch.maxUsage || "Unlimited"}</StatValue>
                    </StatItem>

                    <BatchActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyBatch(batch);
                      }}
                    >
                      <FaCopy />
                      {copiedBatchId === batch._id ? "Copied!" : "Copy All"}
                    </BatchActionButton>
                  </StatsContainer>

                  <CouponsGrid>
                    {batch.coupons.map((coupon) => (
                      <CouponCard key={coupon._id} used={coupon.used} sent={!!coupon.recipient}>
                        <CouponHeader>
                          <CouponCode>
                            {coupon.code}
                            {coupon.used && coupon.recipient ? (
                              <UsedBadge title="Coupon has been used by a buyer">
                                <FaCheckCircle /> Used
                              </UsedBadge>
                            ) : coupon.recipient ? (
                              <SentBadge title="Coupon has been sent to a buyer">
                                <FaCheckCircle /> Sent
                              </SentBadge>
                            ) : null}
                          </CouponCode>
                          <CouponStatus used={coupon.used}>
                            {coupon.used ? "Used" : "Active"}
                          </CouponStatus>
                        </CouponHeader>

                        <CouponActions>
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(coupon.code, batch._id);
                            }}
                            copied={
                              copiedCode === coupon.code &&
                              copiedBatchId === batch._id
                            }
                          >
                            <FaCopy />
                            {copiedCode === coupon.code &&
                              copiedBatchId === batch._id
                              ? "Copied!"
                              : "Copy"}
                          </ActionButton>

                          {/* Hide share button if coupon is used (single-use) or has reached maxUsage */}
                          {!(coupon.used && batch.maxUsage === 1) &&
                            !(coupon.usageCount >= batch.maxUsage) && (
                              <ActionButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSendCouponModal(coupon.code, batch._id);
                                }}
                              >
                                <FaEnvelope /> Share
                              </ActionButton>
                            )}
                        </CouponActions>
                      </CouponCard>
                    ))}
                  </CouponsGrid>
                </BatchDetails>
              )}
            </BatchCard>
          ))}
        </BatchesContainer>
      )}

      {isModalOpen && (
        <CouponBatchModal
          isOpen={isModalOpen}
          onClose={closeModal}
          batch={selectedBatch}
        />
      )}

      {sendCouponModal && (
        <SendCouponModal
          couponCode={sendCouponModal.couponCode}
          batchId={sendCouponModal.batchId}
          onClose={() => setSendCouponModal(null)}
        />
      )}

      <ConfirmationModal
        isOpen={!!batchToDelete}
        onClose={() => setBatchToDelete(null)}
        onConfirm={handleConfirmDeleteBatch}
        title="Delete Coupon Batch"
        message="Are you sure you want to delete this coupon batch? This action cannot be undone."
        confirmText="Delete"
        confirmColor="#ef4444"
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
`;

const ControlsContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 0.8rem;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 0.9rem 0 2.2rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  background: #F9F8F5;
  color: #111827;
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: #9CA3AF; }
  &:focus { border-color: #E8920A; background: #FFFFFF; }
`;

const FilterContainer = styled.div``;

const StatusSelect = styled.select`
  height: 36px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.8rem;
  color: #374151;
  background: #FFFFFF;
  cursor: pointer;
  outline: none;

  &:focus { border-color: #E8920A; }
`;

const CreateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 36px;
  padding: 0 1rem;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.12s;

  &:hover { opacity: 0.88; }
`;

const EmptyState = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  h3 {
    font-size: 0.975rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  p {
    font-size: 0.8rem;
    color: #9CA3AF;
    margin: 0 0 0.75rem;
  }
`;

const BatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BatchCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const StatusButton = styled.button`
  height: 30px;
  padding: 0 0.85rem;
  border-radius: 20px;
  font-size: 0.775rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  border: 0.5px solid ${({ active }) => active ? '#E8920A' : '#F1EFE8'};
  background: ${({ active }) => active ? '#FDF3E3' : '#FFFFFF'};
  color: ${({ active }) => active ? '#E8920A' : '#6B7280'};

  &:hover { border-color: #E8920A; color: #E8920A; }
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: #FFFDF9; }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const BatchName = styled.h3`
  font-size: 0.925rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.3rem;

  svg { color: #9CA3AF; font-size: 0.75rem; flex-shrink: 0; }
`;

const BatchInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.775rem;
  color: #9CA3AF;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Label = styled.span`
  font-weight: 500;
  color: #6B7280;
`;

const Value = styled.span`
  color: #9CA3AF;
`;

const BatchDiscount = styled.div`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.65rem;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 20px;
  font-size: 0.775rem;
  font-weight: 600;
  white-space: nowrap;
  margin-right: 0.5rem;
`;

const BatchActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const BatchDetails = styled.div`
  padding: 1rem 1.25rem;
  background: #FAFAF9;
  border-top: 0.5px solid #F1EFE8;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 0.5px solid #F1EFE8;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 8px;
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: #9CA3AF;
`;

const StatValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
`;

const BatchActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 30px;
  padding: 0 0.85rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 8px;
  color: #374151;
  font-size: 0.775rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { border-color: #E8920A; color: #E8920A; background: #FDF3E3; }
`;

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const CouponCard = styled.div`
  border: 0.5px solid ${({ used, sent }) =>
    used ? '#FEE2E2' : sent ? '#D1FAE5' : '#F1EFE8'};
  background: ${({ used, sent }) =>
    used ? '#FFF5F5' : sent ? '#F0FDF4' : '#FFFFFF'};
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CouponHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
`;

const CouponCode = styled.div`
  font-family: ui-monospace, 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #E8920A;
  word-break: break-all;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const SentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #059669;
  background: #D1FAE5;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;

  svg { font-size: 0.65rem; }
`;

const UsedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #B91C1C;
  background: #FEE2E2;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;

  svg { font-size: 0.65rem; }
`;

const CouponStatus = styled.div`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
  background: ${({ used }) => used ? '#FEE2E2' : '#D1FAE5'};
  color: ${({ used }) => used ? '#991B1B' : '#065F46'};
`;

const CouponActions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 30px;
  padding: ${({ copied }) => copied !== undefined ? '0 0.7rem' : '0'};
  min-width: ${({ copied }) => copied !== undefined ? 'auto' : '30px'};
  flex: ${({ copied }) => copied !== undefined ? 1 : 'none'};
  border-radius: 8px;
  border: 0.5px solid ${({ copied }) => copied ? '#A7F3D0' : '#F1EFE8'};
  background: ${({ copied }) => copied ? '#D1FAE5' : '#FFFFFF'};
  color: ${({ copied }) => copied ? '#065F46' : '#6B7280'};
  font-size: 0.775rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    border-color: #E8920A;
    background: ${({ copied }) => copied ? '#A7F3D0' : '#FDF3E3'};
    color: ${({ copied }) => copied ? '#065F46' : '#E8920A'};
  }
`;

export default CouponTab;
