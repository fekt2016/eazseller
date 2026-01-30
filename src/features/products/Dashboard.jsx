import { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import {
  FaRedo,
  FaWallet,
  FaDollarSign,
  FaShoppingCart,
  FaBox,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaLock,
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

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

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
      (order) => {
        const status = (order.status || order.currentStatus || order.orderStatus || '').toString().toLowerCase();
        const currentStatus = (order.currentStatus || '').toString().toLowerCase();
        const orderStatus = (order.orderStatus || '').toString().toLowerCase();
        return status === 'delivered' || currentStatus === 'delivered' || orderStatus === 'completed';
      }
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
        const status = (order.currentStatus || order.status || order.orderStatus || 'pending').toString().toLowerCase();
        return status === 'delivered' || status === 'completed';
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
  const hasError = !!(ordersError || productError || sellerError);

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
      render: (order) => (
        <OrderIdLink to={PATHS.ORDER_DETAIL.replace(':id', order._id)}>
          #{order.orderNumber || order._id?.slice(-8)}
        </OrderIdLink>
      ),
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (order) => <CustomerName>{order.user?.name || 'N/A'}</CustomerName>,
    },
    {
      key: 'date',
      title: 'Date',
      render: (order) => <DateText>{formatDate(order.createdAt)}</DateText>,
    },
    {
      key: 'amount',
      title: 'Amount',
      align: 'right',
      render: (order) => (
        <AmountText>
          Gh₵{(order.total || order.subtotal || 0).toFixed(2)}
        </AmountText>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (order) => {
        let status = order.orderStatus || order.currentStatus || order.status || 'pending';
        
        if (status === 'delivered') {
          status = 'completed';
        } else if (status === 'out_for_delivery') {
          status = 'shipped';
        } else if (status === 'confirmed') {
          status = 'confirmed';
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
        <ActionButton as={Link} to={PATHS.ORDER_DETAIL.replace(':id', order._id)}>
          View Details
        </ActionButton>
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

  if (!anyDataAvailable && hasError) {
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
    <DashboardContainer>
      <VerificationBanner />
      
      {/* Header Section */}
      <HeaderSection>
        <HeaderContent>
          <WelcomeSection>
            <WelcomeTitle>
              Welcome back, <NameHighlight>{seller?.name?.split(" ")[0] || 'Seller'}</NameHighlight>
            </WelcomeTitle>
            <WelcomeSubtitle>Here's what's happening with your store today</WelcomeSubtitle>
          </WelcomeSection>
          
          <TimeFilterContainer>
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
          </TimeFilterContainer>
        </HeaderContent>
      </HeaderSection>

      {/* Stats Grid */}
      <StatsSection>
        <EnhancedStatCard $variant="success" $delay="0">
          <StatIconWrapper $variant="success">
            <FaWallet />
          </StatIconWrapper>
          <StatContent>
            <StatLabel>Available Balance</StatLabel>
            <StatValue>
              Gh₵{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </StatValue>
            <StatChange $positive={true}>
              {lockedBalance > 0 ? (
                <>
                  <FaLock /> Gh₵{lockedBalance.toFixed(2)} locked
                </>
              ) : (
                <>
                  <FaArrowUp /> Available
                </>
              )}
            </StatChange>
          </StatContent>
        </EnhancedStatCard>

        <EnhancedStatCard $variant="primary" $delay="1">
          <StatIconWrapper $variant="primary">
            <FaDollarSign />
          </StatIconWrapper>
          <StatContent>
            <StatLabel>Total Revenue</StatLabel>
            <StatValue>
              Gh₵{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </StatValue>
            <StatChange $positive={stats.revenueChange >= 0}>
              {stats.revenueChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(stats.revenueChange)}% from last period
            </StatChange>
          </StatContent>
        </EnhancedStatCard>

        <EnhancedStatCard $variant="info" $delay="2">
          <StatIconWrapper $variant="info">
            <FaShoppingCart />
          </StatIconWrapper>
          <StatContent>
            <StatLabel>Total Orders</StatLabel>
            <StatValue>{stats.totalOrders || 0}</StatValue>
            <StatChange $positive={true}>
              <FaArrowUp /> {stats.completedOrders || 0} completed
            </StatChange>
          </StatContent>
        </EnhancedStatCard>

        <EnhancedStatCard $variant="warning" $delay="3">
          <StatIconWrapper $variant="warning">
            <FaBox />
          </StatIconWrapper>
          <StatContent>
            <StatLabel>Pending Orders</StatLabel>
            <StatValue>{stats.pendingOrders || 0}</StatValue>
            <StatChange $positive={stats.orderChange >= 0}>
              {stats.orderChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(stats.orderChange)}% change
            </StatChange>
          </StatContent>
        </EnhancedStatCard>

        <EnhancedStatCard $variant="primary" $delay="4">
          <StatIconWrapper $variant="primary">
            <FaBox />
          </StatIconWrapper>
          <StatContent>
            <StatLabel>Products</StatLabel>
            <StatValue>{stats.totalProducts || 0} listed</StatValue>
            <StatChange $positive={stats.outOfStock === 0}>
              {stats.outOfStock > 0 ? (
                <>
                  <FaArrowDown /> {stats.outOfStock} out of stock
                </>
              ) : (
                <>
                  <FaArrowUp /> All in stock
                </>
              )}
            </StatChange>
          </StatContent>
        </EnhancedStatCard>

        <EnhancedStatCard $variant="info" $delay="5">
          <StatIconWrapper $variant="info">
            <FaChartLine />
          </StatIconWrapper>
          <StatContent>
            <StatLabel>Conversion Rate</StatLabel>
            <StatValue>{stats.conversionRate.toFixed(1)}%</StatValue>
            <StatChange $positive={stats.conversionRate > 0}>
              <FaEye /> {stats.currentPeriodViews} views, {stats.currentPeriodOrders} orders
            </StatChange>
          </StatContent>
        </EnhancedStatCard>
      </StatsSection>

      {/* Recent Orders Section */}
      <ContentSection>
        <StyledSectionHeader>
          <SectionTitle>Recent Orders</SectionTitle>
          <ViewAllButton as={Link} to={PATHS.ORDERS}>
            View All <FaArrowUp style={{ transform: 'rotate(45deg)' }} />
          </ViewAllButton>
        </StyledSectionHeader>
        <TableContainer>
          <ResponsiveDataTable
            data={orders.slice(0, 5)}
            columns={orderColumns}
            $padding="md"
          />
        </TableContainer>
      </ContentSection>

      {/* Top Products Section */}
      <ContentSection>
        <StyledSectionHeader>
          <SectionTitle>Top Selling Products</SectionTitle>
          <ViewAllButton as={Link} to={PATHS.PRODUCTS}>
            View All <FaArrowUp style={{ transform: 'rotate(45deg)' }} />
          </ViewAllButton>
        </StyledSectionHeader>
        <ProductsGrid>
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id || product.id} as={Link} to={PATHS.PRODUCTS}>
              <ProductImageWrapper>
                <ProductImage 
                  src={product.imageCover} 
                  alt={product.name}
                  onError={(e) => {
                    if (e.target.dataset.fallbackAttempted !== 'true') {
                      e.target.dataset.fallbackAttempted = 'true';
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }
                  }}
                />
                {(product.sales || product.totalSold) > 0 && (
                  <SalesBadge>
                    {product.sales || product.totalSold} sold
                  </SalesBadge>
                )}
              </ProductImageWrapper>
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductMeta>
                  <StockStatus $inStock={(product.stock || product.totalStock || 0) > 0}>
                    {(product.stock || product.totalStock || 0) > 0
                      ? `${product.stock || product.totalStock} in stock`
                      : "Out of stock"}
                  </StockStatus>
                </ProductMeta>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductsGrid>
      </ContentSection>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled(PageContainer)`
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-grey-200);
  animation: ${slideIn} 0.5s ease-out;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const WelcomeSection = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 500;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const NameHighlight = styled.span`
  color: var(--color-primary-600);
  font-weight: 600;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.5rem;
  color: var(--color-grey-600);
  font-weight: 400;
  margin: 0;
`;

const TimeFilterContainer = styled.div`
  display: flex;
  gap: 0.8rem;
  background: var(--color-grey-100);
  padding: 0.4rem;
  border-radius: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    
    button {
      flex: 1;
      min-width: 0;
    }
  }
`;

const FilterButton = styled.button`
  padding: 0.8rem 1.6rem;
  border: none;
  background: ${({ $active }) => 
    $active ? 'var(--color-white-0)' : 'transparent'};
  color: ${({ $active }) =>
    $active ? 'var(--color-primary-600)' : 'var(--color-grey-600)'};
  border-radius: 8px;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-body);
  text-transform: capitalize;
  box-shadow: ${({ $active }) => 
    $active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background: ${({ $active }) =>
      $active ? 'var(--color-white-0)' : 'rgba(255, 255, 255, 0.5)'};
    color: var(--color-primary-600);
  }
`;

const StatsSection = styled(StatsGrid)`
  margin-bottom: 2.4rem;
  gap: 1.6rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

const EnhancedStatCard = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.6rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out ${({ $delay }) => `${$delay * 0.1}s`} both;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ $variant }) => {
      switch ($variant) {
        case 'success': return 'var(--color-green-500)';
        case 'primary': return 'var(--color-primary-500)';
        case 'warning': return 'var(--color-yellow-700)';
        case 'info': return 'var(--color-blue-700)';
        default: return 'var(--color-grey-400)';
      }
    }};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: ${({ $variant }) => {
      switch ($variant) {
        case 'success': return 'var(--color-green-500)';
        case 'primary': return 'var(--color-primary-500)';
        case 'warning': return 'var(--color-yellow-700)';
        case 'info': return 'var(--color-blue-700)';
        default: return 'var(--color-grey-400)';
      }
    }};
  }
`;

const StatIconWrapper = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return 'var(--color-green-100)';
      case 'primary': return 'var(--color-primary-100)';
      case 'warning': return 'var(--color-yellow-100)';
      case 'info': return 'var(--color-blue-100)';
      default: return 'var(--color-grey-100)';
    }
  }};
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return 'var(--color-green-700)';
      case 'primary': return 'var(--color-primary-600)';
      case 'warning': return 'var(--color-yellow-700)';
      case 'info': return 'var(--color-blue-700)';
      default: return 'var(--color-grey-600)';
    }
  }};
  font-size: 2rem;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatLabel = styled.div`
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--color-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.8rem;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: 0.8rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: ${({ $positive }) => 
    $positive ? 'var(--color-green-700)' : 'var(--color-red-600)'};
  
  svg {
    font-size: 1.2rem;
  }
`;

const ContentSection = styled(Section)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 16px;
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease-out 0.3s both;
`;

const StyledSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 2rem;
  font-weight: 500;
  color: var(--color-grey-900);
  margin: 0;
`;

const ViewAllButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-primary-600);
  font-size: 1.4rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;

  &:hover {
    background: var(--color-primary-50);
    color: var(--color-primary-700);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
`;

const OrderIdLink = styled(Link)`
  color: var(--color-primary-600);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary-700);
    text-decoration: underline;
  }
`;

const CustomerName = styled.span`
  color: var(--color-grey-700);
  font-weight: 400;
`;

const DateText = styled.span`
  color: var(--color-grey-600);
  font-size: 1.3rem;
`;

const AmountText = styled.span`
  font-weight: 600;
  color: var(--color-grey-900);
  font-size: 1.4rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;

  background-color: ${({ $status }) =>
    $status === "completed" || $status === "delivered"
      ? "var(--color-green-100)"
      : $status === "shipped" || $status === "confirmed"
      ? "var(--color-blue-100)"
      : $status === "processing"
      ? "var(--color-yellow-100)"
      : "var(--color-red-100)"};

  color: ${({ $status }) =>
    $status === "completed" || $status === "delivered"
      ? "var(--color-green-700)"
      : $status === "shipped" || $status === "confirmed"
      ? "var(--color-blue-700)"
      : $status === "processing"
      ? "var(--color-yellow-700)"
      : "var(--color-red-700)"};
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-100);
    color: var(--color-primary-700);
    transform: translateY(-1px);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.6rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Link)`
  border: 1px solid var(--color-grey-200);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-white-0);
  text-decoration: none;
  display: block;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--color-primary-300);
  }
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: var(--color-grey-100);
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const SalesBadge = styled.div`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: var(--color-white-0);
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const ProductInfo = styled.div`
  padding: 1.6rem;
`;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  font-size: 1.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StockStatus = styled.div`
  color: ${({ $inStock }) =>
    $inStock ? "var(--color-green-700)" : "var(--color-red-700)"};
  font-weight: 500;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &::before {
    content: '';
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background: ${({ $inStock }) =>
      $inStock ? "var(--color-green-500)" : "var(--color-red-600)"};
  }
`;

export default Dashboard;
