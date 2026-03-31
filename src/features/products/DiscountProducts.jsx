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
import useProduct from '../../shared/hooks/useProduct';
import useAuth from '../../shared/hooks/useAuth';
import {
  useCreateDiscount,
  useGetsellerDiscount,
  useDeleteDiscount,
  useUpdateDiscount,
} from '../../shared/hooks/useDiscount';
import { formatDate, generateDisplayId } from '../../shared/utils/helpers';
import DiscountModal from '../../shared/components/modal/DiscountModal';
import CouponBatchModal from '../../shared/components/modal/CouponBatchModal';
import CouponTab from '../../shared/components/CouponTab';
import { ConfirmationModal } from '../../shared/components/modal/ConfirmationModal';

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

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
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
      toast.error("Please select at least one product");
      return;
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      toast.error("End date must be after start date");
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
    <DiscountPage>
      {/* ── Header: title + tabs + action ── */}
      <PageHeader>
        <PageTitle>Promotion Management</PageTitle>
        <TabBar>
          <TabSegment
            $active={activeTab === "discounts"}
            onClick={() => setActiveTab("discounts")}
          >
            <FaTag size={11} /> Discounts
            {discounts.length > 0 && (
              <TabBadge $active={activeTab === "discounts"}>{discounts.length}</TabBadge>
            )}
          </TabSegment>
          <TabSegment
            $active={activeTab === "coupons"}
            onClick={() => setActiveTab("coupons")}
          >
            <FaTicketAlt size={11} /> Coupons
          </TabSegment>
        </TabBar>
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
      </PageHeader>

      {/* ── Tab content ── */}
      {activeTab === "discounts" ? (
        <ContentCard>
          {/* Search + filters */}
          <SearchRow>
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
                  $active={activeStatus === status.id}
                  onClick={() => setActiveStatus(status.id)}
                >
                  {status.label}
                </StatusButton>
              ))}
            </StatusFilter>
          </SearchRow>

          {/* Table */}
          {filteredDiscounts.length > 0 ? (
            <>
              <DiscountHead>
                <span>Discount</span>
                <span>Value</span>
                <span>Period</span>
                <span>Status</span>
                <span>Usage</span>
                <span></span>
              </DiscountHead>
              {filteredDiscounts.map((discount) => (
                <DiscountItem key={discount.id}>
                  <DiscountNameCell>
                    <DiscountName>{discount.name}</DiscountName>
                    <DiscountCode><FaTag size={9} /> {discount.code}</DiscountCode>
                  </DiscountNameCell>
                  <DiscountValue>
                    {discount.type === "percentage"
                      ? `${discount.value}% Off`
                      : `GH₵${discount.value} Off`}
                  </DiscountValue>
                  <DiscountDates>
                    <DateRow><FaCalendarAlt size={11} /> {formatDate(discount.startDate)}</DateRow>
                    <DateRow><FaCalendarAlt size={11} /> {formatDate(discount.endDate)}</DateRow>
                  </DiscountDates>
                  <DiscountStatus $active={discount.active}>
                    {discount.active ? "Active" : "Inactive"}
                  </DiscountStatus>
                  <DiscountUsage>
                    {discount.usage} / {discount.maxUsage ?? '∞'}
                  </DiscountUsage>
                  <DiscountActions>
                    <ActionButton title="Edit discount" onClick={() => openDiscountModal(discount)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton title="Delete discount" onClick={() => handleDelete(discount._id, discount.name)}>
                      <FaTrash />
                    </ActionButton>
                  </DiscountActions>
                </DiscountItem>
              ))}
            </>
          ) : (
            <EmptyState>
              <h3>No discounts found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <PrimaryButton onClick={() => openDiscountModal()}>
                <FaPlus /> Create Your First Discount
              </PrimaryButton>
            </EmptyState>
          )}
        </ContentCard>
      ) : (
        <CouponTab
          couponSearchTerm={couponSearchTerm}
          setCouponSearchTerm={setCouponSearchTerm}
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
    </DiscountPage>
  );
};

// Styled Components
const DiscountPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-size: 0.975rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  white-space: nowrap;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-left: auto;
`;

const ContentCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const SearchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const TabBar = styled.div`
  display: inline-flex;
  gap: 2px;
  background: #F3F0EB;
  border-radius: 9px;
  padding: 3px;
  align-self: flex-start;
