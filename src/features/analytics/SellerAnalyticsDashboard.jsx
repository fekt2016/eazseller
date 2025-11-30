import { useState } from 'react';
import styled from 'styled-components';
import {
  FaDollarSign,
  FaShoppingCart,
  FaBox,
  FaChartLine,
  FaEye,
  FaMoneyBillWave,
  FaReceipt,
  FaWarehouse,
  FaUndo,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import {
  useSellerKPICards,
  useSellerRevenueAnalytics,
  useSellerOrderStatusAnalytics,
  useSellerTopProducts,
  useSellerTrafficAnalytics,
  useSellerPayoutAnalytics,
  useSellerTaxAnalytics,
  useSellerInventoryAnalytics,
  useSellerRefundAnalytics,
  useSellerPerformanceScore,
} from '../../shared/hooks/useSellerAnalytics';
import {
  PageContainer,
  PageHeader,
  TitleSection,
  Section,
  SectionHeader,
  StatsGrid,
} from '../../shared/components/ui/SpacingSystem';
import StatCard from '../../shared/components/ui/StatCard';
import { LoadingState, ErrorState, SkeletonCard, EmptyState } from '../../shared/components/ui/LoadingComponents';
import ResponsiveDataTable from '../../shared/components/ui/ResponsiveDataTable';
import Button from '../../shared/components/ui/Button';

const AnalyticsContainer = styled(PageContainer)`
  animation: fadeIn 0.5s ease-out;
`;

const KPIGrid = styled(StatsGrid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
`;

const ChartContainer = styled(Section)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-xl);
`;

const ChartTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
`;

const SimpleLineChart = styled.div`
  height: 300px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) 0;
  border-bottom: 2px solid var(--color-grey-200);
  position: relative;
`;

const Bar = styled.div`
  flex: 1;
  background: linear-gradient(to top, var(--color-primary-500), var(--color-primary-300));
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  min-height: 10px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
    transform: scaleY(1.05);
  }
`;

const BarLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  white-space: nowrap;
`;

const DonutChart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
`;

const DonutSegment = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
`;

const DonutCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    ${({ $color1, $color2, $color3, $color4, $value1, $value2, $value3, $value4 }) => {
      const total = $value1 + $value2 + $value3 + $value4;
      const p1 = ($value1 / total) * 100;
      const p2 = ($value2 / total) * 100;
      const p3 = ($value3 / total) * 100;
      return `${$color1} 0% ${p1}%, ${$color2} ${p1}% ${p1 + p2}%, ${$color3} ${p1 + p2}% ${p1 + p2 + p3}%, ${$color4} ${p1 + p2 + p3}% 100%`;
    }}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: var(--shadow-md);
`;

const DonutCenter = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-white-0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--font-size-lg);
  color: var(--color-grey-800);
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: var(--border-radius-sm);
  background: ${({ $color }) => $color};
`;

const RangeSelector = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
`;

const RangeButton = styled(Button)`
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  background: ${({ $active }) => $active ? 'var(--color-primary-500)' : 'var(--color-grey-100)'};
  color: ${({ $active }) => $active ? 'var(--color-white-0)' : 'var(--color-grey-700)'};
  border: none;

  &:hover {
    background: ${({ $active }) => $active ? 'var(--color-primary-600)' : 'var(--color-grey-200)'};
  }
`;

const PerformanceBadge = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: ${({ $badge }) => {
    if ($badge === 'gold') return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if ($badge === 'silver') return 'linear-gradient(135deg, #C0C0C0, #808080)';
    if ($badge === 'bronze') return 'linear-gradient(135deg, #CD7F32, #8B4513)';
    return 'var(--color-grey-200)';
  }};
  border-radius: var(--border-radius-xl);
  color: ${({ $badge }) => $badge === 'poor' ? 'var(--color-grey-700)' : 'var(--color-white-0)'};
  box-shadow: var(--shadow-md);
`;

const BadgeIcon = styled.div`
  font-size: 3rem;
`;

const BadgeInfo = styled.div`
  flex: 1;
`;

