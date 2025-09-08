import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import styled from "styled-components";

export default function PricingSection({ isSubmitting }) {
  const {
    register,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext();
  const price = watch("price");

  useEffect(() => {
    if (price !== undefined) {
      trigger("discountPrice");
    }
  }, [price, trigger]);
  return (
    <FormGrid>
      <FormGroup>
        <Label htmlFor="price">Price *</Label>
        <Input
          type="number"
          step="0.01"
          {...register("price", {
            required: "Price is required",
            min: { value: 0.01, message: "Price must be greater than 0" },
          })}
          disabled={isSubmitting}
          placeholder="0.00"
        />
        {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="discount">Discount Price</Label>
        <Input
          type="number"
          step="0.01"
          {...register("discountPrice", {
            validate: (value) => {
              const price = parseFloat(watch("price"));
              return (
                !value ||
                value < price ||
                "Discount must be less than regular price"
              );
            },
          })}
          disabled={isSubmitting}
          placeholder="Optional"
        />
        {errors.discountPrice && (
          <ErrorMessage>{errors.discountPrice.message}</ErrorMessage>
        )}
      </FormGroup>
    </FormGrid>
  );
}
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

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }

  &:disabled {
    background-color: #edf2f7;
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.875rem;
`;
