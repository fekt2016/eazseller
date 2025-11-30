import { useFormContext } from "react-hook-form";
import styled from "styled-components";
import { generateSKU } from '../../utils/helpers';

export default function AttributeSection({
  isSubmitting,
  handleAddAttribute,
  fields,
  remove,
  categories,
  setLocalVariants,
  currentUser,
}) {
  const { register, watch } = useFormContext();

  // const attributes = watch("attributes") || [];
  const handleGenerateAllVariants = () => {
    const attributes = watch("attributes") || [];
    const categoryId = watch("category");

    const categoryObj = categories.find((cat) => cat._id === categoryId);
    const categoryCode = categoryObj
      ? categoryObj.name.substring(0, 3).toUpperCase()
      : "GEN";

    const validAttributes = attributes.filter(
      (attr) => attr.name && attr.value
    );

    if (validAttributes.length === 0) return;

    // Create cartesian product of all attributes
    const combinations = validAttributes.reduce((acc, attr) => {
      const values = attr.value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (acc.length === 0) {
        return values.map((value) => ({ [attr.name]: value }));
      }

      return acc.flatMap((comb) =>
        values.map((value) => ({ ...comb, [attr.name]: value }))
      );
    }, []);

    const newVariants = combinations.map((comb) => ({
      ...comb,
      price: "",
      stock: "",
      sku: generateSKU({
        user: currentUser,
        variants: comb,
        category: categoryCode,
      }),
    }));

    setLocalVariants(newVariants);
  };

  return (
    <>
      <SectionHeader>
        <h3>Product Attributes</h3>
        <GenerateButton
          type="button"
          onClick={handleGenerateAllVariants}
          disabled={isSubmitting || fields.length === 0}
        >
          Generate All Combinations
        </GenerateButton>
      </SectionHeader>

      {fields.map((attr, index) => {
        // const currentAttr = attributes[index] || {};

        return (
          <AttributeGroup key={attr.id}>
            <FormGrid>
              <FormGroup>
                <Input
                  {...register(`attributes.${index}.name`)}
                  placeholder="Attribute name (e.g., Material)"
                  disabled={isSubmitting}
                />
              </FormGroup>
              <FormGroup>
                <Input
                  {...register(`attributes.${index}.value`)}
                  placeholder="Comma-separated values (e.g., Silver,Gold)"
                  disabled={isSubmitting}
                />
              </FormGroup>

              <ActionButtons>
                <RemoveButton
                  type="button"
                  onClick={() => remove(index)}
                  disabled={isSubmitting}
                >
                  Remove
                </RemoveButton>
              </ActionButtons>
            </FormGrid>
          </AttributeGroup>
        );
      })}

      <AddButton
        type="button"
        onClick={handleAddAttribute}
        disabled={isSubmitting}
      >
        + Add Attribute
      </AddButton>
    </>
  );
}

// Styled Components
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const GenerateButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2b6cb0;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const AttributeGroup = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const RemoveButton = styled.button`
  padding: 0.75rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  flex: 1;
  transition: background 0.2s;

  &:hover {
    background: #c53030;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  transition: background 0.2s;
  font-weight: 500;

  &:hover {
    background: #2b6cb0;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;
