import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaWallet,
  FaDollarSign,
  FaShoppingCart,
  FaList,
  FaChartLine,
  FaPlus,
  FaBoxOpen,
} from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import useProduct from '../../shared/hooks/useProduct';
import { useGetSellerOrders } from '../../shared/hooks/useOrder';
import { useSellerBalance } from '../../shared/hooks/finance/useSellerBalance';
import {
  useSellerRevenueAnalytics,
  useSellerOrderStatusAnalytics,
  useSellerTopProducts,
  useSellerTrafficAnalytics,
} from '../../shared/hooks/useSellerAnalytics';
import { PATHS } from '../../routes/routePaths';
import {
  LoadingState,
  ErrorState,
  Skeleton,
} from '../../shared/components/ui/LoadingComponents';
import PeriodSelector from '../../components/shared/PeriodSelector';
import KPICard from '../../components/shared/KPICard';
import RevenueChart from '../../components/shared/RevenueChart';
import RecentOrdersTable from '../../components/shared/RecentOrdersTable';
import QuickActions from '../../components/shared/QuickActions';
import TopProducts from '../../components/shared/TopProducts';
import PendingOrdersAlert from '../../components/shared/PendingOrdersAlert';
import { formatGHS } from '../../shared/utils/dashboardFormatters';
import VerificationBanner from '../../shared/components/VerificationBanner';
import { getAttentionCountsFromBreakdown, getAttentionCountsFromOrders } from '../../shared/utils/orderAttention';

const PERIOD_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
];

const RANGE_MAP = {
  today: 1,
  week: 7,
  month: 30,
  year: 365,
};

const periodLabelMap = {
  today: 'today',
  week: 'this week',
  month: 'this month',
  year: 'this year',
};

const trendTone = (value) => (value > 0 ? 'up' : value < 0 ? 'down' : 'neutral');

const periodSubtitle = (period) => {
  if (period === 'today') return 'this day';
  if (period === 'week') return 'this week';
  if (period === 'month') return 'this month';
  return 'this year';
};

const labelForChart = (row, period) => {
  const d = new Date(row?.date);
  if (Number.isNaN(d.getTime())) return '•';
  if (period === 'today') return d.toLocaleTimeString('en-US', { hour: '2-digit' });
  if (period === 'week') return d.toLocaleDateString('en-US', { weekday: 'short' });
  if (period === 'month') return `W${Math.floor((d.getDate() - 1) / 7) + 1}`;
  return d.toLocaleDateString('en-US', { month: 'short' });
};

const isDeliveredForRevenue = (order) => {
  const sellerStatus = String(order?.status || '').toLowerCase();
  const parentStatus = String(
    order?.currentStatus || order?.orderStatus || order?.FulfillmentStatus || ''
  ).toLowerCase();
  const paymentStatus = String(
    order?.paymentStatus || order?.order?.paymentStatus || ''
  ).toLowerCase();

  const deliveredStatuses = new Set([
    'delivered',
    'delievered',
    'completed',
    'payment_completed',
    'paid',
  ]);
  const paidStatuses = new Set(['paid', 'completed', 'payment_completed']);

  return (
    deliveredStatuses.has(sellerStatus) ||
    deliveredStatuses.has(parentStatus) ||
    paidStatuses.has(paymentStatus)
  );
};

const getOrderRevenue = (order) => {
  const candidates = [
    order?.totalBasePrice,
    order?.sellerRevenue,
    order?.total,
    order?.subtotal,
    order?.totalPrice,
  ];

  for (const value of candidates) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) return num;
  }

  const items = Array.isArray(order?.items) ? order.items : [];
  let fromItems = 0;
  items.forEach((item) => {
    const quantity = Number(item?.quantity || 1);
    const unit = Number(
      item?.basePrice ?? item?.priceExVat ?? item?.price ?? 0
    );
    if (Number.isFinite(unit) && unit > 0 && Number.isFinite(quantity)) {
      fromItems += quantity * unit;
    }
  });
  return fromItems;
};

const isInPeriod = (order, period) => {
  const date = new Date(order?.createdAt || order?.updatedAt || Date.now());
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  if (period === 'today') {
    return date >= todayStart;
  }
  if (period === 'week') {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 6);
    return date >= start;
  }
  if (period === 'month') {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 29);
    return date >= start;
  }

  const start = new Date(todayStart);
  start.setDate(start.getDate() - 364);
  return date >= start;
};

