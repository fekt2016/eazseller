import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '../../shared/hooks/useAuth';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import useProduct from '../../shared/hooks/useProduct';
import useCategory from '../../shared/hooks/useCategory';
import {
  FaEdit, FaTrash, FaPlus, FaBoxOpen, FaLayerGroup,
  FaEye, FaSearch, FaTimes, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { SkeletonTableRows } from '../../shared/components/ui/LoadingComponents';
import { toast } from 'react-toastify';
import { formatGHS } from '../../shared/utils/dashboardFormatters';
import ConfirmDeleteModal from '../../components/products/ConfirmDeleteModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 15;
const LOW_STOCK_THRESHOLD = 5;
const HIGH_VIEWS_THRESHOLD = 500;

const STATUS_TABS = [
  { key: 'all',          label: 'All' },
  { key: 'active',       label: 'Active' },
  { key: 'inactive',     label: 'Inactive' },
  { key: 'draft',        label: 'Draft' },
  { key: 'out_of_stock', label: 'Out of stock' },
  { key: 'archived',     label: 'Archived' },
];

const STATUS_CONFIG = {
  active:       { label: 'Active',       bg: '#EAF3DE', color: '#3B6D11', border: '#B8D89A' },
  inactive:     { label: 'Inactive',     bg: '#F1EFE8', color: '#374151', border: '#D1D5DB' },
  draft:        { label: 'Draft',        bg: '#E6F1FB', color: '#185FA5', border: '#BFDBFE' },
  out_of_stock: { label: 'Out of stock', bg: '#FAEEDA', color: '#854F0B', border: '#FDE68A' },
  archived:     { label: 'Archived',     bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
};

// ─── Stock badge helper ────────────────────────────────────────────────────────
const getStockConfig = (qty) => {
  if (qty === 0)                    return { label: '0 · Out of stock',  bg: '#FCEBEB', color: '#A32D2D', border: '#FECACA' };
  if (qty <= LOW_STOCK_THRESHOLD)   return { label: `${qty} · Low stock`, bg: '#FAEEDA', color: '#854F0B', border: '#FDE68A' };
  return                                   { label: `${qty} in stock`,    bg: '#EAF3DE', color: '#3B6D11', border: '#B8D89A' };
};

// ─── Image helper ──────────────────────────────────────────────────────────────
const getProductThumb = (product) => {
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    return img.thumbnail || img.url || null;
  }
  return product.imageCover || product.coverImage || null;
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function Products() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { seller, isLoading: authLoading } = useAuth();
  const sellerId = seller?._id;

  // ── Data ────────────────────────────────────────────────────────────────────
  const { useGetAllProductBySeller, deleteProduct } = useProduct();
  const { getCategories } = useCategory();

  const { data, isLoading: productsLoading } = useGetAllProductBySeller(sellerId);

  const categories = useMemo(() => {
    const raw = getCategories?.data?.data?.results
      || getCategories?.data?.data
      || getCategories?.data?.results
      || [];
    return Array.isArray(raw) ? raw : [];
  }, [getCategories?.data]);

  const products = useMemo(() => {
    const raw = data?.data?.data ?? data?.data?.products ?? data?.products ?? data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const debounceRef = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);
  };

  const clearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (key) => {
    setStatusFilter(key);
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, categoryFilter, statusFilter]);

  // ── Filtered products ────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = products;

    if (debouncedSearch) {
      list = list.filter((p) => {
        const nameMatch = (p.name || '').toLowerCase().includes(debouncedSearch);
        const skuMatch  = (p.defaultSku || p.variants?.[0]?.sku || '').toLowerCase().includes(debouncedSearch);
        return nameMatch || skuMatch;
      });
    }

    if (categoryFilter) {
      list = list.filter((p) => {
        const catId = p.parentCategory?._id || p.parentCategory;
        const id = typeof catId === 'string' ? catId : catId?.toString?.() || '';
        return id === categoryFilter;
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    return list;
  }, [products, debouncedSearch, categoryFilter, statusFilter]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalCount      = products.length;
    const totalViews      = products.reduce((s, p) => s + (p.totalViews || 0), 0);
    const outOfStockCount = products.filter((p) => (p.totalStock ?? 0) === 0).length;
    const totalStockUnits = products.reduce((s, p) => s + (p.totalStock ?? 0), 0);
    return { totalCount, totalViews, outOfStockCount, totalStockUnits };
  }, [products]);

  // ── Status tab counts ─────────────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { all: products.length };
    STATUS_TABS.slice(1).forEach(({ key }) => {
      counts[key] = products.filter((p) => p.status === key).length;
    });
    return counts;
  }, [products]);

  // ── Bulk selection ───────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());

  const isAllSelected = filteredProducts.length > 0
    && filteredProducts.every((p) => selectedIds.has(p._id));

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p._id)));
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const pageFrom    = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageTo      = Math.min(pageFrom + ITEMS_PER_PAGE, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(pageFrom, pageTo);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  const handleDeleteClick = (product) => setDeleteTarget(product);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct.mutateAsync(deleteTarget._id.toString());
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteProduct, queryClient]);

  // ── Bulk delete ──────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    let failed = 0;
    for (const id of ids) {
      try {
        await deleteProduct.mutateAsync(id.toString());
      } catch {
        failed++;
      }
    }
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    clearSelection();
    if (failed === 0) toast.success(`${ids.length} product${ids.length > 1 ? 's' : ''} deleted`);
    else toast.warning(`Deleted ${ids.length - failed}, failed ${failed}`);
  };

  // ── Page numbers ─────────────────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '…', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  // ─────────────────────────────────────────────────────────────────────────────
  if (authLoading || productsLoading) {
    return (
      <ProductsPage>
        <SkeletonTableRows count={10} hasImage />
      </ProductsPage>
    );
  }

  const hasActiveFilters = debouncedSearch || categoryFilter || statusFilter !== 'all';

  const resetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategoryFilter('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <ProductsPage>
      {/* ── Delete modal ──────────────────────────────────────────────────── */}
      <ConfirmDeleteModal
        product={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <PageHeader>
        <div>
          <PageTitle>My Products</PageTitle>
          <PageSubtitle>
            Manage your product catalog&nbsp;·&nbsp;
            <strong>{stats.totalCount}</strong> product{stats.totalCount !== 1 ? 's' : ''} listed
          </PageSubtitle>
        </div>
        <Button as={Link} to={PATHS.ADD_PRODUCT} variant="primary" size="md">
          <FaPlus /> Add product
        </Button>
      </PageHeader>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <StatsRow>
        <StatTile>
          <StatValue>{stats.totalCount.toLocaleString()}</StatValue>
          <StatLabel>Total products</StatLabel>
          <StatSub>In your catalog</StatSub>
        </StatTile>
        <StatTile>
          <StatValue $gold>{stats.totalViews.toLocaleString()}</StatValue>
          <StatLabel>Total views</StatLabel>
          <StatSub>Across all products</StatSub>
        </StatTile>
        <StatTile>
          <StatValue $warn={stats.outOfStockCount > 0} $ok={stats.outOfStockCount === 0}>
            {stats.outOfStockCount}
          </StatValue>
          <StatLabel>Out of stock</StatLabel>
          <StatSub>
            {stats.outOfStockCount > 0 ? 'Needs restock' : 'All products stocked'}
          </StatSub>
        </StatTile>
        <StatTile>
          <StatValue>{stats.totalStockUnits.toLocaleString()}</StatValue>
          <StatLabel>Total stock units</StatLabel>
          <StatSub>Units available</StatSub>
        </StatTile>
      </StatsRow>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <Toolbar>
        <SearchWrap>
          <SearchIcon><FaSearch /></SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by product name or SKU…"
            value={searchInput}
            onChange={handleSearchChange}
          />
          {searchInput && (
            <ClearBtn type="button" onClick={clearSearch}>
              <FaTimes />
            </ClearBtn>
          )}
        </SearchWrap>

        <CategorySelect value={categoryFilter} onChange={handleCategoryChange}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </CategorySelect>

        <StatusTabs>
          {STATUS_TABS.map(({ key, label }) => (
            <StatusTab
              key={key}
              type="button"
              $active={statusFilter === key}
              onClick={() => handleStatusChange(key)}
            >
              {label}
              <TabCount $active={statusFilter === key}>{statusCounts[key] ?? 0}</TabCount>
            </StatusTab>
          ))}
        </StatusTabs>
      </Toolbar>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <TableCard>
        {/* Bulk bar */}
        {selectedIds.size > 0 && (
          <BulkBar>
            <BulkInfo>{selectedIds.size} selected</BulkInfo>
            <BulkAction onClick={handleBulkDelete}>Delete selected</BulkAction>
            <BulkSep>|</BulkSep>
            <BulkAction $muted onClick={clearSelection}>Clear selection ×</BulkAction>
          </BulkBar>
        )}

        {paginatedProducts.length === 0 ? (
          /* Empty states */
          <EmptyWrap>
            {hasActiveFilters ? (
              <>
                <EmptyIcon><FaSearch /></EmptyIcon>
                <EmptyTitle>No products match your filters</EmptyTitle>
                <EmptyText>Try a different search term or clear your filters</EmptyText>
                <ClearFiltersBtn type="button" onClick={resetFilters}>
                  Clear all filters
                </ClearFiltersBtn>
              </>
            ) : (
              <>
                <EmptyIcon><FaBoxOpen /></EmptyIcon>
                <EmptyTitle>No products yet</EmptyTitle>
                <EmptyText>Add your first product to start selling on Saiisai</EmptyText>
                <Button as={Link} to={PATHS.ADD_PRODUCT} variant="primary" size="md">
                  <FaPlus /> Add product
                </Button>
              </>
            )}
          </EmptyWrap>
        ) : (
          <>
          {/* ── Desktop table ── */}
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th $w="36px" $center>
                    <Checkbox
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleAll}
                      title="Select all"
                    />
                  </Th>
                  <Th>Product</Th>
                  <Th $w="110px">Category</Th>
                  <Th $w="120px" $right>Price</Th>
                  <Th $w="140px" $right>Stock</Th>
                  <Th $w="80px" $right>Views</Th>
                  <Th $w="120px">Status</Th>
                  <Th $w="100px" $right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product, idx) => {
                  const totalStock  = product.totalStock ?? 0;
                  const isOOS       = totalStock === 0;
                  const stockCfg    = getStockConfig(totalStock);
                  const statusCfg   = STATUS_CONFIG[product.status] ?? STATUS_CONFIG.inactive;
                  const views       = product.totalViews ?? 0;
                  const isHotViews  = views > HIGH_VIEWS_THRESHOLD;
                  const thumb       = getProductThumb(product);
                  const sku         = product.defaultSku || product.variants?.[0]?.sku || null;
                  const price       = product.defaultPrice ?? product.price ?? 0;
                  const origPrice   = product.variants?.[0]?.originalPrice ?? null;
                  const catName     = product.parentCategory?.name || null;
                  const isSelected  = selectedIds.has(product._id);
                  const isLast      = idx === paginatedProducts.length - 1;

                  return (
                    <Tr
                      key={product._id}
                      $oos={isOOS}
                      $last={isLast}
                      onClick={() => navigate(PATHS.EDIT_PRODUCT.replace(':id', product._id))}
                    >
                      {/* Checkbox */}
                      <Td $center onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(product._id)}
                        />
                      </Td>

                      {/* Product cell */}
                      <Td>
                        <ProductCell>
                          <ProductThumb
                            src={thumb || '/img/placeholder-product.png'}
                            alt={product.name}
                            onError={(e) => { e.target.src = '/img/placeholder-product.png'; }}
                          />
                          <ProductMeta>
                            <ProductName title={product.name}>{product.name}</ProductName>
                            {sku
                              ? <ProductSku>SKU: {sku}</ProductSku>
                              : product.variants?.length > 1
                                ? <ProductSku>{product.variants.length} variants</ProductSku>
                                : null
                            }
                          </ProductMeta>
                        </ProductCell>
                      </Td>

                      {/* Category */}
                      <Td>
                        {catName
                          ? <CategoryBadge>{catName}</CategoryBadge>
                          : <CategoryBadge $muted>Uncategorised</CategoryBadge>
                        }
                      </Td>

                      {/* Price */}
                      <Td $right>
                        <PriceWrap>
                          <PriceMain>{formatGHS(price)}</PriceMain>
                          {origPrice && origPrice > price && (
                            <PriceOrig>{formatGHS(origPrice)}</PriceOrig>
                          )}
                        </PriceWrap>
                      </Td>

                      {/* Stock */}
                      <Td $right>
                        <StockBadge
                          $bg={stockCfg.bg}
                          $color={stockCfg.color}
                          $border={stockCfg.border}
                        >
                          {stockCfg.label}
                        </StockBadge>
                      </Td>

                      {/* Views */}
                      <Td $right>
                        <ViewsCell $hot={isHotViews}>
                          <FaEye />
                          <span>{views.toLocaleString()}</span>
                        </ViewsCell>
                      </Td>

                      {/* Status */}
                      <Td>
                        <StatusBadge
                          $bg={statusCfg.bg}
                          $color={statusCfg.color}
                          $border={statusCfg.border}
                        >
                          {statusCfg.label}
                        </StatusBadge>
                      </Td>

                      {/* Actions */}
                      <Td $right onClick={(e) => e.stopPropagation()}>
                        <ActionButtons>
                          <ActionBtn
                            as={Link}
                            to={PATHS.PRODUCT_VARIANTS.replace(':productId', product._id)}
                            title="Manage variants"
                          >
                            <FaLayerGroup />
                          </ActionBtn>
                          <ActionBtn
                            as={Link}
                            to={PATHS.EDIT_PRODUCT.replace(':id', product._id)}
                            title="Edit product"
                          >
                            <FaEdit />
                          </ActionBtn>
                          <ActionBtn
                            $danger
                            type="button"
                            onClick={() => handleDeleteClick(product)}
                            title="Delete product"
                          >
                            <FaTrash />
                          </ActionBtn>
                        </ActionButtons>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>

          {/* ── Mobile card list ── */}
          <MobileCardList>
            {paginatedProducts.map((product) => {
              const totalStock = product.totalStock ?? 0;
              const stockCfg   = getStockConfig(totalStock);
              const statusCfg  = STATUS_CONFIG[product.status] ?? STATUS_CONFIG.inactive;
              const thumb      = getProductThumb(product);
              const price      = product.defaultPrice ?? product.price ?? 0;
              const sku        = product.defaultSku || product.variants?.[0]?.sku || null;

              return (
                <MobileCard
                  key={product._id}
                  onClick={() => navigate(PATHS.EDIT_PRODUCT.replace(':id', product._id))}
                >
                  <MobileThumb
                    src={thumb || '/img/placeholder-product.png'}
                    alt={product.name}
                    onError={(e) => { e.target.src = '/img/placeholder-product.png'; }}
                  />
                  <MobileCardBody>
                    <MobileCardName>{product.name}</MobileCardName>
                    {sku && <MobileCardSku>SKU: {sku}</MobileCardSku>}
                    <MobileCardBadges>
                      <StatusBadge $bg={statusCfg.bg} $color={statusCfg.color} $border={statusCfg.border}>
                        {statusCfg.label}
                      </StatusBadge>
                      <StockBadge $bg={stockCfg.bg} $color={stockCfg.color} $border={stockCfg.border}>
                        {stockCfg.label}
                      </StockBadge>
                    </MobileCardBadges>
                    <MobileCardFooter>
                      <MobileCardPrice>{formatGHS(price)}</MobileCardPrice>
                      <MobileCardActions onClick={(e) => e.stopPropagation()}>
                        <ActionBtn
                          as={Link}
                          to={PATHS.PRODUCT_VARIANTS.replace(':productId', product._id)}
                          title="Manage variants"
                        >
                          <FaLayerGroup />
                        </ActionBtn>
                        <ActionBtn
                          as={Link}
                          to={PATHS.EDIT_PRODUCT.replace(':id', product._id)}
                          title="Edit product"
                        >
                          <FaEdit />
                        </ActionBtn>
                        <ActionBtn
                          $danger
                          type="button"
                          onClick={() => handleDeleteClick(product)}
                          title="Delete product"
                        >
                          <FaTrash />
                        </ActionBtn>
                      </MobileCardActions>
                    </MobileCardFooter>
                  </MobileCardBody>
                </MobileCard>
              );
            })}
          </MobileCardList>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationInfo>
              Showing {pageFrom + 1}–{pageTo} of {filteredProducts.length} products
            </PaginationInfo>
            <PageButtons>
              <PageBtn
                type="button"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                title="Previous page"
              >
                <FaChevronLeft />
              </PageBtn>
              {pageNumbers.map((n, i) =>
                n === '…' ? (
                  <PageEllipsis key={`e${i}`}>…</PageEllipsis>
                ) : (
                  <PageBtn
                    key={n}
                    type="button"
                    $active={n === currentPage}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </PageBtn>
                )
              )}
              <PageBtn
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                title="Next page"
              >
                <FaChevronRight />
              </PageBtn>
            </PageButtons>
          </Pagination>
        )}
      </TableCard>
    </ProductsPage>
  );
}

