import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useForm, FormProvider } from "react-hook-form";
import { useMemo, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import {
  PageContainer,
  PageHeader,
  TitleSection,
} from '../../../shared/components/ui/SpacingSystem';
import VariantSection from '../../../shared/components/forms/VariantSection';
import CategorySection from '../../../shared/components/forms/CategorySection';
import useAuth from '../../../shared/hooks/useAuth';
import useProduct from '../../../shared/hooks/useProduct';
import useCategory from '../../../shared/hooks/useCategory';
import useVariants from '../../../shared/hooks/variants/useVariants';
import { compressImage } from '../../../shared/utils/imageCompressor';
import Button from '../../../shared/components/ui/Button';

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
  const parentCategoryObj = useMemo(() => {
    if (!parentCategoryId || !allCategories.length) return null;
    return allCategories.find((c) => toId(c?._id) === parentCategoryId) ?? null;
  }, [parentCategoryId, allCategories]);
  const parentCategoryName =
    parentCategoryObj?.name ||
    product?.parentCategory?.name ||
    (parentCategoryId ? '…' : '—');
  const subCategoryName =
    categoryForVariant?.name ||
    product?.subCategory?.name ||
    (subCategoryId ? '…' : '—');

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

  // When product category is available, reset form so parent + sub are selected (same as Add Product) and variant fields come from that category
  useEffect(() => {
    if (!subCategoryId || !categoryForVariant) return;
    methods.reset(defaultValues);
  }, [subCategoryId, categoryForVariant?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (data) => {
    try {
      const v = data.variants?.[0];
      if (!v) {
        alert('Variant data is missing.');
        return;
      }

      const attributes = (v.attributes || []).map((attr) => ({
        key: attr.key,
        value: attr.value || 'N/A',
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

      navigate(`/dashboard/products/${productId}/variants`);
    } catch (error) {
      console.error('Failed to create variant:', error);
      alert(
        error.response?.data?.message ||
          error.details?.message ||
          error.message ||
          'Failed to create variant. Please try again.'
      );
    }
  };

  if (!product && (productData?.isLoading !== false)) {
    return (
      <PageContainer>
        <p>Loading product...</p>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <p>Product not found.</p>
        <button type="button" onClick={() => navigate(-1)}>
          Go back
        </button>
      </PageContainer>
    );
  }

  const variantFieldsLoading = subCategoryId && !categoryForVariant && categoriesLoading;

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <BackButton type="button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <h1>Create New Variant</h1>
          <p>Add a new variant to your product (same form as Add Product variant section)</p>
        </TitleSection>
      </PageHeader>

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
    </PageContainer>
  );
}

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

const FormCard = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
`;

const CategorySectionCard = styled.div`
  padding: var(--spacing-lg);
  background: var(--color-grey-50, #f8fafc);
  border: 1px solid var(--color-grey-200, #e2e8f0);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
`;

const CategorySectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin: 0 0 var(--spacing-xs) 0;
`;

const CategorySectionDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin: 0 0 var(--spacing-md) 0;
`;

const CategoryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
`;

const CategoryField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 160px;
`;

const CategoryLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
`;

const CategoryValue = styled.span`
  font-size: var(--font-size-md);
  color: var(--color-grey-900);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const CategoryNotice = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  padding: var(--spacing-md);
  background: var(--color-amber-50, #fffbeb);
  border: 1px solid var(--color-amber-200, #fde68a);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-sm);

  strong {
    color: var(--color-grey-900);
  }
`;

const EditProductLink = styled(Link)`
  display: inline-block;
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary-600);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
