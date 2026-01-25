import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import styled from "styled-components";
import useCategory from '../../hooks/useCategory';
import BasicSection from "./BasicSection";
import CategorySection from "./CategorySection";
import VariantSection from "./VariantSection";
import ImageSection from "./ImageSection";
import SpecificationSection from "./SpecificationSection";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { LoadingSpinner } from "../LoadingSpinner";
import { generateSKU } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';

const ProductForm = ({ initialData, onSubmit, isSubmitting, mode = "add" }) => {
  console.log("Initial data:", initialData);
  const { seller } = useAuth();

  const { getCategories, getParentCategories } = useCategory();
  const { data, isLoading, error } = getCategories;
  const { data: parentCategoriesData, isLoading: isLoadingParents } = getParentCategories;

  const [variantAttributes, setVariantAttributes] = useState([]);

  const allCategories = useMemo(() => {
    // Handle different response structures
    const categories = data?.data?.results || 
                      data?.data?.data?.results || 
                      data?.results || 
                      data?.data || 
                      [];
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProductForm] Categories data structure:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        categoriesCount: categories.length,
        firstCategory: categories[0],
      });
    }
    
    return Array.isArray(categories) ? categories : [];
  }, [data]);

  // Extract parent categories from dedicated endpoint
  const parentCategoriesFromEndpoint = useMemo(() => {
    const parents = parentCategoriesData?.data?.categories || 
                    parentCategoriesData?.categories || 
                    parentCategoriesData?.data || 
                    [];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProductForm] Parent categories from endpoint:', {
        hasData: !!parentCategoriesData,
        parentCategoriesCount: Array.isArray(parents) ? parents.length : 0,
      });
    }
    
    return Array.isArray(parents) ? parents : [];
  }, [parentCategoriesData]);

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

  const methods = useForm({ 
    defaultValues: initialFormValues,
    mode: 'onChange' // Validate on change for better UX
  });
  const { handleSubmit, control, watch, reset, trigger, formState: { errors } } = methods;
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

  const [step, setStep] = useState(1);

  // Validate step 1 fields before proceeding
  const validateStep1 = async () => {
    const step1Fields = ['name', 'parentCategory', 'subCategory'];
    const isValid = await trigger(step1Fields);
    return isValid;
  };

  const goNext = async () => {
    if (step === 1) {
      // Validate step 1 before proceeding
      const isValid = await validateStep1();
      if (isValid) {
        setStep(2);
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setStep(2);
    }
  };

  const goBack = () => {
    setStep(1);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || isLoadingParents) return <LoadingSpinner />;
  if (error) return <div>Error loading categories</div>;

  const isLastStep = step === 2;

  const handleHeaderBack = () => {
    if (step === 2) {
      // On step 2, go back to step 1
      goBack();
    } else {
      // On step 1, go back to previous page
      window.history.back();
    }
  };

  return (
    <ProductFormContainer>
      <FormHeader>
        <BackButton onClick={handleHeaderBack}>
          <FaArrowLeft /> Back
        </BackButton>
        <FormTitle>
          {mode === "add" ? "Add New Product" : "Edit Product"}
        </FormTitle>
      </FormHeader>

      <StepperContainer>
        <Step $active={step === 1}>
          {step === 1 ? "1. Product Details" : "✓ Product Details"}
        </Step>
        <StepDivider $completed={step === 2} />
        <Step $active={step === 2}>
          {step === 2 ? "2. Media & Specifications" : "Media & Specifications"}
        </Step>
      </StepperContainer>

      <FormProvider {...methods}>
        <StyledForm
          onSubmit={handleSubmit((values) => {
            // Only submit on last step
            if (isLastStep) {
              onSubmit(values);
            }
          })}
        >
          {step === 1 && (
            <Step1Content>
              <StepHeader>
                <StepNumber>Step 1 of 2</StepNumber>
                <StepDescription>Enter basic product information, category, and variants</StepDescription>
              </StepHeader>
              
              <SectionContainer>
                <SectionTitle>Basic Information</SectionTitle>
                <BasicSection />
                {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
              </SectionContainer>

              <SectionContainer>
                <SectionTitle>Category</SectionTitle>
                {allCategories.length === 0 && parentCategoriesFromEndpoint.length === 0 ? (
                  <div style={{ padding: '1rem', color: '#718096', textAlign: 'center' }}>
                    Loading categories...
                  </div>
                ) : (
                  <CategorySection
                    categories={allCategories}
                    parentCategories={parentCategoriesFromEndpoint}
                    parentCategory={parentCategory}
                    subCategory={subCategory}
                  />
                )}
                {errors.parentCategory && <ErrorMessage>{errors.parentCategory.message}</ErrorMessage>}
                {errors.subCategory && <ErrorMessage>{errors.subCategory.message}</ErrorMessage>}
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
            </Step1Content>
          )}

          {step === 2 && (
            <Step2Content>
              <StepHeader>
                <StepNumber>Step 2 of 2</StepNumber>
                <StepDescription>Add product images and specifications</StepDescription>
              </StepHeader>
              
              <SectionContainer>
                <SectionTitle>Images</SectionTitle>
                <ImageSection
                  isSubmitting={isSubmitting}
                  initialData={initialData}
                />
              </SectionContainer>

              <SectionContainer>
                <SectionTitle>Specifications</SectionTitle>
                <SpecificationSection />
              </SectionContainer>
            </Step2Content>
          )}

          <FormActions>
            {step > 1 && (
              <SecondaryButton type="button" onClick={goBack}>
                <FaArrowLeft /> Back
              </SecondaryButton>
            )}
            {!isLastStep ? (
              <PrimaryButton type="button" onClick={goNext}>
                Next <span style={{ marginLeft: '0.5rem' }}>→</span>
              </PrimaryButton>
            ) : (
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner /> Submitting...
                  </>
                ) : (
                  mode === "add" ? "Add Product" : "Save Changes"
                )}
              </PrimaryButton>
            )}
          </FormActions>
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
  padding: 1.5rem;
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

const StepperContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const Step = styled.div`
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  background: ${(p) => (p.$active ? "var(--color-primary-600)" : "#ffffff")};
  color: ${(p) => (p.$active ? "#ffffff" : "#64748b")};
  border: 2px solid
    ${(p) => (p.$active ? "var(--color-primary-600)" : "#e2e8f0")};
  transition: all 0.3s ease;
  position: relative;
  
  ${(p) => p.$active && `
    box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
    transform: translateY(-1px);
  `}
`;

const StepDivider = styled.div`
  flex: 1;
  height: 2px;
  background: linear-gradient(
    to right,
    ${(p) => p.$completed ? "var(--color-primary-400)" : "rgba(148, 163, 184, 0.3)"},
    rgba(148, 163, 184, 0.1)
  );
  border-radius: 2px;
  transition: background 0.3s ease;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const PrimaryButton = styled.button`
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--color-primary-700);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled.button`
  background: #ffffff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Step1Content = styled.div`
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Step2Content = styled.div`
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StepHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const StepNumber = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fed7d7;
  border-radius: 4px;
  border-left: 3px solid #e53e3e;
`;
