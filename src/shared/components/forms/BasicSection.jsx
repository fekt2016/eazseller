import { useFormContext } from "react-hook-form";
import styled from "styled-components";
import useActivePromotions from "../../hooks/useActivePromotions";

const BasicSection = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { data: activePromotions = [], isLoading: promotionsLoading } = useActivePromotions();
  
  const name = watch("name") || "";
  const description = watch("description") || "";
  const productStatus = watch("productStatus") || "active";
  const isPreOrder = watch("isPreOrder");
  const nameLength = name.length;
  const descriptionLength = description.length;

  return (
    <div>
      {/* Product Name */}
      <FieldGroup>
        <Label>
          Product Name <Required>*</Required>
          {nameLength > 0 && <CharCount $warning={nameLength > 100}>{nameLength}/200</CharCount>}
        </Label>
        <Input
          {...register("name", { 
            required: "Please enter a product name",
            maxLength: { value: 200, message: "Product name must be less than 200 characters" }
          })}
          placeholder="e.g., Samsung Galaxy S21 Ultra 128GB"
          maxLength={200}
          $hasError={!!errors.name}
        />
        {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        <HelperText>Choose a clear, descriptive name that customers will search for</HelperText>
      </FieldGroup>

      {/* Description */}
      <FieldGroup>
        <Label>
          Description
          {descriptionLength > 0 && <CharCount $warning={descriptionLength > 2000}>{descriptionLength}/5000</CharCount>}
        </Label>
        <TextArea
          {...register("description", {
            required: "Description is required",
            maxLength: { value: 5000, message: "Description must be less than 5000 characters" }
          })}
          placeholder="Describe your product in detail. Include key features, benefits, and what makes it special..."
          rows={6}
          maxLength={5000}
          $hasError={!!errors.description}
        />
        {errors.description && (
          <ErrorMessage>{errors.description.message}</ErrorMessage>
        )}
        <HelperText>Provide detailed information to help customers make informed decisions</HelperText>
      </FieldGroup>

      <FieldGroup>
        <Label>
          Listing status <Required>*</Required>
        </Label>
        <SegmentedRow>
          <SegmentedBtn
            type="button"
            $active={productStatus === "active"}
            onClick={() => setValue("productStatus", "active", { shouldDirty: true, shouldValidate: true })}
          >
            Active
          </SegmentedBtn>
          <SegmentedBtn
            type="button"
            $active={productStatus === "draft"}
            onClick={() => setValue("productStatus", "draft", { shouldDirty: true, shouldValidate: true })}
          >
            Draft
          </SegmentedBtn>
        </SegmentedRow>
        <HelperText>
          Draft products are saved but not visible to buyers until you publish (set to Active) after approval.
        </HelperText>
      </FieldGroup>

      {/* Additional Information */}
      <FieldRow>
        <FieldGroup style={{ flex: 1 }}>
          <Label>
            Brand
            <Optional>(Optional)</Optional>
          </Label>
          <Input
            {...register("brand")}
            placeholder="e.g., Samsung, Apple, Nike"
          />
          <HelperText>Product brand or manufacturer name</HelperText>
        </FieldGroup>

        <FieldGroup style={{ flex: 1 }}>
          <Label>
            Manufacturer
            <Optional>(Optional)</Optional>
          </Label>
          <Input
            {...register("manufacturer")}
            placeholder="e.g., Sony Corporation"
          />
          <HelperText>Company that manufactured the product</HelperText>
        </FieldGroup>
      </FieldRow>

      <FieldRow>
        <FieldGroup style={{ flex: 1 }}>
          <Label>
            Warranty
            <Optional>(Optional)</Optional>
          </Label>
          <Input
            {...register("warranty")}
            placeholder="e.g., 1 year, 2 years, 6 months"
          />
          <HelperText>Warranty period offered with this product</HelperText>
        </FieldGroup>

        <FieldGroup style={{ flex: 1 }}>
          <Label>
            Return / Refund Window (days) <Required>*</Required>
          </Label>
          <Input
            type="number"
            min={0}
            max={365}
            step={1}
            {...register("returnWindowDays", {
              required: "Please specify the refund/return window in days",
              min: { value: 0, message: "Return window cannot be negative" },
              max: { value: 365, message: "Return window cannot exceed 365 days" },
              valueAsNumber: true,
            })}
            placeholder="e.g., 30"
            $hasError={!!errors.returnWindowDays}
          />
          {errors.returnWindowDays && (
            <ErrorMessage>{errors.returnWindowDays.message}</ErrorMessage>
          )}
          <HelperText>
            Number of days the buyer can request a return/refund for this product.
          </HelperText>
        </FieldGroup>
      </FieldRow>

      {/* Pre-Order */}
      <PreOrderSection>
        <FieldGroup>
          <CheckboxRow>
            <Checkbox
              type="checkbox"
              id="isPreOrder"
              {...register("isPreOrder")}
            />
            <CheckboxLabel htmlFor="isPreOrder">
              This product is available for pre-order
            </CheckboxLabel>
          </CheckboxRow>
          <HelperText>
            Enable this if the product is not yet in stock but customers can order in advance.
          </HelperText>
        </FieldGroup>

        {isPreOrder && (
          <PreOrderFields>
            <FieldRow>
              <FieldGroup style={{ flex: 1 }}>
                <Label>
                  Expected Availability Date
                  <Optional>(Optional)</Optional>
                </Label>
                <Input
                  type="date"
                  {...register("preOrderAvailableDate")}
                />
                <HelperText>When do you expect this product to be available for shipping?</HelperText>
              </FieldGroup>

              <FieldGroup style={{ flex: 1 }}>
                <Label>
                  Pre-Order Note
                  <Optional>(Optional)</Optional>
                </Label>
                <Input
                  {...register("preOrderNote", {
                    maxLength: { value: 300, message: "Pre-order note must be less than 300 characters" },
                  })}
                  placeholder="e.g., Expected to ship by March 2026"
                  maxLength={300}
                  $hasError={!!errors.preOrderNote}
                />
                {errors.preOrderNote && (
                  <ErrorMessage>{errors.preOrderNote.message}</ErrorMessage>
                )}
                <HelperText>A short message shown to buyers about the pre-order</HelperText>
              </FieldGroup>
            </FieldRow>
          </PreOrderFields>
        )}
      </PreOrderSection>

      {/* Admin promotion – add this product to a platform promotion */}
      <FieldGroup>
        <Label>
          Admin promotion
          <Optional>(Optional)</Optional>
        </Label>
        <Select
          {...register("promotionKey")}
          disabled={promotionsLoading}
          $hasError={!!errors.promotionKey}
        >
          <option value="">None</option>
          {(activePromotions || []).map((p) => (
            <option key={p.key} value={p.key}>
              {p.title}
              {p.discountType === "fixed" && p.discountFixed > 0
                ? ` (GH₵${Number(p.discountFixed).toFixed(2)} off)`
                : p.discountPercent > 0
                  ? ` (${p.discountPercent}% off)`
                  : ""}
            </option>
          ))}
        </Select>
        <HelperText>
          Add this product to a platform promotion. Discount is set by admin.
        </HelperText>
      </FieldGroup>
    </div>
  );
};
export default BasicSection;
// Add these styled components to your BasicSection.js
const FieldGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 400;
  color: #1e293b;
  font-size: 1.0625rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Required = styled.span`
  color: #ef4444;
  font-weight: 500;
  margin-left: 0.25rem;
`;

