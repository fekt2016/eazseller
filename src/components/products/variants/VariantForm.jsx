import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState, useMemo } from "react";
import AttributeSelector from "./AttributeSelector";
import VariantInventoryPanel from "./VariantInventoryPanel";
import VariantMediaUploader from "./VariantMediaUploader";
import Button from '../../../shared/components/ui/Button';
import { Section } from '../../../shared/components/ui/SpacingSystem';
import useAuth from '../../../shared/hooks/useAuth';
import useProduct from '../../../shared/hooks/useProduct';
import useCategory from '../../../shared/hooks/useCategory';
import { generateSKU } from '../../../shared/utils/helpers';

export default function VariantForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  productId,
}) {
  const { seller } = useAuth();
  const { useGetProductById } = useProduct();
  const { data: productData } = useGetProductById(productId);
  const product = productData?.data?.product || productData?.data || productData;
  const { getCategories } = useCategory();
  const { data: categoriesData } = getCategories;
  const firstRun = useRef(true);

  // Get category attributes (matching ProductForm pattern)
  const [variantAttributes, setVariantAttributes] = useState([]);
  
  const allCategories = useMemo(() => {
    return categoriesData?.data?.results || [];
  }, [categoriesData]);

  // Set variant attributes from product's subCategory (same as ProductForm)
  useEffect(() => {
    if (product?.subCategory && allCategories.length) {
      const category = allCategories.find((cat) => cat._id === product.subCategory?._id || cat._id === product.subCategory);
      setVariantAttributes(category?.attributes || []);
    }
  }, [product?.subCategory, allCategories]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    getValues,
  } = useForm({
    defaultValues: initialData || {
      name: "",
      attributes: [],
      price: 0,
      discount: 0,
      stock: 0,
      sku: "",
      status: "active",
      images: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        attributes: initialData.attributes || [],
        price: initialData.price || 0,
        discount: initialData.discount || 0,
        stock: initialData.stock || 0,
        sku: initialData.sku || "",
        status: initialData.status || "active",
        images: initialData.images || [],
      });
    }
  }, [initialData, reset]);

  const watchedAttributes = watch("attributes");
  const watchedStock = watch("stock");
  const watchedSku = watch("sku");
  const watchedImages = watch("images") || [];

  // Auto-generate SKU when attributes change
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (!watchedAttributes || watchedAttributes.length === 0) return;

    // Convert attributes array to object format for generateSKU
    const variantsObj = (watchedAttributes || []).reduce((o, a) => {
      if (a?.key && a.value) o[a.key] = a.value;
      return o;
    }, {});

    // Get category from product
    const category = product?.subCategory?.name || product?.parentCategory?.name || "GENERAL";

    // Generate SKU
    const newSku = generateSKU({
      seller: seller || { id: seller?._id || seller?.id || "UNK" },
      variants: variantsObj,
      category: category,
    });

    const currentSku = getValues("sku");

    // Only update if SKU is empty or if attributes changed significantly
    if (!currentSku || currentSku.trim() === "") {
      setValue("sku", newSku, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [watchedAttributes, setValue, getValues, seller, product]);

  const handleFormSubmit = (data) => {
    // Auto-generate SKU if empty before submit
    if (!data.sku || data.sku.trim() === "") {
      const variantsObj = (data.attributes || []).reduce((o, a) => {
        if (a?.key && a.value) o[a.key] = a.value;
        return o;
      }, {});
      
      const category = product?.subCategory?.name || product?.parentCategory?.name || "GENERAL";
      
      data.sku = generateSKU({
        seller: seller || { id: seller?._id || seller?.id || "UNK" },
        variants: variantsObj,
        category: category,
      });
    }
    
    onSubmit(data);
  };

  return (
    <FormContainer onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Basic Information */}
      <Section $padding="lg" $marginBottom="lg">
        <SectionTitle>Basic Information</SectionTitle>
        
        <FormField>
          <Label htmlFor="name">
            Variant Name <Required>*</Required>
          </Label>
          <Input
            id="name"
            type="text"
            {...register("name", {
              required: "Variant name is required",
            })}
            placeholder="e.g., Small Red, Large Blue"
          />
          {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
        </FormField>

        <FormField>
          <Label htmlFor="price">
            Price (Gh₵) <Required>*</Required>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register("price", {
              required: "Price is required",
              min: { value: 0, message: "Price must be 0 or greater" },
            })}
            placeholder="0.00"
          />
          {errors.price && <ErrorText>{errors.price.message}</ErrorText>}
        </FormField>

        <FormField>
          <Label htmlFor="discount">Discount (Gh₵)</Label>
          <Input
            id="discount"
            type="number"
            step="0.01"
            min="0"
            {...register("discount", {
              min: { value: 0, message: "Discount must be 0 or greater" },
            })}
            placeholder="0.00"
          />
          {errors.discount && <ErrorText>{errors.discount.message}</ErrorText>}
        </FormField>

        <FormField>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FormField>
      </Section>

      {/* Attributes */}
      <Section $padding="lg" $marginBottom="lg">
        <AttributeSelector
          variantAttributes={variantAttributes}
          selectedAttributes={watchedAttributes}
          onChange={(newAttributes) => setValue("attributes", newAttributes)}
          register={register}
          setValue={setValue}
          getValues={getValues}
          name="attributes"
        />
      </Section>

      {/* Inventory */}
      <Section $padding="lg" $marginBottom="lg">
        <VariantInventoryPanel
          stock={watchedStock}
          sku={watchedSku}
          onStockChange={(value) => setValue("stock", value)}
          onSkuChange={(value) => setValue("sku", value)}
        />
      </Section>

      {/* Media */}
      <Section $padding="lg" $marginBottom="lg">
        <VariantMediaUploader
          images={watchedImages}
          onImagesChange={(newImages) => setValue("images", newImages)}
          maxImages={5}
        />
      </Section>

      {/* Form Actions */}
      <FormActions>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          gradient
        >
          {initialData ? "Update Variant" : "Create Variant"}
        </Button>
      </FormActions>
    </FormContainer>
  );
}

// Styled Components
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-md);
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-body);
`;

const Required = styled.span`
  color: var(--color-red-600);
`;

const Input = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  transition: var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:hover {
    border-color: var(--color-grey-400);
  }
`;

const Select = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  cursor: pointer;
  transition: var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:hover {
    border-color: var(--color-grey-400);
  }
`;

const ErrorText = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-red-600);
  font-family: var(--font-body);
  margin: 0;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
`;

