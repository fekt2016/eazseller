import styled from "styled-components";
import { useState } from "react";

export default function VariantInventoryPanel({
  stock = 0,
  sku = "",
  onStockChange,
  onSkuChange,
  showAlerts = true,
}) {
  const [localStock, setLocalStock] = useState(stock);
  const [localSku, setLocalSku] = useState(sku);

  const handleStockChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setLocalStock(value);
    onStockChange?.(value);
  };

  const handleSkuChange = (e) => {
    const value = e.target.value;
    setLocalSku(value);
    onSkuChange?.(value);
  };

  const getStockStatus = () => {
    if (localStock === 0) return { level: "out", message: "Out of Stock", color: "red" };
    if (localStock < 10) return { level: "low", message: "Low Stock", color: "yellow" };
    if (localStock < 50) return { level: "medium", message: "Medium Stock", color: "blue" };
    return { level: "good", message: "In Stock", color: "green" };
  };

  const stockStatus = getStockStatus();

  return (
    <InventoryPanel>
      <SectionTitle>Inventory Management</SectionTitle>

      <FieldGroup>
        <Field>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={localStock}
            onChange={handleStockChange}
            placeholder="Enter stock quantity"
          />
          {showAlerts && (
            <StockAlert level={stockStatus.level}>
              {stockStatus.message}
            </StockAlert>
          )}
        </Field>

        <Field>
          <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
          <Input
            id="sku"
            type="text"
            value={localSku}
            onChange={handleSkuChange}
            placeholder="Auto-generated or enter manually"
          />
          <HelperText>
            SKU helps track inventory. Leave empty for auto-generation.
          </HelperText>
        </Field>
      </FieldGroup>

      {showAlerts && localStock < 10 && (
        <AlertBanner level={stockStatus.level}>
          <AlertIcon>⚠️</AlertIcon>
          <AlertMessage>
            {localStock === 0
              ? "This variant is out of stock. Consider restocking soon."
              : `Low stock alert: Only ${localStock} units remaining.`}
          </AlertMessage>
        </AlertBanner>
      )}
    </InventoryPanel>
  );
}

// Styled Components
const InventoryPanel = styled.div`
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
  margin-bottom: var(--spacing-xs);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-body);
`;

const Input = styled.input`
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

const HelperText = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  margin: 0;
`;

const StockAlert = styled.div`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  font-family: var(--font-body);
  width: fit-content;
  background: ${({ level }) => {
    switch (level) {
      case "out": return "var(--color-red-100)";
      case "low": return "var(--color-yellow-100)";
      case "medium": return "var(--color-blue-100)";
      case "good": return "var(--color-green-100)";
      default: return "var(--color-grey-100)";
    }
  }};
  color: ${({ level }) => {
    switch (level) {
      case "out": return "var(--color-red-700)";
      case "low": return "var(--color-yellow-700)";
      case "medium": return "var(--color-blue-700)";
      case "good": return "var(--color-green-700)";
      default: return "var(--color-grey-700)";
    }
  }};
`;

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  background: ${({ level }) => {
    switch (level) {
      case "out": return "var(--color-red-50)";
      case "low": return "var(--color-yellow-50)";
      default: return "var(--color-grey-50)";
    }
  }};
  border-left: 4px solid ${({ level }) => {
    switch (level) {
      case "out": return "var(--color-red-500)";
      case "low": return "var(--color-yellow-500)";
      default: return "var(--color-grey-500)";
    }
  }};
`;

const AlertIcon = styled.span`
  font-size: var(--font-size-lg);
`;

const AlertMessage = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-800);
  font-family: var(--font-body);
  margin: 0;
  flex: 1;
`;

