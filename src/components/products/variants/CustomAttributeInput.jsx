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
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: stretch;
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.9rem;
  
  color: #111827;
  transition: 0.12s;

  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
  }

  &:hover {
    border-color: #D1D5DB;
  }
`;

const AttributesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const AttributeTag = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  background: #F9F8F5;
  border-radius: 9px;
  font-size: 0.875rem;
  
`;

const AttributeName = styled.span`
  color: #374151;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #A32D2D;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: 0.12s;

  &:hover {
    background: #A32D2D;
    color: #A32D2D;
  }
`;

