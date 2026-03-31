import { useState } from 'react';
import styled from 'styled-components';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FaDollarSign,
  FaShoppingCart,
  FaBox,
  FaChartLine,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaWarehouse,
  FaUndo,
  FaReceipt,
} from 'react-icons/fa';
import {
  useSellerKPICards,
  useSellerRevenueAnalytics,
  useSellerOrderStatusAnalytics,
  useSellerTopProducts,
  useSellerPayoutAnalytics,
  useSellerTaxAnalytics,
  useSellerInventoryAnalytics,
  useSellerRefundAnalytics,
  useSellerPerformanceScore,
} from '../../shared/hooks/useSellerAnalytics';
import { getOptimizedImageUrl, IMAGE_SLOTS } from '../../shared/utils/cloudinaryConfig';
import { getAttentionCountsFromBreakdown } from '../../shared/utils/orderAttention';

/* ─── formatters ──────────────────────────────────────────────────────────── */
const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(v || 0);
const fmtNumber = (v) => new Intl.NumberFormat('en-GH').format(v || 0);
const fmtPct = (v) => `${(v || 0).toFixed(1)}%`;
const fmtDate = (v) => new Date(v).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' });

/* ─── constants ───────────────────────────────────────────────────────────── */
const RANGES = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '1y', value: 365 },
];

const STATUS_COLORS = {
  delivered: '#10B981',
  shipped: '#3B82F6',
  processing: '#F59E0B',
  pending: '#E8920A',
  cancelled: '#EF4444',
};

const BADGE_META = {
  gold:   { bg: 'linear-gradient(135deg,#FFD700,#F59E0B)', text: '#7C2D00' },
  silver: { bg: 'linear-gradient(135deg,#CBD5E1,#94A3B8)', text: '#1E293B' },
  bronze: { bg: 'linear-gradient(135deg,#D97706,#92400E)', text: '#FEF3C7' },
  poor:   { bg: '#F3F4F6', text: '#374151' },
};

