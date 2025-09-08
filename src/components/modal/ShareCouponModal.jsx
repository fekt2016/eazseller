import React from "react";
import styled from "styled-components";
import { FaTimes, FaCopy, FaShareAlt } from "react-icons/fa";

const ShareCouponModal = ({ couponCode, onClose }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <h2>Share Coupon</h2>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <Label>Coupon Code:</Label>
          <CouponBox>
            <Code>{couponCode}</Code>
            <IconButton onClick={handleCopy} title="Copy to clipboard">
              <FaCopy />
            </IconButton>
          </CouponBox>

          <Label>Share via:</Label>
          <ShareButtons>
            <ShareButton
              onClick={() =>
                window.open(
                  `https://wa.me/?text=Use this coupon code: ${couponCode}`,
                  "_blank"
                )
              }
              title="Share via WhatsApp"
            >
              <FaShareAlt />
              WhatsApp
            </ShareButton>
            <ShareButton
              onClick={() =>
                window.open(
                  `mailto:?subject=Here's a coupon&body=Use this code: ${couponCode}`,
                  "_blank"
                )
              }
              title="Share via Email"
            >
              <FaShareAlt />
              Email
            </ShareButton>
          </ShareButtons>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    color: #111827;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.div`
  font-weight: 500;
  color: #374151;
`;

const CouponBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: monospace;
`;

const Code = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #4b5563;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    color: #1f2937;
  }
`;

const ShareButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ShareButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

export default ShareCouponModal;
