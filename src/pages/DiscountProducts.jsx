import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaTrash,
  FaEdit,
  FaTag,
  FaCalendarAlt,
  FaPercentage,
  FaDollarSign,
  FaTicketAlt,
  FaQrcode,
} from "react-icons/fa";
import useProduct from "../hooks/useProduct";
import useAuth from "../hooks/useAuth";
import {
  useCreateDiscount,
  useGetsellerDiscount,
  useDeleteDiscount,
  useUpdateDiscount,
} from "../hooks/useDiscount";
import { formatDate, generateDisplayId } from "../utils/helpers";
import DiscountModal from "../components/modal/DiscountModal";
import CouponBatchModal from "../components/modal/CouponBatchModal";
import ShareCouponModal from "../components/modal/ShareCouponModal";
import CouponTab from "../components/CouponTab";
import { ConfirmationModal } from "../components/modal/ConfirmationModal";

const statusOptions = [
  { id: "all", label: "All Discounts" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "upcoming", label: "Upcoming" },
  { id: "expired", label: "Expired" },
];

const initialCouponBatch = {
  name: "",
  discountType: "percentage",
  discountValue: "",
  quantity: 1,
  validFrom: "",
  expiresAt: "",
  maxUsage: "",
};

export const SellerDiscountPage = () => {
  const [activeTab, setActiveTab] = useState("discounts");
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [couponSearchTerm, setCouponSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [discountModal, setDiscountModal] = useState({
    isOpen: false,
    mode: "create",
    discount: null,
  });

  const [couponModal, setCouponModal] = useState({
    isOpen: false,
    batch: initialCouponBatch,
  });

  const [shareModal, setShareModal] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const { seller } = useAuth();
  const { useGetAllProductBySeller } = useProduct();
  const { data: productData } = useGetAllProductBySeller(seller?.id, {
    enabled: !!seller?.id,
  });

  const { data: discountData } = useGetsellerDiscount();
  const { createDiscount } = useCreateDiscount();
  const { deleteDiscount } = useDeleteDiscount();
  const { updateDiscount } = useUpdateDiscount();

  const discounts = useMemo(
    () => discountData?.data?.data?.discounts || [],
    [discountData]
  );

  const sellerProducts = useMemo(
    () => productData?.data?.data || [],
    [productData]
  );
  const handleShareCoupon = (couponCode, batchId) => {
    setShareModal({ couponCode, batchId });
  };
  const sellerCategories = useMemo(() => {
    const categoryMap = {};
    sellerProducts.forEach((product) => {
      if (product.parentCategory?._id) {
        const { _id, name } = product.parentCategory;
        if (!categoryMap[_id]) categoryMap[_id] = { _id, name };
      }
    });
    return Object.values(categoryMap);
  }, [sellerProducts]);

  const productsInCategory = useMemo(
    () =>
      selectedCategory
        ? sellerProducts.filter(
            (p) => p.parentCategory?._id === selectedCategory?._id
          )
        : [],
    [selectedCategory, sellerProducts]
  );

  const filteredDiscounts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return discounts.filter((discount) => {
      // Status filtering
      if (activeStatus !== "all") {
        const isActive =
          discount.active &&
          today >= discount.startDate &&
          today <= discount.endDate;
        const isUpcoming = discount.startDate > today;
        const isExpired = discount.endDate < today;

        if (activeStatus === "active" && !isActive) return false;
        if (activeStatus === "inactive" && discount.active) return false;
        if (activeStatus === "upcoming" && !isUpcoming) return false;
        if (activeStatus === "expired" && !isExpired) return false;
      }

      // Search term filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !discount.name.toLowerCase().includes(term) &&
          !discount.code.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [discounts, activeStatus, searchTerm]);

  const handleProductSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllInView = () => {
    const visibleProductIds = (
      selectedCategory ? productsInCategory : sellerProducts
    ).map((p) => p._id);

    setSelectedProducts((prev) =>
      visibleProductIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !visibleProductIds.includes(id))
        : [...new Set([...prev, ...visibleProductIds])]
    );
  };

  const handleModalDiscountSubmit = (e, formData) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      alert("Please select at least one product");
      return;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      alert("End date must be after start date");
      return;
    }

    const discountData = {
      ...formData,
      value: Number(formData.value),
      maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
      products: selectedProducts,
    };
    if (discountModal.mode == "create") {
      createDiscount(discountData);
      closeDiscountModal();
    }

    if (discountModal.mode == "edit") {
      console.log("updated", discountData);
      updateDiscount({ id: discountModal?.discount._id, data: discountData });
      closeDiscountModal();
    }
  };
  const openCouponModal = () =>
    setCouponModal({ isOpen: true, batch: initialCouponBatch });
  const openDiscountModal = (discount = null) => {
    setDiscountModal({
      isOpen: true,
      mode: discount ? "edit" : "create",
      discount: discount || {
        name: "",
        code: "",
        type: "percentage",
        value: "",
        startDate: "",
        endDate: "",
        maxUsage: "",
        active: true,
      },
    });

    if (discount) {
      setSelectedProducts(discount.products || []);
    } else {
      setSelectedProducts([]);
      setSelectedCategory(null);
    }
  };

  const closeDiscountModal = () => {
    setDiscountModal((prev) => ({ ...prev, isOpen: false }));
  };

  const closeCouponModal = () =>
    setCouponModal({ isOpen: false, batch: initialCouponBatch });
  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Discount",
      message: `Are you sure you want to delete the discount "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteDiscount(id);
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  };

  return (
    <DashboardContainer>
      <ContentContainer>
        <Title>
          <span>Promotion Management</span>
          <HeaderActions>
            {activeTab === "discounts" ? (
              <PrimaryButton onClick={() => openDiscountModal()}>
                <FaPlus /> Create Discount
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={openCouponModal}>
                <FaPlus /> Create Coupon Batch
              </PrimaryButton>
            )}
          </HeaderActions>
        </Title>

        <TabContainer>
          <TabButton
            active={activeTab === "discounts"}
            onClick={() => setActiveTab("discounts")}
          >
            <FaTag /> Discounts
          </TabButton>
          <TabButton
            active={activeTab === "coupons"}
            onClick={() => setActiveTab("coupons")}
          >
            <FaTicketAlt /> Coupons
          </TabButton>
        </TabContainer>

        {activeTab === "discounts" ? (
          <>
            <ControlsContainer>
              <SearchContainer>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Search discounts by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchContainer>

              <StatusFilter>
                {statusOptions.map((status) => (
                  <StatusButton
                    key={status.id}
                    active={activeStatus === status.id}
                    onClick={() => setActiveStatus(status.id)}
                  >
                    {status.label}
                  </StatusButton>
                ))}
              </StatusFilter>
            </ControlsContainer>

            <DiscountsContainer>
              {filteredDiscounts.length > 0 ? (
                filteredDiscounts.map((discount) => (
                  <DiscountItem key={discount.id}>
                    <DiscountName>
                      <div>{discount.name}</div>
                      <DiscountId>
                        ID: {generateDisplayId(discount.id)}
                      </DiscountId>
                    </DiscountName>

                    <DiscountCode>
                      <FaTag /> {discount.code}
                    </DiscountCode>

                    <DiscountValue>
                      {discount.type === "percentage" ? (
                        <FaPercentage />
                      ) : (
                        <FaDollarSign />
                      )}
                      {discount.type === "percentage"
                        ? `${discount.value}% Off`
                        : `$${discount.value} Off`}
                    </DiscountValue>

                    <DiscountDates>
                      <DateRow>
                        <FaCalendarAlt size={12} />
                        {formatDate(discount.startDate)}
                      </DateRow>
                      <DateRow>
                        <FaCalendarAlt size={12} />
                        {formatDate(discount.endDate)}
                      </DateRow>
                    </DiscountDates>

                    <DiscountStatus active={discount.active}>
                      {discount.active ? "Active" : "Inactive"}
                    </DiscountStatus>

                    <DiscountUsage>
                      Used {discount.usage} of {discount.maxUsage} times
                    </DiscountUsage>

                    <DiscountActions>
                      <ActionButton
                        title="Edit discount"
                        onClick={() => openDiscountModal(discount)}
                      >
                        <FaEdit />
                      </ActionButton>
                      <ActionButton
                        title="Delete discount"
                        onClick={() =>
                          handleDelete(discount._id, discount.name)
                        }
                      >
                        <FaTrash />
                      </ActionButton>
                    </DiscountActions>
                  </DiscountItem>
                ))
              ) : (
                <EmptyState>
                  <h3>No discounts found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                  <PrimaryButton onClick={() => openDiscountModal()}>
                    <FaPlus /> Create Your First Discount
                  </PrimaryButton>
                </EmptyState>
              )}
            </DiscountsContainer>
          </>
        ) : (
          <CouponTab
            couponSearchTerm={couponSearchTerm}
            setCouponSearchTerm={setCouponSearchTerm}
            handleShareCoupon={handleShareCoupon}
            openCouponModal={openCouponModal}
            statusOptions={statusOptions}
          />
        )}

        {/* Modals */}
        {discountModal.isOpen && (
          <DiscountModal
            mode={discountModal.mode}
            discount={discountModal.discount}
            onClose={closeDiscountModal}
            onSubmit={handleModalDiscountSubmit}
            sellerCategories={sellerCategories}
            sellerProducts={sellerProducts}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            productsInCategory={productsInCategory}
            selectedProducts={selectedProducts}
            handleProductSelect={handleProductSelect}
            handleSelectAllInView={handleSelectAllInView}
          />
        )}

        {couponModal.isOpen && (
          <CouponBatchModal
            batch={couponModal.batch}
            onClose={closeCouponModal}
          />
        )}

        {shareModal && (
          <ShareCouponModal
            couponCode={shareModal.couponCode}
            onClose={() => setShareModal(null)}
          />
        )}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() =>
            setConfirmationModal({ ...confirmationModal, isOpen: false })
          }
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          confirmColor={confirmationModal.confirmColor}
        />
      </ContentContainer>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 20px;

  @media (min-width: 768px) {
    padding: 32px;
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

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const SearchInput = styled.input`
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