// ─── Styled components ─────────────────────────────────────────────────────────

const ProductsPage = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid #E8920A;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;
`;

const PageSubtitle = styled.p`
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;

  strong { color: #111827; font-weight: 600; }
`;

// ── Stats row ──────────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const StatTile = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.25rem;
`;

const StatValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  color: ${({ $gold, $warn, $ok }) =>
    $gold ? '#E8920A' :
    $warn ? '#854F0B' :
    $ok   ? '#3B6D11' :
    '#111827'
  };
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9CA3AF;
  margin-bottom: 0.15rem;
`;

const StatSub = styled.div`
  font-size: 0.8rem;
  color: #9CA3AF;
`;

// ── Toolbar ────────────────────────────────────────────────────────────────────
const Toolbar = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 200px;
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  color: #9CA3AF;
  font-size: 0.8rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 2rem 0 2rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background: #F9F8F5;
  outline: none;
  transition: border-color 0.12s, background 0.12s;

  &::placeholder { color: #D1D5DB; }
  &:focus { border-color: #E8920A; background: #FFFFFF; }
`;

const ClearBtn = styled.button`
  position: absolute;
  right: 0.65rem;
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  transition: color 0.12s;

  &:hover { color: #374151; }
`;

const CategorySelect = styled.select`
  height: 36px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #374151;
  background: #F9F8F5;
  cursor: pointer;
  outline: none;
  min-width: 160px;
  transition: border-color 0.12s;

  &:focus { border-color: #E8920A; }
`;

const StatusTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: #F1EFE8;
  border-radius: 9px;
  padding: 3px;
  flex-wrap: wrap;
`;

const StatusTab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 28px;
  padding: 0 0.65rem;
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.12s;

  background: ${({ $active }) => $active ? '#FFFFFF' : 'transparent'};
  color:      ${({ $active }) => $active ? '#E8920A' : '#6B7280'};
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  border: ${({ $active }) => $active ? '0.5px solid #F1EFE8' : '0.5px solid transparent'};

  &:hover:not(:disabled) {
    color: ${({ $active }) => $active ? '#E8920A' : '#374151'};
  }
`;

const TabCount = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#E8920A' : '#9CA3AF'};
`;

// ── Table card ─────────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem;
  background: #FDF3E3;
  border-bottom: 0.5px solid #E8920A22;
`;

const BulkInfo = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #E8920A;
`;

const BulkSep = styled.span`
  color: #E8920A44;
  font-size: 0.8rem;
`;

const BulkAction = styled.button`
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  color: ${({ $muted }) => $muted ? '#9CA3AF' : '#A32D2D'};
  transition: opacity 0.12s;

  &:hover { opacity: 0.75; text-decoration: underline; }

  &:last-child { margin-left: auto; }
`;

const TableWrap = styled.div`
  overflow-x: auto;

  @media (max-width: 640px) {
    display: none;
  }
`;

/* ── Mobile card view (hidden on desktop) ──────────────────────────────────── */
const MobileCardList = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: flex;
    flex-direction: column;
  }
`;

const MobileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-bottom: 0.5px solid #F9F8F5;
  cursor: pointer;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: #FAFAF9; }
`;

const MobileThumb = styled.img`
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 9px;
  border: 0.5px solid #F1EFE8;
  background: #F9F8F5;
  flex-shrink: 0;
`;

const MobileCardBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const MobileCardName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MobileCardSku = styled.div`
  font-size: 0.72rem;
  color: #9CA3AF;
`;

const MobileCardBadges = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const MobileCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.15rem;
`;

const MobileCardPrice = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const Th = styled.th`
  padding: 0.65rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9CA3AF;
  background: #F9F8F5;
  border-bottom: 0.5px solid #F1EFE8;
  white-space: nowrap;
  width: ${({ $w }) => $w || 'auto'};
  text-align: ${({ $right, $center }) => $right ? 'right' : $center ? 'center' : 'left'};
`;

const Tr = styled.tr`
  background: ${({ $oos }) => $oos ? 'rgba(252,235,235,0.35)' : 'transparent'};
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: ${({ $oos }) => $oos ? 'rgba(252,235,235,0.6)' : '#FFFDF9'}; }

  td { border-bottom: ${({ $last }) => $last ? 'none' : '0.5px solid #F1EFE8'}; }
`;

const Td = styled.td`
  padding: 0.75rem 0.85rem;
  font-size: 0.9rem;
  color: #111827;
  text-align: ${({ $right, $center }) => $right ? 'right' : $center ? 'center' : 'left'};
  vertical-align: middle;
`;

// ── Product cell ───────────────────────────────────────────────────────────────
const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const ProductThumb = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 9px;
  object-fit: cover;
  flex-shrink: 0;
  border: 0.5px solid #F1EFE8;
  background: #F9F8F5;
`;

const ProductMeta = styled.div`
  min-width: 0;
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductSku = styled.div`
  font-size: 0.8rem;
  color: #9CA3AF;
  font-family: monospace;
  margin-top: 0.15rem;
`;

// ── Category badge ─────────────────────────────────────────────────────────────
const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.55rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ $muted }) => $muted ? '#F1EFE8' : '#FDF3E3'};
  color:      ${({ $muted }) => $muted ? '#9CA3AF' : '#854F0B'};
  border: 0.5px solid ${({ $muted }) => $muted ? '#E5E7EB' : '#FDE68A'};
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ── Price cell ─────────────────────────────────────────────────────────────────
const PriceWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const PriceMain = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
`;

const PriceOrig = styled.span`
  font-size: 0.8rem;
  color: #9CA3AF;
  text-decoration: line-through;
