import { useEffect, useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import styled from "styled-components";

const CategorySection = ({ categories }) => {
  const { control, setValue } = useFormContext();
  const parentCategory = useWatch({ control, name: "parentCategory" });
  const subCategory = useWatch({ control, name: "subCategory" });

  const parentCategories = useMemo(
    () => categories.filter((cat) => !cat.parentCategory),
    [categories]
  );

  const subCategories = useMemo(() => {
    if (!parentCategory) return [];
    return categories.filter((cat) => {
      if (!cat.parentCategory) return false;
      const parentId =
        typeof cat.parentCategory === "object"
          ? cat.parentCategory._id
          : cat.parentCategory;
      return parentId === parentCategory;
    });
  }, [categories, parentCategory]);

  useEffect(() => {
    if (subCategory && subCategories.every((cat) => cat._id !== subCategory)) {
      setValue("subCategory", "");
    }
  }, [subCategories, subCategory, setValue]);

  return (
    <div>
      <FormGroup>
        <Label>Parent Category</Label>
        <Controller
          name="parentCategory"
          defaultValue={""}
          control={control}
          render={({ field }) => (
            <Select {...field}>
              <option value="">Select a category</option>
              {parentCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        />
      </FormGroup>

      {parentCategory && (
        <FormGroup>
          <Label>Sub Category</Label>
          <Controller
            name="subCategory"
            defaultValue={""}
            control={control}
            render={({ field }) => (
              <Select {...field} value={field.value || ""}>
                <option value="">Select a subcategory</option>
                {subCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormGroup>
      )}
    </div>
  );
};

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
`;
const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #fff;
  font-size: 1rem;
  &:focus {
    border-color: #3182ce;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

export default CategorySection;
