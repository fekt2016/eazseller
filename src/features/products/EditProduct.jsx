import { useParams } from "react-router-dom";
import useProduct from '../../shared/hooks/useProduct';
import ProductForm from '../../shared/components/forms/ProductForm';
import { compressImage } from '../../shared/utils/imageCompressor';
import { useMemo } from "react";
import { LoadingContainer } from '../../shared/components/LoadingSpinner';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';

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

      data.variants.forEach((variant, index) => {
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
      });
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
    <div>
      <h1>Edit Product</h1>
      {product && (
        <ProductForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          isSubmitting={updateProduct.isLoading}
          mode="edit"
        />
      )}
    </div>
  );
};

export default EditProduct;
