import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import {
  PageContainer,
  PageHeader,
  TitleSection,
} from '../../../shared/components/ui/SpacingSystem';
import VariantForm from '../../../components/products/variants/VariantForm';
import useVariants from '../../../shared/hooks/variants/useVariants';
import { compressImage } from '../../../shared/utils/imageCompressor';

export default function VariantCreatePage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { createVariant } = useVariants();

  const handleSubmit = async (data) => {
    try {
      // Compress images if any
      const processedImages = [];
      if (data.images && data.images.length > 0) {
        const compressionResults = await Promise.allSettled(
          data.images.map(compressImage)
        );

        compressionResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            processedImages.push(result.value);
          } else {
            console.warn(`Image ${index} compression failed:`, result.reason);
            processedImages.push(data.images[index]);
          }
        });
      }

      const variantData = {
        ...data,
        images: processedImages,
      };

      await createVariant.mutateAsync({
        productId,
        body: variantData,
      });

      // Navigate back to variants list
      navigate(`/dashboard/products/${productId}/variants`);
    } catch (error) {
      console.error("Failed to create variant:", error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Failed to create variant. Please try again."
      );
    }
  };

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <h1>Create New Variant</h1>
          <p>Add a new variant to your product</p>
        </TitleSection>
      </PageHeader>

      <VariantForm
        onSubmit={handleSubmit}
        isSubmitting={createVariant.isPending}
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

