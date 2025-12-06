import styled from "styled-components";
import { Link } from "react-router-dom";
import ResponsiveDataTable from '../../../shared/components/ui/ResponsiveDataTable';
import Button from '../../../shared/components/ui/Button';
import { ButtonSpinner } from '../../../shared/components/ui/LoadingComponents';
import { FaEdit, FaTrash } from "react-icons/fa";

export default function VariantTable({ 
  variants = [], 
  productId, 
  onDelete, 
  deletingId 
}) {
  const formatAttributes = (attributes) => {
    if (!attributes || !Array.isArray(attributes)) return "N/A";
    return attributes
      .map((attr) => {
        if (typeof attr === "object" && attr.key && attr.value) {
          return `${attr.key}: ${attr.value}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(", ") || "N/A";
  };

  const variantColumns = [
    {
      key: 'name',
      title: 'Variant Name',
      render: (variant) => (
        <VariantName>{variant.name || formatAttributes(variant.attributes)}</VariantName>
      ),
    },
    {
      key: 'attributes',
      title: 'Attributes',
      render: (variant) => (
        <AttributesText>{formatAttributes(variant.attributes)}</AttributesText>
      ),
      hideOnMobile: true,
    },
    {
      key: 'price',
      title: 'Price',
      align: 'right',
      render: (variant) => (
        <Price>Gh₵{(variant.price || 0).toFixed(2)}</Price>
      ),
    },
    {
      key: 'stock',
      title: 'Stock',
      align: 'center',
      render: (variant) => (
        <StockIndicator stock={variant.stock || 0}>
          {variant.stock || 0}
          {(variant.stock || 0) === 0 && " (Out of Stock)"}
        </StockIndicator>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      align: 'center',
      render: (variant) => (
        <StatusBadge status={variant.status || "active"}>
          {variant.status || "active"}
        </StatusBadge>
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (variant) => (
        <ActionButtons>
          <Button
            as={Link}
            to={`/dashboard/products/${productId}/variants/${variant._id || variant.id}/edit`}
            variant="ghost"
            size="sm"
            iconOnly
            round
          >
            <FaEdit />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            round
            onClick={() => onDelete(variant._id || variant.id)}
            disabled={deletingId === (variant._id || variant.id)?.toString()}
          >
            {deletingId === (variant._id || variant.id)?.toString() ? (
              <ButtonSpinner size="14px" />
            ) : (
              <FaTrash />
            )}
          </Button>
        </ActionButtons>
      ),
    },
  ];

  return (
    <ResponsiveDataTable
      data={variants}
      columns={variantColumns}
      $padding="md"
      showActions={true}
    />
  );
}

// Styled Components
const VariantName = styled.div`
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  font-size: var(--font-size-md);
`;

const AttributesText = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
  margin: 0;
  font-family: var(--font-body);
  line-height: 1.5;
`;

const Price = styled.div`
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  font-size: var(--font-size-md);
`;

const StockIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  background: ${({ stock }) =>
    stock > 20 
      ? "var(--color-green-100)" 
      : stock > 0 
      ? "var(--color-yellow-100)" 
      : "var(--color-red-100)"};
  color: ${({ stock }) =>
    stock > 20 
      ? "var(--color-green-700)" 
      : stock > 0 
      ? "var(--color-yellow-700)" 
      : "var(--color-red-700)"};
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-xs);
  font-family: var(--font-body);
  text-transform: uppercase;
  background: ${({ status }) =>
    status === "active" 
      ? "var(--color-green-100)" 
      : "var(--color-grey-100)"};
  color: ${({ status }) =>
    status === "active" 
      ? "var(--color-green-700)" 
      : "var(--color-grey-700)"};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
`;

