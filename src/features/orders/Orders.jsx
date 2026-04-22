import styled from "styled-components";
import { useGetSellerOrders } from '../../shared/hooks/useOrder';
import { Link, useNavigate } from "react-router-dom";
import { formatGHS } from '../../shared/utils/dashboardFormatters';
import StatusBadge from '../../components/shared/StatusBadge';
import { useState, useEffect, useMemo } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaSearch,
  FaShoppingBag,
  FaTimesCircle,
  FaTruck,
  FaAngleLeft,
  FaAngleRight,
  FaUndo,
  FaBoxOpen,
  FaFilter,
} from "react-icons/fa";
import { PATHS } from '../../routes/routePaths';
import { firstNameOnly } from '../../shared/utils/orderPrivacy';

const MOBILE_TABLE_BREAKPOINT = 900;

export default function OrdersPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_TABLE_BREAKPOINT : false
  );

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useGetSellerOrders();

  useEffect(() => {
    refetch();
  }, [currentPage, pageSize, searchTerm, statusFilter, dateFilter, refetch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= MOBILE_TABLE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const orders = useMemo(() => ordersData?.data?.data?.orders || [], [ordersData]);

  const getOrderStatus = (order) => {
    const paymentStatus = (order?.paymentStatus || '').toString().toLowerCase();
    const rawStatus = (
      order?.currentStatus ||
      order?.status ||
      order?.orderStatus ||
      order?.FulfillmentStatus ||
      'pending'
    ).toString().toLowerCase();

    // Defensive normalization: paid/completed orders should not appear pending/cancelled.
    const isPaymentConfirmed =
      paymentStatus === 'paid' || paymentStatus === 'completed';
    if (isPaymentConfirmed) {
      if (rawStatus === 'delivered') return 'delivered';
      if (rawStatus === 'out_for_delivery') return 'shipped';
      if (rawStatus === 'cancelled' || rawStatus === 'pending' || rawStatus === 'pending_payment') {
        return 'processing';
      }
    }

    if (rawStatus === 'delivered') return 'delivered';
    if (rawStatus === 'out_for_delivery') return 'shipped';
    if (['payment_completed', 'processing', 'confirmed', 'preparing', 'ready_for_dispatch'].includes(rawStatus)) {
      return 'processing';
    }
    if (rawStatus === 'pending_payment') return 'pending';
    if (rawStatus === 'cancelled' || rawStatus === 'refunded') return 'cancelled';
    return rawStatus;
  };

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { totalOrders: 0, pendingCount: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    }

    return {
      totalOrders: orders.length,
      pendingCount: orders.filter((o) => getOrderStatus(o) === 'pending').length,
      processing: orders.filter((o) => getOrderStatus(o) === 'processing').length,
      shipped: orders.filter((o) => getOrderStatus(o) === 'shipped').length,
      delivered: orders.filter((o) => ['delivered', 'completed'].includes(getOrderStatus(o))).length,
      cancelled: orders.filter((o) => getOrderStatus(o) === 'cancelled').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => {
        const norm = getOrderStatus(order);
        return norm === statusFilter.toLowerCase();
      });
    }

    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (dateFilter === "today") return orderDate.toDateString() === now.toDateString();
        if (dateFilter === "week") return orderDate >= new Date(now.getTime() - 7 * 86400000);
        if (dateFilter === "month") return orderDate >= new Date(now.getTime() - 30 * 86400000);
        return true;
      });
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <Page>
        <StateCard>
          <Spinner />
          <p style={{ color: '#6B7280', marginTop: '0.75rem' }}>Loading orders…</p>
        </StateCard>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <StateCard>
          <FaExclamationCircle size={32} color="#DC2626" />
          <h3 style={{ color: '#111827', marginTop: '0.75rem' }}>Failed to load orders</h3>
          <p style={{ color: '#6B7280' }}>{error.message}</p>
        </StateCard>
      </Page>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const calculateTotalQuantity = (order) => {
    if (!order.items) return 0;
    if (order.items[0]?.quantity) return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return order.items.length;
  };

  const tableOrderStatus = (order) => getOrderStatus(order);

  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingBag />, accent: '#E8920A' },
    { label: 'Pending', value: stats.pendingCount, icon: <FaExclamationCircle />, accent: '#F59E0B' },
    { label: 'Processing', value: stats.processing, icon: <FaBoxOpen />, accent: '#3B82F6' },
    { label: 'Shipped', value: stats.shipped, icon: <FaTruck />, accent: '#8B5CF6' },
    { label: 'Delivered', value: stats.delivered, icon: <FaCheckCircle />, accent: '#10B981' },
    { label: 'Cancelled', value: stats.cancelled, icon: <FaTimesCircle />, accent: '#EF4444' },
  ];

  const getTrackingReference = (order) => {
    return order?.trackingNumber || order?.orderNumber || '';
  };

  return (
    <Page>
      {/* Page Header */}
      <PageHeader>
        <div>
          <PageTitle>Order Management</PageTitle>
          <PageSub>View and track all your customer orders</PageSub>
        </div>
      </PageHeader>

      {/* Stats Row */}
      <StatsGrid>
        {STAT_CARDS.map((s) => (
          <StatCard key={s.label} $accent={s.accent}>
            <StatIconWrap $accent={s.accent}>{s.icon}</StatIconWrap>
            <StatBody>
              <StatValue>{s.value}</StatValue>
              <StatLabel>{s.label}</StatLabel>
            </StatBody>
          </StatCard>
        ))}
      </StatsGrid>

      {/* Filters */}
      <FiltersCard>
        <SearchWrap>
          <FaSearch size={13} color="#9CA3AF" />
          <SearchInput
            type="text"
            placeholder="Search by order ID or customer name…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </SearchWrap>
        <FilterRow>
          <FilterIcon><FaFilter size={12} color="#9CA3AF" /></FilterIcon>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
          <FilterSelect
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </FilterSelect>
        </FilterRow>
      </FiltersCard>

      {/* Table */}
      <TableCard>
        {paginatedOrders.length > 0 ? (
          <>
            {!isMobileView ? (
              <TableScroll>
                <Table>
                  <THead>
                    <tr>
                      <Th>Order ID</Th>
                      <Th>Customer</Th>
                      <Th>Date</Th>
                      <Th>Tracking</Th>
                      <Th align="center">Items</Th>
                      <Th align="right">Amount</Th>
                      <Th>Status</Th>
                      <Th align="center">Actions</Th>
                    </tr>
                  </THead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <TRow key={order._id}>
                        <Td>
                          <OrderNum>{order.orderNumber || `#${order._id?.slice(-8)}`}</OrderNum>
                        </Td>
                        <Td>
                          <CustomerName>
                            {firstNameOnly(order.user?.name) || 'Unknown Customer'}
                          </CustomerName>
                        </Td>
                        <Td>
                          <DateText>{formatDate(order.createdAt)}</DateText>
                        </Td>
                        <Td>
                          {getTrackingReference(order) ? (
                            <TrackingLink
                              onClick={() =>
                                navigate(
                                  PATHS.TRACKING.replace(
                                    ':trackingNumber',
                                    encodeURIComponent(getTrackingReference(order)),
                                  ),
                                )
                              }
                            >
                              {order.trackingNumber || 'Track order'}
                            </TrackingLink>
                          ) : (
                            <PendingText>Pending…</PendingText>
                          )}
                        </Td>
                        <Td align="center">
                          <ItemCount>{calculateTotalQuantity(order)}</ItemCount>
                        </Td>
                        <Td align="right">
                          <AmountText>{formatGHS(order.total || order.subtotal || 0)}</AmountText>
                        </Td>
                        <Td>
                          <StatusBadge status={tableOrderStatus(order)} />
                        </Td>
                        <Td align="center">
                          <ActionGroup>
                            <ActionBtn
                              as={Link}
                              to={PATHS.ORDER_DETAIL.replace(':id', order._id)}
                              title="View order details"
                              $variant="view"
                            >
                              <FaEye size={13} />
                            </ActionBtn>
                            {getTrackingReference(order) ? (
                              <ActionBtn
                                as={Link}
                                to={PATHS.TRACKING.replace(
                                  ':trackingNumber',
                                  encodeURIComponent(getTrackingReference(order)),
                                )}
                                title="Track order"
                                $variant="view"
                              >
                                <FaTruck size={13} />
                              </ActionBtn>
                            ) : null}
                            <ActionBtn
                              as={Link}
                              to={`${PATHS.RETURNS}?orderId=${encodeURIComponent(order.parentOrderId || order.orderId || order._id)}`}
                              title="View refund details"
                              $variant="refund"
                            >
                              <FaUndo size={13} />
                            </ActionBtn>
                          </ActionGroup>
                        </Td>
                      </TRow>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            ) : null}

            {isMobileView ? (
              <MobileOrderList>
              {paginatedOrders.map((order) => {
                const trackingReference = getTrackingReference(order);
                return (
                  <MobileOrderCard key={`mobile-${order._id}`}>
                    <MobileCardTop>
                      <OrderNum>{order.orderNumber || `#${order._id?.slice(-8)}`}</OrderNum>
                      <StatusBadge status={tableOrderStatus(order)} />
                    </MobileCardTop>
                    <MobileMetaGrid>
                      <MobileMetaItem>
                        <MobileMetaLabel>Customer</MobileMetaLabel>
                        <CustomerName>{firstNameOnly(order.user?.name) || 'Unknown Customer'}</CustomerName>
                      </MobileMetaItem>
                      <MobileMetaItem>
                        <MobileMetaLabel>Date</MobileMetaLabel>
                        <DateText>{formatDate(order.createdAt)}</DateText>
                      </MobileMetaItem>
                      <MobileMetaItem>
                        <MobileMetaLabel>Items</MobileMetaLabel>
                        <ItemCount>{calculateTotalQuantity(order)}</ItemCount>
                      </MobileMetaItem>
                      <MobileMetaItem>
                        <MobileMetaLabel>Amount</MobileMetaLabel>
                        <AmountText>{formatGHS(order.total || order.subtotal || 0)}</AmountText>
                      </MobileMetaItem>
                      <MobileMetaItem>
                        <MobileMetaLabel>Tracking</MobileMetaLabel>
                        {trackingReference ? (
                          <TrackingLink
                            onClick={() =>
                              navigate(
                                PATHS.TRACKING.replace(
                                  ':trackingNumber',
                                  encodeURIComponent(trackingReference),
                                ),
                              )
                            }
                          >
                            {order.trackingNumber || 'Track order'}
                          </TrackingLink>
                        ) : (
                          <PendingText>Pending…</PendingText>
                        )}
                      </MobileMetaItem>
                    </MobileMetaGrid>

                    <MobileActionRow>
                      <MobileActionBtn
                        as={Link}
                        to={PATHS.ORDER_DETAIL.replace(':id', order._id)}
                        $variant="view"
                      >
                        <FaEye size={12} />
                        <span>Details</span>
                      </MobileActionBtn>
                      {trackingReference ? (
                        <MobileActionBtn
                          as={Link}
                          to={PATHS.TRACKING.replace(
                            ':trackingNumber',
                            encodeURIComponent(trackingReference),
                          )}
                          $variant="view"
                        >
                          <FaTruck size={12} />
                          <span>Track</span>
                        </MobileActionBtn>
                      ) : null}
                      <MobileActionBtn
                        as={Link}
                        to={`${PATHS.RETURNS}?orderId=${encodeURIComponent(order.parentOrderId || order.orderId || order._id)}`}
                        $variant="refund"
                      >
                        <FaUndo size={12} />
                        <span>Refund</span>
                      </MobileActionBtn>
                    </MobileActionRow>
                  </MobileOrderCard>
                );
              })}
              </MobileOrderList>
            ) : null}
          </>
        ) : (
          <EmptyState>
            <FaShoppingBag size={36} color="#D1D5DB" />
            <EmptyTitle>No orders found</EmptyTitle>
            <EmptyMsg>Try adjusting your filters or search criteria</EmptyMsg>
          </EmptyState>
        )}
      </TableCard>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <PaginationBar>
          <PerPageWrap>
            <PerPageLabel>Rows per page</PerPageLabel>
            <PerPageSelect
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </PerPageSelect>
          </PerPageWrap>

          <PaginationInfo>
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length}
          </PaginationInfo>

          <PageBtns>
            <PageBtn disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
              <FaAngleLeft size={12} />
            </PageBtn>
            <PageIndicator>{currentPage} / {totalPages || 1}</PageIndicator>
            <PageBtn disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>
              <FaAngleRight size={12} />
            </PageBtn>
          </PageBtns>
        </PaginationBar>
      )}
    </Page>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

