import { useNavigate } from "react-router-dom";
import useAuth from '../../shared/hooks/useAuth';
import useProduct from '../../shared/hooks/useProduct';
import ProductForm from '../../shared/components/forms/ProductForm';
import { generateSKU } from '../../shared/utils/helpers';
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { compressImage } from '../../shared/utils/imageCompressor';

const AddProductPage = () => {
  const navigate = useNavigate();
  const { seller } = useAuth();
  const { createProduct } = useProduct();

  const handleSubmit = async (data) => {
    console.log("Form data before submission:", data.parentCategory);
    const formData = new FormData();

    try {
      // Validate categories first
      // const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);
      // const parentCategoryId = isValidObjectId(data.parentCategory)
      //   ? data.category
      //   : null;
      // const subCategoryId = isValidObjectId(data.subCategory)
      //   ? data.subCategory
      //   : null;

      // if (!parentCategoryId) {
      //   console.error("Invalid parent category ID");
      //   alert("Please select a valid parent category");
      //   return;
      // }

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

      // Calculate total stock
      let totalStock = 0;
      if (data.productType === "simple") {
        totalStock = data.stock;
        formData.append("price", data.price.toString());
      } else {
        totalStock = data.variants.reduce(
          (sum, variant) => sum + (parseInt(variant.stock) || 0),
          0
        );
      }
      formData.append("totalStock", totalStock.toString());

      // Format and append variants
      const formattedVariants = data.variants.map((variant) => {
        // Ensure attributes have values
        const attributes = variant.attributes.map((attr) => ({
          key: attr.key,
          value: attr.value || "N/A", // Default value if empty
        }));

        return {
          ...variant,
          attributes,
          price: variant.price ? Number(variant.price) : 0,
          stock: variant.stock ? Number(variant.stock) : 0,
          sku:
            variant.sku ||
            generateSKU({
              user: seller,
              category: data.category,
              variants: variant,
            }),
        };
      });

      // Append variants as JSON string
      formData.append("variants", JSON.stringify(formattedVariants));

      // Append specifications
      const keyValuePairs = data.specifications?.keyValuePairs || [];
      const specifications = {
        keyValuePairs: keyValuePairs.filter((pair) => pair.key && pair.value),
        about: data.specifications?.about || "",
      };
      formData.append("specifications", JSON.stringify(specifications));
      formData.append("manufacturer", data.manufacturer || "");
      formData.append("warranty", data.warranty || "");
      formData.append("condition", data.condition || "new");
      // Append remaining product data
      formData.append("seller", seller.id);

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
          alert(`Error: ${error.message}`);
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Form submission failed. Please check the console for details.");
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
  padding: 2rem;
  background-color: #f8fafc;
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
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e0;
    transform: translateY(-1px);
  }

  svg {
    font-size: 0.8rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  margin: 1.5rem 0 0.5rem;
`;

const HeaderDescription = styled.p`
  font-size: 1rem;
  color: #718096;
  max-width: 700px;
  line-height: 1.5;
`;

const FormContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;
