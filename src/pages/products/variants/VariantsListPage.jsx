import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaPlus, FaArrowLeft, FaBoxOpen } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import {
  PageContainer,
  PageHeader,
  TitleSection,
  ActionSection,
  Toolbar,
} from '../../../shared/components/ui/SpacingSystem';
import Button from '../../../shared/components/ui/Button';
import SearchBox from '../../../shared/components/ui/SearchBox';
import { LoadingState, EmptyState } from '../../../shared/components/ui/LoadingComponents';
import VariantTable from '../../../components/products/variants/VariantTable';
import useVariants from '../../../shared/hooks/variants/useVariants';
import useProduct from '../../../shared/hooks/useProduct';

export default function VariantsListPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const { getVariants, deleteVariant } = useVariants();
  const { data: variantsData, isLoading: variantsLoading } = getVariants(productId);
  const { useGetProductById } = useProduct();
  const { data: productData, isLoading: productLoading } = useGetProductById(productId);

  const variants = useMemo(() => {
    return variantsData?.data || variantsData || [];
  }, [variantsData]);

  const filteredVariants = useMemo(() => {
    if (!searchTerm) return variants;
    
    return variants.filter((variant) => {
      const name = variant.name || "";
      const attributes = variant.attributes
        ?.map((attr) => `${attr.key}: ${attr.value}`)
        .join(" ") || "";
      const searchLower = searchTerm.toLowerCase();
      
      return (
        name.toLowerCase().includes(searchLower) ||
        attributes.toLowerCase().includes(searchLower) ||
        variant.sku?.toLowerCase().includes(searchLower)
      );
    });
  }, [variants, searchTerm]);

  const handleDelete = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) {
      return;
    }

    setDeletingId(variantId);
    try {
      await deleteVariant.mutateAsync({ productId, variantId });
      queryClient.invalidateQueries(["variants", productId]);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete variant. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (variantsLoading || productLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading variants..." />
      </PageContainer>
    );
  }

  const productName = productData?.name || "Product";

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <h1>Product Variants</h1>
          <p>
            Manage variants for: <strong>{productName}</strong>
          </p>
        </TitleSection>
        <ActionSection>
          <Button
            as={Link}
            to={`/dashboard/products/${productId}/variants/create`}
            variant="primary"
            size="lg"
            gradient
          >
            <FaPlus /> Add Variant
          </Button>
        </ActionSection>
      </PageHeader>

      {variants.length === 0 ? (
        <EmptyState
          icon={<FaBoxOpen size={48} />}
          title="No Variants Found"
          message="This product doesn't have any variants yet. Create your first variant to get started!"
          action={
            <Button
              as={Link}
              to={`/dashboard/products/${productId}/variants/create`}
              variant="primary"
              size="lg"
              gradient
            >
              <FaPlus /> Add Your First Variant
            </Button>
          }
        />
      ) : (
        <>
          <Toolbar $padding="md" $marginBottom="lg">
            <SearchBox
              placeholder="Search variants by name, attributes, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Toolbar>

          <VariantTable
            variants={filteredVariants}
            productId={productId}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </>
      )}
    </PageContainer>
  );
}

// Styled Components
const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  background: transparent;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }
`;