/* ─── sub-components ─────────────────────────────────────────────────────── */
function KPICard({ icon, title, value, change, accentColor }) {
  const isPositive = change > 0;
  const hasChange = change !== null && change !== undefined;
  return (
    <KPIItem $accent={accentColor}>
      <KPITop>
        <KPIIcon $accent={accentColor}>{icon}</KPIIcon>
        {hasChange && (
          <ChangePill $positive={isPositive}>
            {isPositive ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
            {Math.abs(change).toFixed(1)}%
          </ChangePill>
        )}
      </KPITop>
      <KPIValue>{value}</KPIValue>
      <KPITitle>{title}</KPITitle>
    </KPIItem>
  );
}

function RangeTabs({ value, onChange }) {
  return (
    <RangeTabsWrap>
      {RANGES.map((r) => (
        <RangeTab key={r.value} $active={value === r.value} onClick={() => onChange(r.value)}>
          {r.label}
        </RangeTab>
      ))}
    </RangeTabsWrap>
  );
}

function SectionCard({ title, icon, children, action }) {
  return (
    <Card>
      <CardHead>
        <CardTitle>
          {icon && <CardTitleIcon>{icon}</CardTitleIcon>}
          {title}
        </CardTitle>
        {action}
      </CardHead>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <MiniStatWrap>
      <MiniStatValue $color={color}>{value}</MiniStatValue>
      <MiniStatLabel>{label}</MiniStatLabel>
    </MiniStatWrap>
  );
}

/* ─── custom tooltip ─────────────────────────────────────────────────────── */
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <TooltipDate>{label}</TooltipDate>
      <TooltipValue>{fmtCurrency(payload[0]?.value)}</TooltipValue>
    </TooltipBox>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */
const SellerAnalyticsDashboard = () => {
  const [revenueRange, setRevenueRange] = useState(30);
  const [payoutRange, setPayoutRange] = useState(30);
  const [refundRange, setRefundRange] = useState(30);
  const [performanceRange, setPerformanceRange] = useState(30);

  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useSellerKPICards();
  const { data: revenueData, isLoading: revenueLoading } = useSellerRevenueAnalytics(revenueRange);
  const { data: orderStatusData, isLoading: orderStatusLoading } = useSellerOrderStatusAnalytics();
  const { data: topProductsData, isLoading: topProductsLoading } = useSellerTopProducts(10);
  const { data: payoutData } = useSellerPayoutAnalytics(payoutRange);
  const { data: taxData } = useSellerTaxAnalytics(30);
  const { data: inventoryData } = useSellerInventoryAnalytics();
  const { data: refundData } = useSellerRefundAnalytics(refundRange);
  const { data: performanceData } = useSellerPerformanceScore(performanceRange);

  const attentionCounts = getAttentionCountsFromBreakdown(orderStatusData?.statusBreakdown || {});

  /* KPI config */
  const kpi = kpiData || {};
  const KPI_ITEMS = [
    { icon: <FaDollarSign />, title: "Today's Revenue", value: fmtCurrency(kpi.revenueToday?.value), change: kpi.revenueToday?.change, accent: '#10B981' },
    { icon: <FaChartLine />, title: "Weekly Revenue", value: fmtCurrency(kpi.revenueThisWeek?.value), change: kpi.revenueThisWeek?.change, accent: '#3B82F6' },
    { icon: <FaShoppingCart />, title: "Orders Today", value: fmtNumber(kpi.ordersToday?.value), accent: '#8B5CF6' },
    { icon: <FaExclamationTriangle />, title: "Needs Attention", value: fmtNumber(attentionCounts.attention), accent: '#F59E0B' },
    { icon: <FaBox />, title: "Products Live", value: fmtNumber(kpi.totalProductsLive?.value), accent: '#E8920A' },
    { icon: <FaMoneyBillWave />, title: "Available Balance", value: fmtCurrency(kpi.availableBalance?.value), accent: '#10B981' },
  ];

  /* Revenue chart data */
  const chartData = (revenueData?.dailyRevenue || []).slice(-14).map((d) => ({
    date: fmtDate(d.date),
    amount: d.amount,
  }));

  /* Order status pie data */
  const pieData = orderStatusData?.statusBreakdown
    ? Object.entries(orderStatusData.statusBreakdown).map(([status, d]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: d.count || 0,
        color: STATUS_COLORS[status] || '#9CA3AF',
      }))
    : [];

  /* Top products */
  const topProducts = topProductsData?.topSellingProducts || topProductsData?.data?.topSellingProducts || [];

  if (kpiLoading) {
    return (
      <Page>
        <SkeletonGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonKPI key={i} />)}
        </SkeletonGrid>
        <SkeletonChart />
      </Page>
    );
  }

  if (kpiError) {
    return (
      <Page>
        <StateCard>
          <FaExclamationTriangle size={28} color="#EF4444" />
          <p style={{ color: '#374151', marginTop: '0.75rem' }}>Failed to load analytics data</p>
        </StateCard>
      </Page>
    );
  }

  return (
    <Page>
      {/* Header */}
      <PageHeader>
        <div>
          <PageTitle>Analytics</PageTitle>
          <PageSub>Track your sales, revenue, and performance</PageSub>
        </div>
      </PageHeader>

      {/* KPI grid */}
      <KPIGrid>
        {KPI_ITEMS.map((k) => (
          <KPICard key={k.title} icon={k.icon} title={k.title} value={k.value} change={k.change} accentColor={k.accent} />
        ))}
      </KPIGrid>

      {/* Performance score */}
      {performanceData && (() => {
        const badge = performanceData.performanceBadge || 'poor';
        const meta = BADGE_META[badge] || BADGE_META.poor;
        return (
          <SectionCard title="Seller Performance" icon={<FaTrophy />} action={<RangeTabs value={performanceRange} onChange={setPerformanceRange} />}>
            <PerformanceWrap $bg={meta.bg} $text={meta.text}>
              <TrophyIcon>{<FaTrophy size={28} />}</TrophyIcon>
              <PerformanceInfo>
                <PerformanceTier $text={meta.text}>{badge.toUpperCase()} SELLER</PerformanceTier>
                <PerformanceScore $text={meta.text}>{performanceData.sellerScore?.toFixed(1)}<ScoreUnit $text={meta.text}>/100</ScoreUnit></PerformanceScore>
                <PerformanceMeta $text={meta.text}>
                  On-time delivery: {fmtPct(performanceData.breakdown?.onTimeDeliveryRate)} &nbsp;·&nbsp;
                  Quality score: {fmtPct(performanceData.breakdown?.productQualityScore)}
                </PerformanceMeta>
              </PerformanceInfo>
            </PerformanceWrap>
          </SectionCard>
        );
      })()}

      {/* Revenue timeline */}
      <SectionCard
        title="Revenue Timeline"
        icon={<FaChartLine />}
        action={<RangeTabs value={revenueRange} onChange={setRevenueRange} />}
      >
        {revenueLoading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8920A" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#E8920A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₵${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={48} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#E8920A" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#E8920A' }} />
              </AreaChart>
            </ResponsiveContainer>
            {revenueData?.summary && (
              <RevenueSummary>
                <MiniStat label="Total Revenue" value={fmtCurrency(revenueData.summary.totalRevenue)} />
                <SummaryDivider />
                <MiniStat label="Net Revenue" value={fmtCurrency(revenueData.summary.netRevenue)} color="#10B981" />
                <SummaryDivider />
                <MiniStat label="Withholding Tax" value={fmtCurrency(revenueData.summary.withholdingDeducted)} color="#EF4444" />
              </RevenueSummary>
            )}
          </>
        ) : (
          <EmptyMsg>No revenue data for this period</EmptyMsg>
        )}
      </SectionCard>

      {/* Two-column: order status + top products */}
      <TwoCol>
        {/* Order status */}
        <SectionCard title="Order Status" icon={<FaShoppingCart />}>
          {orderStatusLoading ? (
            <ChartSkeleton />
          ) : pieData.length > 0 ? (
            <StatusLayout>
              <PieWrap>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [fmtNumber(v), n]} />
                  </PieChart>
                </ResponsiveContainer>
                <PieCenter>{fmtNumber(orderStatusData?.totalOrders || 0)}<PieCenterSub>total</PieCenterSub></PieCenter>
              </PieWrap>
              <StatusLegend>
                {pieData.map((d) => (
                  <LegendRow key={d.name}>
                    <LegendDot $color={d.color} />
                    <LegendName>{d.name}</LegendName>
                    <LegendCount>{fmtNumber(d.value)}</LegendCount>
                  </LegendRow>
                ))}
              </StatusLegend>
            </StatusLayout>
          ) : (
            <EmptyMsg>No order data available</EmptyMsg>
          )}
        </SectionCard>

        {/* Top products */}
        <SectionCard title="Top Selling Products" icon={<FaTrophy />}>
          {topProductsLoading ? (
            <ChartSkeleton />
          ) : topProducts.length > 0 ? (
            <ProductList>
              {topProducts.slice(0, 6).map((p, i) => (
                <ProductRow key={p.productId || i}>
                  <ProductRank>{i + 1}</ProductRank>
                  {p.productImage && (
                    <ProductImg
                      src={getOptimizedImageUrl(p.productImage, IMAGE_SLOTS.TABLE_THUMB)}
                      alt={p.productName}
                    />
                  )}
                  <ProductInfo>
                    <ProductName>{p.productName}</ProductName>
                    <ProductMeta>{fmtNumber(p.totalSold)} sold · {fmtNumber(p.totalOrders)} orders</ProductMeta>
                  </ProductInfo>
                  <ProductRevenue>{fmtCurrency(p.totalRevenue)}</ProductRevenue>
                </ProductRow>
              ))}
            </ProductList>
          ) : (
            <EmptyMsg>No product data available</EmptyMsg>
          )}
        </SectionCard>
      </TwoCol>

      {/* Tax breakdown */}
      {taxData && (
        <SectionCard title="Tax Breakdown" icon={<FaReceipt />}>
          <FourGrid>
            <MiniStat label="VAT" value={fmtCurrency(taxData.taxBreakdown?.totalVAT)} />
            <MiniStat label="NHIL" value={fmtCurrency(taxData.taxBreakdown?.totalNHIL)} />
            <MiniStat label="GETFund" value={fmtCurrency(taxData.taxBreakdown?.totalGETFund)} />
            <MiniStat label="Withholding Tax" value={fmtCurrency(taxData.withholdingTax?.total)} color="#EF4444" />
            <MiniStat label="Net Revenue" value={fmtCurrency(taxData.sellerRevenue?.netRevenue)} color="#10B981" />
          </FourGrid>
        </SectionCard>
      )}

      {/* Inventory */}
      {inventoryData && (
        <SectionCard title="Inventory Alerts" icon={<FaWarehouse />}>
          <FourGrid>
            <MiniStat label="Low Stock" value={fmtNumber(inventoryData.inventorySummary?.lowStock)} color="#F59E0B" />
            <MiniStat label="Out of Stock" value={fmtNumber(inventoryData.inventorySummary?.outOfStock)} color="#EF4444" />
            <MiniStat label="Total SKUs" value={fmtNumber(inventoryData.inventorySummary?.totalSKUs)} />
            <MiniStat label="Inventory Value" value={fmtCurrency(inventoryData.inventorySummary?.inventoryValue)} color="#10B981" />
          </FourGrid>
          {inventoryData.lowStockProducts?.length > 0 && (
            <LowStockTable>
              <LowStockHead>
                <span>Product</span>
                <span>Stock</span>
                <span>Price</span>
              </LowStockHead>
              {inventoryData.lowStockProducts.slice(0, 8).map((p, i) => (
                <LowStockRow key={i}>
                  <span>{p.name}</span>
                  <StockBadge $low={p.stock <= 5}>{p.stock}</StockBadge>
                  <span>{fmtCurrency(p.price)}</span>
                </LowStockRow>
              ))}
            </LowStockTable>
          )}
        </SectionCard>
      )}

      {/* Payout analytics */}
      {payoutData && (
        <SectionCard title="Payout Analytics" icon={<FaMoneyBillWave />} action={<RangeTabs value={payoutRange} onChange={setPayoutRange} />}>
          <FourGrid>
            <MiniStat label="Total Withdrawn" value={fmtCurrency(payoutData.totalWithdrawn)} />
            <MiniStat label="Pending" value={fmtCurrency(payoutData.pendingWithdrawal)} color="#F59E0B" />
            <MiniStat label="Withholding Tax" value={fmtCurrency(payoutData.withholdingTaxDeducted)} color="#EF4444" />
            <MiniStat label="Available Balance" value={fmtCurrency(payoutData.availableBalance)} color="#10B981" />
          </FourGrid>
          {payoutData.lastPayouts?.length > 0 && (
            <LowStockTable>
              <LowStockHead>
                <span>Date</span>
                <span>Requested</span>
                <span>Tax</span>
                <span>Paid</span>
                <span>Status</span>
              </LowStockHead>
              {payoutData.lastPayouts.map((p, i) => (
                <LowStockRow key={i}>
                  <span>{new Date(p.date).toLocaleDateString('en-GH')}</span>
                  <span>{fmtCurrency(p.amountRequested)}</span>
                  <span>{fmtCurrency(p.withholdingTax)}</span>
                  <span>{fmtCurrency(p.amountPaid)}</span>
                  <PayoutStatus $status={p.status}>{p.status}</PayoutStatus>
                </LowStockRow>
              ))}
            </LowStockTable>
          )}
        </SectionCard>
      )}

      {/* Refund analytics */}
      {refundData && (
        <SectionCard title="Refund Analytics" icon={<FaUndo />} action={<RangeTabs value={refundRange} onChange={setRefundRange} />}>
          <FourGrid>
            {refundData.totalRefunds !== undefined && <MiniStat label="Total Refunds" value={fmtNumber(refundData.totalRefunds)} />}
            {refundData.totalRefundAmount !== undefined && <MiniStat label="Refund Amount" value={fmtCurrency(refundData.totalRefundAmount)} color="#EF4444" />}
            {refundData.refundRate !== undefined && <MiniStat label="Refund Rate" value={fmtPct(refundData.refundRate)} color={refundData.refundRate > 5 ? '#EF4444' : '#10B981'} />}
          </FourGrid>
        </SectionCard>
      )}
    </Page>
  );
};