const Optional = styled.span`
  color: #64748b;
  font-weight: 400;
  font-size: 0.9375rem;
  margin-left: 0.25rem;
`;

const CharCount = styled.span`
  font-size: 0.875rem;
  color: ${({ $warning }) => ($warning ? '#ef4444' : '#64748b')};
  font-weight: 400;
`;

const HelperText = styled.p`
  margin: 0.375rem 0 0 0;
  font-size: 0.9375rem;
  color: #64748b;
  line-height: 1.4;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid ${props => props.$hasError ? '#e53e3e' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1.0625rem;
  color: #1e293b;
  background: #ffffff;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch-friendly on mobile */

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e53e3e' : '#E8920A'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(229, 62, 62, 0.1)' : 'rgba(255, 196, 0, 0.1)'};
  }

  &:hover:not(:focus) {
    border-color: ${props => props.$hasError ? '#e53e3e' : '#cbd5e1'};
  }

  &::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1.125rem; /* Prevent zoom on iOS */
    min-height: 48px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid ${props => props.$hasError ? '#e53e3e' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1.0625rem;
  color: #1e293b;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch-friendly on mobile */

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e53e3e' : '#E8920A'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(229, 62, 62, 0.1)' : 'rgba(255, 196, 0, 0.1)'};
  }

  &:hover:not(:focus) {
    border-color: ${props => props.$hasError ? '#e53e3e' : '#cbd5e1'};
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1.125rem; /* Prevent zoom on iOS */
    min-height: 48px;
  }
`;

// const TextArea = styled.textarea`
//   width: 100%;
//   padding: 0.75rem;
//   border: 1px solid #e2e8f0;
//   border-radius: 6px;
//   font-size: 1rem;
//   font-family: inherit;

//   &:focus {
//     outline: none;
//     border-color: #3182ce;
//     box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
//   }
// `;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

// const Label = styled.label`
//   display: block;
//   margin-bottom: 0.5rem;
//   font-weight: 500;
//   color: #4a5568;
// `;

// const Input = styled.input`
//   width: 100%;
//   padding: 0.75rem;
//   border: 1px solid #cbd5e0;
//   border-radius: 6px;
//   font-size: 1rem;
//   transition: border-color 0.2s;

//   &:focus {
//     outline: none;
//     border-color: #3182ce;
//     box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
//   }
// `;

const SegmentedRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const SegmentedBtn = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${({ $active }) => ($active ? '#e8920a' : '#e2e8f0')};
  background: ${({ $active }) => ($active ? '#fdf3e3' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#854f0b' : '#64748b')};
  transition: all 0.2s ease;

  &:hover {
    border-color: #e8920a;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid ${(props) => (props.$hasError ? '#e53e3e' : '#e2e8f0')};
  border-radius: 8px;
  font-size: 1.0625rem;
  color: #1e293b;
  background: #ffffff;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }

  &::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1.125rem; /* Prevent zoom on iOS */
    min-height: 140px;
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.875rem;
  font-weight: 400;
  padding: 0.5rem;
  background: #fed7d7;
  border-radius: 4px;
  border-left: 3px solid #e53e3e;
`;

const PreOrderSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
`;

const PreOrderFields = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #fde68a;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #E8920A;
  cursor: pointer;
  flex-shrink: 0;
`;

const CheckboxLabel = styled.label`
  font-size: 1.0625rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;
