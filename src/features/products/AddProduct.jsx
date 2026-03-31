import { useNavigate, Link } from "react-router-dom";
import useAuth from '../../shared/hooks/useAuth';
import useProduct from '../../shared/hooks/useProduct';
import ProductForm from '../../shared/components/forms/ProductForm';
import { generateSKU } from '../../shared/utils/helpers';
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { compressImage } from '../../shared/utils/imageCompressor';
import { toast } from 'react-toastify';
import { productService } from '../../shared/services/productApi';
import { PATHS } from '../../routes/routePaths';

/** Upload at most N images at once to balance speed vs server load */
const PRODUCT_IMAGE_UPLOAD_CONCURRENCY = 3;

async function runWithConcurrency(taskFns, concurrency) {
  const results = new Array(taskFns.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < taskFns.length) {
      const i = nextIndex;
      nextIndex += 1;
      results[i] = await taskFns[i]();
    }
  }
  const n = Math.min(concurrency, taskFns.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

const AddProductPage = () => {
  const navigate = useNavigate();
  const { seller, refetchAuth } = useAuth();
  const { createProduct } = useProduct();

  const handleSubmit = async (data) => {
    let currentSeller = seller;
    let sellerId = currentSeller?.id || currentSeller?._id;
    if (!sellerId && refetchAuth) {
      try {
        const result = await refetchAuth();
        const refetched = result?.data;
        currentSeller = refetched ?? seller;
        sellerId = currentSeller?.id || currentSeller?._id;
      } catch (_) {
        /* ignore */
      }
    }
    if (!sellerId) {
      console.error("AddProduct: No seller loaded. Please log in again.");
      toast.error("Session expired or seller not loaded. Please refresh the page or log in again.");
      return;
    }

    const formData = new FormData();

    try {
      // Validate categories first
      if (!data.parentCategory) {
        console.error("Invalid parent category ID");
        toast.error("Please select a parent category");
        return;
      }

      if (!data.subCategory) {
        console.error("Invalid sub category ID");
        toast.error("Please select a sub category");
        return;
      }

      // Use dedicated seller image upload endpoint for all product images
      const coverSource = data.imageCover || data.images?.[0] || null;
      const additionalSources = Array.isArray(data.images) ? data.images : [];
      const combinedSources = [
        ...(coverSource ? [coverSource] : []),
        ...additionalSources.filter((img) => img !== coverSource),
      ].slice(0, 8);

      const imageTasks = combinedSources.map((source, i) => async () => {
        let compressed = source;
        if (source instanceof File) {
          try {
            compressed = await compressImage(source, {
              quality: 0.85,
              maxWidth: 1200,
              maxHeight: 1200,
            });
          } catch {
            compressed = source;
          }
        }

        if (compressed instanceof File) {
          const uploaded = await productService.uploadProductImage(compressed);
          return {
            url: uploaded.url,
            thumbnail: uploaded.thumbnail || uploaded.url,
            medium: uploaded.medium || uploaded.url,
            large: uploaded.large || uploaded.url,
            publicId: uploaded.publicId,
            blurhash: uploaded.blurhash || null,
            position: i,
            alt: data.name || "",
          };
        }
        if (typeof compressed === "string" && compressed.trim()) {
          return {
            url: compressed,
            thumbnail: compressed,
            medium: compressed,
            large: compressed,
            publicId: null,
            blurhash: null,
            position: i,
            alt: data.name || "",
          };
        }
        return null;
      });

      const builtSlots = await runWithConcurrency(
        imageTasks,
        PRODUCT_IMAGE_UPLOAD_CONCURRENCY,
      );
      const uploadedImages = builtSlots
        .filter(Boolean)
        .sort((a, b) => a.position - b.position)
        .map((img, idx) => ({ ...img, position: idx }));

      if (uploadedImages.length === 0) {
        toast.error("At least one product image is required");
        return;
      }

      // Append basic product data
      formData.append("name", data.name);
      formData.append("brand", data.brand);
      formData.append("description", data.description);
      formData.append("parentCategory", data.parentCategory);
      formData.append("subCategory", data.subCategory);
      formData.append("images", JSON.stringify(uploadedImages));
      formData.append("imageCover", uploadedImages[0].url);

      // Calculate total stock and price
      let totalStock = 0;
      let productPrice = 0;

      if (data.productType === "simple") {
        totalStock = data.stock;
        productPrice = parseFloat(data.price) || 0;

        // Validate simple product price
        if (productPrice <= 0) {
          toast.error('Product price must be greater than 0', {
            position: 'top-right',
            autoClose: 5000,
          });
          return;
        }
      } else {
        // For variant products, calculate total stock and use minimum variant price as main price
        totalStock = data.variants.reduce(
          (sum, variant) => sum + (parseInt(variant.stock) || 0),
          0
        );
        // Use minimum variant price as the main product price
        const variantPrices = data.variants
          .map((v) => parseFloat(v.price) || 0)
          .filter((p) => p > 0);

        if (variantPrices.length === 0) {
          toast.error('At least one variant must have a price greater than 0', {
            position: 'top-right',
            autoClose: 5000,
          });
          return;
        }

        productPrice = Math.min(...variantPrices);

        // Validate all variant prices
        const invalidVariants = data.variants.filter(
          (v) => !v.price || parseFloat(v.price) <= 0
        );
        if (invalidVariants.length > 0) {
          toast.error('All variants must have a price greater than 0', {
            position: 'top-right',
            autoClose: 5000,
          });
          return;
        }
      }

      // Always append price (required by backend) - ensure it's > 0
      if (productPrice <= 0) {
        toast.error('Product price must be greater than 0', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }

      formData.append("price", productPrice.toString());
      formData.append("totalStock", totalStock.toString());

      // Format variants and process variant images
      const variantImagePromises = data.variants.map(async (variant, index) => {
        // Ensure attributes have values
        const attributes = variant.attributes.map((attr) => ({
          key: attr.key,
          value:
            attr.value != null && String(attr.value).trim() !== ''
              ? String(attr.value).trim()
              : '',
        }));

        // Separate existing images (strings) from new images (Files)
        const existingVariantImages = (variant.images || []).filter(
          (img) => typeof img === "string"
        );
        const newVariantImages = (variant.images || []).filter(
          (img) => img instanceof File
        );

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

        const variantPayload = {
          ...variant,
          attributes,
          price: variant.price ? Number(variant.price) : 0,
          stock: variant.stock ? Number(variant.stock) : 0,
          // If SKU is empty, generate it using the same helper as VariantForm/ProductForm
          sku:
            variant.sku ||
            generateSKU({
              seller,
              category: data.category,
              variants: variant,
            }),
          images: existingVariantImages,
        };
        const compareAt = parseFloat(variant.originalPrice);
        if (!Number.isNaN(compareAt) && compareAt > 0) {
          variantPayload.originalPrice = compareAt;
        } else {
          delete variantPayload.originalPrice;
        }
        return variantPayload;
      });

      // Wait for all variant image processing to complete
      const formattedVariants = await Promise.all(variantImagePromises);

      // Append variants as JSON string
      formData.append("variants", JSON.stringify(formattedVariants));

      // Append specifications - align with Product model shape
      const specifications = {
        material: (data.specifications?.material || [])
          .map((mat) => ({
            value: Array.isArray(mat.value) ? mat.value[0] || '' : (mat.value || ''),
            hexCode: mat.hexCode || '',
          }))
          .filter((mat) => mat.value || mat.hexCode),
        weight: data.specifications?.weight?.value
          ? {
            value: Number(data.specifications.weight.value) || 0,
            unit: data.specifications.weight.unit || 'kg',
          }
          : null,
        dimensions:
          data.specifications?.dimensions &&
          (data.specifications.dimensions.length ||
            data.specifications.dimensions.width ||
            data.specifications.dimensions.height)
            ? {
              length: Number(data.specifications.dimensions.length) || 0,
              width: Number(data.specifications.dimensions.width) || 0,
              height: Number(data.specifications.dimensions.height) || 0,
              unit: data.specifications.dimensions.unit || 'cm',
            }
            : null,
      };

      formData.append("specifications", JSON.stringify(specifications));
      formData.append("manufacturer", data.manufacturer || "");
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      if (data.metaTitle) {
        formData.append('metaTitle', data.metaTitle.trim());
      }
      if (data.metaDescription) {
        formData.append('metaDescription', data.metaDescription.trim());
      }

      // Handle warranty - ensure it's ALWAYS sent as a plain string (backend will parse and convert to object)
      // This prevents validation errors from Mongoose trying to cast objects to strings
      let warrantyValue = "";
      if (data.warranty !== undefined && data.warranty !== null && data.warranty !== "") {
        try {
          // If it's already a string, use it directly
          if (typeof data.warranty === 'string') {
            warrantyValue = data.warranty.trim();
          }
          // If it's an object, extract the details string or create a readable string
          else if (typeof data.warranty === 'object') {
            warrantyValue = data.warranty.details ||
              (data.warranty.duration && data.warranty.type
                ? `${data.warranty.duration} ${data.warranty.type}`.trim()
                : "");
          }
          // If it's something else, convert to string
          else {
            warrantyValue = String(data.warranty).trim();
          }
        } catch (e) {
          // If anything fails, just convert to string
          warrantyValue = String(data.warranty).trim();
        }
      }
      // Always append as a plain string, never as object or JSON
      formData.append("warranty", warrantyValue);
      formData.append("condition", data.variants?.[0]?.condition || "new");
      // Return window
      if (data.returnWindowDays != null) {
        formData.append("returnWindowDays", String(data.returnWindowDays));
      }
      // Pre-order fields
      formData.append("isPreOrder", data.isPreOrder ? "true" : "false");
      if (data.isPreOrder) {
        if (data.preOrderAvailableDate) {
          formData.append("preOrderAvailableDate", data.preOrderAvailableDate);
        }
        if (data.preOrderNote) {
          formData.append("preOrderNote", data.preOrderNote.trim());
        }
      }
      if (data.promotionKey) {
        formData.append("promotionKey", data.promotionKey.trim());
      }
      formData.append("status", data.productStatus || "active");
      // Append video if present
      if (data.video) {
        // If it's a File, multer will pick it up from req.files
        // If it's a string (e.g. existing video URL), it will be in req.body
        formData.append("video", data.video);
      }

      // Backend sets seller from auth; we append for consistency when we have it
      formData.append("seller", sellerId);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[AddProduct] submitting keys:', [...formData.keys()]);
      }

      // Submit form data
      createProduct.mutate(formData, {
        onSuccess: () => {
          navigate(PATHS.PRODUCTS);
        },
        onError: (error) => {
          console.error("Creation error:", error);
          toast.error(error?.response?.data?.message || error.message || 'Failed to create product');
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the console for details.");
    }
  };

  return (
    <PageContainer>
      <HeaderContainer>
        <Breadcrumb aria-label="Breadcrumb">
          <BreadcrumbLink to={PATHS.PRODUCTS}>
            Products
          </BreadcrumbLink>
          <BreadcrumbSep>/</BreadcrumbSep>
          <BreadcrumbCurrent>Add new product</BreadcrumbCurrent>
        </Breadcrumb>
        <BackButton type="button" onClick={() => navigate(PATHS.PRODUCTS)}>
          <FaArrowLeft />
          Back to Products
        </BackButton>
        <PageTitle>Add new product</PageTitle>
        <HeaderDescription>
          Fill out the form below to list a product in your store
        </HeaderDescription>
      </HeaderContainer>

      <FormContainer>
        <ProductForm
          mode="add"
          onSubmit={handleSubmit}
          isSubmitting={createProduct.isPending}
          hidePageHeader
        />
      </FormContainer>
    </PageContainer>
  );
};

export default AddProductPage;

const PageContainer = styled.div`
  padding: 1rem;
  background-color: #F9F8F5;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderContainer = styled.div`
  margin-bottom: 2.5rem;
  position: relative;
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8125rem;
  margin-bottom: 0.75rem;
`;

const BreadcrumbLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;
  &:hover {
    color: #e8920a;
  }
`;

const BreadcrumbSep = styled.span`
  color: #9ca3af;
`;

const BreadcrumbCurrent = styled.span`
  color: #111827;
  font-weight: 500;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 400;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #F9F8F5;
    border-color: #E5E7EB;
    transform: translateY(-1px);
  }

  svg {
    font-size: 0.875rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 1rem 0 0.375rem;
`;

const HeaderDescription = styled.p`
  font-size: 0.8125rem;
  font-weight: 400;
  color: #9CA3AF;
  max-width: 700px;
  line-height: 1.5;
`;

const FormContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 0.5px solid #e8e4dc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;
