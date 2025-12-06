import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaSearch,
  FaEnvelope,
  FaPlus,
  FaCopy,
  FaSpinner,
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

  const handleDeleteBatch = async (batchId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this coupon batch? This action cannot be undone."
      )
    ) {
      try {
        couponDeleteMutation(batchId);
      } catch (error) {
        console.error("Failed to delete batch:", error);
        alert("Failed to delete batch. Please try again.");
      }
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
        <LoadingState>
          <Spinner />
          <p>Loading coupons...</p>
        </LoadingState>
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
    </Container>
  );
};

// Styled Components
const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  padding: 24px;
  background-color: #f9fafb;
  min-height: calc(100vh - 64px);
`;

const Header = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const StatusFilter = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;
const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 500px;
  min-width: 250px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 42px;

  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Spinner = styled(FaSpinner)`
  font-size: 3rem;
  animation: ${spinAnimation} 1s linear infinite;
  margin-bottom: 24px;
  color: #3b82f6;
`;
const FilterContainer = styled.div`
  position: relative;
`;

const StatusSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  height: 42px;
  appearance: none;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1f2937;
  }

  p {
    color: #6b7280;
    margin-bottom: 30px;
    font-size: 1.05rem;
  }
`;

const BatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BatchCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
  }
`;
const StatusButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background-color: ${({ active }) => (active ? "#dbeafe" : "#f3f4f6")};
  color: ${({ active }) => (active ? "#1d4ed8" : "#4b5563")};

  &:hover {
    background-color: #e5e7eb;
  }
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const BatchName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const BatchInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  color: #6b7280;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Label = styled.span`
  font-weight: 600;
  color: #4b5563;
`;

const Value = styled.span`
  color: #6b7280;
`;

const BatchDiscount = styled.div`
  padding: 8px 16px;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 24px;
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  margin-right: 10px;
`;

const BatchActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const BatchDetails = styled.div`
  padding: 24px;
  background: #fff;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f1f5f9;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  min-width: 160px;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @media (max-width: 480px) {
    min-width: 100%;
  }
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const StatValue = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
`;

const BatchActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #e0f2fe;
  color: #0369a1;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #bae6fd;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CouponCard = styled.div`
  border: 1px solid ${({ used, sent }) => 
    used ? "#fecaca" : sent ? "#a7f3d0" : "#bfdbfe"};
  background: ${({ used, sent }) => 
    used ? "#fef2f2" : sent ? "#f0fdf4" : "#f0f9ff"};
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CouponHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const CouponCode = styled.div`
  font-family: "Courier New", monospace;
  font-size: 17px;
  font-weight: 700;
  color: #1e40af;
  word-break: break-all;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: #d1fae5;
  padding: 4px 8px;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  white-space: nowrap;
  
  svg {
    font-size: 12px;
  }
`;

const UsedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #b91c1c;
  background: #fee2e2;
  padding: 4px 8px;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  white-space: nowrap;
  
  svg {
    font-size: 12px;
  }
`;

const CouponStatus = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${({ used }) => (used ? "#fee2e2" : "#d1fae5")};
  color: ${({ used }) => (used ? "#b91c1c" : "#065f46")};
  margin-left: 10px;
  flex-shrink: 0;
`;

const CouponActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;

  @media (max-width: 380px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 8px;
  background: ${({ copied }) => (copied ? "#10b981" : "white")};
  border: 1px solid ${({ copied }) => (copied ? "#10b981" : "#e5e7eb")};
  color: ${({ copied }) => (copied ? "white" : "#4b5563")};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 600;
  flex: 1;

  &:hover {
    background: ${({ copied }) => (copied ? "#059669" : "#f3f4f6")};
    border-color: ${({ copied }) => (copied ? "#059669" : "#d1d5db")};
  }

  &:last-child {
    background: ${({ copied }) => (copied ? "#10b981" : "#eff6ff")};
    border-color: ${({ copied }) => (copied ? "#10b981" : "#dbeafe")};
    color: ${({ copied }) => (copied ? "white" : "#1d4ed8")};

    &:hover {
      background: ${({ copied }) => (copied ? "#059669" : "#dbeafe")};
    }
  }
`;

export default CouponTab;
