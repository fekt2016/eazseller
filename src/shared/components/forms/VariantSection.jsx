import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { generateSKU } from '../../utils/helpers';
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";

export default function VariantSection({ variantAttributes = [], seller }) {
  const { control, register, setValue, getValues } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "variants",
  });

  const [customAttributes, setCustomAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState("");

  // Watch all variant stocks for changes
  const variantStocks = useWatch({
    control,
    name: "variants",
    defaultValue: [],
  });

  // Calculate total stock based on watched values
  const totalStock = useMemo(() => {
    return variantStocks.reduce(
      (sum, variant) => sum + (parseInt(variant?.stock || 0) || 0),
      0
    );
  }, [variantStocks]);

  // Combine predefined and custom attributes, excluding 'Brand'
  const allAttributes = useMemo(() => {
    const filteredPredefined = variantAttributes.filter(
      (attr) => attr.name.toLowerCase() !== "brand"
    );

    return [
      ...filteredPredefined,
      ...customAttributes
        .filter((name) => name.toLowerCase() !== "brand")
        .map((name) => ({ name, _id: `custom-${name}` })),
    ];
  }, [variantAttributes, customAttributes]);

  // Add a new custom attribute
  const addCustomAttribute = () => {
    const trimmedAttribute = newAttribute.trim();
    if (
      trimmedAttribute &&
      trimmedAttribute.toLowerCase() !== "brand" &&
      !customAttributes.includes(trimmedAttribute)
    ) {
      setCustomAttributes((prev) => [...prev, trimmedAttribute]);
      setNewAttribute("");
    }
  };

  // Generate variants from options
  const generateVariants = () => {
    const variantOptions = getValues("variantOptions") || [];
    const subCategory = getValues("subCategory") || "GENERAL";

    if (!variantOptions || variantOptions.length === 0) return;

    // Create all possible combinations of option values
    const combinations = variantOptions.reduce((acc, option) => {
      if (!acc.length) {
        return option.values.map((value) => ({ [option.key]: value }));
      }
      return acc.flatMap((combo) =>
        option.values.map((value) => ({ ...combo, [option.key]: value }))
      );
    }, []);

    // Create variant objects from combinations
    const newVariants = combinations.map((combo) => {
      const attributes = allAttributes.map((attr) => ({
        key: attr.name,
        value: combo[attr.name] || "",
      }));

      const variantObj = attributes.reduce((acc, attr) => {
        if (attr.value) acc[attr.key] = attr.value;
        return acc;
      }, {});

      return {
        attributes,
        price: 0,
        stock: 0,
        sku: generateSKU({
          user: seller,
          variants: variantObj,
          category: subCategory,
        }),
        status: "active",
      };
    });

    // Replace existing variants with the new generated ones
    replace(newVariants);
  };

  // Add a single variant manually
  const addVariantManually = () => {
    append({
      attributes: allAttributes.map((attr) => ({
        key: attr.name,
        value: "",
      })),
      sku: "",
      price: 0,
      stock: 0,
      status: "active",
    });
  };

  return (
    <div>
      <VariantControls>
        <GenerateButton type="button" onClick={generateVariants}>
          Generate Variants from Options
        </GenerateButton>
        <AddVariantButton type="button" onClick={addVariantManually}>
          + Add Variant Manually
        </AddVariantButton>
      </VariantControls>

      <AttributeManagement>
        <h4>Additional Attributes:</h4>
        <AttributeInputGroup>
          <AttributeInput
            type="text"
            value={newAttribute}
            onChange={(e) => setNewAttribute(e.target.value)}
            placeholder="New attribute name"
          />
          <AddAttributeButton type="button" onClick={addCustomAttribute}>
            Add Attribute
          </AddAttributeButton>
        </AttributeInputGroup>

        <AttributeList>
          {customAttributes
            .filter((attr) => attr.toLowerCase() !== "brand")
            .map((attr, index) => (
              <AttributeTag key={index}>
                {attr}
                <RemoveAttributeButton
                  type="button"
                  onClick={() =>
                    setCustomAttributes((prev) =>
                      prev.filter((a) => a !== attr)
                    )
                  }
                >
                  ×
                </RemoveAttributeButton>
              </AttributeTag>
            ))}
        </AttributeList>
      </AttributeManagement>

      <VariantTable>
        <thead>
          <tr>
            <TableHeader>Attributes</TableHeader>
            <TableHeader>SKU</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Stock</TableHeader>
            <TableHeader>Images</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, idx) => (
            <VariantRow
              key={field.id}
              variantIndex={idx}
              allAttributes={allAttributes}
              canRemove={fields.length > 1}
              remove={remove}
              register={register}
              control={control}
              setValue={setValue}
              getValues={getValues}
              seller={seller}
            />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <TotalStockLabel colSpan="3">Total Stock:</TotalStockLabel>
            <TotalStockValue>{totalStock}</TotalStockValue>
            <td colSpan="3"></td>
          </tr>
        </tfoot>
      </VariantTable>
    </div>
  );
}

