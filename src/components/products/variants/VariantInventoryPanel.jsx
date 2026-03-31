import styled from "styled-components";
import { useState, useEffect } from "react";

export default function VariantInventoryPanel({
  stock = 0,
  sku = "",
  onStockChange,
  onSkuChange,
  showAlerts = true,
}) {
  const [localStock, setLocalStock] = useState(stock);
  // Keep localSku in sync with parent (auto-generated) value
  const [localSku, setLocalSku] = useState(sku);

  // Sync when parent sku prop changes (e.g. auto-generated from attributes)
  useEffect(() => {
    setLocalSku(sku || "");
  }, [sku]);

  // Sync when parent stock prop changes
  useEffect(() => {
    setLocalStock(stock || 0);
  }, [stock]);

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
  gap: 1rem;
  padding: 1rem;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #F1EFE8;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  
`;

const Input = styled.input`
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

const HelperText = styled.p`
  font-size: 0.8rem;
  color: #6B7280;
  
  margin: 0;
`;

const StockAlert = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 1rem 1rem;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 600;
  
  width: fit-content;
  background: ${({ level }) => {
    switch (level) {
      case "out": return "#A32D2D";
      case "low": return "#854F0B";
      case "medium": return "#185FA5";
      case "good": return "#3B6D11";
      default: return "#F9F8F5";
    }
  }};
  color: ${({ level }) => {
    switch (level) {
      case "out": return "#A32D2D";
      case "low": return "#854F0B";
      case "medium": return "#185FA5";
      case "good": return "#3B6D11";
      default: return "#374151";
    }
  }};
`;

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  border-radius: 9px;
  background: ${({ level }) => {
    switch (level) {
      case "out": return "#A32D2D";
      case "low": return "#854F0B";
      default: return "#F9F8F5";
    }
  }};
  border-left: 4px solid ${({ level }) => {
    switch (level) {
      case "out": return "#A32D2D";
      case "low": return "#854F0B";
      default: return "#9CA3AF";
    }
  }};
`;

const AlertIcon = styled.span`
  font-size: 1.1rem;
`;

const AlertMessage = styled.p`
  font-size: 0.875rem;
  color: #1F2937;
  
  margin: 0;
  flex: 1;
`;

