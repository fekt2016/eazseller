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
import { LoadingState } from '../../../shared/components/ui/LoadingComponents';
import VariantSection from '../../../shared/components/forms/VariantSection';
import CategorySection from '../../../shared/components/forms/CategorySection';
import useAuth from '../../../shared/hooks/useAuth';
import useProduct from '../../../shared/hooks/useProduct';
import useCategory from '../../../shared/hooks/useCategory';
import useVariants from '../../../shared/hooks/variants/useVariants';
import { compressImage } from '../../../shared/utils/imageCompressor';
import Button from '../../../shared/components/ui/Button';
import { toast } from 'react-toastify';

// Normalize variant images to URL strings for form and comparison
function variantImageUrls(images) {
  if (!images) return [];
  const arr = Array.isArray(images) ? images : [images];
  return arr.map((img) => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object' && img.url) return img.url;
    return null;
  }).filter(Boolean);
}

export default function VariantEditPage() {
  const { productId, variantId } = useParams();
  const navigate = useNavigate();
  const { seller } = useAuth();
  const { useGetProductById } = useProduct();
  const { getCategories } = useCategory();
  const { getVariant, updateVariant } = useVariants();

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

  const { data: variantData, isLoading: variantLoading } = getVariant(
    productId,
    variantId
  );

  const allCategories = useMemo(() => {
    const raw = getCategories?.data?.data?.results ?? getCategories?.data?.results ?? getCategories?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [getCategories?.data]);

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

  const categoryNameForSku = categoryForVariant?.name || 'GENERAL';

  const parentCategoryId = toId(
    product?.parentCategory?._id ??
    product?.parentCategory ??
    product?.parentCategoryId ??
    categoryForVariant?.parentCategory?._id ??
    categoryForVariant?.parentCategory
  );

  const defaultValues = useMemo(() => {
    if (!variantData) {
      return {
        variants: [{ name: '', attributes: [], sku: '', price: 0, stock: 0, status: 'active', condition: 'new', images: [] }],
        parentCategory: '',
        subCategory: '',
      };
    }
    const attrs = (variantData.attributes || []).map((a) => ({
      key: a.key ?? a.name ?? '',
      value: a.value ?? '',
    }));
    const images = variantImageUrls(variantData.images);
    return {
      variants: [
        {
          name: variantData.name ?? '',
          attributes: attrs,
          sku: variantData.sku ?? '',
          price: Number(variantData.price) || 0,
          stock: Number(variantData.stock) || 0,
          status: variantData.status ?? 'active',
          condition: variantData.condition ?? 'new',
          images,
        },
      ],
      parentCategory: parentCategoryId || '',
      subCategory: subCategoryId || '',
    };
  }, [variantData, subCategoryId, parentCategoryId]);

  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!variantData) return;
    methods.reset(defaultValues);
  }, [variantData?._id, variantData?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (data) => {
    try {
      const v = data.variants?.[0];
      if (!v) {
        toast.error('Variant data is missing.');
        return;
      }

      const attributes = (v.attributes || []).map((attr) => ({
        key: attr.key,
        value: attr.value || 'N/A',
      }));

      const existingImages = (v.images || []).filter((img) => typeof img === 'string');
      const newImages = (v.images || []).filter((img) => img instanceof File);

      const processedNewImages = [];
      if (newImages.length > 0) {
        const results = await Promise.allSettled(
          newImages.map((file) =>
            compressImage(file, { quality: 0.6, maxWidth: 800, maxHeight: 800 })
          )
        );
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') processedNewImages.push(result.value);
          else if (newImages[i]) processedNewImages.push(newImages[i]);
        });
      }

      const originalUrls = variantImageUrls(variantData?.images || []);
      const imagesToDelete = originalUrls.filter((url) => !existingImages.includes(url));

      const variantUpdateData = {
        name: v.name || '',
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        sku: v.sku || '',
        status: v.status || 'active',
        condition: v.condition || 'new',
        attributes,
        images: processedNewImages,
        imagesToDelete,
      };

      await updateVariant.mutateAsync({
        productId,
        variantId,
        body: variantUpdateData,
      });

      navigate(`/dashboard/products/${productId}/variants`);
    } catch (error) {
      console.error('Failed to update variant:', error);
      toast.error(
        error.response?.data?.message ||
        error.details?.message ||
        error.message ||
        'Failed to update variant. Please try again.'
      );
    }
  };

  if (variantLoading || (!variantData && productData?.isLoading !== false)) {
    return (
      <PageContainer>
        <LoadingState message="Loading..." />
      </PageContainer>
    );
  }

  if (!variantData) {
    return (
      <PageContainer>
        <div>Variant not found</div>
        <button type="button" onClick={() => navigate(-1)}>Go back</button>
      </PageContainer>
    );
  }

  const variantFieldsLoading = subCategoryId && !categoryForVariant;

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <BackButton type="button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <h1>Edit Variant</h1>
          <p>Update variant information (same form as Add Product variant section)</p>
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
                isLoading={updateVariant.isPending}
                gradient
              >
                Update Variant
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