export const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
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

const DiscountId = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
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

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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
  background-color: ${({ active }) => (active ? "#d1fae5" : "#fee2e2")};
  color: ${({ active }) => (active ? "#065f46" : "#b91c1c")};

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

export const ActionButton = styled.button`
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

export const PrimaryButton = styled.button`
  padding: 10px 16px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #2563eb;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 16px;
  }

  p {
    color: #6b7280;
    margin-bottom: 24px;
  }
`;

export const CouponControlsContainer = styled(ControlsContainer)`
  margin-bottom: 16px;
`;

export const CouponBatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const CouponBatchCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
`;

export const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

export const BatchName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

export const BatchDiscount = styled.div`
  padding: 6px 12px;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 20px;
  font-weight: 600;
`;

export const BatchDetails = styled.div`
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

export const DetailItem = styled.div``;

export const DetailLabel = styled.span`
  font-weight: 500;
  color: #374151;
  display: block;
  margin-bottom: 4px;
`;

export const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

export const CouponItem = styled.div`
  border: 1px solid ${({ used }) => (used ? "#e5e7eb" : "#dbeafe")};
  background: ${({ used }) => (used ? "#f9fafb" : "#eff6ff")};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

export const CouponCode = styled.div`
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
  word-break: break-all;
`;

export const CouponStatus = styled.div`
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
  background: ${({ used }) => (used ? "#fee2e2" : "#d1fae5")};
  color: ${({ used }) => (used ? "#b91c1c" : "#065f46")};
`;

export const CouponActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

export default SellerDiscountPage;
