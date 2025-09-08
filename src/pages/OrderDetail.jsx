import { useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import {
  FaChevronLeft,
  FaPrint,
  FaDownload,
  FaEllipsisV,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaCreditCard,
  FaUser,
  FaMapMarkerAlt,
  // FaHistory,
  // FaBell,
  FaShoppingBag,
  FaTag,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaEdit,
  // FaEnvelope,
  // FaPhone,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSellerOrder } from "../hooks/useOrder";
// const order = [];
// Admin Order Details Component
function OrderDetails() {
  const [showEdit, setShowEdit] = useState(false);
  const { id: orderId } = useParams();

  const navigate = useNavigate();

  const {
    data: orderData,
    isLoading,
    isError,
    error,
  } = useGetSellerOrder(orderId);

  const order = useMemo(() => {
    return orderData?.data.data.order || [];
  }, [orderData]);

  if (isLoading) {
    return <div>Loading order details...</div>;
  }

  if (isError) {
    return <div>Error loading order: {error?.message}</div>;
  }

  console.log("order", order);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/orders");
  };
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!order) return <p>No order data found.</p>; // Prevent undefined access

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={handleBack}>
              <FaChevronLeft /> Back to Orders
            </BackButton>
            <OrderTitle>
              Order <span>#{order.order.orderNumber}</span>
            </OrderTitle>
            <OrderStatus status={order.status}>
              {order.status === "completed" && <FaCheckCircle />}
              {order.status === "processing" && <FaBox />}
              {order.status === "shipped" && <FaTruck />}
              {order.status === "cancelled" && <FaExclamationTriangle />}
              {order.status.toUpperCase()}
            </OrderStatus>
          </HeaderLeft>
          <HeaderRight>
            <IconButton onClick={handlePrint}>
              <FaPrint />
            </IconButton>
            <IconButton>
              <FaDownload />
            </IconButton>
            <IconButton>
              <FaEllipsisV />
            </IconButton>
          </HeaderRight>
        </Header>

        <MainContent>
          <div>
            <OrderSection>
              <SectionHeader>
                <SectionTitle>
                  <FaShoppingBag /> Order Items
                </SectionTitle>
                <EditButton onClick={() => setShowEdit(!showEdit)}>
                  <FaEdit /> Edit
                </EditButton>
              </SectionHeader>

              <ItemsTable>
                <thead>
                  <tr>
                    <TableHeader>Product</TableHeader>
                    <TableHeader>SKU</TableHeader>
                    <TableHeader>Price</TableHeader>
                    <TableHeader>Qty</TableHeader>
                    <TableHeader>Total</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => {
                    // console.log("item", item.product.variants);
                    // const variant = JSON.parse(item.product.variants);
                    return (
                      <TableRow key={item._id}>
                        <TableCell>
                          <ProductImage>
                            {item.product?.name?.charAt(0) || "P"}
                          </ProductImage>
                          <ProductDetails>
                            <ProductName>
                              {item.product?.name || "Product"}
                            </ProductName>
                            {/* <ProductSku>
                              {variant.map((v) => v.sku) || "N/A"}
                            </ProductSku> */}
                          </ProductDetails>
                        </TableCell>
                        {/* <TableCell>
                          {variant.map((v) => v.sku) || "N/A"}
                        </TableCell> */}
                        <TableCell>
                          ${item.price?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>{item.quantity || 0}</TableCell>
                        <TableCell>
                          ${(item.price * item.quantity)?.toFixed(2) || "0.00"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </ItemsTable>
            </OrderSection>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
                "@media (max-width: 600px)": {
                  gridTemplateColumns: "1fr",
                },
              }}
            >
              <OrderSection>
                <SectionHeader>
                  <SectionTitle>
                    <FaUser /> Customer Information
                  </SectionTitle>
                </SectionHeader>

                <SectionContent>
                  <InfoCard>
                    <InfoLabel>
                      <FaUser size={14} /> Customer
                    </InfoLabel>
                    <InfoValue>{order.order.user?.name || "N/A"}</InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>
                      <FaTag size={14} /> Contact
                    </InfoLabel>
                    <InfoValue>{order.order.user?.email || "N/A"}</InfoValue>
                    <InfoValue>{order.order.user?.phone || "N/A"}</InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>
                      <FaMapMarkerAlt size={14} /> Shipping Address
                    </InfoLabel>
                    <InfoValue>
                      {/* {order.order.shippingAddress} */}
                      {/* {order.shippingAddress?.street &&
                        `${order.order.shippingAddress}, `}
                      {order.shippingAddress?.city &&
                        `${order.shippingAddress.city}, `}
                      {order.shippingAddress?.state &&
                        `${order.shippingAddress.state}, `}
                      {order.shippingAddress?.postalCode} */}
                    </InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>
                      <FaMapMarkerAlt size={14} /> Billing Address
                    </InfoLabel>
                    <InfoValue>
                      {/* {order.order.shippingAddress} */}
                      {/* {order.billingAddress?.street &&
                        `${order.billingAddress.street}, `}
                      {order.billingAddress?.city &&
                        `${order.billingAddress.city}, `}
                      {order.billingAddress?.state &&
                        `${order.billingAddress.state}, `}
                      {order.billingAddress?.postalCode} */}
                    </InfoValue>
                  </InfoCard>
                </SectionContent>
              </OrderSection>

              <OrderSection>
                <SectionHeader>
                  <SectionTitle>
                    <FaClipboardList /> Order Information
                  </SectionTitle>
                </SectionHeader>

                <SectionContent>
                  <InfoCard>
                    <InfoLabel>
                      <FaCalendarAlt size={14} /> Order Date
                    </InfoLabel>
                    <InfoValue>{formatDate(order.createdAt)}</InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>
                      <FaTruck size={14} /> Shipping Method
                    </InfoLabel>
                    <InfoValue>
                      {order.shippingMethod || "Standard Shipping"}
                    </InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>
                      <FaCreditCard size={14} /> Payment Method
                    </InfoLabel>
                    <InfoValue>
                      {order.paymentMethod || "Credit Card"}
                    </InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>
                      <FaMoneyBillWave size={14} /> Payment Status
                    </InfoLabel>
                    <InfoValue
                      style={{
                        color:
                          order.payoutStatus === "paid"
                            ? theme.success
                            : theme.danger,
                      }}
                    >
                      {order.payoutStatus || "Pending"}
                    </InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>
                      <FaTruck size={14} /> Tracking Number
                    </InfoLabel>
                    <InfoValue>
                      {order.trackingNumber || "Not available"}
                    </InfoValue>
                  </InfoCard>
                </SectionContent>
              </OrderSection>
            </div>
          </div>

          <div>
            <OrderSummary>
              <SectionHeader>
                <SectionTitle>
                  <FaClipboardList /> Order Summary
                </SectionTitle>
              </SectionHeader>

              <SummaryItem>
                <SummaryLabel>Subtotal</SummaryLabel>
                <SummaryValue>
                  ${order.subtotal?.toFixed(2) || "0.00"}
                </SummaryValue>
              </SummaryItem>

              <SummaryItem>
                <SummaryLabel>Shipping</SummaryLabel>
                <SummaryValue>
                  ${order.shippingCost?.toFixed(2) || "0.00"}
                </SummaryValue>
              </SummaryItem>

              <SummaryItem>
                <SummaryLabel>Tax</SummaryLabel>
                <SummaryValue>${order.tax?.toFixed(2) || "0.00"}</SummaryValue>
              </SummaryItem>

              <SummaryItem>
                <SummaryLabel>Discount</SummaryLabel>
                <SummaryValue style={{ color: theme.success }}>
                  -${order.discount?.toFixed(2) || "0.00"}
                </SummaryValue>
              </SummaryItem>

              <TotalRow>
                <SummaryLabel>Total</SummaryLabel>
                <SummaryValue>
                  ${order.totalAmount?.toFixed(2) || "0.00"}
                </SummaryValue>
              </TotalRow>

              <StatusButton status={order.status}>
                {order.status === "completed" && <FaCheckCircle />}
                {order.status === "processing" && <FaBox />}
                {order.status === "shipped" && <FaTruck />}
                {order.status === "cancelled" && <FaExclamationTriangle />}
                {order.status?.charAt(0).toUpperCase() +
                  order.status?.slice(1) || "N/A"}
              </StatusButton>

              <ActionButton onClick={handlePrint}>
                <FaPrint /> Print Invoice
              </ActionButton>
            </OrderSummary>
          </div>
        </MainContent>
      </Container>
    </>
  );
}

export default OrderDetails;

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  body {
    background-color: #f8fafc;
    color: #333;
  }

  #root {
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  }
`;

// Theme variables
const theme = {
  primary: "#4361ee",
  primaryLight: "#c6d2ff",
  text: "#333",
  textLight: "#777",
  border: "#ddd",
  background: "#f8fafc",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  light: "#f8f9fa",
  dark: "#343a40",
  secondary: "#6c757d",
  accent: "#007bff",
};

// Main container
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

// Header styles
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid ${theme.border};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${theme.primaryLight};
  color: ${theme.primary};
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.primary};
    color: white;
  }
`;

const OrderTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.dark};

  span {
    color: ${theme.textLight};
    font-weight: 500;
  }
`;

const OrderStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  background: ${(props) =>
    props.status === "completed"
      ? "rgba(6, 214, 160, 0.1)"
      : props.status === "processing"
      ? "rgba(255, 209, 102, 0.1)"
      : props.status === "shipped"
      ? "rgba(67, 97, 238, 0.1)"
      : props.status === "cancelled"
      ? "rgba(239, 71, 111, 0.1)"
      : "rgba(101, 119, 134, 0.1)"};
  color: ${(props) =>
    props.status === "completed"
      ? "#06d6a0"
      : props.status === "processing"
      ? "#ffd166"
      : props.status === "shipped"
      ? "#4361ee"
      : props.status === "cancelled"
      ? "#ef476f"
      : "#657786"};
  font-size: 14px;
  font-weight: 600;
  margin-left: 15px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IconButton = styled.button`
  background: ${theme.light};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${theme.text};
  transition: all 0.2s;

  &:hover {
    background: ${theme.primaryLight};
    color: ${theme.primary};
    border-color: ${theme.primary};
  }
`;

// Main content
const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 25px;
  padding: 30px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// Order details section
const OrderSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  position: relative;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${theme.border};
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.dark};
`;

