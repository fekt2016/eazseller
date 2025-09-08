import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaChartLine,
  FaExclamationTriangle,
  FaRedo,
  FaEye,
} from "react-icons/fa";
import useProduct from "../hooks/useProduct";
import useAuth from "../hooks/useAuth";
import { useGetSellerOrders } from "../hooks/useOrder";
import { formatDate } from "../utils/helpers";
import { Link } from "react-router-dom";
import useAnalytics from "../hooks/useAnalytics";

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("month");
  const [retryCount, setRetryCount] = useState(0);

  const { useGetAllProductBySeller } = useProduct();
  const { useGetSellerProductViews } = useAnalytics();
  const { seller, isLoading: isSellerLoading, error: sellerError } = useAuth();
  const sellerId = useMemo(() => seller?.id || null, [seller]);

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

  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(
      (order) => order.status.toLowerCase() === "delivered"
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

    // Current period orders (all statuses)
    const currentPeriodOrders = orders.filter(
      (order) =>
        new Date(order.createdAt) >= start && new Date(order.createdAt) <= end
    );
    const previousPeriodOrders = orders.filter(
      (order) =>
        new Date(order.createdAt) >= prevStart &&
        new Date(order.createdAt) <= prevEnd
    );

    // Order trend calculation
    const orderChange =
      previousPeriodOrders.length === 0
        ? currentPeriodOrders.length > 0
          ? 100
          : 0
        : ((currentPeriodOrders.length - previousPeriodOrders.length) /
            previousPeriodOrders.length) *
          100;

    // Revenue calculation - only delivered orders
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
      (sum, order) => sum + order.subtotal,
      0
    );
    const previousRevenue = previousPeriodRevenueOrders.reduce(
      (sum, order) => sum + order.subtotal,
      0
    );

    const revenueChange =
      previousRevenue === 0
        ? currentRevenue > 0
          ? 100
          : 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // Conversion rate for current period
    const currentPeriodViews = totalViews.filter(
      (view) =>
        new Date(view.viewedAt) >= start && new Date(view.viewedAt) <= end
    );

    const conversionRate =
      currentPeriodViews.length > 0
        ? (currentPeriodOrders.length / currentPeriodViews.length) * 100
        : 0;

    // Other metrics
    const pendingOrders = orders.filter(
      (order) => order.status.toLowerCase() === "pending"
    ).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    return {
      totalRevenue: currentRevenue,
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      pendingOrders,
      totalProducts: products.length,
      outOfStock,
      orderChange: parseFloat(orderChange.toFixed(1)),
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      currentPeriodViews: currentPeriodViews.length,
      currentPeriodOrders: currentPeriodOrders.length,
    };
  }, [orders, products, timeFilter, totalViews]);

  const isLoading = isOrdersLoading || isProductLoading || isSellerLoading;
  const anyDataAvailable = orders.length > 0 || products.length > 0;

  const handleRetry = () => {
    refetchOrders();
    refetchProducts();
    setRetryCount((prev) => prev + 1);
  };

  if (isLoading && !anyDataAvailable && retryCount === 0) {
    return <LoadingContainer>Loading dashboard data...</LoadingContainer>;
  }

  if (!anyDataAvailable) {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        <ErrorMessage>
          {ordersError?.message ||
            productError?.message ||
            sellerError?.message ||
            "Failed to load data. Please check your connection."}
        </ErrorMessage>
        <RetryButton onClick={handleRetry}>
          <FaRedo /> Try Again
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeSection>
          <h1>Welcome back, {seller.name.split(" ")[0]}</h1>
          <p>Here what happening with your store today</p>
        </WelcomeSection>
        <TimeFilter>
          <FilterButton
            active={timeFilter === "today"}
            onClick={() => setTimeFilter("today")}
          >
            Today
          </FilterButton>
          <FilterButton
            active={timeFilter === "week"}
            onClick={() => setTimeFilter("week")}
          >
            This Week
          </FilterButton>
          <FilterButton
            active={timeFilter === "month"}
            onClick={() => setTimeFilter("month")}
          >
            This Month
          </FilterButton>
          <FilterButton
            active={timeFilter === "year"}
            onClick={() => setTimeFilter("year")}
          >
            This Year
          </FilterButton>
        </TimeFilter>
      </DashboardHeader>

      <DashboardMetrics>
        <MetricCard>
          <CardIcon $color="var(--color-brand-500)">
            <FaDollarSign />
          </CardIcon>
          <CardContent>
            <h3>Total Revenue</h3>
            <Value>Gh₵{(stats.totalRevenue || 0).toLocaleString()}</Value>
            <Trend $positive={stats.revenueChange > 0}>
              {stats.revenueChange > 0 ? "↑" : "↓"}{" "}
              {Math.abs(stats.revenueChange || 0)}% from last period
            </Trend>
          </CardContent>
        </MetricCard>

        <MetricCard>
          <CardIcon $color="var(--color-green-700)">
            <FaShoppingCart />
          </CardIcon>
          <CardContent>
            <h3>Orders</h3>
            <Value>{stats.pendingOrders || 0} pending</Value>
            <Trend $positive={stats.orderChange > 0}>
              {stats.orderChange > 0 ? "↑" : "↓"}{" "}
              {Math.abs(stats.orderChange || 0)}% from last period
            </Trend>
          </CardContent>
        </MetricCard>

        <MetricCard>
          <CardIcon $color="var(--color-blue-700)">
            <FaBox />
          </CardIcon>
          <CardContent>
            <h3>Products</h3>
            <Value>{stats.totalProducts || 0} listed</Value>
            <SmallText>
              {products.filter((p) => p.stock === 0).length} out of stock
            </SmallText>
          </CardContent>
        </MetricCard>

        <MetricCard>
          <CardIcon $color="var(--color-sec-700)">
            <FaChartLine />
          </CardIcon>
          <CardContent>
            <h3>Conversion Rate</h3>
            <Value>{stats.conversionRate.toFixed(1)}%</Value>
            <SmallText>
              Based on {stats.currentPeriodViews} views and{" "}
              {stats.currentPeriodOrders} orders
            </SmallText>
          </CardContent>
        </MetricCard>

        <MetricCard>
          <CardIcon $color="var(--color-purple-700)">
            <FaEye />
          </CardIcon>
          <CardContent>
            <h3>Total Views</h3>
            <Value>{totalViewsCount}</Value>
            <SmallText>All-time product views</SmallText>
          </CardContent>
        </MetricCard>
      </DashboardMetrics>

      <DashboardContent>
        <OverviewContent>
          <Section>
            <SectionHeader>
              <h2>Recent Orders</h2>
              <ViewAllLink to="/dashboard/orders">View All Orders</ViewAllLink>
            </SectionHeader>
            <OrdersTable>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.user.name}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>Gh₵{order.total}</td>
                    <td>
                      <StatusBadge $status={order.status.toLowerCase()}>
                        {order.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionButton>Manage</ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </OrdersTable>
          </Section>

          <Section>
            <SectionHeader>
              <h2>Top Selling Products</h2>
              <ViewAllLink to="/dashboard/products">
                View All Products
              </ViewAllLink>
            </SectionHeader>
            <ProductsGrid>
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id}>
                  <ProductImage src={product.imageCover} alt={product.name} />
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductMeta>
                      <StockStatus $inStock={product.stock > 0}>
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </StockStatus>
                    </ProductMeta>
                    <SalesBadge>{product.sales} sold</SalesBadge>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          </Section>
        </OverviewContent>
      </DashboardContent>
    </DashboardContainer>
  );
};

