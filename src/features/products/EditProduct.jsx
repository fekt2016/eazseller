import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import useProduct from '../../shared/hooks/useProduct';
import useVariants from '../../shared/hooks/variants/useVariants';
import useAuth from '../../shared/hooks/useAuth';
import useAnalytics from '../../shared/hooks/useAnalytics';
import ProductForm from '../../shared/components/forms/ProductForm';
import { compressImage } from '../../shared/utils/imageCompressor';
import { LoadingContainer } from '../../shared/components/LoadingSpinner';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import Button from '../../shared/components/ui/Button';
import { PATHS } from '../../routes/routePaths';
import { FaLayerGroup, FaBox, FaInfoCircle, FaArrowRight, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';
import { productService } from '../../shared/services/productApi';

const EditProduct = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { seller } = useAuth();
  const sellerId = seller?._id ?? seller?.id ?? null;
  const { useGetSellerProductViews } = useAnalytics();
  const { data: viewData } = useGetSellerProductViews(sellerId, { enabled: !!sellerId && !!productId });

  const productViewCount = useMemo(() => {
    const views = viewData?.data?.views || [];
    const productIdStr = productId?.toString?.() ?? productId;
    const item = views.find((v) => (v.productId?.toString?.() ?? v.productId) === productIdStr);
    return item?.views ?? 0;
  }, [viewData?.data?.views, productId]);

  const { useGetProductById, updateProduct } = useProduct();
  const {
    data: productResponse,
    isLoading,
    error,
  } = useGetProductById(productId);

  const product = productResponse?.data?.product || {};

  // Fetch variants from API
  const { getVariants } = useVariants();
  const { data: variantsData, isLoading: variantsLoading } = getVariants(productId);

  const variants = useMemo(() => {
    const rawVariants = variantsData?.data || variantsData || [];

    // Deduplicate variants by _id to prevent showing duplicates
    if (!Array.isArray(rawVariants)) return [];

    const seen = new Set();
    const uniqueVariants = rawVariants.filter((variant) => {
      const id = variant._id || variant.id || JSON.stringify(variant);
      if (seen.has(id)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[EditProduct] Duplicate variant detected and removed:', id);
        }
        return false;
      }
      seen.add(id);
      return true;
    });

    if (process.env.NODE_ENV === 'development' && rawVariants.length !== uniqueVariants.length) {
      console.log('[EditProduct] Variants deduplication:', {
        original: rawVariants.length,
        unique: uniqueVariants.length,
        removed: rawVariants.length - uniqueVariants.length,
      });
    }

    return uniqueVariants;
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
    defaultTitle: "Saiisai Seller Dashboard",
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
      warranty: (() => {
        // Always convert warranty to a plain string for the form
        if (!product.warranty) return "";
        if (typeof product.warranty === 'string') return product.warranty.trim();
        if (typeof product.warranty === 'object' && product.warranty !== null) {
          // Extract details or create readable string from object
          return product.warranty.details ||
            (product.warranty.duration && product.warranty.type
              ? `${product.warranty.duration} ${product.warranty.type}`.trim()
              : "");
        }
        return String(product.warranty).trim();
      })(),
      condition: product.condition || "new",
      promotionKey: product.promotionKey || "",

      // Image handling — align with ProductForm / AddProduct: cover + gallery slots
      ...(() => {
        const rawImages = Array.isArray(product.images) ? [...product.images] : [];
        const firstUrl = rawImages[0]
          ? typeof rawImages[0] === "string"
            ? rawImages[0]
            : rawImages[0]?.url || ""
          : "";
        const coverStr =
          product.coverImage ||
          product.imageCover?.url ||
          (typeof product.imageCover === "string" ? product.imageCover : "") ||
          "";
        const resolvedCover =
          (coverStr && String(coverStr).trim()) ||
          (firstUrl && String(firstUrl).trim()) ||
          "";
        let gallery = rawImages;
        if (
          resolvedCover &&
          firstUrl &&
          String(firstUrl).trim() === String(resolvedCover).trim()
        ) {
          gallery = rawImages.slice(1);
        }
        return { imageCover: resolvedCover, images: gallery };
      })(),

      // Categories - extract IDs as strings for form
      parentCategory: product.parentCategory
        ? (product.parentCategory._id || product.parentCategory)
        : "",
      subCategory: product.subCategory
        ? (product.subCategory._id || product.subCategory)
        : "",

      // Variants handling
      variants: parsedVariants.map((variant) => ({
        ...variant,
        price: parseFloat(variant.price) || 0,
        stock: parseInt(variant.stock) || 0,
        attributes: variant.attributes || [],
      })),

      // Specifications handling - convert objects to strings for form inputs
      specifications: {
        weight: product.specifications?.weight
          ? (typeof product.specifications.weight === 'object' && product.specifications.weight !== null
            ? `${product.specifications.weight.value || ''}${product.specifications.weight.unit || ''}`.trim()
            : String(product.specifications.weight).trim())
          : "",
        dimension: product.specifications?.dimensions
          ? (typeof product.specifications.dimensions === 'object' && product.specifications.dimensions !== null
            ? `${product.specifications.dimensions.length || ''}x${product.specifications.dimensions.width || ''}x${product.specifications.dimensions.height || ''}${product.specifications.dimensions.unit || ''}`.trim()
            : String(product.specifications.dimensions).trim())
          : "",
        material: (product.specifications?.material || []).map((m) => ({
          hexCode: m.hexCode || "",
          value: Array.isArray(m.value) ? (m.value[0] || "") : (m.value || ""), // Ensure value is a string, not array
        })),
      },

      // Attributes handling
      attributes: product.attributes || [],

      // Video handling
      video: product.video || "",
    };
  }, [product]);
  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setHasUnsavedChanges(false);
    const formData = new FormData();

    // CRITICAL: Ensure warranty is a plain string before processing
    // Convert any object/JSON to a plain string immediately
    if (data.warranty && typeof data.warranty === 'object') {
      data.warranty = data.warranty.details ||
        (data.warranty.duration && data.warranty.type
          ? `${data.warranty.duration} ${data.warranty.type}`.trim()
          : "");
    } else if (data.warranty && typeof data.warranty === 'string' && data.warranty.trim().startsWith('{')) {
      // If it's a JSON string, parse and extract
      try {
        const parsed = JSON.parse(data.warranty);
        if (typeof parsed === 'object' && parsed !== null) {
          data.warranty = parsed.details ||
            (parsed.duration && parsed.type
              ? `${parsed.duration} ${parsed.type}`.trim()
              : "");
        }
      } catch (e) {
        // If parsing fails, use as-is but ensure it's a string
        data.warranty = String(data.warranty).trim();
      }
    }

    try {
      // Same ordering as AddProduct: cover first, then gallery (dedupe by URL vs cover)
      const coverSource = data.imageCover || data.images?.[0] || null;
      const additionalSources = Array.isArray(data.images) ? data.images : [];
      const urlKey = (src) => {
        if (!src) return "";
        if (typeof src === "string") return src.trim();
        if (src instanceof File) return "";
        if (typeof src === "object" && src.url) return String(src.url).trim();
        return "";
      };
      const combinedSources = [
        ...(coverSource ? [coverSource] : []),
        ...additionalSources.filter((img) => {
          if (img === coverSource) return false;
          if (coverSource instanceof File || img instanceof File) {
            return img !== coverSource;
          }
          const a = urlKey(coverSource);
          const b = urlKey(img);
          if (a && b && a === b) return false;
          return true;
        }),
      ].slice(0, 8);

      const uploadedImages = [];
      for (let i = 0; i < combinedSources.length; i += 1) {
        const item = combinedSources[i];
        if (item instanceof File) {
          let compressed = item;
          try {
            compressed = await compressImage(item, {
              quality: 0.85,
              maxWidth: 1200,
              maxHeight: 1200,
            });
          } catch {
            compressed = item;
          }
          const uploaded = await productService.uploadProductImage(compressed);
          uploadedImages.push({
            url: uploaded.url,
            thumbnail: uploaded.thumbnail || uploaded.url,
            medium: uploaded.medium || uploaded.url,
            large: uploaded.large || uploaded.url,
            publicId: uploaded.publicId,
            blurhash: uploaded.blurhash || null,
            position: i,
            alt: data.name || "",
          });
        } else if (typeof item === "string" && item.trim()) {
          uploadedImages.push({
            url: item,
            thumbnail: item,
            medium: item,
            large: item,
            publicId: null,
            blurhash: null,
            position: i,
            alt: data.name || "",
          });
        } else if (item && typeof item === "object" && item.url) {
          uploadedImages.push({
            ...item,
            position: i,
            alt: item.alt || data.name || "",
          });
        }
      }

      if (uploadedImages.length === 0) {
        toast.error("At least one product image is required", {
          position: 'top-right',
          autoClose: 5000,
        });
        setIsSubmitting(false);
        setHasUnsavedChanges(true);
        return;
      }

      formData.append("images", JSON.stringify(uploadedImages));
      formData.append("imageCover", uploadedImages[0].url);

      // Other fields - ensure required fields are always sent
      formData.append("name", data.name || "");
      formData.append("description", data.description || "");

      // Price is required - ensure it's always sent and valid
      const productPrice = parseFloat(data.price) || 0;
      if (productPrice <= 0) {
        toast.error('Product price must be greater than 0', {
          position: 'top-right',
          autoClose: 5000,
        });
        setIsSubmitting(false);
        setHasUnsavedChanges(true);
        return;
      }
      formData.append("price", productPrice.toString());

      // Categories are required
      if (!data.parentCategory) {
        toast.error('Parent category is required', {
          position: 'top-right',
          autoClose: 5000,
        });
        setIsSubmitting(false);
        setHasUnsavedChanges(true);
        return;
      }
      formData.append("parentCategory", data.parentCategory);

      if (!data.subCategory) {
        toast.error('Sub category is required', {
          position: 'top-right',
          autoClose: 5000,
        });
        setIsSubmitting(false);
        setHasUnsavedChanges(true);
        return;
      }
      formData.append("subCategory", data.subCategory);

      formData.append("brand", data.brand || "");
      formData.append("manufacturer", data.manufacturer);
      if (data.promotionKey) {
        formData.append("promotionKey", data.promotionKey.trim());
      } else {
        formData.append("promotionKey", "");
      }

      // IMPORTANT: Do NOT send warranty from EditProduct to avoid casting issues.
      // The existing warranty stored in the product will be preserved on update.

      formData.append("condition", data.condition);

      // Append video if present
      if (data.video) {
        // If it's a File, multer will pick it up from req.files
        // If it's a string (e.g. existing video URL), it will be in req.body
        formData.append("video", data.video);
      }

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
      } else {
        // Clear pre-order fields when toggled off
        formData.append("preOrderAvailableDate", "");
        formData.append("preOrderNote", "");
      }
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

      // Handle specifications - send as JSON string
      // Only include fields that have values (don't send null/empty fields)
      const specifications = {};

      // Material array
      const materials = (data.specifications?.material || [])
        .map((mat) => ({
          value: Array.isArray(mat.value) ? mat.value[0] || "" : (mat.value || ""),
          hexCode: mat.hexCode || "",
        }))
        .filter((mat) => mat.value || mat.hexCode); // Filter out empty materials

      if (materials.length > 0) {
        specifications.material = materials;
      }

      // Weight object
      if (data.specifications?.weight) {
        const weightStr = String(data.specifications.weight).trim();
        if (weightStr) {
          const weightMatch = weightStr.match(/([\d.]+)\s*([a-z]+)/i);
          if (weightMatch) {
            specifications.weight = {
              value: parseFloat(weightMatch[1]) || 0,
              unit: weightMatch[2].toLowerCase() || 'g',
            };
          } else {
            // If no unit found, try to extract number and default to 'g'
            const numMatch = weightStr.match(/([\d.]+)/);
            if (numMatch) {
              specifications.weight = {
                value: parseFloat(numMatch[1]) || 0,
                unit: 'g',
              };
            }
          }
        }
      }

      // Dimensions object (note: form field is 'dimension' but schema expects 'dimensions')
      if (data.specifications?.dimension) {
        const dimStr = String(data.specifications.dimension).trim();
        if (dimStr) {
          // Match format: "10x10x5cm" or "10x10x5" or "10 x 10 x 5 cm"
          const dimMatch = dimStr.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*([a-z]+)?/i);
          if (dimMatch) {
            const length = parseFloat(dimMatch[1]) || 0;
            const width = parseFloat(dimMatch[2]) || 0;
            const height = parseFloat(dimMatch[3]) || 0;
            const unit = dimMatch[4]?.toLowerCase() || 'cm';

            // Validate unit is in enum ['cm', 'in']
            const validUnit = (unit === 'cm' || unit === 'in') ? unit : 'cm';

            // Only add if we have valid dimensions
            if (length > 0 && width > 0 && height > 0) {
              specifications.dimensions = {
                length,
                width,
                height,
                unit: validUnit,
              };
            }
          }
        }
      }

      // Only append specifications if it has at least one field
      if (Object.keys(specifications).length > 0) {
        formData.append("specifications", JSON.stringify(specifications));
      }
      // formData.append("attributes", JSON.stringify(data.attributes));

      // Debug: Log what's being sent (in development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[EditProduct] FormData contents:');
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
          } else {
            console.log(`  ${key}:`, value);
          }
        }
      }

      updateProduct.mutate(
        {
          id: product._id,
          data: formData,
        },
        {
          onSuccess: () => {
            toast.success('Product updated successfully!', {
              position: 'top-right',
              autoClose: 3000,
            });
            setIsSubmitting(false);
            // Navigate back after a short delay
            setTimeout(() => {
              navigate(PATHS.PRODUCTS);
            }, 1500);
          },
          onError: (error) => {
            // Log full error details for debugging
            console.error('[EditProduct] Update error - Full details:', {
              message: error?.message,
              response: error?.response?.data,
              status: error?.response?.status,
              statusText: error?.response?.statusText,
              headers: error?.response?.headers,
              request: error?.request,
              config: error?.config,
            });

            // Extract error message - check multiple possible locations
            let errorMessage = 'Failed to update product. Please try again.';
            let errorDetails = null;

            if (error?.response?.data) {
              const responseData = error.response.data;

              // Check for validation errors object
              if (responseData.errors && typeof responseData.errors === 'object') {
                const validationErrors = Object.entries(responseData.errors)
                  .map(([field, message]) => {
                    const msg = Array.isArray(message) ? message.join(', ') : message;
                    return `${field}: ${msg}`;
                  })
                  .join('\n');
                errorMessage = `Validation errors:\n${validationErrors}`;
                errorDetails = responseData.errors;
              }
              // Check for message field (could be a string or object)
              else if (responseData.message) {
                errorMessage = typeof responseData.message === 'string'
                  ? responseData.message
                  : JSON.stringify(responseData.message);
              }
              // Check for error field
              else if (responseData.error) {
                errorMessage = typeof responseData.error === 'string'
                  ? responseData.error
                  : JSON.stringify(responseData.error);
              }
              // Check for status field
              else if (responseData.status === 'fail' || responseData.status === 'error') {
                errorMessage = responseData.message || 'Update failed';
              }
            } else if (error?.message) {
              errorMessage = error.message;
            }

            // Log the extracted error message
            console.error('[EditProduct] Extracted error message:', errorMessage);
            if (errorDetails) {
              console.error('[EditProduct] Error details:', errorDetails);
            }

            // Show error in toast with full message
            toast.error(errorMessage, {
              position: 'top-right',
              autoClose: 10000, // Longer timeout for validation errors
              style: { whiteSpace: 'pre-line' }, // Allow line breaks
            });
            setIsSubmitting(false);
            setHasUnsavedChanges(true); // Keep unsaved state on error
          },
        }
      );
    } catch (err) {
      console.error("Submission error:", err);
      toast.error('An error occurred while updating the product. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
      setIsSubmitting(false);
      setHasUnsavedChanges(true);
    }
  };
  if (isLoading) return <LoadingContainer />;
  if (error) {
    return (
      <EditProductPage>
        <ErrorContainer>
          <FaExclamationTriangle />
          <h2>Error Loading Product</h2>
          <p>{error.message || 'Failed to load product. Please try again.'}</p>
          <Button onClick={() => navigate(PATHS.PRODUCTS)} variant="primary">
            <FaArrowLeft /> Back to Products
          </Button>
        </ErrorContainer>
      </EditProductPage>
    );
  }

  const productStatus = product?.status || 'draft';
  const isVisible = product?.isVisible !== false;
  const moderationStatus = product?.moderationStatus || 'pending';

  return (
    <EditProductPage>
      {/* Breadcrumbs */}
      <BreadcrumbNav>
        <BreadcrumbLink to={PATHS.DASHBOARD}>Dashboard</BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbLink to={PATHS.PRODUCTS}>Products</BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbCurrent>{product?.name || 'Edit Product'}</BreadcrumbCurrent>
      </BreadcrumbNav>

      {/* Header Section */}
      <HeaderCard>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={() => navigate(PATHS.PRODUCTS)}>
              <FaArrowLeft /> Back
            </BackButton>
            <TitleGroup>
              <PageTitle>Edit Product</PageTitle>
              <ProductName>{product?.name || 'Loading...'}</ProductName>
            </TitleGroup>
          </HeaderLeft>
          <HeaderRight>
            <StatusBadges>
              <StatusBadge $status={productStatus} $type="status">
                {productStatus === 'active' && <FaCheckCircle />}
                {productStatus === 'draft' && <FaInfoCircle />}
                {productStatus === 'inactive' && <FaExclamationTriangle />}
                <span>{productStatus.charAt(0).toUpperCase() + productStatus.slice(1).replace('_', ' ')}</span>
              </StatusBadge>
              <StatusBadge $status={moderationStatus} $type="moderation">
                {moderationStatus === 'approved' && <FaCheckCircle />}
                {moderationStatus === 'pending' && <FaInfoCircle />}
                {moderationStatus === 'rejected' && <FaExclamationTriangle />}
                <span>{moderationStatus.charAt(0).toUpperCase() + moderationStatus.slice(1)}</span>
              </StatusBadge>
              <VisibilityBadge $visible={isVisible}>
                {isVisible ? <FaEye /> : <FaEyeSlash />}
                <span>{isVisible ? 'Visible' : 'Hidden'}</span>
              </VisibilityBadge>
              <ViewCountBadge>
                <FaEye />
                <span>{productViewCount} {productViewCount === 1 ? 'view' : 'views'}</span>
              </ViewCountBadge>
            </StatusBadges>
          </HeaderRight>
        </HeaderContent>

        {hasUnsavedChanges && (
          <UnsavedWarning>
            <FaExclamationTriangle />
            <span>You have unsaved changes</span>
          </UnsavedWarning>
        )}
      </HeaderCard>

      {/* Variants Summary Card */}
      {!variantsLoading && (
        <VariantsSummaryCard>
          <VariantsCardHeader>
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
          </VariantsCardHeader>

          {hasVariants && (
            <>
              <VariantsInfo>
                <InfoItem>
                  <InfoLabel>Total Variants</InfoLabel>
                  <InfoValue>{variantCount}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Total Stock</InfoLabel>
                  <InfoValue>{totalVariantStock} units</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Active Variants</InfoLabel>
                  <InfoValue>
                    {variants.filter(v => v.status === 'active').length}
                  </InfoValue>
                </InfoItem>
              </VariantsInfo>

              <VariantsPreview>
                <PreviewTitle>Quick Preview</PreviewTitle>
                <VariantsList>
                  {variants.slice(0, 3).map((variant, idx) => {
                    // Use a more unique key to prevent React from creating duplicates
                    const uniqueKey = variant._id || variant.id || `variant-${idx}-${variant.sku || Date.now()}`;
                    return (
                      <VariantPreviewItem key={uniqueKey}>
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
                          <VariantStatusBadge $status={variant.status || 'active'}>
                            {variant.status || 'active'}
                          </VariantStatusBadge>
                        </VariantDetails>
                      </VariantPreviewItem>
                    );
                  })}
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
            </>
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
        </VariantsSummaryCard>
      )}

      {/* Product Form */}
      {product && (
        <FormWrapper>
          <ProductForm
            initialData={initialFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || updateProduct.isPending}
            mode="edit"
            onFormChange={() => setHasUnsavedChanges(true)}
          />
        </FormWrapper>
      )}
    </EditProductPage>
  );
};

export default EditProduct;

// Styled Components
const EditProductPage = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const BreadcrumbNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #9CA3AF;
`;

const BreadcrumbLink = styled(Link)`
  color: #9CA3AF;
  text-decoration: none;
  transition: color 0.12s;

  &:hover {
    color: #E8920A;
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #D1D5DB;
`;

const BreadcrumbCurrent = styled.span`
  color: #374151;
  font-weight: 500;
`;

const HeaderCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  border: 0.5px solid #F1EFE8;
  border-left: 3px solid #E8920A;
  padding: 1.25rem 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 1rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 34px;
  padding: 0 0.85rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: #E8920A;
    color: #E8920A;
  }

  svg { font-size: 0.75rem; }
`;

const TitleGroup = styled.div`
  flex: 1;
  min-width: 0;
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;
`;

const ProductName = styled.p`
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadges = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 26px;
  padding: 0 0.65rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;

  ${({ $type, $status }) => {
    if ($type === 'status') {
      if ($status === 'active')       return `background:#EAF3DE;color:#3B6D11;border:0.5px solid #B8D89A;`;
      if ($status === 'draft')        return `background:#E6F1FB;color:#185FA5;border:0.5px solid #BFDBFE;`;
      if ($status === 'out_of_stock') return `background:#FAEEDA;color:#854F0B;border:0.5px solid #FDE68A;`;
      if ($status === 'archived')     return `background:#EDE9FE;color:#5B21B6;border:0.5px solid #DDD6FE;`;
      return `background:#F1EFE8;color:#374151;border:0.5px solid #D1D5DB;`;
    } else {
      if ($status === 'approved') return `background:#EAF3DE;color:#3B6D11;border:0.5px solid #B8D89A;`;
      if ($status === 'pending')  return `background:#FAEEDA;color:#854F0B;border:0.5px solid #FDE68A;`;
      return `background:#FCEBEB;color:#A32D2D;border:0.5px solid #FECACA;`;
    }
  }}

  svg { font-size: 0.75rem; }