const EditButton = styled.button`
  background: ${theme.primaryLight};
  color: ${theme.primary};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${theme.primary};
    color: white;
  }
`;

const SectionContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: ${theme.textLight};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Items table
const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 15px;
  background: ${theme.primaryLight};
  color: ${theme.primary};
  font-weight: 600;
  border-bottom: 2px solid ${theme.primary};
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8fafc;
  }

  &:hover {
    background-color: ${theme.primaryLight};
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.text};

  &:first-child {
    display: flex;
    align-items: center;
    gap: 15px;
  }
`;

const ProductImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: linear-gradient(45deg, #4361ee, #3a0ca3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.div`
  font-weight: 600;
  margin-bottom: 3px;
`;

const ProductSku = styled.div`
  font-size: 13px;
  color: ${theme.textLight};
`;

// Order summary
const OrderSummary = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  position: sticky;
  top: 20px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${theme.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.div`
  color: ${theme.textLight};
`;

const SummaryValue = styled.div`
  font-weight: 600;
  color: ${theme.text};
`;

const TotalRow = styled(SummaryItem)`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.dark};
  padding: 15px 0;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: ${theme.primary};
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover {
    background: ${theme.secondary};
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
  }
`;

const StatusButton = styled(ActionButton)`
  background: ${(props) =>
    props.status === "completed"
      ? theme.success
      : props.status === "processing"
      ? theme.warning
      : props.status === "shipped"
      ? theme.primary
      : props.status === "cancelled"
      ? theme.danger
      : "#94a3b8"};
  margin-top: 10px;
`;
