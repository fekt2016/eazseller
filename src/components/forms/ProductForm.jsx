import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import styled from "styled-components";
import useCategory from "../../hooks/useCategory";
import BasicSection from "./BasicSection";
import CategorySection from "./CategorySection";
import VariantSection from "./VariantSection";
import ImageSection from "./ImageSection";
import SpecificationSection from "./SpecificationSection";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { LoadingSpinner } from "../LoadingSpinner";
import { generateSKU } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";

const ProductForm = ({ initialData, onSubmit, isSubmitting, mode = "add" }) => {
  console.log("Initial data:", initialData);
  const { seller } = useAuth();

  const { getCategories } = useCategory();
  const { data, isLoading, error } = getCategories;

  const [variantAttributes, setVariantAttributes] = useState([]);

  const allCategories = useMemo(() => {
    return data?.data?.results || [];
  }, [data]);

  const initialFormValues = useMemo(() => {
    const defaults = {
      name: "",
      description: "",
      imageCover: "",
      images: [],
      parentCategory: "",
      subCategory: "",
      variants: [
        {
          attributes: [],
          price: 0,
          stock: 0,
          sku: "",
          status: "active",
        },
      ],
      brand: "",
      manufacturer: "",
      warranty: "",
      condition: "new",
      specifications: {
        material: [{ value: "", hexCode: "" }],
        weight: "",
        dimension: "",
      },
    };

    if (initialData) {
      return {
        ...defaults,
        ...initialData,
        parentCategory:
          initialData.parentCategory?._id || initialData.parentCategory || "",
        subCategory:
          initialData.subCategory?._id || initialData.subCategory || "",
        manufacturer: initialData.manufacturer || "",
        warranty: initialData.warranty || "",
        condition: initialData.condition || "new",
        variants:
          initialData.variants?.map((variant) => ({
            ...variant,
            price:
              typeof variant.price === "number"
                ? variant.price
                : parseFloat(variant.price) || 0,
            stock:
              typeof variant.stock === "number"
                ? variant.stock
                : parseInt(variant.stock) || 0,
            attributes:
              variant.attributes?.map((attr) => ({
                key: attr.key,
                value: attr.value,
              })) || [],
          })) || defaults.variants,
        specifications: {
          weight: initialData.specifications?.weight || "",
          dimension: initialData.specifications?.dimension || "",
          material: initialData.specifications?.material?.length
            ? initialData.specifications.material.map((m) => ({
                value: m.value || "",
                hexCode: m.hexCode || "",
              }))
            : defaults.specifications.material,
        },
      };
    }
    return defaults;
  }, [initialData]);

  const methods = useForm({ defaultValues: initialFormValues });
  const { handleSubmit, control, watch, reset } = methods;
  const parentCategory = watch("parentCategory");
  const subCategory = watch("subCategory");
  const productName = watch("name");
  const variants = watch("variants");

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    update: updateVariant,
  } = useFieldArray({ control, name: "variants" });

  useEffect(() => {
    reset(initialFormValues);
  }, [initialFormValues, reset]);

  useEffect(() => {
    if (subCategory && allCategories.length) {
      const category = allCategories.find((cat) => cat._id === subCategory);
      setVariantAttributes(category?.attributes || []);
    }
  }, [subCategory, allCategories]);

  const getCategoryName = useCallback(
    (id) => {
      if (!id) return "";
      const category = allCategories.find((cat) => cat._id === id);
      return category?.name || "";
    },
    [allCategories]
  );

  const addNewVariant = useCallback(() => {
    const attributes = variantAttributes.map((attr) => ({
      key: attr.name,
      value: "",
    }));
    const variantObj = attributes.reduce((acc, attr) => {
      acc[attr.key] = attr.value;
      return acc;
    }, {});

    appendVariant({
      attributes,
      price: 0,
      stock: 0,
      sku: generateSKU({
        user: seller,
        variants: variantObj,
        category: getCategoryName(subCategory),
      }),
      status: "active",
    });
  }, [appendVariant, seller, getCategoryName, subCategory, variantAttributes]);

  // Prevent infinite SKU generation loop
  useEffect(() => {
    if (!variants || variants.length === 0 || !subCategory) return;

    const updatedVariants = variants.map((variant) => {
      const variantObj = (variant.attributes || []).reduce((acc, attr) => {
        acc[attr.key] = attr.value;
        return acc;
      }, {});

      return {
        ...variant,
        sku: generateSKU({
          user: seller,
          variants: variantObj,
          category: getCategoryName(subCategory),
        }),
      };
    });

    reset((prev) => ({ ...prev, variants: updatedVariants }), {
      keepValues: true,
    });
  }, [productName, subCategory, variants, reset, seller, getCategoryName]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading categories</div>;

  return (
    <ProductFormContainer>
      <FormHeader>
        <BackButton onClick={() => window.history.back()}>
          <FaArrowLeft /> Back
        </BackButton>
        <FormTitle>
          {mode === "add" ? "Add New Product" : "Edit Product"}
        </FormTitle>
      </FormHeader>
      <FormProvider {...methods}>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <SectionContainer>
            <SectionTitle>Basic Information</SectionTitle>
            <BasicSection />
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Category</SectionTitle>
            <CategorySection
              categories={allCategories}
              parentCategory={parentCategory}
              subCategory={subCategory}
            />
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Variants</SectionTitle>
            <VariantSection
              variantAttributes={variantAttributes}
              fields={variantFields}
              append={addNewVariant}
              remove={removeVariant}
              update={updateVariant}
              seller={seller}
            />
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Specifications</SectionTitle>
            <SpecificationSection />
          </SectionContainer>

          <SectionContainer>
            <SectionTitle>Images</SectionTitle>
            <ImageSection
              isSubmitting={isSubmitting}
              initialData={initialData}
            />
          </SectionContainer>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoadingSpinner />
            ) : mode === "add" ? (
              "Add Product"
            ) : (
              "Save Changes"
            )}
          </SubmitButton>
        </StyledForm>
      </FormProvider>
    </ProductFormContainer>
  );
};
export default ProductForm;

// Styled Components
const ProductFormContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  color: #1a202c;
  margin: 0;
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

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e0;
  }
`;

const StyledForm = styled.form`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
`;

const SectionContainer = styled.div`
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const SubmitButton = styled.button`
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background: #2b6cb0;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;