export default SellerAnalyticsDashboard;

/* ─── styled components ───────────────────────────────────────────────────── */
const Page = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-left: 3px solid #E8920A;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;
`;

const PageSub = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
`;

/* KPI */
const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: repeat(2, 1fr); }
`;

const KPIItem = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.2rem 1rem;
  border-top: 3px solid ${(p) => p.$accent};
`;

const KPITop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const KPIIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${(p) => p.$accent}15;
  color: ${(p) => p.$accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
`;

const ChangePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  background: ${(p) => p.$positive ? '#DCFCE7' : '#FEE2E2'};
  color: ${(p) => p.$positive ? '#15803D' : '#DC2626'};
`;

const KPIValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin-bottom: 0.2rem;
`;

const KPITitle = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
`;

/* Section card */
const Card = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const CardTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardTitleIcon = styled.span`
  color: #E8920A;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

/* Range tabs */
const RangeTabsWrap = styled.div`
  display: flex;
  gap: 0.25rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 8px;
  padding: 0.2rem;
`;

const RangeTab = styled.button`
  height: 26px;
  padding: 0 0.65rem;
  border-radius: 6px;
  border: none;
  font-size: 0.75rem;
  font-weight: ${(p) => p.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.12s;
  background: ${(p) => p.$active ? '#E8920A' : 'transparent'};
  color: ${(p) => p.$active ? '#FFFFFF' : '#6B7280'};

  &:hover { background: ${(p) => p.$active ? '#D97706' : '#F1EFE8'}; }
`;

/* Performance */
const PerformanceWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$text};
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
`;

const TrophyIcon = styled.div`
  opacity: 0.9;
`;

const PerformanceInfo = styled.div`
  flex: 1;
`;

const PerformanceTier = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${(p) => p.$text};
  opacity: 0.8;
  margin-bottom: 0.2rem;
`;

const PerformanceScore = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${(p) => p.$text};
  line-height: 1;
  margin-bottom: 0.3rem;
`;

const ScoreUnit = styled.span`
  font-size: 0.9rem;
  font-weight: 400;
  color: ${(p) => p.$text};
  opacity: 0.6;
`;

const PerformanceMeta = styled.div`
  font-size: 0.75rem;
  color: ${(p) => p.$text};
  opacity: 0.75;
`;

/* Revenue chart */
const TooltipBox = styled.div`
  background: #1F2937;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
`;

const TooltipDate = styled.div`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin-bottom: 0.2rem;
`;

const TooltipValue = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #FFFFFF;
`;

const RevenueSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 0.5px solid #F1EFE8;
  flex-wrap: wrap;
`;

const SummaryDivider = styled.div`
  width: 1px;
  height: 28px;
  background: #F1EFE8;
`;

/* Mini stat */
const MiniStatWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const MiniStatValue = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${(p) => p.$color || '#111827'};
`;

const MiniStatLabel = styled.div`
  font-size: 0.8rem;
  color: #9CA3AF;
`;

const FourGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.25rem;
`;

/* Two-column layout */
const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

/* Pie / order status */
const StatusLayout = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const PieWrap = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 180px;
`;

const PieCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
`;

const PieCenterSub = styled.div`
  font-size: 0.8rem;
  color: #9CA3AF;
  font-weight: 400;
`;

const StatusLegend = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-width: 130px;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  flex-shrink: 0;
`;

const LegendName = styled.span`
  flex: 1;
  font-size: 0.8rem;
  color: #374151;
`;

const LegendCount = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
`;

/* Top products */
const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0;
  border-bottom: 0.5px solid #F9F8F5;

  &:last-child { border-bottom: none; }
`;

const ProductRank = styled.div`
  width: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #D1D5DB;
  text-align: center;
  flex-shrink: 0;
`;

const ProductImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 7px;
  object-fit: cover;
  flex-shrink: 0;
  border: 0.5px solid #F1EFE8;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.div`
  font-size: 0.825rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductMeta = styled.div`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin-top: 0.1rem;
`;

const ProductRevenue = styled.div`
  font-size: 0.825rem;
  font-weight: 600;
  color: #E8920A;
  white-space: nowrap;
  flex-shrink: 0;
`;

/* Low stock / payout table */
const LowStockTable = styled.div`
  margin-top: 1rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  overflow: hidden;
`;

const LowStockHead = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.55rem 0.9rem;
  background: #F9F8F5;
  font-size: 0.8rem;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  > span { flex: 1; }
`;

const LowStockRow = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.6rem 0.9rem;
  border-top: 0.5px solid #F9F8F5;
  font-size: 0.8rem;
  color: #374151;
  align-items: center;

  > span { flex: 1; }
`;

const StockBadge = styled.div`
  flex: 1;
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(p) => p.$low ? '#DC2626' : '#D97706'};
`;

const PayoutStatus = styled.div`
  flex: 1;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  color: ${(p) =>
    p.$status === 'completed' ? '#10B981' :
    p.$status === 'pending' ? '#F59E0B' : '#6B7280'};
`;

/* Misc */
const EmptyMsg = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  text-align: center;
  padding: 2rem 0;
  margin: 0;
`;

const ChartSkeleton = styled.div`
  height: 200px;
  background: linear-gradient(90deg, #F9F8F5 25%, #F1EFE8 50%, #F9F8F5 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.4s infinite;

  @keyframes shimmer { to { background-position: -200% 0; } }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: repeat(2, 1fr); }
`;

const SkeletonKPI = styled.div`
  height: 100px;
  background: linear-gradient(90deg, #F9F8F5 25%, #F1EFE8 50%, #F9F8F5 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.4s infinite;

  @keyframes shimmer { to { background-position: -200% 0; } }
`;

const SkeletonChart = styled.div`
  height: 280px;
  background: linear-gradient(90deg, #F9F8F5 25%, #F1EFE8 50%, #F9F8F5 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.4s infinite;

  @keyframes shimmer { to { background-position: -200% 0; } }
`;

const StateCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
