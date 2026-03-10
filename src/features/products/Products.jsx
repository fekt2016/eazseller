import { Link } from "react-router-dom";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from '../../shared/hooks/useAuth';
import { useCallback, useMemo, useState } from "react";
import useProduct from '../../shared/hooks/useProduct';
import useAnalytics from '../../shared/hooks/useAnalytics';
import useCategory from '../../shared/hooks/useCategory';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaLayerGroup, FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { PATHS } from '../../routes/routePaths';
import {
  PageContainer,
  PageHeader,
  TitleSection,
  ActionSection,
  Toolbar,
  FilterGroup,
} from '../../shared/components/ui/SpacingSystem';
import ResponsiveDataTable from '../../shared/components/ui/ResponsiveDataTable';
import Button from '../../shared/components/ui/Button';
import SearchBox from '../../shared/components/ui/SearchBox';
import { LoadingState, EmptyState } from '../../shared/components/ui/LoadingComponents';
import { ButtonSpinner } from '../../shared/components/ButtonSpinner';
import { toast } from 'react-toastify';
import { getOptimizedImageUrl, IMAGE_SLOTS } from "../../shared/utils/cloudinaryConfig";
import OptimizedImage from "../../shared/components/OptimizedImage";

export default function Products() {
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { seller, isLoading: authLoading } = useAuth();
  const sellerId = seller?._id;

  const queryClient = useQueryClient();
  const { useGetAllProductBySeller, deleteProduct } = useProduct();
  const { useGetSellerProductViews } = useAnalytics();
  const { getCategories } = useCategory();
  const { data, isLoading: productsLoading } = useGetAllProductBySeller(sellerId);
  const { data: viewData } = useGetSellerProductViews(sellerId, { enabled: !!sellerId });
  const categories = getCategories?.data?.data?.results || getCategories?.data?.data || [];

  const products = useMemo(() => {
    const raw = data?.data?.data ?? data?.data?.products ?? data?.products ?? data?.data;
    const list = Array.isArray(raw) ? raw : [];
    return list;
  }, [data]);

  const viewsByProductId = useMemo(() => {
    const map = {};
    (viewData?.data?.views || []).forEach((item) => {
      const id = item.productId?.toString?.() ?? item.productId;
      if (id) map[id] = (item.views || 0) + (map[id] || 0);
    });
    return map;
  }, [viewData?.data?.views]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product =>
        product.category?._id === categoryFilter ||
        product.category?.name === categoryFilter
      );
    }

    return filtered;
  }, [products, searchTerm, categoryFilter]);

  const handleDeleteConfirmed = useCallback(async (stringId) => {
    setDeletingId(stringId);
    try {
      await deleteProduct.mutateAsync(stringId);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to delete product. Please try again.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  }, [deleteProduct, queryClient]);

  const handleDeleteClick = useCallback((id) => {
    const stringId = id.toString();
    if (pendingDeleteId === stringId) {
      // Second click — confirmed
      setPendingDeleteId(null);
      handleDeleteConfirmed(stringId);
    } else {
      // First click — arm the confirm
      setPendingDeleteId(stringId);
      // Auto-reset after 4 seconds
      setTimeout(() => setPendingDeleteId((cur) => cur === stringId ? null : cur), 4000);
    }
  }, [pendingDeleteId, handleDeleteConfirmed]);

  // Product columns for ResponsiveDataTable - memoized to prevent re-renders
  const productColumns = useMemo(() => [
    {
      key: 'product',
      title: 'Product',
      render: (product) => (
        <ProductCellContent>
          <div style={{ width: '50px', flexShrink: 0 }}>
            <OptimizedImage
              src={product.imageCover || (product.images && product.images[0])}
              slot={IMAGE_SLOTS.TABLE_THUMB}
              aspectRatio="1/1"
              alt={product.name}
              radius="0.5rem"
            />
          </div>
          <ProductName>{product.name}</ProductName>
        </ProductCellContent>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (product) => (
        <ProductDescription>
          {product.description?.slice(0, 100) || 'No description'}...
        </ProductDescription>
      ),
      hideOnMobile: true,
    },
    {
      key: 'price',
      title: 'Price',
      align: 'right',
      render: (product) => (
        <Price>Gh₵{(product.defaultPrice || product.price || 0).toFixed(2)}</Price>
      ),
    },
    {
      key: 'stock',
      title: 'Stock',
      align: 'center',
      render: (product) => (
        <StockIndicator $stock={product.totalStock || product.stock || 0}>
          {product.totalStock || product.stock || 0}
          {(product.totalStock || product.stock || 0) === 0 && " (Out of Stock)"}
        </StockIndicator>
      ),
    },
    {
      key: 'views',
      title: 'Views',
      align: 'center',
      render: (product) => {
        const id = (product._id || product.id)?.toString?.() ?? (product._id || product.id);
        const count = viewsByProductId[id] ?? 0;
        return (
          <TableViewCount>
            <FaEye />
            <span>{count}</span>
          </TableViewCount>
        );
      },
      hideOnMobile: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (product) => (
        <ActionButtons>
          <Button
            as={Link}
            to={PATHS.PRODUCT_VARIANTS.replace(':productId', product._id)}
            variant="ghost"
            size="sm"
            iconOnly
            round
            title="Manage Variants"
          >
            <FaLayerGroup />
          </Button>
          <Button
            as={Link}
            to={PATHS.EDIT_PRODUCT.replace(':id', product._id)}
            variant="ghost"
            size="sm"
            iconOnly
            round
            title="Edit Product"
          >
            <FaEdit />
          </Button>
          <Button
            variant={pendingDeleteId === product._id?.toString() ? "danger" : "ghost"}
            size="sm"
            iconOnly
            round
            onClick={() => handleDeleteClick(product._id)}
            disabled={deletingId === product._id?.toString()}
            title={pendingDeleteId === product._id?.toString() ? "Click again to confirm delete" : "Delete Product"}
          >
            {deletingId === product._id?.toString() ? (
              <ButtonSpinner size="14px" />
            ) : pendingDeleteId === product._id?.toString() ? (
              <FaCheck />
            ) : (
              <FaTrash />
            )}
          </Button>
        </ActionButtons>
      ),
    },
  ], [pendingDeleteId, deletingId, handleDeleteClick, viewsByProductId]);

  if (authLoading || productsLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading products..." />
      </PageContainer>
    );
  }

  if (products.length <= 0) {
    return (
      <PageContainer>
        <EmptyState
          icon={<FaBoxOpen size={48} />}
          title="No Products Found"
          message="You haven't added any products yet. Start by adding your first product!"
          action={
            <Button as={Link} to={PATHS.ADD_PRODUCT} variant="primary" size="lg" gradient>
              <FaPlus /> Add Your First Product
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </TitleSection>
        <ActionSection>
          <Button as={Link} to={PATHS.ADD_PRODUCT} variant="primary" size="lg" gradient>
            <FaPlus /> Add Product
          </Button>
        </ActionSection>
      </PageHeader>

      <Toolbar $padding="md" $marginBottom="lg">
        <SearchBox
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterGroup $gap="sm">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </Select>
        </FilterGroup>
      </Toolbar>

      <ResponsiveDataTable
        data={filteredProducts}
        columns={productColumns}
        $padding="md"
        showActions={true}
      />
    </PageContainer>
  );
}

// Styled Components
const ProductCellContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

/* ProductImage styled component replaced by OptimizedImage */
const ProductImage = styled.div`
  width: 50px;
  height: 50px;
  flex-shrink: 0;
`;

const ProductName = styled.div`
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  font-size: var(--font-size-md);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductDescription = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
  margin: 0;
  max-width: 400px;
  font-family: var(--font-body);
  line-height: 1.5;
`;

const Price = styled.div`
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  font-size: var(--font-size-md);
`;

const StockIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  background: ${({ $stock }) =>
    $stock > 20
      ? "var(--color-green-100)"
      : $stock > 0
        ? "var(--color-yellow-100)"
        : "var(--color-red-100)"};
  color: ${({ $stock }) =>
    $stock > 20
      ? "var(--color-green-700)"
      : $stock > 0
        ? "var(--color-yellow-700)"
        : "var(--color-red-700)"};
`;

const TableViewCount = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--font-size-sm);
  color: var(--color-grey-600, #64748b);
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
`;

const Select = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-700);
  background: var(--color-white-0);
  cursor: pointer;
  transition: var(--transition-base);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
  
  &:hover {
    border-color: var(--color-grey-300);
  }
`;