const BadgeScore = styled.div`
  font-size: 2.5rem;
  font-weight: var(--font-bold);
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-GH').format(num || 0);
};

const formatPercentage = (num) => {
  return `${(num || 0).toFixed(1)}%`;
};

const SellerAnalyticsDashboard = () => {
  const [revenueRange, setRevenueRange] = useState(30);
  const [trafficRange, setTrafficRange] = useState(30);
  const [payoutRange, setPayoutRange] = useState(30);
  const [taxRange, setTaxRange] = useState(30);
  const [refundRange, setRefundRange] = useState(30);
  const [performanceRange, setPerformanceRange] = useState(30);

  // KPI Cards
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useSellerKPICards();

  // Revenue Analytics
  const { data: revenueData, isLoading: revenueLoading } = useSellerRevenueAnalytics(revenueRange);

  // Order Status Analytics
  const { data: orderStatusData, isLoading: orderStatusLoading } = useSellerOrderStatusAnalytics();

  // Top Products
  const { data: topProductsData, isLoading: topProductsLoading } = useSellerTopProducts(10);

  // Traffic Analytics
  const { data: trafficData, isLoading: trafficLoading } = useSellerTrafficAnalytics(trafficRange);

  // Payout Analytics
  const { data: payoutData, isLoading: payoutLoading } = useSellerPayoutAnalytics(payoutRange);

  // Tax Analytics
  const { data: taxData, isLoading: taxLoading } = useSellerTaxAnalytics(taxRange);

  // Inventory Analytics
  const { data: inventoryData, isLoading: inventoryLoading } = useSellerInventoryAnalytics();

  // Refund Analytics
  const { data: refundData, isLoading: refundLoading } = useSellerRefundAnalytics(refundRange);

  // Performance Score
  const { data: performanceData, isLoading: performanceLoading } = useSellerPerformanceScore(performanceRange);

  if (kpiLoading) {
    return (
      <AnalyticsContainer>
        <KPIGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </KPIGrid>
      </AnalyticsContainer>
    );
  }

  if (kpiError) {
    return <ErrorState message="Failed to load analytics data" />;
  }

  const kpi = kpiData || {};

  return (
    <AnalyticsContainer>
      <PageHeader>
        <TitleSection>
          <h1>Analytics Dashboard</h1>
          <p>Track your sales, revenue, and performance metrics</p>
        </TitleSection>
      </PageHeader>

      {/* KPI Cards */}
      <KPIGrid>
        <StatCard
          title={kpi.revenueToday?.label || "Today's Revenue"}
          value={formatCurrency(kpi.revenueToday?.value || 0)}
          change={kpi.revenueToday?.change ? `${kpi.revenueToday.change > 0 ? '+' : ''}${kpi.revenueToday.change.toFixed(1)}%` : null}
          variant="success"
          icon={<FaDollarSign />}
        />
        <StatCard
          title={kpi.revenueThisWeek?.label || "This Week's Revenue"}
          value={formatCurrency(kpi.revenueThisWeek?.value || 0)}
          change={kpi.revenueThisWeek?.change ? `${kpi.revenueThisWeek.change > 0 ? '+' : ''}${kpi.revenueThisWeek.change.toFixed(1)}%` : null}
          variant="primary"
          icon={<FaChartLine />}
        />
        <StatCard
          title={kpi.ordersToday?.label || "Orders Today"}
          value={formatNumber(kpi.ordersToday?.value || 0)}
          variant="info"
          icon={<FaShoppingCart />}
        />
        <StatCard
          title={kpi.pendingOrders?.label || "Pending Orders"}
          value={formatNumber(kpi.pendingOrders?.value || 0)}
          variant="warning"
          icon={<FaBox />}
        />
        <StatCard
          title={kpi.totalProductsLive?.label || "Products Live"}
          value={formatNumber(kpi.totalProductsLive?.value || 0)}
          variant="info"
          icon={<FaBox />}
        />
        <StatCard
          title={kpi.availableBalance?.label || "Available Balance"}
          value={formatCurrency(kpi.availableBalance?.value || 0)}
          variant="success"
          icon={<FaMoneyBillWave />}
        />
      </KPIGrid>

      {/* Performance Badge */}
      {performanceData && (
        <ChartContainer>
          <ChartTitle>Seller Performance Score</ChartTitle>
          <PerformanceBadge $badge={performanceData.performanceBadge}>
            <BadgeIcon>
              <FaTrophy />
            </BadgeIcon>
            <BadgeInfo>
              <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                {performanceData.performanceBadge?.toUpperCase()} SELLER
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8, marginTop: 'var(--spacing-xs)' }}>
                On-time Delivery: {formatPercentage(performanceData.breakdown?.onTimeDeliveryRate)} | 
                Quality Score: {formatPercentage(performanceData.breakdown?.productQualityScore)}
              </div>
            </BadgeInfo>
            <BadgeScore>{performanceData.sellerScore?.toFixed(1)}</BadgeScore>
          </PerformanceBadge>
        </ChartContainer>
      )}

      {/* Revenue Timeline */}
      <ChartContainer>
        <ChartTitle>Revenue Timeline</ChartTitle>
        <RangeSelector>
          <RangeButton $active={revenueRange === 7} onClick={() => setRevenueRange(7)}>7 Days</RangeButton>
          <RangeButton $active={revenueRange === 30} onClick={() => setRevenueRange(30)}>30 Days</RangeButton>
          <RangeButton $active={revenueRange === 90} onClick={() => setRevenueRange(90)}>90 Days</RangeButton>
          <RangeButton $active={revenueRange === 365} onClick={() => setRevenueRange(365)}>1 Year</RangeButton>
        </RangeSelector>
        {revenueLoading ? (
          <LoadingState />
        ) : revenueData?.dailyRevenue ? (
          <SimpleLineChart>
            {revenueData.dailyRevenue.slice(-14).map((day, index) => {
              const maxRevenue = Math.max(...revenueData.dailyRevenue.map(d => d.amount));
              const height = maxRevenue > 0 ? (day.amount / maxRevenue) * 100 : 0;
              return (
                <Bar key={index} style={{ height: `${height}%` }}>
                  <BarLabel>{new Date(day.date).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}</BarLabel>
                </Bar>
              );
            })}
          </SimpleLineChart>
        ) : (
          <EmptyState message="No revenue data available" />
        )}
        {revenueData?.summary && (
          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
            <div><strong>Total Revenue:</strong> {formatCurrency(revenueData.summary.totalRevenue)}</div>
            <div><strong>Net Revenue:</strong> {formatCurrency(revenueData.summary.netRevenue)}</div>
            <div><strong>Withholding Tax:</strong> {formatCurrency(revenueData.summary.withholdingDeducted)}</div>
          </div>
        )}
      </ChartContainer>

      {/* Order Status Breakdown */}
      <ChartContainer>
        <ChartTitle>Order Status Breakdown</ChartTitle>
        {orderStatusLoading ? (
          <LoadingState />
        ) : orderStatusData?.statusBreakdown ? (
          <DonutChart>
            <DonutCircle
              $color1="#10b981"
              $color2="#3b82f6"
              $color3="#f59e0b"
              $color4="#ef4444"
              $value1={orderStatusData.statusBreakdown.delivered?.count || 0}
              $value2={orderStatusData.statusBreakdown.shipped?.count || 0}
              $value3={orderStatusData.statusBreakdown.processing?.count || 0}
              $value4={orderStatusData.statusBreakdown.pending?.count || 0}
            >
              <DonutCenter>{orderStatusData.totalOrders || 0}</DonutCenter>
            </DonutCircle>
            <Legend>
              {Object.entries(orderStatusData.statusBreakdown).map(([status, data]) => (
                <LegendItem key={status}>
                  <LegendColor $color={
                    status === 'delivered' ? '#10b981' :
                    status === 'shipped' ? '#3b82f6' :
                    status === 'processing' ? '#f59e0b' :
                    '#ef4444'
                  } />
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}: {data.count} ({data.percentage}%)</span>
                </LegendItem>
              ))}
            </Legend>
          </DonutChart>
        ) : (
          <EmptyState message="No order data available" />
        )}
      </ChartContainer>

      {/* Top Products */}
      {topProductsData?.topSellingProducts && (
        <ChartContainer>
          <ChartTitle>Top Selling Products</ChartTitle>
          <ResponsiveDataTable
            data={topProductsData.topSellingProducts}
            columns={[
              {
                key: 'productName',
                title: 'Product',
                render: (item) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} style={{ width: '40px', height: '40px', borderRadius: 'var(--border-radius-sm)', objectFit: 'cover' }} />
                    )}
                    <span>{item.productName}</span>
                  </div>
                ),
              },
              { key: 'totalSold', title: 'Sold', render: (item) => formatNumber(item.totalSold) },
              { key: 'totalRevenue', title: 'Revenue', render: (item) => formatCurrency(item.totalRevenue) },
              { key: 'totalOrders', title: 'Orders', render: (item) => formatNumber(item.totalOrders) },
              { key: 'conversionRate', title: 'Conversion', render: (item) => formatPercentage(item.conversionRate) },
            ]}
          />
        </ChartContainer>
      )}

      {/* Tax Breakdown */}
      {taxData && (
        <ChartContainer>
          <ChartTitle>Tax Breakdown</ChartTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-xs)' }}>VAT</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)' }}>{formatCurrency(taxData.taxBreakdown?.totalVAT || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-xs)' }}>NHIL</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)' }}>{formatCurrency(taxData.taxBreakdown?.totalNHIL || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-xs)' }}>GETFund</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)' }}>{formatCurrency(taxData.taxBreakdown?.totalGETFund || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-xs)' }}>COVID Levy</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)' }}>{formatCurrency(taxData.taxBreakdown?.totalCovidLevy || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-xs)' }}>Withholding Tax</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)' }}>{formatCurrency(taxData.withholdingTax?.total || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-xs)' }}>Net Revenue</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-green-600)' }}>{formatCurrency(taxData.sellerRevenue?.netRevenue || 0)}</div>
            </div>
          </div>
        </ChartContainer>
      )}

      {/* Inventory Alerts */}
      {inventoryData && (
        <ChartContainer>
          <ChartTitle>Inventory Alerts</ChartTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Low Stock Items</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-warning-600)' }}>
                {inventoryData.inventorySummary?.lowStock || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Out of Stock</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-danger-600)' }}>
                {inventoryData.inventorySummary?.outOfStock || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Total SKUs</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-bold)' }}>
                {inventoryData.inventorySummary?.totalSKUs || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Inventory Value</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-bold)' }}>
                {formatCurrency(inventoryData.inventorySummary?.inventoryValue || 0)}
              </div>
            </div>
          </div>
          {inventoryData.lowStockProducts && inventoryData.lowStockProducts.length > 0 && (
            <ResponsiveDataTable
              data={inventoryData.lowStockProducts.slice(0, 10)}
              columns={[
                { key: 'name', title: 'Product' },
                { key: 'stock', title: 'Stock', render: (item) => <span style={{ color: 'var(--color-warning-600)', fontWeight: 'bold' }}>{item.stock}</span> },
                { key: 'price', title: 'Price', render: (item) => formatCurrency(item.price) },
              ]}
            />
          )}
        </ChartContainer>
      )}

      {/* Payout Analytics */}
      {payoutData && (
        <ChartContainer>
          <ChartTitle>Payout Analytics</ChartTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Total Withdrawn</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)' }}>{formatCurrency(payoutData.totalWithdrawn || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Pending Withdrawal</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-warning-600)' }}>{formatCurrency(payoutData.pendingWithdrawal || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Withholding Tax</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)' }}>{formatCurrency(payoutData.withholdingTaxDeducted || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)' }}>Available Balance</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-green-600)' }}>{formatCurrency(payoutData.availableBalance || 0)}</div>
            </div>
          </div>
          {payoutData.lastPayouts && payoutData.lastPayouts.length > 0 && (
            <ResponsiveDataTable
              data={payoutData.lastPayouts}
              columns={[
                { key: 'date', title: 'Date', render: (item) => new Date(item.date).toLocaleDateString('en-GH') },
                { key: 'amountRequested', title: 'Requested', render: (item) => formatCurrency(item.amountRequested) },
                { key: 'withholdingTax', title: 'Tax', render: (item) => formatCurrency(item.withholdingTax) },
                { key: 'amountPaid', title: 'Paid', render: (item) => formatCurrency(item.amountPaid) },
                { key: 'status', title: 'Status', render: (item) => <span style={{ textTransform: 'capitalize' }}>{item.status}</span> },
              ]}
            />
          )}
        </ChartContainer>
      )}
    </AnalyticsContainer>
  );
};

export default SellerAnalyticsDashboard;

