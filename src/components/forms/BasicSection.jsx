import { useFormContext } from "react-hook-form";
import styled from "styled-components";

// In BasicSection.js

const BasicSection = () => {
  const { register } = useFormContext();

  return (
    <div>
      {/* Existing fields */}
      <FieldGroup>
        <Label>Product Name*</Label>
        <Input
          {...register("name", { required: "Product name is required" })}
          placeholder="Enter product name"
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Description</Label>
        <TextArea
          {...register("description")}
          placeholder="Enter product description"
          rows={4}
        />
      </FieldGroup>

      {/* New fields group */}
      <FieldRow>
        <FieldGroup style={{ flex: 1 }}>
          <Label>Manufacturer</Label>
          <Input
            {...register("manufacturer")}
            placeholder="e.g., Sony, Samsung"
          />
        </FieldGroup>

        <FieldGroup style={{ flex: 1 }}>
          <Label>Warranty</Label>
          <Input
            {...register("warranty")}
            placeholder="e.g., 1 year, 2 years"
          />
        </FieldGroup>

        <FieldGroup style={{ flex: 1 }}>
          <Label>Condition*</Label>
          <Select {...register("condition", { required: true })}>
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
            <option value="used">Used</option>
            <option value="open_box">Open Box</option>
            <option value="for_parts">For Parts</option>
          </Select>
        </FieldGroup>
      </FieldRow>

      <FieldGroup>
        <Label>Brand</Label>
        <Input {...register("brand")} placeholder="Enter brand name" />
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
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.875rem;
`;
