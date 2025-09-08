import { useEffect, useState } from "react";
import styled from "styled-components";
import { FaFolder, FaCheck } from "react-icons/fa";

export default function DiscountModal({
  mode,
  discount,
  onClose,
  onSubmit,
  sellerCategories,
  sellerProducts,
  selectedCategory,
  setSelectedCategory,
  productsInCategory,
  selectedProducts,
  handleProductSelect,
  handleSelectAllInView,
}) {
  // Helper function to format dates for input fields
  const formatDateForInput = (date) => {
    if (!date) return "";

    // Handle various date formats
    let dateObj;
    if (typeof date === "string") {
      // Check if it's already in YYYY-MM-DD format
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      // Try to parse as ISO string
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return "";
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "";
    }

    // Format to YYYY-MM-DD for input[type="date"]
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Initialize formData with properly formatted dates
  const [formData, setFormData] = useState(() => {
    const initialData = {
      name: "",
      code: "",
      type: "percentage",
      value: "",
      startDate: "",
      endDate: "",
      maxUsage: "",
      active: true,
      ...discount,
    };

    return {
      ...initialData,
      startDate: formatDateForInput(initialData.startDate),
      endDate: formatDateForInput(initialData.endDate),
    };
  });
  console.log("formData", formData);

  // Update form when discount prop changes
  useEffect(() => {
    if (discount) {
      setFormData({
        ...discount,
        startDate: formatDateForInput(discount.startDate),
        endDate: formatDateForInput(discount.endDate),
      });
    }
  }, [discount]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission with proper date validation
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      alert("Please select at least one product");
      return;
    }

    // Convert dates to proper format for validation
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    // Reset time part to avoid timezone issues
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate <= startDate) {
      alert("End date must be after start date");
      return;
    }

    // Prepare data for submission
    const discountData = {
      ...formData,
      value: Number(formData.value),
      maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
      products: selectedProducts,
      // Ensure dates are in proper format for backend
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    // Pass data to parent component
    onSubmit(e, discountData);
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <h2>{mode === "create" ? "Create New Discount" : "Edit Discount"}</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            <TwoColumnGrid>
              {/* Product Selection Column */}
              <div>
                <FormGroup>
                  <Label>Filter by Category (optional)</Label>
                  <CategoryGrid>
                    {sellerCategories.map((category) => (
                      <CategoryOption
                        key={category._id}
                        selected={selectedCategory?._id === category._id}
                        onClick={() => {
                          setSelectedCategory(
                            selectedCategory?._id === category._id
                              ? null
                              : category
                          );
                        }}
                      >
                        <FaFolder /> {category.name}
                      </CategoryOption>
                    ))}
                  </CategoryGrid>
                </FormGroup>

                <FormGroup>
                  <Label>
                    {selectedCategory
                      ? `Select Products in ${selectedCategory.name}`
                      : "Select Products"}
                    <SelectedCountBadge>
                      {selectedProducts.length} selected
                    </SelectedCountBadge>
                  </Label>

                  <ButtonGroup>
                    <SecondaryButton
                      onClick={handleSelectAllInView}
                      type="button"
                    >
                      {selectedCategory &&
                      productsInCategory.length > 0 &&
                      selectedProducts.filter((id) =>
                        productsInCategory.some((p) => p._id === id)
                      ).length === productsInCategory.length
                        ? "Deselect All in Category"
                        : "Select All in Category"}
                    </SecondaryButton>

                    <SecondaryButton
                      onClick={() => handleProductSelect([])}
                      type="button"
                    >
                      Clear Selection
                    </SecondaryButton>
                  </ButtonGroup>
                </FormGroup>

                <FormGroup>
                  <ProductGrid>
                    {(selectedCategory
                      ? productsInCategory
                      : sellerProducts
                    ).map((product) => (
                      <ProductOption
                        key={product._id}
                        selected={selectedProducts.includes(product._id)}
                        onClick={() => handleProductSelect(product._id)}
                      >
                        <ProductImage
                          src={product.imageCover}
                          alt={product.name}
                        />
                        <ProductName>{product.name}</ProductName>
                        <ProductPrice>Gh₵{product.price}</ProductPrice>

                        {selectedProducts.includes(product._id) && (
                          <SelectedBadge>
                            <FaCheck size={10} />
                          </SelectedBadge>
                        )}
                      </ProductOption>
                    ))}
                  </ProductGrid>
                </FormGroup>
              </div>

              {/* Discount Details Column */}
              <div>
                <FormGroup>
                  <Label>Discount Name *</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Discount Code *</Label>
                  <Input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    disabled={mode === "edit"} // Prevent changing code after creation
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Discount Type *</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed">Fixed Amount Discount</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>
                    {formData.type === "percentage"
                      ? "Discount Percentage *"
                      : "Discount Amount *"}
                  </Label>
                  <Input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </FormGroup>
              </div>

              {/* Schedule & Limits Column */}
              <div>
                <FormGroup>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Maximum Usage (optional)</Label>
                  <Input
                    type="number"
                    name="maxUsage"
                    value={formData.maxUsage}
                    onChange={handleInputChange}
                    min="1"
                  />
                </FormGroup>

                <CheckboxContainer>
                  <Checkbox
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <Label>Active Discount</Label>
                </CheckboxContainer>
              </div>
            </TwoColumnGrid>

            <ButtonContainer>
              <PrimaryButton variant="outline" onClick={onClose} type="button">
                Cancel
              </PrimaryButton>
              <PrimaryButton type="submit">
                {mode === "create" ? "Create Discount" : "Update Discount"}
              </PrimaryButton>
            </ButtonContainer>
          </form>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalBody = styled.div`
  padding: 16px 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;

  &:hover {
    color: #1f2937;
  }
`;
const TwoColumnGrid = styled.div`
  display: grid;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const FormGroup = styled.div`
  margin-bottom: 16px;
`;
const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background: ${({ active }) => (active ? "white" : "transparent")};
  border: none;
  border-bottom: 3px solid
    ${({ active }) => (active ? "#3b82f6" : "transparent")};
  font-weight: 500;
  color: ${({ active }) => (active ? "#3b82f6" : "#6b7280")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    color: #3b82f6;
    background-color: #f3f4f6;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
`;

const ProductOption = styled.div`
  position: relative;
  border: 2px solid ${(props) => (props.selected ? "#3b82f6" : "#e5e7eb")};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.selected ? "#dbeafe" : "white")};

  &:hover {
    border-color: #93c5fd;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f3f4f6;
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPrice = styled.div`
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
  margin-top: 4px;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const CategoryOption = styled.div`
  border: 2px solid ${(props) => (props.selected ? "#3b82f6" : "#e5e7eb")};
  background: ${(props) => (props.selected ? "#dbeafe" : "white")};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: #93c5fd;
  }

  svg {
    font-size: 1.5rem;
    color: ${(props) => (props.selected ? "#3b82f6" : "#6b7280")};
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const PrimaryButton = styled.button`
  padding: 10px 16px;
  background-color: ${(props) =>
    props.variant === "outline" ? "transparent" : "#3b82f6"};
  color: ${(props) => (props.variant === "outline" ? "#3b82f6" : "white")};
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: ${(props) =>
    props.variant === "outline" ? "1px solid #3b82f6" : "none"};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: ${(props) =>
      props.variant === "outline" ? "#dbeafe" : "#2563eb"};
  }
`;

const SecondaryButton = styled.button`
  padding: 8px 12px;
  background-color: white;
  color: #4b5563;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid #d1d5db;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CouponControlsContainer = styled(ControlsContainer)`
  margin-bottom: 16px;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #9ca3af;
    background-color: #f9fafb;
  }
