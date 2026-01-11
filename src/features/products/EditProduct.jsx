import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import styled from "styled-components";
import useProduct from '../../shared/hooks/useProduct';
import useVariants from '../../shared/hooks/variants/useVariants';
import ProductForm from '../../shared/components/forms/ProductForm';
import { compressImage } from '../../shared/utils/imageCompressor';
import { LoadingContainer } from '../../shared/components/LoadingSpinner';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PageContainer, PageHeader, TitleSection, ActionSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import Button from '../../shared/components/ui/Button';
// Card component will be created inline if needed
import { PATHS } from '../../routes/routePaths';
import { FaLayerGroup, FaBox, FaInfoCircle, FaArrowRight } from "react-icons/fa";

const EditProduct = () => {
  const { id: productId } = useParams();

  const { useGetProductById, updateProduct } = useProduct();
  const {
    data: productResponse,
    isLoading,
    error,
  } = useGetProductById(productId);
  console.log("product", productResponse);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const product = productResponse?.data?.product || {};
  console.log("prod", product);

  // Fetch variants from API
  const { getVariants } = useVariants();
  const { data: variantsData, isLoading: variantsLoading } = getVariants(productId);
  
  const variants = useMemo(() => {
    return variantsData?.data || variantsData || [];
  }, [variantsData]);

  const hasVariants = variants && variants.length > 0;
  const variantCount = variants?.length || 0;
  const totalVariantStock = useMemo(() => {
    return variants?.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0) || 0;
  }, [variants]);

  // SEO - Update page title and meta tags based on product data
  useDynamicPageTitle({
    title: "Product Details",
    dynamicTitle: product?.name && `${product.name} — Manage Product`,
    description: "View and update your product.",
    defaultTitle: "EazSeller Dashboard",
  });

  const initialFormData = useMemo(() => {
    if (!product || Object.keys(product).length === 0) return {};

    // Parse variants if stored as string
    const parsedVariants =
      typeof product.variants === "string"
        ? JSON.parse(product.variants)
        : product.variants || [];

    return {
      // Basic fields
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      brand: product.brand || "",
      manufacturer: product.manufacturer || "",
      warranty: product.warranty || "",
      condition: product.condition || "new",

      // Image handling
      imageCover: product.imageCover?.url || product.imageCover || "",
      images: (product.images || []).map((img) =>
        typeof img === "object" ? img.url : img
      ),

      // Categories
      parentCategory: product.parentCategory
        ? {
            value: product.parentCategory._id,
            label: product.parentCategory.name,
          }
        : null,
      subCategory: product.subCategory
        ? { value: product.subCategory._id, label: product.subCategory.name }
        : null,

      // Variants handling
      variants: parsedVariants.map((variant) => ({
        ...variant,
        price: parseFloat(variant.price) || 0,
        stock: parseInt(variant.stock) || 0,
        attributes: variant.attributes || [],
      })),

      // Specifications handling
      specifications: {
        weight: product.specifications?.weight || "",
        dimension: product.specifications?.dimension || "",
        material: (product.specifications?.material || []).map((m) => ({
          hexCode: m.hexCode || "",
          value: Array.isArray(m.value) ? m.value : [m.value || ""],
        })),
      },

      // Attributes handling
      attributes: product.attributes || [],
    };
  }, [product]);
  console.log(" edit initial form data", initialFormData);
  const handleSubmit = async (data) => {
    console.log("Form data before submission:", data);
    const formData = new FormData();

    try {
      // Handle image cover
      if (data.imageCover instanceof File) {
        const compressedCover = await compressImage(data.imageCover, {
          quality: 0.7,
          maxWidth: 1024,
          maxHeight: 1024,
        });
        formData.append("imageCover", compressedCover);
      } else if (data.imageCover) {
        formData.append("imageCover", data.imageCover);
      }

      // Handle images
      const existingImages = data.images.filter(
        (img) => typeof img === "string"
      );
      const newImages = data.images.filter((img) => img instanceof File);

      // 1. Stringify existing images array
      formData.append("existingImages", JSON.stringify(existingImages));

      // 2. Use separate field for new images
      const compressedNewImages = await Promise.all(
        newImages.map((file) =>
          compressImage(file, { quality: 0.6, maxWidth: 800, maxHeight: 800 })
        )
      );

      compressedNewImages.forEach((file) => {
        formData.append("newImages", file); // Changed field name
      });

      // Other fields
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("parentCategory", data.parentCategory);
      formData.append("subCategory", data.subCategory);
      formData.append("brand", data.brand);
      formData.append("manufacturer", data.manufacturer);
      formData.append("warranty", data.warranty);
      formData.append("condition", data.condition);
      // formData.append("variants", JSON.stringify(data.variants));

      // Process variant images asynchronously
      const variantImagePromises = data.variants.map(async (variant, index) => {
        // Append variant fields
        formData.append(`variants[${index}][price]`, variant.price.toString());
        formData.append(`variants[${index}][stock]`, variant.stock.toString());
        formData.append(`variants[${index}][sku]`, variant.sku);
        formData.append(`variants[${index}][status]`, variant.status);

        // Include _id if exists (for updates)
        if (variant._id) {
          formData.append(`variants[${index}][_id]`, variant._id);
        }

        // Handle variant attributes
        variant.attributes.forEach((attr, attrIndex) => {
          formData.append(
            `variants[${index}][attributes][${attrIndex}][key]`,
            attr.key
          );
          formData.append(
            `variants[${index}][attributes][${attrIndex}][value]`,
            attr.value
          );
        });

        // Handle variant images
        const existingVariantImages = (variant.images || []).filter(
          (img) => typeof img === "string"
        );
        const newVariantImages = (variant.images || []).filter(
          (img) => img instanceof File
        );

        // Append existing images as JSON (will be merged with new ones on backend)
        if (existingVariantImages.length > 0) {
          formData.append(`variants[${index}][images]`, JSON.stringify(existingVariantImages));
        }

        // Process and append new variant images as files
        if (newVariantImages.length > 0) {
          const compressionResults = await Promise.allSettled(
            newVariantImages.map((file) =>
              compressImage(file, { quality: 0.6, maxWidth: 800, maxHeight: 800 })
            )
          );

          compressionResults.forEach((result, imgIndex) => {
            if (result.status === "fulfilled") {
              formData.append(`variantImages[${index}]`, result.value);
            } else {
              console.warn(`Variant ${index} image ${imgIndex} compression failed:`, result.reason);
              if (newVariantImages[imgIndex]) {
                formData.append(`variantImages[${index}]`, newVariantImages[imgIndex]);
              }
            }
          });
        }
      });

      // Wait for all variant image processing to complete
      await Promise.all(variantImagePromises);
      formData.append("specifications[weight]", data.specifications.weight);
      formData.append(
        "specifications[dimension]",
        data.specifications.dimension
      );

      data.specifications.material.forEach((mat, index) => {
        formData.append(
          `specifications[material][${index}][hexCode]`,
          mat.hexCode
        );
        const values = Array.isArray(mat.value) ? mat.value : [mat.value];
        values.forEach((val, valIndex) => {
          formData.append(
            `specifications[material][${index}][value][${valIndex}]`,
            val
          );
        });
      });
      // formData.append("attributes", JSON.stringify(data.attributes));

      // Debug log
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }
      updateProduct.mutate({
        id: product._id,
        data: formData,
      });
    } catch (err) {
      console.error("Submission error:", err);
    }
  };
  if (isLoading) return <LoadingContainer />;
  if (error) return <div>{error.message}</div>;
  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Edit Product</h1>
          <p>{product?.name || "Update product information"}</p>
        </TitleSection>
        <ActionSection>
          <Button
            as={Link}
            to={PATHS.PRODUCT_VARIANTS.replace(':productId', productId)}
            variant="outline"
            size="md"
          >
            <FaLayerGroup /> Manage Variants
          </Button>
        </ActionSection>
      </PageHeader>

      {/* Variants Summary Card */}
      {!variantsLoading && (
        <Section $padding="lg" $marginBottom="lg">
          <VariantsCard>
            <VariantsSummaryHeader>
              <VariantsTitle>
                <FaLayerGroup />
                <div>
                  <h3>Product Variants</h3>
                  <VariantsSubtitle>
                    {hasVariants 
                      ? `${variantCount} variant${variantCount !== 1 ? 's' : ''} configured`
                      : 'No variants configured'}
                  </VariantsSubtitle>
                </div>
              </VariantsTitle>
              <Button
                as={Link}
                to={PATHS.PRODUCT_VARIANTS.replace(':productId', productId)}
                variant={hasVariants ? "primary" : "outline"}
                size="md"
              >
                {hasVariants ? (
                  <>
                    <FaLayerGroup /> View All Variants
                  </>
                ) : (
                  <>
                    <FaBox /> Add Variants
                  </>
                )}
                <FaArrowRight />
              </Button>
            </VariantsSummaryHeader>

            {hasVariants && (
              <VariantsInfo>
                <InfoItem>
                  <InfoLabel>Total Variants:</InfoLabel>
                  <InfoValue>{variantCount}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Total Stock:</InfoLabel>
                  <InfoValue>{totalVariantStock} units</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Active Variants:</InfoLabel>
                  <InfoValue>
                    {variants.filter(v => v.status === 'active').length}
                  </InfoValue>
                </InfoItem>
              </VariantsInfo>
            )}

            {hasVariants && (
              <VariantsPreview>
                <PreviewTitle>Quick Preview:</PreviewTitle>
                <VariantsList>
                  {variants.slice(0, 3).map((variant, idx) => (
                    <VariantPreviewItem key={variant._id || idx}>
                      <VariantAttributes>
                        {variant.attributes?.map((attr, ai) => (
                          <AttributeBadge key={ai}>
                            {attr.key}: {attr.value}
                          </AttributeBadge>
                        )) || <span>No attributes</span>}
                      </VariantAttributes>
                      <VariantDetails>
                        <span>Price: GH₵{parseFloat(variant.price || 0).toFixed(2)}</span>
                        <span>Stock: {variant.stock || 0}</span>
                        <StatusBadge $status={variant.status || 'active'}>
                          {variant.status || 'active'}
                        </StatusBadge>
                      </VariantDetails>
                    </VariantPreviewItem>
                  ))}
                </VariantsList>
                {variantCount > 3 && (
                  <ViewMoreLink
                    as={Link}
                    to={PATHS.PRODUCT_VARIANTS.replace(':productId', productId)}
                  >
                    View all {variantCount} variants <FaArrowRight />
                  </ViewMoreLink>
                )}
              </VariantsPreview>
            )}

            {!hasVariants && (
              <NoVariantsMessage>
                <FaInfoCircle />
                <div>
                  <p>This product doesn't have any variants yet.</p>
                  <p>Add variants to offer different options (size, color, etc.) to your customers.</p>
                </div>
              </NoVariantsMessage>
            )}
          </VariantsCard>
        </Section>
      )}

      {product && (
        <ProductForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          isSubmitting={updateProduct.isLoading}
          mode="edit"
        />
      )}
    </PageContainer>
  );
};

