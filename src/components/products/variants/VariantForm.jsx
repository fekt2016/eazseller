import styled from "styled-components";
import { useForm, useWatch } from "react-hook-form";
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
    control,
  } = useForm({
    defaultValues: initialData || {
      name: "",
      attributes: [],
      price: 0,
      discount: 0,
      stock: 0,
      sku: "",
      status: "active",
      condition: "new", // Default condition
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
        condition: initialData.condition || "new", // Include condition
        images: initialData.images || [],
      });
    }
  }, [initialData, reset]);

  const watchedAttributes = watch("attributes");
  const watchedStock = watch("stock");
  const watchedSku = watch("sku");
  const watchedImages = watch("images") || [];

  // useWatch gives deep, reliable change detection for nested array fields
  // (registered inputs update individual array elements which watch() may not detect)
  const deepWatchedAttrs = useWatch({ control, name: "attributes" });

  // Serialize attributes for stable useEffect dependency (detects value-level changes)
  const attrsKey = useMemo(() => {
    try {
      return JSON.stringify(
        (deepWatchedAttrs || []).map((a) => ({ k: a?.key, v: a?.value }))
      );
    } catch {
      return "";
    }
  }, [deepWatchedAttrs]);

  // Auto-generate SKU whenever attributes change (same logic as Add Product form)
  useEffect(() => {
    // Skip initial render when editing an existing variant that already has a SKU
    if (firstRun.current) {
      firstRun.current = false;
      // But still generate if SKU is empty (new variant)
      const currentSku = getValues("sku");
      if (currentSku && currentSku.trim() !== "") return;
    }

    const attrs = deepWatchedAttrs || [];
    if (attrs.length === 0) return;

    // Need at least one attribute with a value to generate
    const hasValue = attrs.some((a) => a?.key && a?.value && String(a.value).trim() !== "");
    if (!hasValue) return;

    // Need seller data to generate a proper SKU
    if (!seller) return;

    // Convert attributes array to object format for generateSKU
    const variantsObj = attrs.reduce((o, a) => {
      if (a?.key && a.value) o[a.key] = a.value;
      return o;
    }, {});

    // Get category from product (same as ProductForm)
    const category = product?.subCategory?.name || product?.parentCategory?.name || "GENERAL";

    // Generate SKU using the shared helper (same as Add Product)
    const newSku = generateSKU({
      seller,
      variants: variantsObj,
      category,
    });

    const currentSku = getValues("sku");

    // Auto-fill if SKU is empty or update with new generated value
    if (!currentSku || currentSku.trim() === "" || currentSku !== newSku) {
      setValue("sku", newSku, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [attrsKey, seller, product, setValue, getValues, deepWatchedAttrs]);

  const handleFormSubmit = (data) => {
    // Auto-generate SKU if empty before submit
    if (!data.sku || data.sku.trim() === "") {
      const variantsObj = (data.attributes || []).reduce((o, a) => {
        if (a?.key && a.value) o[a.key] = a.value;
        return o;
      }, {});
      
      const category = product?.subCategory?.name || product?.parentCategory?.name || "GENERAL";
      
      data.sku = generateSKU({
        seller,
        variants: variantsObj,
        category,
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

        <FormField>
          <Label htmlFor="condition">
            Condition <Required>*</Required>
          </Label>
          <Select 
            id="condition" 
            {...register("condition", {
              required: "Condition is required",
            })}
          >
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="open_box">Open Box</option>
            <option value="refurbished">Refurbished</option>
            <option value="used">Used</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </Select>
          {errors.condition && <ErrorText>{errors.condition.message}</ErrorText>}
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
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  
`;

const Required = styled.span`
  color: #A32D2D;
`;

const Input = styled.input`
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.9rem;
  
  color: #111827;
  transition: 0.12s;

  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
  }

  &:hover {
    border-color: #D1D5DB;
  }
`;

const Select = styled.select`
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.9rem;
  
  color: #111827;
  background: #FFFFFF;
  cursor: pointer;
  transition: 0.12s;

  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
  }

  &:hover {
    border-color: #D1D5DB;
  }
`;

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #A32D2D;
  
  margin: 0;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F1EFE8;
`;