`;

// ── Stock badge ────────────────────────────────────────────────────────────────
const StockBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  height: 22px;
  padding: 0 0.55rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color:      ${({ $color }) => $color};
  border:     0.5px solid ${({ $border }) => $border};
  white-space: nowrap;
`;

// ── Views cell ─────────────────────────────────────────────────────────────────
const ViewsCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.875rem;
  font-weight: ${({ $hot }) => $hot ? '600' : '400'};
  color: ${({ $hot }) => $hot ? '#E8920A' : '#9CA3AF'};

  svg { font-size: 0.75rem; }
`;

// ── Status badge ───────────────────────────────────────────────────────────────
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.55rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color:      ${({ $color }) => $color};
  border:     0.5px solid ${({ $border }) => $border};
  white-space: nowrap;
`;

// ── Action buttons ─────────────────────────────────────────────────────────────
const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
`;

const ActionBtn = styled.button`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  border: 0.5px solid ${({ $danger }) => $danger ? '#FECACA' : '#F1EFE8'};
  background: ${({ $danger }) => $danger ? '#FCEBEB' : '#FFFFFF'};
  color: ${({ $danger }) => $danger ? '#A32D2D' : '#6B7280'};
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.12s, border-color 0.12s, color 0.12s;

  &:hover {
    background: ${({ $danger }) => $danger ? '#FEE2E2' : '#F9F8F5'};
    border-color: ${({ $danger }) => $danger ? '#FCA5A5' : '#E8920A'};
    color: ${({ $danger }) => $danger ? '#991B1B' : '#E8920A'};
  }
