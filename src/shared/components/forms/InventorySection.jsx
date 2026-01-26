import styled from "styled-components";
import { useFormContext } from "react-hook-form";

const InventorySection = ({ isSubmitting }) => {
  const { register, watch, formState: { errors } } = useFormContext();
  const variants = watch("variants");
  const totalStock = watch("totalStock");

  return (
    <SectionContainer>
      <SectionTitle>Inventory</SectionTitle>
      <FormGroup>
        <Label>
          Total Stock *
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
          <>
            <Input
              type="number"
              step="1"
              min="0"
              {...register("totalStock", { 
                required: "Stock is required",
                min: { value: 0, message: "Stock must be 0 or greater" },
                valueAsNumber: true,
              })}
              disabled={isSubmitting}
              placeholder="Enter stock quantity"
            />
            {errors.totalStock && <ErrorMessage>{errors.totalStock.message}</ErrorMessage>}
          </>
        )}
      </FormGroup>
    </SectionContainer>
  );
};
export default InventorySection;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
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
  font-weight: 400;
  font-size: 1.0625rem;
  color: #2d3748;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.0625rem;

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

const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.875rem;
`;
