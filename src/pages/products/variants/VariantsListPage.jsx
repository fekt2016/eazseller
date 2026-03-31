import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaPlus, FaArrowLeft, FaBoxOpen } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import Button from '../../../shared/components/ui/Button';
import SearchBox from '../../../shared/components/ui/SearchBox';
import { LoadingState, EmptyState } from '../../../shared/components/ui/LoadingComponents';
import VariantTable from '../../../components/products/variants/VariantTable';
import useVariants from '../../../shared/hooks/variants/useVariants';
import useProduct from '../../../shared/hooks/useProduct';
import { toast } from 'react-toastify';

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

  const product = useMemo(() => {
    // Normalize product shape from API response
    return (
      productData?.data?.product ||
      productData?.data ||
      productData ||
      null
    );
  }, [productData]);

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
      toast.error("Failed to delete variant. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (variantsLoading || productLoading) {
    return (
      <VariantListPage>
        <LoadingState message="Loading variants..." />
      </VariantListPage>
    );
  }

  const productName = product?.name || "Product";
  const productImage =
    (product?.imageCover && typeof product.imageCover === "object"
      ? product.imageCover.url
      : product?.imageCover) || null;

  return (
    <VariantListPage>
      <VarHeader>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </BackButton>
        <VarTitleSection>
          <h1>Product Variants</h1>
          <p>Manage variants for: <strong>{productName}</strong></p>
        </VarTitleSection>
        <VarActions>
          <Button
            as={Link}
            to={`/dashboard/products/${productId}/variants/create`}
            variant="primary"
            size="md"
            gradient
          >
            <FaPlus /> Add Variant
          </Button>
        </VarActions>
      </VarHeader>

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
        <TableCard>
          <SearchToolbar>
            <SearchBox
              placeholder="Search variants by name, attributes, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchToolbar>

          <VariantTable
            variants={filteredVariants}
            productId={productId}
            productImage={productImage}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </TableCard>
      )}
    </VariantListPage>
  );
}

// Styled Components
const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 32px;
  padding: 0 0.75rem;
  background: transparent;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  color: #6B7280;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s;
  flex-shrink: 0;

  &:hover {
    background: #F9F8F5;
    border-color: #E8920A;
    color: #374151;
  }
`;

const VariantListPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const VarHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid #E8920A;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const VarTitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  h1 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  p {
    font-size: 0.8rem;
    color: #9CA3AF;
    margin: 0;

    &::before {
      content: '·';
      margin-right: 0.5rem;
      color: #D1D5DB;
    }

    strong { color: #374151; font-weight: 500; }
  }
`;

const VarActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const TableCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const SearchToolbar = styled.div`
  padding: 0.875rem 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
`;