/* ─── styled components ───────────────────────────────────────────────────── */
const Page = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const PageSub = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
`;

/* Stats */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-left: 3px solid ${(p) => p.$accent};
`;

const StatIconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: ${(p) => p.$accent}15;
  color: ${(p) => p.$accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const StatBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 0.1rem;
`;

/* Filters */
const FiltersCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0.85rem;
  }
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  padding: 0.6rem 0.9rem;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #111827;
  outline: none;

  &::placeholder { color: #9CA3AF; }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterIcon = styled.div`
  display: flex;
  align-items: center;
`;

const FilterSelect = styled.select`
  height: 36px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.8rem;
  color: #374151;
  background: #FFFFFF;
  cursor: pointer;
  outline: none;

  &:focus { border-color: #E8920A; }

  @media (max-width: 768px) {
    flex: 1 1 48%;
    min-width: 140px;
  }
`;

/* Table */
const TableCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const TableScroll = styled.div`
  overflow-x: auto;
`;

const MobileOrderList = styled.div`
  display: grid;
  padding: 0.85rem;
  gap: 0.75rem;
`;

const MobileOrderCard = styled.article`
  border: 1px solid #F1EFE8;
  border-radius: 10px;
  padding: 0.75rem;
  background: #FFFFFF;
  display: grid;
  gap: 0.7rem;
`;

const MobileCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const MobileMetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
`;

const MobileMetaItem = styled.div`
  display: grid;
  gap: 0.2rem;
  min-width: 0;
`;

const MobileMetaLabel = styled.span`
  color: #9CA3AF;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const MobileActionRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const MobileActionBtn = styled.a`
  min-height: 2.75rem;
  width: auto;
  padding: 0 0.75rem;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  background: ${(p) => VARIANT_STYLES[p.$variant]?.bg || '#F3F4F6'};
  color: ${(p) => VARIANT_STYLES[p.$variant]?.color || '#374151'};

  &:hover {
    background: ${(p) => VARIANT_STYLES[p.$variant]?.hover || '#E5E7EB'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const THead = styled.thead`
  background: #F9F8F5;
  border-bottom: 1px solid #F1EFE8;
`;

const Th = styled.th`
  padding: 0.75rem 1.1rem;
  text-align: ${(p) => p.align || 'left'};
  font-size: 0.75rem;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const TRow = styled.tr`
  border-bottom: 0.5px solid #F1EFE8;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: #FFFDF9; }
`;

const Td = styled.td`
  padding: 0.9rem 1.1rem;
  vertical-align: middle;
  text-align: ${(p) => p.align || 'left'};
`;

const OrderNum = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  font-family: ui-monospace, 'Courier New', monospace;
`;

const CustomerName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
`;

const DateText = styled.span`
  font-size: 0.8rem;
  color: #6B7280;
  white-space: nowrap;
`;

const TrackingLink = styled.span`
  font-size: 0.8rem;
  color: #185FA5;
  cursor: pointer;
  font-family: ui-monospace, 'Courier New', monospace;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover { color: #1D4ED8; }
`;

const PendingText = styled.span`
  font-size: 0.8rem;
  color: #D1D5DB;
  font-style: italic;
`;

const ItemCount = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const AmountText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
`;

const ActionGroup = styled.div`
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
`;

const VARIANT_STYLES = {
  view:   { bg: '#EFF6FF', color: '#1D4ED8', hover: '#DBEAFE' },
  refund: { bg: '#FFF7ED', color: '#EA580C', hover: '#FED7AA' },
};

const ActionBtn = styled.a`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  background: ${(p) => VARIANT_STYLES[p.$variant]?.bg || '#F3F4F6'};
  color: ${(p) => VARIANT_STYLES[p.$variant]?.color || '#374151'};

  &:hover {
    background: ${(p) => VARIANT_STYLES[p.$variant]?.hover || '#E5E7EB'};
  }
`;

/* Empty state */
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1rem;
  gap: 0.5rem;
`;

const EmptyTitle = styled.h3`
  font-size: 0.975rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const EmptyMsg = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0;
`;

/* Pagination */
const PaginationBar = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (max-width: 768px) {
    padding: 0.75rem 0.85rem;
  }
`;

const PerPageWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PerPageLabel = styled.span`
  font-size: 0.8rem;
  color: #9CA3AF;
`;

const PerPageSelect = styled.select`
  height: 30px;
  padding: 0 0.6rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #374151;
  background: #FFFFFF;
  outline: none;
`;

const PaginationInfo = styled.span`
  font-size: 0.8rem;
  color: #6B7280;
`;

const PageBtns = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const PageBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 0.5px solid #F1EFE8;
  background: #FFFFFF;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s;

  &:hover:not(:disabled) { background: #F9F8F5; border-color: #E8920A; color: #E8920A; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`;

const PageIndicator = styled.span`
  font-size: 0.8rem;
  color: #6B7280;
  min-width: 50px;
  text-align: center;
`;

/* Loading / error */
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

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid #F1EFE8;
  border-top-color: #E8920A;
  animation: spin 0.7s linear infinite;

  @keyframes spin { to { transform: rotate(360deg); } }
`;