const Dashboard = () => {
  const [period, setPeriod] = useState('month');
  const { seller, isLoading: isSellerLoading } = useAuth();
  const sellerId = useMemo(() => seller?._id || seller?.id || null, [seller]);
  const { useGetAllProductBySeller } = useProduct();
  const {
    availableBalance,
    isLoading: isBalanceLoading,
  } = useSellerBalance();
  const {
    data: ordersResp,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useGetSellerOrders();
  const {
    data: productResp,
    isLoading: isProductsLoading,
  } = useGetAllProductBySeller(sellerId, { enabled: !!sellerId });

  const range = RANGE_MAP[period];
  const { data: revenue, isLoading: isRevenueLoading } = useSellerRevenueAnalytics(range);
  const { data: orderStatus, isLoading: isOrderStatusLoading } = useSellerOrderStatusAnalytics();
  const { data: topProducts, isLoading: isTopProductsLoading } = useSellerTopProducts(5);
  const { data: traffic, isLoading: isTrafficLoading } = useSellerTrafficAnalytics(range);

  const orders = useMemo(() => {
    if (Array.isArray(ordersResp?.data?.data?.orders)) return ordersResp.data.data.orders;
    if (Array.isArray(ordersResp?.data?.orders)) return ordersResp.data.orders;
    if (Array.isArray(ordersResp?.orders)) return ordersResp.orders;
    return [];
  }, [ordersResp]);

  const products = useMemo(() => {
    const source =
      productResp?.data?.data ||
      productResp?.data?.products ||
      productResp?.products ||
      productResp?.data ||
      [];
    return Array.isArray(source) ? source : [];
  }, [productResp]);

  const productCount = useMemo(() => {
    const total = productResp?.total || productResp?.count || productResp?.data?.total;
    return typeof total === 'number' ? total : products.length;
  }, [productResp, products.length]);

  const lowStockCount = useMemo(
    () =>
      products.filter((item) => {
        const stock = Number(item?.stock ?? item?.totalStock ?? 0);
        return stock > 0 && stock <= 10;
      }).length,
    [products]
  );

  const statusBreakdown = orderStatus?.statusBreakdown || {};
  const localAttention = getAttentionCountsFromOrders(orders);
  const breakdownAttention = getAttentionCountsFromBreakdown(statusBreakdown);

  const pendingOrders =
    orders.length > 0
      ? localAttention.pending
      : breakdownAttention.pending;
  const confirmedOrders =
    orders.length > 0
      ? localAttention.confirmed
      : breakdownAttention.confirmed;
  const attentionOrders = pendingOrders + confirmedOrders;
  const completedOrders = Number(
    statusBreakdown?.delivered?.count ??
      statusBreakdown?.delivered ??
      statusBreakdown?.completed?.count ??
      0
  );
  const totalOrders = Number(orderStatus?.totalOrders || orders.length || 0);

  const trafficPayload = traffic?.data || traffic || {};
  const revenuePayload = revenue?.data || revenue || {};

  const fallbackViewsFromProducts = useMemo(
    () =>
      products.reduce(
        (sum, item) => sum + Number(item?.totalViews || item?.views || 0),
        0
      ),
    [products]
  );

  const totalViews = Math.max(
    Number(trafficPayload?.totalViews || 0),
    fallbackViewsFromProducts
  );
  const periodOrdersFromTraffic = Number(trafficPayload?.totalOrders || 0);
  const derivedConversionRate =
    totalViews > 0 ? (periodOrdersFromTraffic / totalViews) * 100 : 0;
  const uniqueVisitors = Number(
    trafficPayload?.uniqueVisitors || trafficPayload?.visitors || 0
  );
  const apiConversionRate = Number(trafficPayload?.conversionRate || 0);
  const conversionRate =
    Number.isFinite(apiConversionRate) && apiConversionRate > 0
      ? apiConversionRate
      : derivedConversionRate;
  const apiTotalRevenue = Number(revenuePayload?.summary?.totalRevenue || 0);
  const ordersRevenue = useMemo(
    () =>
      orders
        .filter((order) => isDeliveredForRevenue(order) && isInPeriod(order, period))
        .reduce((sum, order) => sum + getOrderRevenue(order), 0),
    [orders, period]
  );
  const totalRevenue =
    ordersRevenue > 0 ? ordersRevenue : apiTotalRevenue;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : null;
  const revenueTrend = Number.isFinite(revenuePayload?.trend)
    ? Number(revenuePayload.trend)
    : null;
  const chartData = (revenuePayload?.dailyRevenue || []).map((row) => ({
    label: labelForChart(row, period),
    amount: Number(row?.amount || 0),
  }));
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
    .slice(0, 5);
  const topProductsPayload = topProducts?.data || topProducts || {};
  const topSellingFromApi = Array.isArray(topProductsPayload?.topSellingProducts)
    ? topProductsPayload.topSellingProducts
    : [];
  const topSellingFallback = useMemo(() => {
    const map = new Map();
    (Array.isArray(orders) ? orders : []).forEach((order) => {
      const items = Array.isArray(order?.items) ? order.items : [];
      items.forEach((item) => {
        const productObj = item?.product || {};
        const productId = String(
          productObj?._id || item?.product || item?.productId || ''
        );
        if (!productId) return;

        const productName = productObj?.name || item?.productName || 'Product';
        const quantity = Number(item?.quantity || 1);
        const unitRevenue = Number(
          item?.basePrice ?? item?.priceExVat ?? item?.price ?? 0
        );
        const image =
          productObj?.images?.[0]?.thumbnail ||
          productObj?.images?.[0]?.url ||
          productObj?.imageCover ||
          null;

        const prev = map.get(productId) || {
          productId,
          productName,
          productImage: image,
          totalSold: 0,
          totalRevenue: 0,
        };
        prev.totalSold += quantity;
        prev.totalRevenue += quantity * unitRevenue;
        if (!prev.productImage && image) prev.productImage = image;
        map.set(productId, prev);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => Number(b.totalSold || 0) - Number(a.totalSold || 0))
      .slice(0, 5);
  }, [orders]);
  const topSelling = topSellingFromApi.length > 0
    ? topSellingFromApi
    : topSellingFallback;
  const hasTopSales = topSelling.some((item) => Number(item?.totalSold || item?.unitsSold || 0) > 0);
  const firstName = String(seller?.name || seller?.shopName || 'Seller')
    .trim()
    .split(/\s+/)[0];

  const isLoading =
    isSellerLoading ||
    isBalanceLoading ||
    isOrdersLoading ||
    isProductsLoading ||
    isRevenueLoading ||
    isOrderStatusLoading ||
    isTopProductsLoading ||
    isTrafficLoading;

  if (ordersError && orders.length === 0 && !isLoading) {
    return <ErrorState message={ordersError.message || 'Failed to load dashboard'} />;
  }

  const actions = [
    { label: 'Add product', to: PATHS.ADD_PRODUCT, icon: <FaPlus size={13} />, toneBg: '#FDF3E3', toneColor: '#E8920A' },
    { label: 'View orders', to: PATHS.ORDERS, icon: <FaShoppingCart size={13} />, toneBg: '#E6F1FB', toneColor: '#185FA5' },
    { label: 'Withdraw', to: PATHS.WITHDRAWALS, icon: <FaWallet size={13} />, toneBg: '#EAF3DE', toneColor: '#3B6D11' },
    { label: 'Manage listings', to: PATHS.PRODUCTS, icon: <FaBoxOpen size={13} />, toneBg: '#F1EFE8', toneColor: '#6B7280' },
  ];

    return (
    <Wrap>
      <VerificationBanner />
      <Topbar>
        <TopbarLeft>
          <Title>Dashboard</Title>
          <PeriodSelector options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </TopbarLeft>
      </Topbar>

      <WelcomeRow>
        <div>
          <WelcomeText>
            Welcome back, <WelcomeName>{firstName}</WelcomeName>
          </WelcomeText>
          <WelcomeSub>{`Here's what's happening with your store ${periodLabelMap[period]}`}</WelcomeSub>
        </div>
        <AddProductButton as={Link} to={PATHS.ADD_PRODUCT}>
          + Add product
        </AddProductButton>
      </WelcomeRow>

      {isLoading ? (
        <LoadingGrid>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} height="108px" />
          ))}
          <Skeleton height="120px" />
          <Skeleton height="220px" />
          <Skeleton height="220px" />
        </LoadingGrid>
              ) : (
                <>
          <KpiGrid>
            <KPICard
              label="Available balance"
              value={availableBalance}
              icon={<FaWallet size={14} />}
              tone="primary"
              accent
              currency
              trendText="Available to withdraw"
            />
            <KPICard
              label="Total revenue"
              value={totalRevenue}
              icon={<FaDollarSign size={14} />}
              tone="primary"
              accent
              currency
              trendText={
                revenueTrend === null
                  ? 'No previous period data'
                  : `${revenueTrend > 0 ? '+' : ''}${revenueTrend.toFixed(1)}% from last period`
              }
              trendTone={revenueTrend === null ? 'neutral' : trendTone(revenueTrend)}
            />
            <KPICard
              label="Total orders"
              value={totalOrders}
              icon={<FaShoppingCart size={14} />}
              tone="info"
              accent
              trendText={`${completedOrders} completed`}
              trendTone="up"
            />
            <KPICard
              label="Products listed"
              value={productCount}
              icon={<FaList size={14} />}
              tone="success"
              accent
              trendText={lowStockCount > 0 ? `${lowStockCount} low stock` : 'All in stock'}
              trendTone={lowStockCount > 0 ? 'down' : 'up'}
            />
          </KpiGrid>

          <KpiGrid>
            <KPICard
              label="Needs attention"
              value={attentionOrders}
              icon={<FaShoppingCart size={14} />}
              tone="warning"
              trendText={
                attentionOrders > 0
                  ? `${pendingOrders} pending · ${confirmedOrders} confirmed`
                  : 'All clear'
              }
              trendTone={attentionOrders > 0 ? 'down' : 'up'}
              smallValue
            />
            <KPICard
              label="Conversion rate"
              value={`${conversionRate.toFixed(1)}%`}
              icon={<FaChartLine size={14} />}
              tone="info"
              trendText={`${totalViews} views · ${periodOrdersFromTraffic || totalOrders} orders`}
              smallValue
            />
            <KPICard
              label="Store views"
              value={totalViews}
              icon={<FaChartLine size={14} />}
              tone="neutral"
              trendText={`This ${periodLabelMap[period].replace('this ', '')}`}
              smallValue
            />
            <KPICard
              label="Avg. order value"
              value={avgOrderValue == null ? '—' : formatGHS(avgOrderValue)}
              icon={<FaDollarSign size={14} />}
              tone="neutral"
              trendText={`Based on ${totalOrders} orders`}
              smallValue
            />
          </KpiGrid>

          <MainGrid>
            <LeftCol>
              <RevenueChart
                title="Revenue over time"
                periodLabel={periodLabelMap[period]}
                subtitle={periodSubtitle(period)}
                totalRevenue={totalRevenue}
                data={chartData}
              />
              <RecentOrdersTable
                orders={recentOrders}
                ordersPath={PATHS.ORDERS}
                orderDetailPath={PATHS.ORDER_DETAIL}
              />
            </LeftCol>
            <RightCol>
              <QuickActions actions={actions} />
              <PendingOrdersAlert
                count={attentionOrders}
                to={PATHS.ORDERS}
              />
              <TopProducts
                products={topSelling}
                hasSales={hasTopSales}
                productsPath={PATHS.PRODUCTS}
              />
              <MiniInfo>{`Unique visitors: ${uniqueVisitors}`}</MiniInfo>
            </RightCol>
          </MainGrid>
        </>
      )}
      {!isLoading && !orders.length ? (
        <BottomHint>
          <LoadingState message="No orders yet. Orders from buyers will appear here." />
        </BottomHint>
      ) : null}
    </Wrap>
  );
};

const Wrap = styled.div`
  padding: 1rem 1.2rem;
`;

const Topbar = styled.div`
  height: 52px;
  border-bottom: 0.5px solid #F1EFE8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const TopbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  color: #111827;
`;

const WelcomeRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin: 1rem 0;
`;

const WelcomeText = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  color: #111827;
`;

const WelcomeName = styled.span`
  color: #E8920A;
`;

const WelcomeSub = styled.p`
    font-size: 1.2rem;
  color: #6B7280;
  margin-top: 0.2rem;
`;

const AddProductButton = styled.button`
  border: none;
  background: #E8920A;
  color: #FFFFFF;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 14px;
  margin-top: 14px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const LeftCol = styled.div``;

const RightCol = styled.div`
  display: grid;
  gap: 14px;
  align-content: start;
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
`;

const MiniInfo = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.8rem;
  color: #6B7280;
  font-size: 1.1rem;
`;

const BottomHint = styled.div`
  margin-top: 0.8rem;
`;

export default Dashboard;
