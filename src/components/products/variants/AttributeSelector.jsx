import styled from "styled-components";
import { useState, useMemo, useEffect } from "react";

/**
 * AttributeSelector component that matches the pattern used in ProductForm's VariantSection
 * Uses hidden inputs for keys and visible inputs for values, consistent with add product form
 */
export default function AttributeSelector({
  variantAttributes = [],
  selectedAttributes = [],
  onChange,
  register,
  setValue,
  getValues,
  name = "attributes",
}) {
  const [customAttributes, setCustomAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState("");

  // Combine predefined and custom attributes, excluding 'Brand'
  const allAttributes = useMemo(() => {
    const filteredPredefined = variantAttributes.filter(
      (attr) => attr.name?.toLowerCase() !== "brand"
    );

    return [
      ...filteredPredefined,
      ...customAttributes
        .filter((name) => name.toLowerCase() !== "brand")
        .map((name) => ({ name, _id: `custom-${name}` })),
    ];
  }, [variantAttributes, customAttributes]);

  // Initialize attributes array with all attribute keys when component mounts or attributes change
  useEffect(() => {
    if (allAttributes.length === 0) return;

    const currentAttrs = getValues(name) || [];
    
    // Ensure all attributes from allAttributes are present
    const updatedAttrs = [...currentAttrs];
    let hasChanges = false;

    allAttributes.forEach((attr) => {
      const attrName = attr.name;
      const existingIndex = updatedAttrs.findIndex((a) => a.key === attrName);
      
      if (existingIndex === -1) {
        // Add missing attribute
        updatedAttrs.push({ key: attrName, value: "" });
        hasChanges = true;
      }
    });

    // Remove attributes that are no longer in allAttributes (but keep custom ones that were manually added)
    const validKeys = allAttributes.map((attr) => attr.name);
    const filteredAttrs = updatedAttrs.filter((attr) => {
      // Keep if it's in validKeys OR if it was in the original selectedAttributes (custom attribute)
      return validKeys.includes(attr.key) || 
             (selectedAttributes && selectedAttributes.some((sa) => sa.key === attr.key));
    });
    
    if (filteredAttrs.length !== updatedAttrs.length) {
      hasChanges = true;
    }

    if (hasChanges) {
      setValue(name, filteredAttrs.length > 0 ? filteredAttrs : updatedAttrs, {
        shouldDirty: false,
        shouldValidate: false,
      });
      onChange(filteredAttrs.length > 0 ? filteredAttrs : updatedAttrs);
    }
  }, [allAttributes, name, getValues, setValue, onChange, selectedAttributes]);

  // Add a new custom attribute
  const addCustomAttribute = () => {
    const trimmedAttribute = newAttribute.trim();
    if (
      trimmedAttribute &&
      trimmedAttribute.toLowerCase() !== "brand" &&
      !customAttributes.includes(trimmedAttribute)
    ) {
      setCustomAttributes((prev) => [...prev, trimmedAttribute]);
      setNewAttribute("");
    }
  };

  // Get current attribute value
  const getAttributeValue = (attrName) => {
    const attr = selectedAttributes.find((a) => a.key === attrName);
    return attr?.value || "";
  };

  // Handle attribute value change
  const handleAttributeValueChange = (attrName, value) => {
    const currentAttrs = getValues(name) || [];
    const attrIndex = currentAttrs.findIndex((a) => a.key === attrName);

    if (attrIndex === -1) {
      // Add new attribute
      const newAttrs = [...currentAttrs, { key: attrName, value }];
      setValue(name, newAttrs, { shouldDirty: true });
      onChange(newAttrs);
    } else {
      // Update existing attribute
      const updatedAttrs = [...currentAttrs];
      updatedAttrs[attrIndex] = { ...updatedAttrs[attrIndex], value };
      setValue(name, updatedAttrs, { shouldDirty: true });
      onChange(updatedAttrs);
    }
  };

  return (
    <AttributeSelectorContainer>
      <SectionTitle>Variant Attributes</SectionTitle>

      {/* Display all attributes (predefined + custom) */}
      {allAttributes.map((attr, index) => {
        const attrName = attr.name;
        const currentAttrs = getValues(name) || [];
        const attrIndex = currentAttrs.findIndex((a) => a.key === attrName);

        // If attribute not found, skip rendering (useEffect will add it)
        if (attrIndex === -1) {
          return null;
        }

        return (
          <AttributeField key={`${attrName}-${index}`}>
            <AttributeLabel>{attrName}:</AttributeLabel>
            <AttributeInputWrapper>
              {/* Hidden input for key (matching VariantSection pattern) */}
              <input
                type="hidden"
                {...register(`${name}.${attrIndex}.key`)}
                value={attrName}
              />
              {/* Visible input for value */}
              <AttributeInput
                type="text"
                {...register(`${name}.${attrIndex}.value`)}
                placeholder={`Enter ${attrName.toLowerCase()}`}
              />
            </AttributeInputWrapper>
          </AttributeField>
        );
      })}

      {/* Add Custom Attribute */}
      {allAttributes.length > 0 && (
        <CustomAttributeSection>
          <CustomAttributeInput
            type="text"
            value={newAttribute}
            onChange={(e) => setNewAttribute(e.target.value)}
            placeholder="Add custom attribute (e.g., Pattern, Finish)"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomAttribute();
              }
            }}
          />
          <AddButton type="button" onClick={addCustomAttribute}>
            Add Attribute
          </AddButton>
        </CustomAttributeSection>
      )}

      {/* Custom Attributes List */}
      {customAttributes.length > 0 && (
        <CustomAttributesList>
          {customAttributes
            .filter((attr) => attr.toLowerCase() !== "brand")
            .map((attr, index) => (
              <AttributeTag key={index}>
                {attr}
                <RemoveAttributeButton
                  type="button"
                  onClick={() => {
                    setCustomAttributes((prev) => prev.filter((a) => a !== attr));
                    // Remove from selected attributes
                    const updated = selectedAttributes.filter((a) => a.key !== attr);
                    setValue(name, updated, { shouldDirty: true });
                    onChange(updated);
                  }}
                >
                  ×
                </RemoveAttributeButton>
              </AttributeTag>
            ))}
        </CustomAttributesList>
      )}
    </AttributeSelectorContainer>
  );
}

// Styled Components
const AttributeSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-sm);
`;

const AttributeField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const AttributeLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-body);
`;

const AttributeInputWrapper = styled.div`
  position: relative;
`;

const AttributeInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  transition: var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:hover {
    border-color: var(--color-grey-400);
  }
`;

const CustomAttributeSection = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);
`;

const CustomAttributeInput = styled(AttributeInput)`
  flex: 1;
`;

const AddButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  font-family: var(--font-body);
  cursor: pointer;
  transition: var(--transition-base);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--color-primary-600);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CustomAttributesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);
`;

const AttributeTag = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-grey-100);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
`;

const RemoveAttributeButton = styled.button`
  background: none;
  border: none;
  color: var(--color-red-600);
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-cir);
  transition: var(--transition-base);

  &:hover {
    background: var(--color-red-100);
    color: var(--color-red-700);
  }
`;