`;

const StatusFilter = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const StatusButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background-color: ${({ active }) => (active ? "#dbeafe" : "#f3f4f6")};
  color: ${({ active }) => (active ? "#1d4ed8" : "#4b5563")};

  &:hover {
    background-color: #e5e7eb;
  }
`;

const DiscountsContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
`;

const DiscountItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr auto;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "name value"
      "dates status"
      "usage actions";
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

const DiscountName = styled.div`
  font-weight: 600;
  color: #1f2937;

  @media (max-width: 1024px) {
    grid-area: name;
  }
`;

const DiscountCode = styled.div`
  color: #3b82f6;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 1024px) {
    grid-area: name;
    justify-self: end;
  }
`;

const DiscountValue = styled.div`
  font-weight: 600;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 1024px) {
    grid-area: value;
  }
`;

const DiscountDates = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    grid-area: dates;
  }
`;

const DiscountStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;

  ${({ active }) =>
    active
      ? `background-color: #d1fae5; color: #065f46;`
      : `background-color: #fee2e2; color: #b91c1c;`}

  @media (max-width: 1024px) {
    grid-area: status;
    justify-self: end;
  }
`;

const DiscountUsage = styled.div`
  color: #6b7280;
  font-size: 0.875rem;

  @media (max-width: 1024px) {
    grid-area: usage;
  }
`;

const DiscountActions = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 1024px) {
    grid-area: actions;
    justify-self: end;
  }
`;

const ActionButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }
`;

const CreateDiscountPanel = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-top: 24px;
`;

const CreateCouponPanel = styled(CreateDiscountPanel)``;

const PanelTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const SelectedCountBadge = styled.span`
  background-color: #3b82f6;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

// Coupon Batch Styles
const CouponBatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CouponBatchCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const BatchName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const BatchDiscount = styled.div`
  padding: 6px 12px;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 20px;
  font-weight: 600;
`;

const BatchActions = styled.div`
  display: flex;
  gap: 4px;
`;

const BatchDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.875rem;
  color: #6b7280;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #374151;
  display: block;
  margin-bottom: 4px;
`;

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const CouponItem = styled.div`
  border: 1px solid ${({ used }) => (used ? "#e5e7eb" : "#dbeafe")};
  background: ${({ used }) => (used ? "#f9fafb" : "#eff6ff")};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const CouponCode = styled.div`
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
  word-break: break-all;
`;

const CouponStatus = styled.div`
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
  background: ${({ used }) => (used ? "#fee2e2" : "#d1fae5")};
  color: ${({ used }) => (used ? "#b91c1c" : "#065f46")};
`;

const CouponActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

// Share Modal Styles

const ShareModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 90%;
  max-width: 500px;
  padding: 24px;
`;

const QRCodeContainer = styled.div`
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const CouponCodeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: #2563eb;
  }
`;

const ShareOptions = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const ShareOptionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;
