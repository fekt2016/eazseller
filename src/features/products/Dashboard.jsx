import { useMemo, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
  FaRedo,
  FaWallet,
  FaDollarSign,
  FaShoppingCart,
  FaBox,
  FaChartLine,
} from "react-icons/fa";
import useProduct from '../../shared/hooks/useProduct';
import useAuth from '../../shared/hooks/useAuth';
import { useGetSellerOrders } from '../../shared/hooks/useOrder';
import { useSellerBalance } from '../../shared/hooks/finance/useSellerBalance';
import { formatDate } from '../../shared/utils/helpers';
import useAnalytics from '../../shared/hooks/useAnalytics';
import { PATHS } from '../../routes/routePaths';
import { 
  PageContainer, 
  PageHeader, 
  TitleSection,
  Section,
  SectionHeader,
  StatsGrid,
} from '../../shared/components/ui/SpacingSystem';

import ResponsiveDataTable from '../../shared/components/ui/ResponsiveDataTable';
import Button from '../../shared/components/ui/Button';
import StatCard from '../../shared/components/ui/StatCard';
import { LoadingState, ErrorState } from '../../shared/components/ui/LoadingComponents';
import VerificationBanner from '../../shared/components/VerificationBanner';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("month");
  const [retryCount, setRetryCount] = useState(0);

  const { useGetAllProductBySeller } = useProduct();
  const { useGetSellerProductViews } = useAnalytics();
  const { seller, isLoading: isSellerLoading, error: sellerError } = useAuth();
  const sellerId = useMemo(() => seller?.id || null, [seller]);
  
  // Get seller balance using unified hook
  const {
    availableBalance,
    pendingBalance,
    totalEarnings,
    withdrawnAmount,
    lockedBalance,
    isLoading: isBalanceLoading,
    error: balanceError
  } = useSellerBalance();

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetSellerOrders();

  const {
    data: productData,
    isLoading: isProductLoading,
    error: productError,
    refetch: refetchProducts,
  } = useGetAllProductBySeller(sellerId, {
    enabled: !!sellerId,
  });

  const { data: viewData } = useGetSellerProductViews(sellerId, {
    enabled: !!sellerId,
  });

  const orders = useMemo(() => {
    return ordersData?.data?.data?.orders || [];
  }, [ordersData]);
  console.log("orders", orders);

  const products = useMemo(() => {
    return productData?.data?.data || [];
  }, [productData]);

  const totalViews = useMemo(() => {
    return viewData?.data?.views || [];
  }, [viewData]);

  const totalViewsCount = useMemo(() => {
    return totalViews.length;
  }, [totalViews]);
  
  // Calculate stats first to get totalRevenue
  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(
      (order) => order.status?.toLowerCase() === "delivered"
    );

    const getDateRange = (period) => {
      const now = new Date();
      let start, end, prevStart, prevEnd;

      switch (period) {
        case "today":
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setHours(23, 59, 59, 999);
          prevStart = new Date(start);
          prevStart.setDate(prevStart.getDate() - 1);
          prevEnd = new Date(prevStart);
          prevEnd.setHours(23, 59, 59, 999);
          break;
        case "week":
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          prevStart = new Date(start);
          prevStart.setDate(start.getDate() - 7);
          prevEnd = new Date(end);
          prevEnd.setDate(end.getDate() - 7);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
          prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          prevEnd.setHours(23, 59, 59, 999);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
          end.setHours(23, 59, 59, 999);
          prevStart = new Date(now.getFullYear() - 1, 0, 1);
          prevEnd = new Date(now.getFullYear() - 1, 11, 31);
          prevEnd.setHours(23, 59, 59, 999);
          break;
        default:
          return { start, end, prevStart, prevEnd };
      }

      return { start, end, prevStart, prevEnd };
    };

    const { start, end, prevStart, prevEnd } = getDateRange(timeFilter);

    const currentPeriodOrders = orders.filter(
      (order) =>
        new Date(order.createdAt) >= start && new Date(order.createdAt) <= end
    );
    const previousPeriodOrders = orders.filter(
      (order) =>
        new Date(order.createdAt) >= prevStart &&
        new Date(order.createdAt) <= prevEnd
    );

    const orderChange =
      previousPeriodOrders.length === 0
        ? currentPeriodOrders.length > 0
          ? 100
          : 0
        : ((currentPeriodOrders.length - previousPeriodOrders.length) /
            previousPeriodOrders.length) *
          100;

    const currentPeriodRevenueOrders = deliveredOrders.filter(
      (order) =>
        new Date(order.createdAt) >= start && new Date(order.createdAt) <= end
    );
    const previousPeriodRevenueOrders = deliveredOrders.filter(
      (order) =>
        new Date(order.createdAt) >= prevStart &&
        new Date(order.createdAt) <= prevEnd
    );

    const currentRevenue = currentPeriodRevenueOrders.reduce(
      (sum, order) => sum + (order.subtotal || order.total || 0),
      0
    );
    const previousRevenue = previousPeriodRevenueOrders.reduce(
      (sum, order) => sum + (order.subtotal || order.total || 0),
      0
    );

    const revenueChange =
      previousRevenue === 0
        ? currentRevenue > 0
          ? 100
          : 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    const currentPeriodViews = totalViews.filter(
      (view) =>
        new Date(view.viewedAt) >= start && new Date(view.viewedAt) <= end
    );

    const conversionRate =
      currentPeriodViews.length > 0
        ? (currentPeriodOrders.length / currentPeriodViews.length) * 100
        : 0;

    const pendingOrders = orders.filter(
      (order) => {
        const status = order.currentStatus || order.status || 'pending';
        return ['pending', 'pending_payment', 'payment_completed', 'confirmed', 'processing', 'preparing', 'ready_for_dispatch'].includes(status.toLowerCase());
      }
    ).length;
    
    const completedOrders = orders.filter(
      (order) => {
        const status = order.currentStatus || order.status || 'pending';
        return status.toLowerCase() === 'delivered';
      }
    ).length;
    
    const totalOrders = orders.length;
    const outOfStock = products.filter((p) => (p.stock || p.totalStock || 0) === 0).length;

    return {
      totalRevenue: currentRevenue,
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      pendingOrders,
      completedOrders,
      totalOrders,
      totalProducts: products.length,
      outOfStock,
      orderChange: parseFloat(orderChange.toFixed(1)),
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      currentPeriodViews: currentPeriodViews.length,
      currentPeriodOrders: currentPeriodOrders.length,
    };
  }, [orders, products, timeFilter, totalViews]);
  
  // Total revenue from unified hook (already calculated)
  const totalRevenue = totalEarnings;

  const isLoading = isOrdersLoading || isProductLoading || isSellerLoading;
  const anyDataAvailable = orders.length > 0 || products.length > 0;

  const handleRetry = () => {
    refetchOrders();
    refetchProducts();
    setRetryCount((prev) => prev + 1);
  };

  // Order columns for ResponsiveDataTable
  const orderColumns = [
    {
      key: 'orderNumber',
      title: 'Order ID',
      render: (order) => `#${order.orderNumber || order._id?.slice(-8)}`,
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (order) => order.user?.name || 'N/A',
    },
    {
      key: 'date',
      title: 'Date',
      render: (order) => formatDate(order.createdAt),
    },
    {
      key: 'amount',
      title: 'Amount',
      align: 'right',
      render: (order) => `Gh₵${(order.total || order.subtotal || 0).toFixed(2)}`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (order) => {
        // Use orderStatus as primary source (set to 'confirmed' after payment)
        let status = order.orderStatus || order.currentStatus || order.status || 'pending';
        
        // Map status values to display-friendly status
        if (status === 'delivered') {
          status = 'completed';
        } else if (status === 'out_for_delivery') {
          status = 'shipped';
        } else if (status === 'confirmed') {
          status = 'confirmed'; // Show confirmed, not processing
        } else if (['preparing', 'ready_for_dispatch'].includes(status)) {
          status = 'processing';
        } else if (status === 'pending_payment' || status === 'pending') {
          status = 'pending';
        }
        
        return (
          <StatusBadge $status={status.toLowerCase()}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (order) => (
        <Button as={Link} to={PATHS.ORDER_DETAIL.replace(':id', order._id)} variant="ghost" size="sm">
          View
        </Button>
      ),
    },
  ];

  if (isLoading && !anyDataAvailable && retryCount === 0) {
    return (
      <PageContainer>
        <LoadingState message="Loading dashboard data..." />
      </PageContainer>
    );
  }

  if (!anyDataAvailable) {
    return (
      <PageContainer>
        <ErrorState
          title="Failed to load data"
          message={
            ordersError?.message ||
            productError?.message ||
            sellerError?.message ||
            "Please check your connection and try again."
          }
          action={
            <Button variant="primary" onClick={handleRetry}>
          <FaRedo /> Try Again
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <VerificationBanner />
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Welcome back, {seller?.name?.split(" ")[0] || 'Seller'}</h1>
          <p>Here's what's happening with your store today</p>
        </TitleSection>
        <TimeFilter>
          {['today', 'week', 'month', 'year'].map((period) => (
          <FilterButton
              key={period}
              $active={timeFilter === period}
              onClick={() => setTimeFilter(period)}
          >
              {period === 'today' ? 'Today' : 
               period === 'week' ? 'This Week' :
               period === 'month' ? 'This Month' : 'This Year'}
          </FilterButton>
          ))}
        </TimeFilter>
      </PageHeader>

      <StatsGrid $gap="md" $marginBottom="lg">
        <StatCard
          title="Available Balance"
          value={`Gh₵${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={lockedBalance > 0 ? `Gh₵${lockedBalance.toFixed(2)} locked` : "Available"}
          variant="success"
          icon={<FaWallet />}
        />
        <StatCard
          title="Total Revenue"
          value={`Gh₵${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`}
          variant="primary"
          icon={<FaDollarSign />}
        />
        <StatCard
          title="Total Orders"
          value={`${stats.totalOrders || 0}`}
          change={`${stats.completedOrders || 0} completed`}
          variant="success"
          icon={<FaShoppingCart />}
        />
        <StatCard
          title="Pending Orders"
          value={`${stats.pendingOrders || 0}`}
          change={`${stats.orderChange >= 0 ? '+' : ''}${stats.orderChange}%`}
          variant="warning"
          icon={<FaBox />}
        />
        <StatCard
          title="Products"
          value={`${stats.totalProducts || 0} listed`}
          change={`${stats.outOfStock} out of stock`}
          variant="primary"
          icon={<FaBox />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          change={`${stats.currentPeriodOrders} orders`}
          variant="primary"
          icon={<FaChartLine />}
        />
      </StatsGrid>

      <Section $padding="lg" $marginBottom="lg">
        <SectionHeader $padding="md" $marginBottom="md">
          <h3>Recent Orders</h3>
          <Button as={Link} to={PATHS.ORDERS} variant="ghost" size="sm">
            View All
          </Button>
        </SectionHeader>
        <ResponsiveDataTable
          data={orders.slice(0, 5)}
          columns={orderColumns}
          $padding="md"
        />
      </Section>

      <Section $padding="lg">
        <SectionHeader $padding="md" $marginBottom="md">
          <h3>Top Selling Products</h3>
          <Button as={Link} to={PATHS.PRODUCTS} variant="ghost" size="sm">
            View All
          </Button>
            </SectionHeader>
        <ProductsGrid $gap="md">
              {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id || product.id}>
              <ProductImage 
                src={product.imageCover} 
                alt={product.name}
                onError={(e) => {
                  // Prevent infinite loop and use local fallback
                  if (e.target.dataset.fallbackAttempted !== 'true') {
                    e.target.dataset.fallbackAttempted = 'true';
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }
                }}
              />
              <ProductInfo $padding="md">
                    <ProductName>{product.name}</ProductName>
                    <ProductMeta>
                  <StockStatus $inStock={(product.stock || product.totalStock || 0) > 0}>
                    {(product.stock || product.totalStock || 0) > 0
                      ? `${product.stock || product.totalStock} in stock`
                          : "Out of stock"}
                      </StockStatus>
                    </ProductMeta>
                {(product.sales || product.totalSold) > 0 && (
                  <SalesBadge>{product.sales || product.totalSold} sold</SalesBadge>
                )}
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          </Section>
    </PageContainer>
  );
};

// Styled Components
const TimeFilter = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const FilterButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid ${({ $active }) => 
    $active ? 'var(--color-primary-500)' : 'var(--color-grey-200)'};
  background-color: ${({ $active }) =>
    $active ? 'var(--color-primary-500)' : 'var(--color-white-0)'};
  color: ${({ $active }) =>
    $active ? 'var(--color-white-0)' : 'var(--color-grey-600)'};
  border-radius: var(--border-radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-base);
  font-family: var(--font-body);
  text-transform: capitalize;

  &:hover {
    border-color: var(--color-primary-500);
    background-color: ${({ $active }) =>
      $active ? 'var(--color-primary-500)' : 'var(--color-primary-50)'};
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  font-family: var(--font-body);
  text-transform: capitalize;

  background-color: ${({ $status }) =>
    $status === "delivered"
      ? "var(--color-green-100)"
      : $status === "shipped"
      ? "var(--color-blue-100)"
      : $status === "processing"
      ? "var(--color-yellow-100)"
      : "var(--color-red-100)"};

  color: ${({ $status }) =>
    $status === "delivered"
      ? "var(--color-green-700)"
      : $status === "shipped"
      ? "var(--color-blue-700)"
      : $status === "processing"
      ? "var(--color-yellow-700)"
      : "var(--color-red-700)"};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  ${({ $gap }) => $gap && `gap: var(--spacing-${$gap});`}
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--color-white-0);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  background-color: var(--color-grey-100);
`;

const ProductInfo = styled.div`
  ${({ $padding }) => $padding && `padding: var(--spacing-${$padding});`}
`;

const ProductName = styled.div`
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-xs);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  font-size: var(--font-size-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
`;

const StockStatus = styled.div`
  color: ${({ $inStock }) =>
    $inStock ? "var(--color-green-700)" : "var(--color-red-700)"};
  font-weight: var(--font-medium);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
`;

const SalesBadge = styled.div`
  background-color: var(--color-primary-500);
  color: var(--color-white-0);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  display: inline-block;
  font-family: var(--font-body);
`;

export default Dashboard;