`;

const TabSegment = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 28px;
  padding: 0 0.9rem;
  border: none;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: ${(p) => p.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.15s;
  background: ${(p) => p.$active ? '#FFFFFF' : 'transparent'};
  color: ${(p) => p.$active ? '#111827' : '#6B7280'};
  box-shadow: ${(p) => p.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  white-space: nowrap;

  &:hover { color: ${(p) => p.$active ? '#111827' : '#374151'}; }
`;

const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 0.68rem;
  font-weight: 600;
  background: ${(p) => p.$active ? '#FDF3E3' : '#E5E1D8'};
  color: ${(p) => p.$active ? '#E8920A' : '#9CA3AF'};
`;


export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 0.9rem 0 2.2rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  background: #F9F8F5;
  color: #111827;
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: #9CA3AF; }
  &:focus { border-color: #E8920A; background: #FFFFFF; }
`;

export const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 0.8rem;
`;

const StatusFilter = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
`;

const StatusButton = styled.button`
  height: 30px;
  padding: 0 0.85rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  border: 0.5px solid ${(p) => p.$active ? '#E8920A' : '#F1EFE8'};
  background: ${(p) => p.$active ? '#FDF3E3' : '#FFFFFF'};
  color: ${(p) => p.$active ? '#E8920A' : '#6B7280'};

  &:hover { border-color: #E8920A; color: #E8920A; }
`;


const DiscountHead = styled.div`
  display: grid;
  grid-template-columns: 2fr 0.7fr 1fr auto auto 64px;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem;
  background: #F9F8F5;
  border-bottom: 0.5px solid #F1EFE8;

  span {
    font-size: 0.7rem;
    font-weight: 600;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  @media (max-width: 1024px) { display: none; }
`;

const DiscountItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 0.7fr 1fr auto auto 64px;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
  align-items: center;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: #FFFDF9; }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
`;

const DiscountNameCell = styled.div``;

const DiscountName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
  margin-bottom: 0.2rem;
`;

const DiscountCode = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 24px;
  padding: 0 0.65rem;
  background: #FDF3E3;
  color: #E8920A;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: ui-monospace, 'Courier New', monospace;
`;

const DiscountValue = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #10B981;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const DiscountDates = styled.div`
  color: #9CA3AF;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const DiscountStatus = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(p) => p.$active ? '#D1FAE5' : '#FEE2E2'};
  color: ${(p) => p.$active ? '#065F46' : '#991B1B'};
`;

const DiscountUsage = styled.div`
  color: #9CA3AF;
  font-size: 0.875rem;
`;

const DiscountActions = styled.div`
  display: flex;
  gap: 0.35rem;
`;

export const ActionButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;

  &:hover { background: #F9F8F5; border-color: #E8920A; color: #E8920A; }
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 36px;
  padding: 0 1rem;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover { opacity: 0.88; }
`;

export const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  h3 {
    font-size: 0.975rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  p {
    font-size: 0.8rem;
    color: #9CA3AF;
    margin: 0 0 1rem;
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

export const CouponControlsContainer = styled(ControlsContainer)``;

export const CouponBatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const CouponBatchCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.25rem;
`;

export const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

export const BatchName = styled.h3`
  font-size: 0.975rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

export const BatchDiscount = styled.div`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 0.7rem;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const BatchDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #6B7280;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

export const DetailItem = styled.div``;

export const DetailLabel = styled.span`
  font-weight: 500;
  color: #9CA3AF;
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.75rem;
`;

export const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.5rem;
`;

export const CouponItem = styled.div`
  border: 0.5px solid ${(p) => p.used ? '#F1EFE8' : '#FDE68A'};
  background: ${(p) => p.used ? '#F9F8F5' : '#FFFDF9'};
  border-radius: 9px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

export const CouponCode = styled.div`
  font-family: ui-monospace, 'Courier New', monospace;
  font-size: 0.925rem;
  font-weight: 600;
  color: #E8920A;
  margin-bottom: 0.5rem;
  word-break: break-all;
`;

export const CouponStatus = styled.div`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 0.55rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
  background: ${(p) => p.used ? '#FEE2E2' : '#D1FAE5'};
  color: ${(p) => p.used ? '#991B1B' : '#065F46'};
`;

export const CouponActions = styled.div`
  display: flex;
  gap: 0.35rem;
  margin-top: 0.75rem;
`;

export default SellerDiscountPage;