// Styled Components (same as before)
const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: var(--color-grey-50);
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const WelcomeSection = styled.div`
  h1 {
    font-size: 1.8rem;
    color: var(--color-brand-700);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--color-grey-600);
    font-size: 1.1rem;
  }
`;

const TimeFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: 1px solid
    ${(props) =>
      props.active ? "var(--color-brand-500)" : "var(--color-grey-200)"};
  background-color: ${(props) =>
    props.active ? "var(--color-brand-500)" : "var(--color-white-0)"};
  color: ${(props) =>
    props.active ? "var(--color-white-0)" : "var(--color-grey-600)"};
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-brand-500);
  }
`;

const DashboardMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  padding: 1rem;
`;

const CardIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${(props) => props.$color}20;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1.5rem;
`;

const CardContent = styled.div`
  flex: 1;
`;

const Value = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-grey-900);
`;

const Trend = styled.div`
  font-size: 0.9rem;
  color: ${(props) =>
    props.$positive ? "var(--color-green-700)" : "var(--color-red-700)"};
  margin-top: 0.25rem;
`;

const SmallText = styled.div`
  font-size: 0.9rem;
  color: var(--color-grey-500);
  margin-top: 0.25rem;
`;

const DashboardContent = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
`;

const OverviewContent = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: var(--color-white-0);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-grey-200);

  h2 {
    font-size: 1.25rem;
    color: var(--color-brand-600);
    margin: 0;
  }
`;

const ViewAllLink = styled(Link)`
  color: var(--color-brand-600);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-grey-200);
  }

  th {
    font-weight: 700;
    color: var(--color-brand-600);
    background-color: var(--color-grey-50);
  }

  tr:hover {
    background-color: var(--color-grey-50);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: var(--border-radius-cir);
  font-size: 0.8rem;
  font-weight: 600;

  background-color: ${(props) =>
    props.$status === "delivered"
      ? "var(--color-green-100)"
      : props.$status === "shipped"
      ? "var(--color-blue-100)"
      : props.$status === "processing"
      ? "var(--color-yellow-100)"
      : "var(--color-red-100)"};

  color: ${(props) =>
    props.$status === "delivered"
      ? "var(--color-green-700)"
      : props.$status === "shipped"
      ? "var(--color-blue-700)"
      : props.$status === "processing"
      ? "var(--color-yellow-700)"
      : "var(--color-red-700)"};
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.8rem;
  background-color: var(--color-brand-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const ProductImage = styled.img`
  height: 150px;
  width: 100%;
  object-fit: cover;
  background-color: var(--color-grey-100);
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--color-grey-600);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const StockStatus = styled.div`
  color: ${(props) =>
    props.$inStock ? "var(--color-green-700)" : "var(--color-red-700)"};
  font-weight: 600;
`;

const SalesBadge = styled.div`
  background-color: var(--color-sec-700);
  color: var(--color-white-0);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-cir);
  display: inline-block;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: var(--color-brand-500);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--color-red-700);
  background: var(--color-red-100);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  margin: 2rem 0;
`;

const ErrorIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-red-700);
`;

const ErrorMessage = styled.div`
  color: var(--color-red-700);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-brand-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.2s;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

export default Dashboard;