`;

const VisibilityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 26px;
  padding: 0 0.65rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $visible }) => $visible ? '#EAF3DE' : '#F1EFE8'};
  color:      ${({ $visible }) => $visible ? '#3B6D11' : '#374151'};
  border:     0.5px solid ${({ $visible }) => $visible ? '#B8D89A' : '#D1D5DB'};
  svg { font-size: 0.75rem; }
`;

const ViewCountBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 26px;
  padding: 0 0.65rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #E6F1FB;
  color: #185FA5;
  border: 0.5px solid #BFDBFE;
  svg { font-size: 0.75rem; }
`;

const UnsavedWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding: 0.65rem 0.85rem;
  background: #FAEEDA;
  border: 0.5px solid #FDE68A;
  border-left: 3px solid #F59E0B;
  border-radius: 9px;
  color: #854F0B;
  font-size: 0.875rem;
  font-weight: 500;
  svg { font-size: 0.9rem; flex-shrink: 0; }
`;

const FormWrapper = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  border: 0.5px solid #F1EFE8;
  overflow: hidden;
`;

const VariantsSummaryCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  border: 0.5px solid #F1EFE8;

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
  }
`;

const VariantsCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: #FFFFFF;
  border-radius: 12px;
  border: 0.5px solid #F1EFE8;

  svg {
    font-size: 3rem;
    color: #A32D2D;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.25rem;
    color: #111827;
    margin: 0 0 0.5rem;
  }

  p {
    color: #6B7280;
    font-size: 0.9rem;
    margin: 0 0 1.5rem;
  }
