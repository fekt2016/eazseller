import styled from "styled-components";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaPrint,
  FaEllipsisV,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useGetSellerOrders } from "../hooks/useOrder";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const OrdersPage = () => {
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useGetSellerOrders();
  // console.log("ordersData", ordersData);
  const orders = useMemo(() => {
    return ordersData?.data.data.orders || [];
  }, [ordersData]);
  console.log("orders", orders);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderPaymentStatus = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <StatusBadge status="paid">
            <FaCheckCircle /> Paid
          </StatusBadge>
        );
      case "pending":
        return (
          <StatusBadge status="pending">
            <FaTimesCircle /> Pending
          </StatusBadge>
        );
      default:
        return status;
    }
  };

  const renderFulfillmentStatus = (status) => {
    switch (status.toLowerCase()) {
      case "shipped":
        return (
          <StatusBadge status="shipped">
            <FaTruck /> Shipped
          </StatusBadge>
        );
      case "processing":
        return <StatusBadge status="processing">Processing</StatusBadge>;
      case "delivered":
        return <StatusBadge status="delivered">Delivered</StatusBadge>;
      default:
        return status;
    }
  };

  if (isOrdersLoading) {
    return (
      <DashboardContainer>
        <Header>
          <Title>Orders</Title>
          <Loading>Loading orders...</Loading>
        </Header>
      </DashboardContainer>
    );
  }

  if (isOrdersError) {
    return (
      <DashboardContainer>
        <Header>
          <Title>Orders</Title>
          <ErrorMessage>
            Error: {ordersError?.message || "Failed to load orders"}
          </ErrorMessage>
        </Header>
      </DashboardContainer>
    );
  }

  // Placeholder for viewing order details

  return (
    <DashboardContainer>
      <Header>
        <Title>Orders</Title>
        <ControlsContainer>
          <SearchContainer>
            <FaSearch />
            <SearchInput placeholder="Search orders..." />
          </SearchContainer>
          <FilterButton>
            <FaFilter />
            Filter
          </FilterButton>
        </ControlsContainer>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <TableHeaderRow>
              <TableHeader>Order ID</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Payment Status</TableHeader>
              <TableHeader>Fulfillment</TableHeader>
              <TableHeader>Items</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableHeaderRow>
          </thead>
          <tbody>
            {orders?.map((order) => {
              console.log("order", order);
              return (
                <TableRow key={order._id}>
                  <TableCell>#{order.orderNumber.slice(0, 14)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <CustomerName>{order.user?.name}</CustomerName>
                    <CustomerEmail>{order.user?.email}</CustomerEmail>
                  </TableCell>
                  <TableCell>${order.subtotal.toFixed(2)}</TableCell>
                  <TableCell>
                    {renderPaymentStatus(order.payoutStatus)}
                  </TableCell>
                  <TableCell>
                    {renderFulfillmentStatus(order.payoutStatus)}
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>
                    <ActionIcons>
                      <Link
                        to={`/order-detail/${order._id}`}
                        style={{ display: "flex" }}
                      >
                        <ActionIcon>
                          <FaEye />
                        </ActionIcon>
                      </Link>
                      <ActionIcon>
                        <FaPrint />
                      </ActionIcon>
                      <ActionIcon>
                        <FaEllipsisV />
                      </ActionIcon>
                    </ActionIcons>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </DashboardContainer>
  );
};

export default OrdersPage;

// Styled components
const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f5f7fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  margin-left: 0.5rem;
  font-size: 0.9rem;
  width: 200px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f2f5;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeaderRow = styled.tr`
  background-color: #f8fafc;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1.2rem 1rem;
  font-size: 0.95rem;
  color: #334155;
`;

const CustomerName = styled.div`
  font-weight: 500;
`;

const CustomerEmail = styled.div`
  font-size: 0.8rem;
  color: #64748b;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;

  background-color: ${(props) => {
    switch (props.status) {
      case "paid":
        return "#e6f7ee";
      case "pending":
        return "#fef6e7";
      case "shipped":
        return "#e0f2fe";
      case "processing":
        return "#f1f5f9";
      case "delivered":
        return "#f0fdf4";
      default:
        return "#f1f5f9";
    }
  }};

  color: ${(props) => {
    switch (props.status) {
      case "paid":
        return "#0d9b5e";
      case "pending":
        return "#f59e0b";
      case "shipped":
        return "#0284c7";
      case "processing":
        return "#64748b";
      case "delivered":
        return "#16a34a";
      default:
        return "#64748b";
    }
  }};
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const ActionIcon = styled.div`
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #475569;
  }
`;

const Loading = styled.div`
  color: #64748b;
  padding: 2rem 0;
  text-align: center;
  width: 100%;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  padding: 2rem 0;
  text-align: center;
  width: 100%;
`;
