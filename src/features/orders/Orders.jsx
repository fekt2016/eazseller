import styled from "styled-components";
import { useGetSellerOrders } from '../../shared/hooks/useOrder';
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from '../../shared/utils/helpers';
import { useState, useEffect, useMemo } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaSearch,
  FaShoppingBag,
  FaTimesCircle,
  FaTruck,
  FaClock,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import { PATHS } from '../../routes/routePaths';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useGetSellerOrders();

  console.log("Orders data:", ordersData);

  // Refetch data when parameters change
  useEffect(() => {
    refetch();
  }, [currentPage, pageSize, searchTerm, statusFilter, dateFilter, refetch]);

  // Extract data from response - must be before conditional returns
  const orders = ordersData?.data?.data?.orders || [];

  // Calculate stats - must be before conditional returns
  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        pendingCount: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };
    }

    const getOrderStatus = (order) => {
      const status = order.currentStatus || order.status || order.FulfillmentStatus || 'pending';
      if (status === 'delivered') return 'delivered';
      if (status === 'out_for_delivery') return 'shipped';
      if (['payment_completed', 'processing', 'confirmed', 'preparing', 'ready_for_dispatch'].includes(status)) return 'processing';
      if (status === 'pending_payment') return 'pending';
      if (status === 'cancelled' || status === 'refunded') return 'cancelled';
      return status.toLowerCase();
    };

    return {
      totalOrders: orders.length,
      pendingCount: orders.filter((order) => getOrderStatus(order) === 'pending').length,
      processing: orders.filter((order) => getOrderStatus(order) === 'processing').length,
      shipped: orders.filter((order) => getOrderStatus(order) === 'shipped').length,
      delivered: orders.filter((order) => getOrderStatus(order) === 'delivered' || getOrderStatus(order) === 'completed').length,
      cancelled: orders.filter((order) => getOrderStatus(order) === 'cancelled').length,
    };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => {
        const status = order.currentStatus || order.status || order.FulfillmentStatus || 'pending';
        let normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'delivered') normalizedStatus = 'delivered';
        else if (normalizedStatus === 'out_for_delivery') normalizedStatus = 'shipped';
        else if (['payment_completed', 'processing', 'confirmed', 'preparing', 'ready_for_dispatch'].includes(normalizedStatus)) normalizedStatus = 'processing';
        else if (normalizedStatus === 'pending_payment') normalizedStatus = 'pending';
        return normalizedStatus === statusFilter.toLowerCase();
      });
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Pagination - must be before conditional returns
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Conditional returns must come AFTER all hooks
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoaderSpinner />
        <p>Loading orders...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <FaExclamationCircle size={48} color="#e74c3c" />
        <h3>Failed to load orders</h3>
        <p>{error.message}</p>
        <p>Please try again later</p>
      </ErrorContainer>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const calculateTotalQuantity = (order) => {
    if (!order.items) return 0;
    if (order.items[0]?.quantity) {
      return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return order.items.length;
  };

  const getStatusIcon = (order) => {
    const status = order.orderStatus || order.currentStatus || order.status || order.FulfillmentStatus || 'pending';
    if (status === 'delivered' || status === 'completed') return <FaCheckCircle />;
    if (status === 'out_for_delivery' || status === 'shipped') return <FaTruck />;
    if (status === 'confirmed') return <FaCheckCircle />; // Check icon for confirmed
    if (['preparing', 'ready_for_dispatch'].includes(status)) return <FaShoppingBag />;
    if (status === 'pending_payment' || status === 'pending') return <FaExclamationCircle />;
    if (status === 'cancelled' || status === 'refunded') return <FaTimesCircle />;
    return <FaClock />;
  };

  const getStatusColor = (order) => {
    const status = order.orderStatus || order.currentStatus || order.status || order.FulfillmentStatus || 'pending';
    if (status === 'delivered' || status === 'completed') return "#2ecc71";
    if (status === 'out_for_delivery' || status === 'shipped') return "#9b59b6";
    if (status === 'confirmed') return "#27ae60"; // Green for confirmed
    if (['preparing', 'ready_for_dispatch'].includes(status)) return "#3498db";
    if (status === 'pending_payment' || status === 'pending') return "#f39c12";
    if (status === 'cancelled' || status === 'refunded') return "#e74c3c";
    return "#7f8c8d";
  };

  const getStatusText = (order) => {
    // Use orderStatus as primary source (set to 'confirmed' after payment)
    const status = order.orderStatus || order.currentStatus || order.status || order.FulfillmentStatus || 'pending';
    if (status === 'delivered' || status === 'completed') return 'Delivered';
    if (status === 'out_for_delivery' || status === 'shipped') return 'Shipped';
    if (status === 'confirmed') return 'Confirmed'; // Show confirmed, not processing
    if (['preparing', 'ready_for_dispatch'].includes(status)) return 'Processing';
    if (status === 'pending_payment' || status === 'pending') return 'Pending';
    if (status === 'cancelled' || status === 'refunded') return 'Cancelled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Container>
      <Header>
        <Title>
          <FaShoppingBag /> Order Management
        </Title>
        <Description>View and track your customer orders</Description>
      </Header>

      <StatsContainer>
        <StatCard>
          <StatIcon $color="#3498db">
            <FaShoppingBag />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalOrders}</StatValue>
            <StatLabel>Total Orders</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#f39c12">
            <FaExclamationCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pendingCount}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#3498db">
            <FaShoppingBag />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.processing}</StatValue>
            <StatLabel>Processing</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#9b59b6">
            <FaTruck />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.shipped}</StatValue>
            <StatLabel>Shipped</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#2ecc71">
            <FaCheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.delivered}</StatValue>
            <StatLabel>Delivered</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#e74c3c">
            <FaTimesCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.cancelled}</StatValue>
            <StatLabel>Cancelled</StatLabel>
          </StatContent>
        </StatCard>
      </StatsContainer>

      <ControlsContainer>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by order ID or customer name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </SearchContainer>

        <FilterGroup>
          <FilterLabel>Status</FilterLabel>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Date</FilterLabel>
          <FilterSelect
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </FilterSelect>
        </FilterGroup>
      </ControlsContainer>

      <OrdersTable>
        <TableHeader>
          <TableRow>
            <HeaderCell>Order ID</HeaderCell>
            <HeaderCell>Customer</HeaderCell>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Tracking Number</HeaderCell>
            <HeaderCell>Items</HeaderCell>
            <HeaderCell>Amount</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell>Actions</HeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber || `#${order._id?.slice(-8)}`}</TableCell>
                <TableCell>{order.user?.name || "Unknown Customer"}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  {order.trackingNumber ? (
                    <TrackingLink 
                      onClick={() => navigate(`/tracking/${order.trackingNumber}`)}
                      title="Track Order"
                    >
                      {order.trackingNumber}
                    </TrackingLink>
                  ) : (
                    <TrackingPending>Pending...</TrackingPending>
                  )}
                </TableCell>
                <TableCell>{calculateTotalQuantity(order)}</TableCell>
                <TableCell>
                  Gh₵{(order.total || order.subtotal || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <StatusBadge $color={getStatusColor(order)}>
                    {getStatusIcon(order)}
                    {getStatusText(order)}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionIcon
                      $color="#3498db"
                      title="View details"
                      to={PATHS.ORDER_DETAIL.replace(':id', order._id)}
                    >
                      <FaEye />
                    </ActionIcon>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <NoOrdersRow>
              <td colSpan="8">
                <NoOrders>
                  <FaShoppingBag size={48} />
                  <h3>No orders found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                </NoOrders>
              </td>
            </NoOrdersRow>
          )}
        </TableBody>
      </OrdersTable>

      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <PaginationContainer>
          <PageSizeControl>
            <span>Orders per page:</span>
            <PageSizeSelect
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </PageSizeSelect>
          </PageSizeControl>

          <PaginationInfo>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length}{" "}
            orders
          </PaginationInfo>

          <PaginationControls>
            <PaginationButton
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              title="First Page"
            >
              <FaAngleLeft />
            </PaginationButton>

            <PaginationButton
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              title="Previous Page"
            >
              <FaAngleLeft />
            </PaginationButton>

            <PageInfo>
              Page {currentPage} of {totalPages || 1}
            </PageInfo>

            <PaginationButton
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              title="Next Page"
            >
              <FaAngleRight />
            </PaginationButton>

            <PaginationButton
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              title="Last Page"
            >
              <FaAngleRight />
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #7f8c8d;
  font-size: 1rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: white;
  background-color: ${(props) => props.$color || "#3498db"};
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
`;

const StatLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ControlsContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 0.75rem;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
`;

