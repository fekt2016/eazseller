import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useForm, FormProvider } from "react-hook-form";
import { useMemo, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
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
import { PATHS } from '../../../routes/routePaths';

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

  const goBackToVariants = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(PATHS.PRODUCT_VARIANTS.replace(':productId', productId));
  };

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
        value:
          attr.value != null && String(attr.value).trim() !== ''
            ? String(attr.value).trim()
            : '',
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

      goBackToVariants();
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
      <VariantFormPage>
        <LoadingState message="Loading..." />
      </VariantFormPage>
    );
  }

  if (!variantData) {
    return (
      <VariantFormPage>
        <div>Variant not found</div>
        <button type="button" onClick={goBackToVariants}>Go back</button>
      </VariantFormPage>
    );
  }

  const variantFieldsLoading = subCategoryId && !categoryForVariant;

  return (
    <VariantFormPage>
      <VarHeader>
        <VarTitleSection>
          <BackButton type="button" onClick={goBackToVariants}>
            <FaArrowLeft /> Back
          </BackButton>
          <h1>Edit Variant</h1>
          <p>Update variant information (same form as Add Product variant section)</p>
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
                isLoading={updateVariant.isPending}
                gradient
              >
                Update Variant
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
