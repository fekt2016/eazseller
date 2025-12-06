import styled from "styled-components";
import { useState } from "react";
import Button from '../../../shared/components/ui/Button';
import { FaPlus, FaTimes } from "react-icons/fa";

export default function CustomAttributeInput({ 
  attributes = [], 
  onAdd, 
  onRemove 
}) {
  const [newAttribute, setNewAttribute] = useState("");

  const handleAdd = () => {
    const trimmed = newAttribute.trim();
    if (trimmed && !attributes.includes(trimmed)) {
      onAdd(trimmed);
      setNewAttribute("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Container>
      <InputGroup>
        <Input
          type="text"
          value={newAttribute}
          onChange={(e) => setNewAttribute(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter custom attribute name (e.g., Pattern, Finish)"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAdd}
          disabled={!newAttribute.trim()}
        >
          <FaPlus /> Add
        </Button>
      </InputGroup>

      {attributes.length > 0 && (
        <AttributesList>
          {attributes.map((attr, index) => (
            <AttributeTag key={index}>
              <AttributeName>{attr}</AttributeName>
              <RemoveButton
                type="button"
                onClick={() => onRemove(attr)}
                aria-label={`Remove ${attr}`}
              >
                <FaTimes />
              </RemoveButton>
            </AttributeTag>
          ))}
        </AttributesList>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const InputGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: stretch;
`;

const Input = styled.input`
  flex: 1;
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

const AttributesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
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

const AttributeName = styled.span`
  color: var(--color-grey-700);
  font-weight: var(--font-medium);
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--color-red-600);
  cursor: pointer;
  font-size: var(--font-size-sm);
  line-height: 1;
  padding: 0;
  width: 18px;
  height: 18px;
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