function VariantRow({
  variantIndex,
  allAttributes = [],
  canRemove,
  remove,
  register,
  control,
  setValue,
  getValues,
  seller,
}) {
  const firstRun = useRef(true);
  const prevAttrValues = useRef([]);
  const subCategory = useWatch({ name: "subCategory", control }) || "GENERAL";

  const watchedAttrs = useWatch({
    control,
    name: `variants.${variantIndex}.attributes`,
    defaultValue: [],
  });

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      prevAttrValues.current = (watchedAttrs || []).map((a) => a.value);
      return;
    }

    const currentValues = (watchedAttrs || []).map((a) => a.value);
    const prevValues = prevAttrValues.current;

    const valuesChanged =
      currentValues.length !== prevValues.length ||
      currentValues.some((val, i) => val !== prevValues[i]);

    if (!valuesChanged) return;

    prevAttrValues.current = currentValues;

    const variantsObj = (watchedAttrs || []).reduce((o, a) => {
      if (a?.key && a.value) o[a.key] = a.value;
      return o;
    }, {});

    const newSku = generateSKU({
      seller,
      variants: variantsObj,
      category: subCategory,
    });
    const currentSku = getValues(`variants.${variantIndex}.sku`);

    if (newSku !== currentSku) {
      setValue(`variants.${variantIndex}.sku`, newSku, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [watchedAttrs, setValue, getValues, variantIndex, seller, subCategory]);

  return (
    <tr>
      <TableCell>
        <VariantAttributes>
          {allAttributes.map((attr, ai) => {
            // Find the attribute index in the variant's attributes array
            const attrIndex = watchedAttrs.findIndex(
              (a) => a.key === attr.name
            );

            // If not found, add it to the variant
            if (attrIndex === -1) {
              const newAttrs = [...watchedAttrs, { key: attr.name, value: "" }];
              setValue(`variants.${variantIndex}.attributes`, newAttrs);
              return null;
            }

            return (
              <AttributeItem key={`${attr.name}-${ai}`}>
                <input
                  type="hidden"
                  {...register(
                    `variants.${variantIndex}.attributes.${attrIndex}.key`
                  )}
                  value={attr.name}
                />
                <AttributeName>{attr.name}:</AttributeName>
                <AttributeInput
                  {...register(
                    `variants.${variantIndex}.attributes.${attrIndex}.value`
                  )}
                  placeholder={`Enter ${attr.name}`}
                />
              </AttributeItem>
            );
          })}
        </VariantAttributes>
      </TableCell>
      <TableCell>
        <Input
          readOnly
          {...register(`variants.${variantIndex}.sku`)}
          placeholder="SKU"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          {...register(`variants.${variantIndex}.price`)}
          placeholder="Price"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          {...register(`variants.${variantIndex}.stock`)}
          placeholder="Stock"
        />
      </TableCell>
      <TableCell>
        <VariantImageUpload
          variantIndex={variantIndex}
          control={control}
          setValue={setValue}
          register={register}
        />
      </TableCell>
      <TableCell>
        <Select {...register(`variants.${variantIndex}.status`)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </TableCell>
      <TableCell>
        {canRemove && (
          <RemoveButton onClick={() => remove(variantIndex)}>
            Remove
          </RemoveButton>
        )}
      </TableCell>
    </tr>
  );
}

// --- Styled Components ---
const VariantControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const GenerateButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #388e3c;
  }
