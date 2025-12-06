import { Link } from "react-router-dom";
import styled from "styled-components";
import useAuth from '../../shared/hooks/useAuth';
import { useMemo, useState } from "react";
import useProduct from '../../shared/hooks/useProduct';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaLayerGroup } from "react-icons/fa";
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

export default function Products() {
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { seller, isLoading: authLoading } = useAuth();
  const sellerId = seller?._id;

  const { useGetAllProductBySeller, deleteProduct } = useProduct();
  const { data, isLoading: productsLoading } = useGetAllProductBySeller(sellerId);

  const products = useMemo(() => {
    return data?.data.data || [];
  }, [data]);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    const stringId = id.toString();
    setDeletingId(stringId);
    try {
      await deleteProduct.mutateAsync(stringId);
      queryClient.invalidateQueries("products");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Product columns for ResponsiveDataTable
  const productColumns = [
    {
      key: 'product',
      title: 'Product',
      render: (product) => (
        <ProductCellContent>
          <ProductImage 
            src={product.imageCover} 
            alt={product.name}
            onError={(e) => {
              // Prevent infinite loop
              if (e.target.dataset.fallbackAttempted !== 'true') {
                e.target.dataset.fallbackAttempted = 'true';
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="10" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
              }
            }}
          />
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
        <StockIndicator stock={product.totalStock || product.stock || 0}>
          {product.totalStock || product.stock || 0}
          {(product.totalStock || product.stock || 0) === 0 && " (Out of Stock)"}
        </StockIndicator>
      ),
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
            variant="ghost"
            size="sm"
            iconOnly
            round
            onClick={() => handleDelete(product._id)}
            disabled={deletingId === product._id?.toString()}
            title="Delete Product"
          >
            {deletingId === product._id?.toString() ? (
              <ButtonSpinner size="14px" />
            ) : (
              <FaTrash />
            )}
          </Button>
        </ActionButtons>
      ),
    },
  ];

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
            {/* Add category options here if available */}
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

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
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
  background: ${({ stock }) =>
    stock > 20 
      ? "var(--color-green-100)" 
      : stock > 0 
      ? "var(--color-yellow-100)" 
      : "var(--color-red-100)"};
  color: ${({ stock }) =>
    stock > 20 
      ? "var(--color-green-700)" 
      : stock > 0 
      ? "var(--color-yellow-700)" 
      : "var(--color-red-700)"};
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
