import styled from "styled-components";
import { Link } from "react-router-dom";
import ResponsiveDataTable from '../../../shared/components/ui/ResponsiveDataTable';
import Button from '../../../shared/components/ui/Button';
import { ButtonSpinner } from '../../../shared/components/ui/LoadingComponents';
import { FaEdit, FaTrash, FaBoxOpen } from "react-icons/fa";
import { IMAGE_SLOTS } from "../../../shared/utils/cloudinaryConfig";
import OptimizedImage from "../../../shared/components/OptimizedImage";

export default function VariantTable({
  variants = [],
  productId,
  productImage = null,
  onDelete,
  deletingId,
}) {
  const getVariantImageUrl = (variant) => {
    const images = variant.images;

    // If images is an array, flatten one level and pick the first truthy entry
    if (Array.isArray(images) && images.length > 0) {
      const flat = [];
      images.forEach((img) => {
        if (Array.isArray(img)) {
          img.forEach((inner) => flat.push(inner));
        } else {
          flat.push(img);
        }
      });

      const first = flat.find((img) => img);
      if (!first) return null;

      if (typeof first === "object" && first?.url) return first.url;
      if (typeof first === "string") return first;
      return null;
    }

    // If images is a single string
    if (typeof images === "string" && images.trim() !== "") {
      return images;
    }

    // If images is a single object with url
    if (images && typeof images === "object" && images.url) {
      return images.url;
    }

    return null;
  };

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
      key: 'image',
      title: 'Image',
      align: 'center',
      render: (variant) => {
        const imageUrl = getVariantImageUrl(variant) || productImage;

        return (
          <VariantImageContainer>
            {imageUrl ? (
              <OptimizedImage
                src={imageUrl}
                slot={IMAGE_SLOTS.TABLE_THUMB}
                aspectRatio="1/1"
                alt="Variant"
                objectFit="contain"
                radius="9px"
              />
            ) : (
              <NoImagePlaceholder>
                <FaBoxOpen />
                <span>No Image</span>
              </NoImagePlaceholder>
            )}
          </VariantImageContainer>
        );
      },
    },
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
      title: 'Quantity',
      align: 'center',
      render: (variant) => (
        <StockIndicator $stock={variant.stock || 0}>
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
      key: 'condition',
      title: 'Condition',
      align: 'center',
      render: (variant) => (
        <ConditionBadge condition={variant.condition || "new"}>
          {variant.condition ? variant.condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : "New"}
        </ConditionBadge>
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
  font-weight: 600;
  color: #111827;
  
  font-size: 0.9rem;
`;

const AttributesText = styled.p`
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0;
  
  line-height: 1.5;
`;

const Price = styled.div`
  font-weight: 700;
  color: #111827;
  
  font-size: 0.9rem;
`;

const StockIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  background: ${({ $stock }) =>
    $stock > 20 ? '#DCFCE7' : $stock > 0 ? '#FEF3C7' : '#FEE2E2'};
  color: ${({ $stock }) =>
    $stock > 20 ? '#15803D' : $stock > 0 ? '#B45309' : '#B91C1C'};
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: capitalize;
  background: ${({ status }) =>
    status === 'active' ? '#DCFCE7' : '#F3F4F6'};
  color: ${({ status }) =>
    status === 'active' ? '#15803D' : '#6B7280'};
`;

const ConditionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: capitalize;
  background: ${({ condition }) => {
    switch (condition) {
      case 'new': return '#DBEAFE';
      case 'like_new':
      case 'open_box': return '#DCFCE7';
      case 'refurbished': return '#EDE9FE';
      case 'used': return '#FEF3C7';
      case 'fair': return '#FEF9C3';
      case 'poor': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  }};
  color: ${({ condition }) => {
    switch (condition) {
      case 'new': return '#1D4ED8';
      case 'like_new':
      case 'open_box': return '#15803D';
      case 'refurbished': return '#6D28D9';
      case 'used': return '#92400E';
      case 'fair': return '#854D0E';
      case 'poor': return '#B91C1C';
      default: return '#374151';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
`;

const VariantImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  margin: 0 auto;
`;

/* VariantImage styled component replaced by OptimizedImage */
const VariantImage = styled.div`
  width: 100%;
  height: 100%;
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F9F8F5;
  border-radius: 9px;
  border: 1px dashed #E5E7EB;
  color: #9CA3AF;
  font-size: 0.8rem;
  gap: 0.25rem;

  svg {
    font-size: 1.1rem;
  }
  
  span {
    font-size: 0.8rem;
    font-weight: 500;
  }
`;