`;

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  gap: 0.75rem;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  color: #D1D5DB;
`;

const EmptyTitle = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
  text-align: center;
`;

const ClearFiltersBtn = styled.button`
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #E8920A;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.12s;
  &:hover { opacity: 0.75; }
`;

// ── Checkbox ───────────────────────────────────────────────────────────────────
const Checkbox = styled.input`
  width: 15px;
  height: 15px;
  accent-color: #E8920A;
  cursor: pointer;
`;

// ── Pagination ─────────────────────────────────────────────────────────────────
const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-top: 0.5px solid #F1EFE8;
`;

const PaginationInfo = styled.span`
  font-size: 0.875rem;
  color: #9CA3AF;
`;

const PageButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PageBtn = styled.button`
  min-width: 30px;
  height: 30px;
  padding: 0 0.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: pointer;
  border: 0.5px solid ${({ $active }) => $active ? '#E8920A' : '#F1EFE8'};
  background: ${({ $active }) => $active ? '#E8920A' : '#FFFFFF'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#374151'};
  transition: all 0.12s;

  &:hover:not(:disabled):not([data-active="true"]) {
    border-color: #E8920A;
    color: #E8920A;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageEllipsis = styled.span`
  font-size: 0.875rem;
  color: #9CA3AF;
  padding: 0 0.2rem;
`;
