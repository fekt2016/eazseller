import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useForm, FormProvider } from "react-hook-form";
import { useMemo, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import VariantSection from '../../../shared/components/forms/VariantSection';
import CategorySection from '../../../shared/components/forms/CategorySection';
import useAuth from '../../../shared/hooks/useAuth';
import useProduct from '../../../shared/hooks/useProduct';
import useCategory from '../../../shared/hooks/useCategory';
import useVariants from '../../../shared/hooks/variants/useVariants';
import { compressImage } from '../../../shared/utils/imageCompressor';
import Button from '../../../shared/components/ui/Button';
import { toast } from 'react-toastify';
import { PATHS } from '../../../routes/routePaths';

export default function VariantCreatePage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { seller } = useAuth();
  const { useGetProductById } = useProduct();
  const { data: productData } = useGetProductById(productId);
  const product = useMemo(() => {
    const raw =
      productData?.data?.product ??
      productData?.data ??
      productData?.product ??
      productData;
    if (!raw || typeof raw !== 'object') return null;
    return raw;
  }, [productData]);
  const { getCategories } = useCategory();
  const { data: categoriesData, isLoading: categoriesLoading } = getCategories;
  const { createVariant } = useVariants();

  const allCategories = useMemo(() => {
    const raw = categoriesData?.data?.results ?? categoriesData?.results ?? categoriesData?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [categoriesData]);

  const toId = (v) => (v == null ? '' : typeof v === 'object' && v?.toString ? v.toString() : String(v));

  const subCategoryId = toId(
    product?.subCategory?._id ?? product?.subCategory ?? product?.subCategoryId ?? ''
  );

  const categoryForVariant = useMemo(() => {
    if (!subCategoryId) return null;
    const fromList = allCategories.find((cat) => toId(cat?._id) === subCategoryId);
    if (fromList) return fromList;
    if (product?.subCategory && (product.subCategory._id || product.subCategory.name)) {
      return product.subCategory;
    }
    return null;
  }, [subCategoryId, allCategories, product?.subCategory]);

  const [variantAttributes, setVariantAttributes] = useState([]);

  // Infer attribute keys from existing variants when product has no category set (fallback)
  const inferredAttributesFromVariants = useMemo(() => {
    const variants = product?.variants || [];
    const keys = new Set();
    variants.forEach((v) => {
      (v.attributes || []).forEach((a) => {
        if (a?.key) keys.add(a.key);
      });
    });
    return Array.from(keys).map((name) => ({ name, type: 'text' }));
  }, [product?.variants]);

  useEffect(() => {
    const fromCategory =
      categoryForVariant?.attributes ?? product?.subCategory?.attributes ?? [];
    const attrs =
      fromCategory.length > 0 ? fromCategory : inferredAttributesFromVariants;
    const safe = Array.isArray(attrs)
      ? attrs.filter((a) => a && (a.name || a.key)).map((a) => ({ ...a, name: a.name || a.key }))
      : [];
    setVariantAttributes(safe);
  }, [categoryForVariant, product?.subCategory?.attributes, inferredAttributesFromVariants]);

  // Same category name used for SKU as on Add Product (backend uses category name for SKU)
  const categoryNameForSku = categoryForVariant?.name || 'GENERAL';

  // Resolve parent category for display (product's category drives variant attribute fields)
  const parentCategoryId = toId(
    product?.parentCategory?._id ??
    product?.parentCategory ??
    product?.parentCategoryId ??
    categoryForVariant?.parentCategory?._id ??
    categoryForVariant?.parentCategory
  );
  // Same shape as Add Product: form has parentCategory + subCategory so variant fields come from that category (or inferred from existing variants when no category)
  const defaultValues = useMemo(() => {
    const categoryAttrs = categoryForVariant?.attributes || product?.subCategory?.attributes || [];
    const attrsSource =
      categoryAttrs.length > 0 ? categoryAttrs : inferredAttributesFromVariants;
    const initialVariantAttributes = Array.isArray(attrsSource)
      ? attrsSource
        .filter((attr) => attr && (attr.name || attr.key))
        .map((attr) => ({
          key: attr.name || attr.key || '',
          value: attr.values?.length === 1 ? attr.values[0] : '',
        }))
      : [];

    return {
      variants: [
        {
          name: '',
          attributes: initialVariantAttributes,
          sku: '',
          price: 0,
          stock: 0,
          status: 'active',
          condition: 'new',
          images: [],
        },
      ],
      parentCategory: parentCategoryId || '',
      subCategory: subCategoryId || '',
    };
  }, [subCategoryId, parentCategoryId, categoryForVariant, product?.subCategory, inferredAttributesFromVariants]);

  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const goBackToVariants = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(PATHS.PRODUCT_VARIANTS.replace(':productId', productId));
  };

  // When product category is available, reset form so parent + sub are selected (same as Add Product) and variant fields come from that category
  useEffect(() => {
    if (!subCategoryId || !categoryForVariant) return;
    methods.reset(defaultValues);
  }, [subCategoryId, categoryForVariant?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (data) => {
    try {
      const v = data.variants?.[0];
      if (!v) {
        toast.error('Variant data is missing.');
        return;
      }

      const attributes = (v.attributes || []).map((attr) => ({
        key: attr.key,
        value:
          attr.value != null && String(attr.value).trim() !== ''
            ? String(attr.value).trim()
            : '',
      }));

      const existingImages = (v.images || []).filter((img) => typeof img === 'string');
      const newImages = (v.images || []).filter((img) => img instanceof File);

      const processedImages = [];
      if (newImages.length > 0) {
        const results = await Promise.allSettled(
          newImages.map((file) =>
            compressImage(file, { quality: 0.6, maxWidth: 800, maxHeight: 800 })
          )
        );
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') processedImages.push(result.value);
          else if (newImages[i]) processedImages.push(newImages[i]);
        });
      }

      const variantData = {
        name: v.name || '',
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        sku: v.sku || '',
        status: v.status || 'active',
        condition: v.condition || 'new',
        attributes,
        images: [...existingImages, ...processedImages],
      };

      await createVariant.mutateAsync({
        productId,
        body: variantData,
      });

      goBackToVariants();
    } catch (error) {
      console.error('Failed to create variant:', error);
      toast.error(
        error.response?.data?.message ||
        error.details?.message ||
        error.message ||
        'Failed to create variant. Please try again.'
      );
    }
  };

  if (!product && (productData?.isLoading !== false)) {
    return (
      <VariantFormPage>
        <p>Loading product...</p>
      </VariantFormPage>
    );
  }

  if (!product) {
    return (
      <VariantFormPage>
        <p>Product not found.</p>
        <button type="button" onClick={goBackToVariants}>
          Go back
        </button>
      </VariantFormPage>
    );
  }

  const variantFieldsLoading = subCategoryId && !categoryForVariant && categoriesLoading;

  return (
    <VariantFormPage>
      <VarHeader>
        <VarTitleSection>
          <BackButton type="button" onClick={goBackToVariants}>
            <FaArrowLeft /> Back
          </BackButton>
          <h1>Create New Variant</h1>
          <p>Add a new variant to your product (same form as Add Product variant section)</p>
        </VarTitleSection>
      </VarHeader>

      <FormCard>
        <FormProvider {...methods}>
          <Form onSubmit={methods.handleSubmit(handleSubmit)}>
            <CategorySectionCard>
              <CategorySectionTitle>Product category</CategorySectionTitle>
              <CategorySectionDescription>
                Variant fields below are based on this product&apos;s category.
              </CategorySectionDescription>
              {!subCategoryId && !product?.subCategory && inferredAttributesFromVariants.length === 0 ? (
                <CategoryNotice>
                  <strong>No category set.</strong> This product does not have a category assigned. To get variant fields (e.g. Storage, Color), edit the product and set a parent and sub category first.
                  <EditProductLink to={`/dashboard/products/${productId}/edit`}>
                    Edit product to set category →
                  </EditProductLink>
                </CategoryNotice>
              ) : !subCategoryId && !product?.subCategory ? null : (
                <>
                  <CategorySection
                    categories={allCategories}
                    readOnly
                  />
                  {variantFieldsLoading && (
                    <CategorySectionDescription style={{ marginTop: '0.75rem', fontStyle: 'italic' }}>
                      Loading variant fields for this category…
                    </CategorySectionDescription>
                  )}
                </>
              )}
            </CategorySectionCard>

            <VariantSection
              variantAttributes={variantAttributes}
              seller={seller}
              singleVariantMode
              categoryNameForSku={categoryNameForSku}
            />
            <FormActions>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={createVariant.isPending}
                gradient
              >
                Create Variant
              </Button>
            </FormActions>
          </Form>
        </FormProvider>
      </FormCard>
    </VariantFormPage>
  );
}

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  margin-bottom: 1rem;
  background: transparent;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  color: #374151;
  font-size: 0.875rem;
  
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: #F9F8F5;
    border-color: #D1D5DB;
  }