export default EditProduct;

// Styled Components
const VariantsCard = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
`;

const VariantsSummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
`;

const VariantsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  svg {
    font-size: var(--font-size-2xl);
    color: var(--color-primary-500);
  }
  
  h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
    font-family: var(--font-heading);
  }
`;

const VariantsSubtitle = styled.p`
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
`;

const VariantsInfo = styled.div`
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const InfoLabel = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const VariantsPreview = styled.div`
  margin-top: var(--spacing-lg);
`;

const PreviewTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
`;

const VariantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const VariantPreviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const VariantAttributes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  flex: 1;
`;

const AttributeBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--border-radius-cir);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
`;

const VariantDetails = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  text-transform: capitalize;
  
  background-color: ${({ $status }) => 
    $status === 'active' 
      ? 'var(--color-green-100)' 
      : 'var(--color-grey-100)'};
  color: ${({ $status }) => 
    $status === 'active' 
      ? 'var(--color-green-700)' 
      : 'var(--color-grey-700)'};
`;

const ViewMoreLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary-500);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  text-decoration: none;
  margin-top: var(--spacing-sm);
  transition: var(--transition-base);
  
  &:hover {
    color: var(--color-primary-600);
    text-decoration: underline;
  }
`;

const NoVariantsMessage = styled.div`
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  
  svg {
    font-size: var(--font-size-xl);
    color: var(--color-blue-600);
    flex-shrink: 0;
    margin-top: var(--spacing-xs);
  }
  
  p {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--font-size-sm);
    color: var(--color-grey-700);
    font-family: var(--font-body);
    line-height: 1.6;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;