const SearchIcon = styled.div`
  color: #7f8c8d;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 150px;
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
`;

const TableHeader = styled.thead`
  background-color: #f8fafc;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e2e8f0;

  &:nth-child(even) {
    background-color: #f8fafc;
  }

  &:hover {
    background-color: #f1f5f9;
  }
`;

const HeaderCell = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  color: #2c3e50;
`;

const TrackingLink = styled.span`
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #2980b9;
  }
`;

const TrackingPending = styled.span`
  color: #95a5a6;
  font-style: italic;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.$color ? `${props.$color}20` : "#f1f5f9"};
  color: ${(props) => props.$color || "#4a5568"};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIcon = styled(Link)`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.$color ? `${props.$color}20` : "#f1f5f9"};
  color: ${(props) => props.$color || "#4a5568"};
  border: none;
  text-decoration: none;

  &:hover {
    background-color: ${(props) => props.$color || "#e2e8f0"};
    color: white;
  }
`;

const NoOrdersRow = styled.tr`
  td {
    padding: 3rem;
    text-align: center;
  }
`;

const NoOrders = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #7f8c8d;

  h3 {
    color: #2c3e50;
    margin: 0;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const PageSizeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const PageSizeSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
`;

const PaginationInfo = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PageInfo = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #4a5568;
`;

const PaginationButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;
  color: #2c3e50;
  border: 1px solid #e2e8f0;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #3498db;
`;

const LoaderSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 2rem auto;

  h3 {
    color: #e74c3c;
    margin: 1rem 0 0.5rem;
  }

  p {
    color: #7f8c8d;
    font-size: 1rem;
    margin: 0.25rem 0;
  }
`;
