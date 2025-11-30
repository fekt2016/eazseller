import styled from "styled-components";
import { useFormContext } from "react-hook-form";

const InventorySection = ({ isSubmitting }) => {
  const { register, watch } = useFormContext();
  const variants = watch("variants");
  const totalStock = watch("totalStock");

  return (
    <SectionContainer>
      <SectionTitle>Inventory</SectionTitle>
      <FormGroup>
        <Label>
          Total Stock
          {variants?.length > 0 && (
            <InfoText>(Calculated from variants)</InfoText>
          )}
        </Label>

        {variants?.length > 0 ? (
          <Input
            type="number"
            readOnly
            value={totalStock || ""}
            placeholder="0"
          />
        ) : (
          <Input
            type="text"
            {...register("totalStock", { required: "Stock is required" })}
            disabled={isSubmitting}
            placeholder="Enter stock quantity"
          />
        )}
      </FormGroup>
    </SectionContainer>
  );
};
export default InventorySection;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2d3748;
`;

const SectionContainer = styled.section`
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:read-only {
    background-color: #f7fafc;
    cursor: not-allowed;
  }
`;

const InfoText = styled.span`
  font-size: 0.8rem;
  color: #718096;
  margin-left: 0.5rem;
  font-weight: normal;
`;
