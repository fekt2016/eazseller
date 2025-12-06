// CouponBatchModal.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaPercentage, FaDollarSign } from "react-icons/fa";
import { useCreateCoupon, useUpdateCoupon } from '../../hooks/useCoupon';
import LoadingSpinner from '../LoadingSpinner';

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
    maxDiscountAmount: "",
    minOrderAmount: 0,
    maxUsagePerUser: 1,
    sellerFunded: true,
    platformFunded: false,
    stackingAllowed: false,
    isPublic: false, // If false, coupons are private (only visible to recipients). If true, visible to all users.
    applicableProducts: [],
    applicableCategories: [],
  });
  const [showHighDiscountWarning, setShowHighDiscountWarning] = useState(false);

  // Update form data when batch changes (edit mode)
  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || "",
        discountType: batch.discountType || "percentage",
        discountValue: batch.discountValue || 0,
        quantity: batch.quantity || batch.coupons?.length || 1,
        validFrom: formatDateForInput(batch.validFrom) || "",
        expiresAt: formatDateForInput(batch.expiresAt) || "",
        maxUsage: batch.maxUsage || 1,
        maxDiscountAmount: batch.maxDiscountAmount || "",
        minOrderAmount: batch.minOrderAmount || 0,
        maxUsagePerUser: batch.maxUsagePerUser || 1,
        sellerFunded: batch.sellerFunded !== undefined ? batch.sellerFunded : true,
        platformFunded: batch.platformFunded || false,
        stackingAllowed: batch.stackingAllowed || false,
        isPublic: batch.isPublic !== undefined ? batch.isPublic : false,
        applicableProducts: batch.applicableProducts?.map(p => p._id || p) || [],
        applicableCategories: batch.applicableCategories?.map(c => c._id || c) || [],
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
        maxDiscountAmount: "",
        minOrderAmount: 0,
        maxUsagePerUser: 1,
        sellerFunded: true,
        platformFunded: false,
        stackingAllowed: false,
        isPublic: false,
        applicableProducts: [],
        applicableCategories: [],
      });
    }
  }, [batch]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const { createMutation, isLoading: isCreating } = useCreateCoupon();
  const { updateMutation, isLoading: isUpdating } = useUpdateCoupon();
  
  const isLoading = isCreating || isUpdating;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : 
                     (name === "quantity" || name === "discountValue" || name === "maxUsage" || 
                      name === "maxDiscountAmount" || name === "minOrderAmount" || name === "maxUsagePerUser")
                      ? Number(value) : value;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      
      // Show warning for high discounts
      if (name === "discountValue" && updated.discountType === "percentage") {
        if (newValue > 50 && newValue <= 90) {
          setShowHighDiscountWarning(true);
        } else if (newValue > 90) {
          // Require confirmation for > 90%
          if (!window.confirm(`Warning: You are creating a ${newValue}% discount coupon. This is very high and may result in significant revenue loss. Continue?`)) {
            return prev; // Cancel the change
          }
        } else {
          setShowHighDiscountWarning(false);
        }
      }
      
      // Validate max discount amount for percentage
      if (name === "discountType" && value === "percentage") {
        // Reset maxDiscountAmount if switching to percentage
        updated.maxDiscountAmount = "";
      }
      
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.expiresAt) <= new Date(formData.validFrom)) {
      alert("Expiration date must be after valid from date");
      return;
    }

    // Validate discount value
    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    if (formData.discountType === "fixed" && formData.discountValue > 1000) {
      alert("Fixed discount cannot exceed GH₵1000");
      return;
    }

    // Show warning for high discounts
    if (formData.discountType === "percentage" && formData.discountValue > 50) {
      if (!window.confirm(`You are creating a ${formData.discountValue}% discount coupon. This is a high discount. Continue?`)) {
        return;
      }
    }

    if (batch) {
      // Edit mode
      updateMutation(
        { id: batch._id, ...formData },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      // Create mode
      createMutation(formData, {
        onSuccess: () => {
          onClose();
        },
      });
    }
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

        <FormContainer>
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

          <Label>Max Usage Per User</Label>
          <Input
            name="maxUsagePerUser"
            type="number"
            value={formData.maxUsagePerUser}
            onChange={handleChange}
            placeholder="e.g. 1"
            min={1}
          />

          <Label>Minimum Order Amount (GH₵)</Label>
          <Input
            name="minOrderAmount"
            type="number"
            value={formData.minOrderAmount}
            onChange={handleChange}
            placeholder="0"
            min={0}
            step="0.01"
          />

          {formData.discountType === "percentage" && (
            <>
              <Label>Max Discount Amount (GH₵) - Optional</Label>
              <Input
                name="maxDiscountAmount"
                type="number"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="No limit"
                min={0}
                step="0.01"
              />
              <HelperText>
                Caps the maximum discount for percentage coupons
              </HelperText>
            </>
          )}

          {showHighDiscountWarning && (
            <WarningBox>
              ⚠️ High discount detected. This may result in significant revenue loss.
            </WarningBox>
          )}

          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              name="sellerFunded"
              checked={formData.sellerFunded}
              onChange={handleChange}
            />
            <CheckboxLabel>Seller pays for discount</CheckboxLabel>
          </CheckboxContainer>

          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              name="stackingAllowed"
              checked={formData.stackingAllowed}
              onChange={handleChange}
            />
            <CheckboxLabel>Allow stacking with other coupons</CheckboxLabel>
          </CheckboxContainer>

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  {batch ? "Updating..." : "Creating..."}
                </>
              ) : (
                batch ? "Update Batch" : "Create Batch"
              )}
            </SubmitButton>
          </Form>
        </FormContainer>
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
  padding: 20px;
  overflow-y: auto;
`;

const Modal = styled.div`
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
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

const FormContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const SubmitButton = styled.button`
  padding: 10px 16px;
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const HelperText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: -4px;
  margin-bottom: 4px;
  line-height: 1.4;
`;

const WarningBox = styled.div`
  padding: 10px 12px;
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
  margin-bottom: 8px;
  line-height: 1.4;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
`;

export default CouponBatchModal;
