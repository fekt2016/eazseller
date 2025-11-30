// CouponBatchModal.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaPercentage, FaDollarSign } from "react-icons/fa";
import { useCreateCoupon, useUpdateCoupon } from '../../hooks/useCoupon';

const CouponBatchModal = ({ batch, onClose }) => {
  // Initialize form data based on whether we're creating or editing
  const [formData, setFormData] = useState({
    name: "",
    discountType: "percentage",
    discountValue: 0,
    quantity: 1,
    validFrom: "",
    expiresAt: "",
    maxUsage: 1,
  });

  // Update form data when batch changes (edit mode)
  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || "",
        discountType: batch.discountType || "percentage",
        discountValue: batch.discountValue || 0,
        quantity: batch.quantity || 1,
        validFrom: formatDateForInput(batch.validFrom) || "",
        expiresAt: formatDateForInput(batch.expiresAt) || "",
        maxUsage: batch.maxUsage || 1,
      });
    } else {
      // Reset to defaults for create mode
      setFormData({
        name: "",
        discountType: "percentage",
        discountValue: 0,
        quantity: 1,
        validFrom: "",
        expiresAt: "",
        maxUsage: 1,
      });
    }
  }, [batch]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const { createMutation } = useCreateCoupon();
  const { updateMutation } = useUpdateCoupon();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "discountValue" || name === "maxUsage"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (batch) {
      // Edit mode
      updateMutation({ id: batch._id, ...formData });
    } else {
      // Create mode
      createMutation(formData);
    }

    onClose();
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>{batch ? "Edit Coupon Batch" : "Create Coupon Batch"}</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Label>Batch Name</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter batch name"
            required
          />

          <Label>Discount Type</Label>
          <Select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </Select>

          <Label>Discount Value</Label>
          <Input
            name="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={handleChange}
            placeholder={
              formData.discountType === "percentage" ? "e.g. 10" : "e.g. 5"
            }
            required
          />

          <Label>Quantity</Label>
          <Input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            min={1}
            required
            disabled={!!batch} // Disable for edits
          />

          <Label>Valid From</Label>
          <Input
            name="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={handleChange}
            required
          />

          <Label>Expires At</Label>
          <Input
            name="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={handleChange}
            required
          />

          <Label>Max Usage Per Coupon</Label>
          <Input
            name="maxUsage"
            type="number"
            value={formData.maxUsage}
            onChange={handleChange}
            placeholder="e.g. 1"
            min={1}
          />

          <SubmitButton type="submit">
            {batch ? "Update Batch" : "Create Batch"}
          </SubmitButton>
        </Form>
      </Modal>
    </Overlay>
  );
};

// ... (styled components remain the same) ...

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: white;
  padding: 24px;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const SubmitButton = styled.button`
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

export default CouponBatchModal;
