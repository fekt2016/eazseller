import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaEnvelope, FaSearch, FaUser, FaShoppingBag } from "react-icons/fa";
import couponApi from "../../services/couponApi";
import LoadingSpinner from "../LoadingSpinner";

const SendCouponModal = ({ couponCode, batchId, onClose }) => {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch eligible buyers when modal opens
  useEffect(() => {
    const fetchBuyers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await couponApi.getEligibleBuyers();
        const buyersList = response?.data?.buyers || [];
        setBuyers(buyersList);
        setFilteredBuyers(buyersList);
      } catch (err) {
        console.error("Error fetching eligible buyers:", err);
        setError("Failed to load buyers. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyers();
  }, []);

  // Filter buyers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBuyers(buyers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = buyers.filter(
      (buyer) =>
        buyer.name?.toLowerCase().includes(term) ||
        buyer.email?.toLowerCase().includes(term)
    );
    setFilteredBuyers(filtered);
  }, [searchTerm, buyers]);

  const handleSendEmail = async () => {
    if (!selectedBuyer) {
      setError("Please select a buyer");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      await couponApi.sendCouponEmail({
        buyerId: selectedBuyer._id,
        couponCode,
        batchId,
        message: message.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error sending coupon email:", err);
      setError(
        err.response?.data?.message || "Failed to send email. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            <FaEnvelope /> Send Coupon via Email
          </Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          {/* Coupon Preview */}
          <CouponPreview>
            <PreviewLabel>Coupon Code:</PreviewLabel>
            <CouponCodeBox>{couponCode}</CouponCodeBox>
          </CouponPreview>

          {/* Buyer Selection */}
          <Section>
            <SectionLabel>Select Buyer *</SectionLabel>
            {isLoading ? (
              <LoadingState>
                <LoadingSpinner />
                <p>Loading buyers...</p>
              </LoadingState>
            ) : buyers.length === 0 ? (
              <EmptyState>
                <p>No eligible buyers found.</p>
                <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                  Buyers who have ordered from you or follow you will appear here.
                </p>
              </EmptyState>
            ) : (
              <>
                <SearchContainer>
                  <SearchIcon />
                  <SearchInput
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>

                <BuyersList>
                  {filteredBuyers.length === 0 ? (
                    <EmptyState>
                      <p>No buyers match your search.</p>
                    </EmptyState>
                  ) : (
                    filteredBuyers.map((buyer) => (
                      <BuyerItem
                        key={buyer._id}
                        selected={selectedBuyer?._id === buyer._id}
                        onClick={() => setSelectedBuyer(buyer)}
                      >
                        <BuyerInfo>
                          <BuyerName>{buyer.name || "No name"}</BuyerName>
                          <BuyerEmail>{buyer.email}</BuyerEmail>
                        </BuyerInfo>
                        <BuyerType type={buyer.type}>
                          {buyer.type === "ordered" ? (
                            <>
                              <FaShoppingBag /> Customer
                            </>
                          ) : (
                            <>
                              <FaUser /> Follower
                            </>
                          )}
                        </BuyerType>
                      </BuyerItem>
                    ))
                  )}
                </BuyersList>
              </>
            )}
          </Section>

          {/* Optional Message */}
          <Section>
            <SectionLabel>Personal Message (Optional)</SectionLabel>
            <MessageTextarea
              placeholder="Add a personal message to include in the email..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <CharCount>{message.length}/500</CharCount>
          </Section>

          {/* Error/Success Messages */}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <SuccessMessage>
              ✅ Coupon email sent successfully!
            </SuccessMessage>
          )}

          {/* Action Buttons */}
          <ActionButtons>
            <CancelButton onClick={onClose} disabled={isSending}>
              Cancel
            </CancelButton>
            <SendButton
              onClick={handleSendEmail}
              disabled={!selectedBuyer || isSending || isLoading}
            >
              {isSending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Sending...
                </>
              ) : (
                <>
                  <FaEnvelope /> Send Email
                </>
              )}
            </SendButton>
          </ActionButtons>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CouponPreview = styled.div`
  background: #f0f9ff;
  border: 2px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
`;

const PreviewLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
`;

const CouponCodeBox = styled.div`
  font-family: "Courier New", monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e40af;
  letter-spacing: 2px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const BuyersList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
`;

const BuyerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ selected }) => (selected ? "#dbeafe" : "white")};
  border-bottom: 1px solid #e5e7eb;

  &:hover {
    background: ${({ selected }) => (selected ? "#bfdbfe" : "#f3f4f6")};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const BuyerInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BuyerName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
`;

const BuyerEmail = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const BuyerType = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  background: ${({ type }) =>
    type === "ordered" ? "#d1fae5" : "#e0e7ff"};
  color: ${({ type }) => (type === "ordered" ? "#065f46" : "#3730a3")};
`;

const MessageTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CharCount = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: right;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  color: #065f46;
  font-size: 14px;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default SendCouponModal;