`;

const VariantsCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: none;
  border: 1px solid #F1EFE8;
`;

const VariantsSummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.85rem;
`;

const VariantsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  
  svg {
    font-size: 1.5rem;
    color: #E8920A;
  }
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    font-family: inherit;
  }
`;

const VariantsSubtitle = styled.p`
  margin: 0.3rem 0 0 0;
  font-size: 0.875rem;
  color: #6B7280;
  font-family: inherit;
`;

const VariantsInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.85rem;
  background: #F9F8F5;
  border-radius: 9px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  font-family: inherit;
`;

const VariantsPreview = styled.div`
  margin-top: 1.25rem;
`;

const PreviewTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.85rem;
  font-family: inherit;
`;

const VariantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
`;

const VariantPreviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem;
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 9px;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const VariantAttributes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  flex: 1;
`;

const AttributeBadge = styled.span`
  padding: 0.3rem 0.5rem;
  background: #E8920A;
  color: #E8920A;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const VariantDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.875rem;
  color: #374151;
  flex-wrap: wrap;
`;

const VariantStatusBadge = styled.span`
  padding: 0.3rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background-color: ${({ $status }) =>
    $status === 'active'
      ? '#EAF3DE'
      : '#F1EFE8'};
  color: ${({ $status }) =>
    $status === 'active'
      ? '#3B6D11'
      : '#374151'};
`;

const ViewMoreLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #E8920A;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  margin-top: 0.5rem;
  transition: all 0.12s;
  
  &:hover {
    color: #E8920A;
    text-decoration: underline;
  }
`;

const NoVariantsMessage = styled.div`
  display: flex;
  gap: 0.85rem;
  padding: 1.25rem;
  background: #E6F1FB;
  border: 1px solid #BFDBFE;
  border-radius: 9px;
  
  svg {
    font-size: 1.25rem;
    color: #185FA5;
    flex-shrink: 0;
    margin-top: 0.3rem;
  }
  
  p {
    margin: 0 0 0.3rem 0;
    font-size: 0.875rem;
    color: #374151;
    font-family: inherit;
    line-height: 1.6;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;