`;

const AddVariantButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #1976d2;
  }
`;

const AttributeManagement = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
`;

const AttributeInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const AttributeInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
`;

const AddAttributeButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const AttributeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const AttributeTag = styled.span`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const RemoveAttributeButton = styled.button`
  margin-left: 0.5rem;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 0.25rem;

  &:hover {
    color: #bd2130;
  }
`;

const VariantTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;
const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  background-color: #edf2f7;
  border-bottom: 2px solid #e2e8f0;
`;
const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;
const VariantAttributes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const AttributeItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
const AttributeName = styled.span`
  font-weight: 600;
  color: #4a5568;
  min-width: 100px;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 0.9rem;
  &[readonly] {
    background: #f7fafc;
    cursor: not-allowed;
  }
`;
const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 0.9rem;
`;
const RemoveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #c53030;
  }
`;
const TotalStockLabel = styled.td`
  font-weight: 600;
  color: #2d3748;
  background: #f7fafc;
  border-top: 2px solid #e2e8f0;
  padding: 1rem;
`;
const TotalStockValue = styled.td`
  font-weight: 700;
  color: #3182ce;
  background: #f7fafc;
  border-top: 2px solid #e2e8f0;
  padding: 1rem;
`;

// Variant Image Upload Component
function VariantImageUpload({ variantIndex, control, setValue, register }) {
  const [imagePreviews, setImagePreviews] = useState([]);
  const watchedImages = useWatch({
    control,
    name: `variants.${variantIndex}.images`,
    defaultValue: [],
  });

  // Sync image previews
  useEffect(() => {
    const previews = (watchedImages || []).map((img) => {
      if (typeof img === "string") return img;
      if (img instanceof File) return URL.createObjectURL(img);
      return "";
    });
    setImagePreviews(previews);

    // Cleanup object URLs
    return () => {
      previews.forEach((preview) => {
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [watchedImages]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentImages = watchedImages || [];
    setValue(`variants.${variantIndex}.images`, [...currentImages, ...files], {
      shouldDirty: true,
    });
  };

  const handleRemoveImage = (index) => {
    const newImages = [...(watchedImages || [])];
    newImages.splice(index, 1);
    setValue(`variants.${variantIndex}.images`, newImages, {
      shouldDirty: true,
    });
  };

  return (
    <VariantImageContainer>
      <VariantImageUploadArea>
        <VariantImageUploadIcon>
          <FiImage size={16} />
        </VariantImageUploadIcon>
        <VariantImageUploadText>Add Images</VariantImageUploadText>
        <VariantImageFileInput
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
      </VariantImageUploadArea>

      {imagePreviews.length > 0 && (
        <VariantImagePreviewGrid>
          {imagePreviews.map((preview, index) => (
            <VariantImagePreview key={index}>
              <VariantPreviewImage src={preview} alt={`Variant ${index + 1}`} />
              <VariantImageRemoveButton
                type="button"
                onClick={() => handleRemoveImage(index)}
              >
                <FiX size={12} />
              </VariantImageRemoveButton>
            </VariantImagePreview>
          ))}
        </VariantImagePreviewGrid>
      )}
    </VariantImageContainer>
  );
}

const VariantImageContainer = styled.div`
  min-width: 200px;
  max-width: 300px;
`;

const VariantImageUploadArea = styled.div`
  border: 1.5px dashed #cbd5e0;
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;

  &:hover {
    border-color: #3182ce;
    background: #edf2f7;
  }
`;

const VariantImageUploadIcon = styled.div`
  color: #a0aec0;
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: center;
`;

const VariantImageUploadText = styled.span`
  font-size: 0.75rem;
  color: #718096;
  display: block;
`;

const VariantImageFileInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
`;

const VariantImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const VariantImagePreview = styled.div`
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1/1;
  border: 1px solid #e2e8f0;
`;

const VariantPreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VariantImageRemoveButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background: rgba(229, 62, 62, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    background: #c53030;
    transform: scale(1.1);
  }
`;
