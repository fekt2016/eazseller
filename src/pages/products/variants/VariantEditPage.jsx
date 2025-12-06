import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import {
  PageContainer,
  PageHeader,
  TitleSection,
} from '../../../shared/components/ui/SpacingSystem';
import { LoadingState } from '../../../shared/components/ui/LoadingComponents';
import VariantForm from '../../../components/products/variants/VariantForm';
import useVariants from '../../../shared/hooks/variants/useVariants';
import { compressImage } from '../../../shared/utils/imageCompressor';

export default function VariantEditPage() {
  const { productId, variantId } = useParams();
  const navigate = useNavigate();
  const { getVariant, updateVariant } = useVariants();

  const { data: variantData, isLoading: variantLoading } = getVariant(
    productId,
    variantId
  );

  const handleSubmit = async (data) => {
    try {
      // Separate existing images (strings) from new images (Files)
      const existingImages = [];
      const newImages = [];
      const imagesToDelete = [];

      if (data.images && data.images.length > 0) {
        data.images.forEach((img) => {
          if (typeof img === "string") {
            existingImages.push(img);
          } else if (img instanceof File) {
            newImages.push(img);
          }
        });
      }

      // Compress new images
      const processedNewImages = [];
      if (newImages.length > 0) {
        const compressionResults = await Promise.allSettled(
          newImages.map(compressImage)
        );

        compressionResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            processedNewImages.push(result.value);
          } else {
            console.warn(`Image ${index} compression failed:`, result.reason);
            processedNewImages.push(newImages[index]);
          }
        });
      }

      // Find images that were removed (existing images not in the new list)
      const originalImages = variantData?.images || [];
      originalImages.forEach((originalImg) => {
        if (!existingImages.includes(originalImg)) {
          imagesToDelete.push(originalImg);
        }
      });

      const variantUpdateData = {
        ...data,
        images: processedNewImages,
        imagesToDelete,
      };

      await updateVariant.mutateAsync({
        productId,
        variantId,
        body: variantUpdateData,
      });

      // Navigate back to variants list
      navigate(`/dashboard/products/${productId}/variants`);
    } catch (error) {
      console.error("Failed to update variant:", error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Failed to update variant. Please try again."
      );
    }
  };

  if (variantLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading variant..." />
      </PageContainer>
    );
  }

  if (!variantData) {
    return (
      <PageContainer>
        <div>Variant not found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <h1>Edit Variant</h1>
          <p>Update variant information</p>
        </TitleSection>
      </PageHeader>

      <VariantForm
        initialData={variantData}
        onSubmit={handleSubmit}
        isSubmitting={updateVariant.isPending}
        productId={productId}
      />
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

