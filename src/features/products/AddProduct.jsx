import { useNavigate } from "react-router-dom";
import useAuth from '../../shared/hooks/useAuth';
import useProduct from '../../shared/hooks/useProduct';
import ProductForm from '../../shared/components/forms/ProductForm';
import { generateSKU } from '../../shared/utils/helpers';
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { compressImage } from '../../shared/utils/imageCompressor';
import { toast } from 'react-toastify';

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

    console.log("Form data before submission:", data.parentCategory);
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

      // Process cover image
      if (data.imageCover) {
        try {
          const compressedCover = await compressImage(data.imageCover);
          formData.append("imageCover", compressedCover);
        } catch (error) {
          console.error("Cover image compression failed:", error);
          formData.append("imageCover", data.imageCover);
        }
      }

      // Process additional images
      if (data.images && data.images.length > 0) {
        const compressionResults = await Promise.allSettled(
          data.images.map(compressImage)
        );

        compressionResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            formData.append("newImages", result.value);
          } else {
            console.warn(`Image ${index} compression failed:`, result.reason);
            formData.append("newImages", data.images[index]);
          }
        });
      }

      // Append basic product data
      formData.append("name", data.name);
      formData.append("brand", data.brand);
      formData.append("description", data.description);
      formData.append("parentCategory", data.parentCategory);
      formData.append("subCategory", data.subCategory);

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
          value: attr.value || "N/A", // Default value if empty
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

        return {
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
          // Include existing images (URLs) in the variant object
          images: existingVariantImages,
        };
      });

      // Wait for all variant image processing to complete
      const formattedVariants = await Promise.all(variantImagePromises);

      // Append variants as JSON string
      formData.append("variants", JSON.stringify(formattedVariants));

      // Append specifications - format correctly for backend
      const specifications = {
        material: (data.specifications?.material || []).map((mat) => ({
          value: Array.isArray(mat.value) ? mat.value[0] || "" : (mat.value || ""),
          hexCode: mat.hexCode || "",
        })).filter((mat) => mat.value || mat.hexCode), // Filter out empty materials
        weight: data.specifications?.weight ? (() => {
          // Parse weight string (e.g., "0.5kg", "500g") into object
          const weightStr = String(data.specifications.weight).trim();
          if (!weightStr) return null;

          const weightMatch = weightStr.match(/([\d.]+)\s*([a-z]+)/i);
          if (weightMatch) {
            return {
              value: parseFloat(weightMatch[1]) || 0,
              unit: weightMatch[2].toLowerCase() || 'g',
            };
          }
          // If no unit found, try to extract number and default to 'g'
          const numMatch = weightStr.match(/([\d.]+)/);
          return {
            value: numMatch ? parseFloat(numMatch[1]) : 0,
            unit: 'g',
          };
        })() : null,
        dimension: data.specifications?.dimension || "",
      };

      formData.append("specifications", JSON.stringify(specifications));
      formData.append("manufacturer", data.manufacturer || "");

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
      // Append video if present
      if (data.video) {
        // If it's a File, multer will pick it up from req.files
        // If it's a string (e.g. existing video URL), it will be in req.body
        formData.append("video", data.video);
      }

      // Backend sets seller from auth; we append for consistency when we have it
      formData.append("seller", sellerId);

      // Log form data for debugging
      for (let [key, value] of formData.entries()) {
        console.log(key, "→", value);
      }

      // Submit form data
      createProduct.mutate(formData, {
        onSuccess: () => {
          navigate("/dashboard/products");
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
        <BackButton onClick={() => navigate("/seller/dashboard/products")}>
          <FaArrowLeft />
          Back to Products
        </BackButton>
        <PageTitle>Add New Product</PageTitle>
        <HeaderDescription>
          Fill out the form below to add a new product to your store
        </HeaderDescription>
      </HeaderContainer>

      <FormContainer>
        <ProductForm
          mode="add"
          onSubmit={handleSubmit}
          isSubmitting={createProduct.isPending}
        />
      </FormContainer>
    </PageContainer>
  );
};

export default AddProductPage;

const PageContainer = styled.div`
  padding: var(--spacing-md);
  background-color: var(--color-grey-50);
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderContainer = styled.div`
  margin-bottom: 2.5rem;
  position: relative;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: 400;
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: var(--color-grey-100);
    border-color: var(--color-grey-300);
    transform: translateY(-1px);
  }

  svg {
    font-size: var(--font-size-sm);
  }
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: 500;
  color: var(--color-grey-900);
  margin: var(--spacing-md) 0 var(--spacing-xs);
`;

const HeaderDescription = styled.p`
  font-size: var(--font-size-lg);
  font-weight: 400;
  color: var(--color-grey-500);
  max-width: 700px;
  line-height: 1.5;
`;

const FormContainer = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;