`;

const FormCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #F1EFE8;
`;

const CategorySectionCard = styled.div`
  padding: 1.5rem;
  background: #F9F8F5;
  border: 1px solid #F1EFE8;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const CategorySectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  
  margin: 0 0 0.375rem 0;
`;

const CategorySectionDescription = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0 0 1rem 0;
`;

const CategoryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const CategoryField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 160px;
`;

const CategoryLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const CategoryValue = styled.span`
  font-size: 0.9rem;
  color: #111827;
  padding: 0.5rem 1rem;
  background: #FFFFFF;
  border-radius: 9px;
  border: 1px solid #F1EFE8;
`;

const CategoryNotice = styled.div`
  font-size: 0.875rem;
  color: #374151;
  padding: 1rem;
  background: #FEF3C7;
  border: 1px solid #FDE68A;
  border-radius: 9px;
  margin-top: 0.5rem;

  strong {
    color: #111827;
  }
`;

const EditProductLink = styled(Link)`
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #E8920A;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// ── Layout wrappers replacing SpacingSystem ──────────────────────────────────
const VariantFormPage = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const VarHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid #E8920A;
  padding: 1.2rem 1.5rem;
`;

const VarTitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  h1 { font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0; }
  p  { font-size: 0.9rem;  color: #9CA3AF; margin: 0; }
`;
