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
  FaClock,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSellerOrder } from '../../shared/hooks/useOrder';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
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

  // SEO - Update page title and meta tags based on order data
  useDynamicPageTitle({
    title: "Seller Order",
    dynamicTitle: order?.order && `Seller Order #${order.order.orderNumber || order.order._id?.slice(-8) || order.order._id}`,
    description: "View customer order details.",
    defaultTitle: "EazSeller Orders",
  });

  if (isLoading) {
    return <div>Loading order details...</div>;
  }

  if (isError) {
    return <div>Error loading order: {error?.message}</div>;
  }

  console.log("order", order);
  console.log("Order status fields:", {
    currentStatus: order?.currentStatus,
    status: order?.status,
    orderStatus: order?.orderStatus,
    FulfillmentStatus: order?.FulfillmentStatus,
    payoutStatus: order?.payoutStatus,
    sellerPaymentStatus: order?.sellerPaymentStatus,
  });

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
            <OrderStatus status={(() => {
              // Use orderStatus as primary source (set to 'confirmed' after payment)
              let status = order.orderStatus || order.currentStatus || order.status || 'pending';
              if (status === 'delivered') return 'completed';
              if (status === 'out_for_delivery') return 'shipped';
              if (status === 'confirmed') return 'confirmed'; // Show confirmed, not processing
              if (['preparing', 'ready_for_dispatch'].includes(status)) return 'processing';
              if (status === 'pending_payment' || status === 'pending') return 'pending';
              return status.toLowerCase();
            })()}>
              {(() => {
                const status = order.orderStatus || order.currentStatus || order.status || 'pending';
                if (status === 'delivered' || status === 'completed') return <FaCheckCircle />;
                if (status === 'out_for_delivery' || status === 'shipped') return <FaTruck />;
                if (status === 'confirmed') return <FaCheckCircle />; // Confirmed uses check icon
                if (['preparing', 'ready_for_dispatch'].includes(status)) return <FaBox />;
                if (status === 'cancelled' || status === 'refunded') return <FaExclamationTriangle />;
                return <FaClock />;
              })()}
              {(() => {
                let status = order.orderStatus || order.currentStatus || order.status || 'pending';
                if (status === 'delivered') status = 'completed';
                if (status === 'out_for_delivery') status = 'shipped';
                if (status === 'confirmed') status = 'confirmed'; // Keep as confirmed
                if (['preparing', 'ready_for_dispatch'].includes(status)) status = 'processing';
                if (status === 'pending_payment' || status === 'pending') status = 'pending';
                return status.toUpperCase();
              })()}
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
                          GH₵{(item.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{item.quantity || 0}</TableCell>
                        <TableCell>
                          GH₵{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </ItemsTable>
            </OrderSection>

            <OrderDetailsGrid>
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
                      <FaTruck size={14} /> Delivery Method
                    </InfoLabel>
                    <InfoValue>
                      {order.order?.deliveryMethod === 'pickup_center' && 'Pickup from EazShop Center'}
                      {order.order?.deliveryMethod === 'dispatch' && 'EazShop Dispatch Rider'}
                      {order.order?.deliveryMethod === 'seller_delivery' && "Seller's Own Delivery"}
                      {!order.order?.deliveryMethod && 'Standard Shipping'}
                    </InfoValue>
                  </InfoCard>

                  {/* Delivery Instructions */}
                  {order.order?.deliveryMethod && (
                    <InfoCard style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                      <InfoLabel style={{ marginBottom: '12px', fontSize: '15px', fontWeight: '600' }}>
                        <FaTruck size={16} /> Delivery Instructions
                      </InfoLabel>
                      {order.order.deliveryMethod === 'pickup_center' && order.order.pickupCenterId && (
                        <DeliveryInstructions>
                          <InstructionTitle>📦 Send item to EazShop Pickup Center:</InstructionTitle>
                          <InstructionText>
                            <strong>{order.order.pickupCenterId.pickupName}</strong>
                          </InstructionText>
                          <InstructionText>
                            {order.order.pickupCenterId.address}
                          </InstructionText>
                          <InstructionText>
                            {order.order.pickupCenterId.area}, {order.order.pickupCenterId.city}
                          </InstructionText>
                          {order.order.pickupCenterId.openingHours && (
                            <InstructionText style={{ marginTop: '8px', fontStyle: 'italic' }}>
                              Opening Hours: {order.order.pickupCenterId.openingHours}
                            </InstructionText>
                          )}
                          {order.order.pickupCenterId.googleMapLink && (
                            <MapLink 
                              href={order.order.pickupCenterId.googleMapLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              View on Google Maps →
                            </MapLink>
                          )}
                        </DeliveryInstructions>
                      )}
                      {order.order.deliveryMethod === 'dispatch' && (
                        <DeliveryInstructions>
                          <InstructionTitle>🚚 Wait for EazShop rider to pick item</InstructionTitle>
                          <InstructionText>
                            An EazShop dispatch rider will come to your location to pick up the item. 
                            Please have the order ready for pickup.
                          </InstructionText>
                        </DeliveryInstructions>
                      )}
                      {order.order.deliveryMethod === 'seller_delivery' && (
                        <DeliveryInstructions>
                          <InstructionTitle>🏍️ Deliver to buyer using your own rider</InstructionTitle>
                          <InstructionText>
                            <strong>Delivery Address:</strong>
                          </InstructionText>
                          {order.order.shippingAddress && (
                            <>
                              {order.order.shippingAddress.streetAddress && (
                                <InstructionText>
                                  {order.order.shippingAddress.streetAddress}
                                </InstructionText>
                              )}
                              {order.order.shippingAddress.landmark && (
                                <InstructionText>
                                  {order.order.shippingAddress.landmark}
                                </InstructionText>
                              )}
                              <InstructionText>
                                {order.order.shippingAddress.city && `${order.order.shippingAddress.city}, `}
                                {order.order.shippingAddress.region}
                              </InstructionText>
                              {order.order.shippingAddress.contactPhone && (
                                <InstructionText style={{ marginTop: '8px' }}>
                                  <strong>Contact:</strong> {order.order.shippingAddress.contactPhone}
                                </InstructionText>
                              )}
                            </>
                          )}
                        </DeliveryInstructions>
                      )}
                    </InfoCard>
                  )}

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
                      <FaMoneyBillWave size={14} /> Customer Payment Status
                    </InfoLabel>
                    <InfoValue
                      style={{
                        color:
                          (order.order?.paymentStatus === "completed" || order.paymentStatus === "completed")
                            ? "var(--color-green-700)"
                            : "var(--color-red-600)",
                      }}
                    >
                      {(order.order?.paymentStatus === "completed" || order.paymentStatus === "completed") ? "Paid" : "Pending"}
                    </InfoValue>
                  </InfoCard>
                  <InfoCard>
                    <InfoLabel>
                      <FaMoneyBillWave size={14} /> Your Payout Status
                    </InfoLabel>
                    <InfoValue
                      style={{
                        color:
                          order.payoutStatus === "paid"
                            ? "var(--color-green-700)"
                            : "var(--color-yellow-600)",
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
                      {order.order?.trackingNumber || order.trackingNumber ? (
                        <TrackingLink 
                          onClick={() => navigate(`/tracking/${order.order?.trackingNumber || order.trackingNumber}`)}
                          title="Track Order"
                        >
                          {order.order?.trackingNumber || order.trackingNumber}
                        </TrackingLink>
                      ) : (
                        "Not available"
                      )}
                    </InfoValue>
                  </InfoCard>
                </SectionContent>
              </OrderSection>
            </OrderDetailsGrid>
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
                  GH₵{(order.subtotal || 0).toFixed(2)}
                </SummaryValue>
              </SummaryItem>

              <SummaryItem>
                <SummaryLabel>Shipping</SummaryLabel>
                <SummaryValue>
                  GH₵{(order.shippingCost || 0).toFixed(2)}
                </SummaryValue>
              </SummaryItem>

              <SummaryItem>
                <SummaryLabel>Tax</SummaryLabel>
                <SummaryValue>GH₵{(order.tax || 0).toFixed(2)}</SummaryValue>
              </SummaryItem>

              {/* Calculate discount if applicable (subtotal before discount - subtotal after discount) */}
              {(order.order?.discountAmount || order.order?.discount || 0) > 0 && (
                <SummaryItem>
                  <SummaryLabel>Discount</SummaryLabel>
                  <SummaryValue style={{ color: "var(--color-green-700)" }}>
                    -GH₵{(order.order?.discountAmount || order.order?.discount || 0).toFixed(2)}
                  </SummaryValue>
                </SummaryItem>
              )}

              <TotalRow>
                <SummaryLabel>Total</SummaryLabel>
                <SummaryValue>
                  GH₵{(order.total || 0).toFixed(2)}
                </SummaryValue>
              </TotalRow>
              
              {/* Seller Earnings (after commission) */}
              <SummaryItem style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid var(--color-grey-300)' }}>
                <SummaryLabel style={{ fontWeight: '600' }}>Your Earnings</SummaryLabel>
                <SummaryValue style={{ fontWeight: '700', color: 'var(--color-green-700)' }}>
                  GH₵{((order.total || 0) - ((order.total || 0) * (order.commissionRate || 0.15))).toFixed(2)}
                </SummaryValue>
              </SummaryItem>
              
              <SummaryItem>
                <SummaryLabel style={{ fontSize: '13px', color: 'var(--color-grey-500)' }}>Platform Fee ({(order.commissionRate || 0.15) * 100}%)</SummaryLabel>
                <SummaryValue style={{ fontSize: '13px', color: 'var(--color-grey-600)' }}>
                  GH₵{((order.total || 0) * (order.commissionRate || 0.15)).toFixed(2)}
                </SummaryValue>
              </SummaryItem>

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
    font-family: var(--font-body);
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

// Theme variables removed - using CSS variables from GlobalStyles

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
  border-bottom: 1px solid var(--color-grey-200);
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
  background: var(--color-primary-100);
  color: var(--color-primary-500);
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-500);
    color: white;
  }
`;

const OrderTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-grey-900);

  span {
    color: var(--color-grey-500);
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
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-grey-700);
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-100);
    color: var(--color-primary-500);
    border-color: var(--color-primary-500);
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

// Order details grid container
const OrderDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;

  @media (max-width: 600px) {
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
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-grey-900);
`;

const EditButton = styled.button`
  background: var(--color-primary-100);
  color: var(--color-primary-500);
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
    background: var(--color-primary-500);
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
  color: var(--color-grey-500);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-grey-700);
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
  background: var(--color-primary-100);
  color: var(--color-primary-500);
  font-weight: 600;
  border-bottom: 2px solid var(--color-primary-500);
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8fafc;
  }

  &:hover {
    background-color: var(--color-primary-100);
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid var(--color-grey-200);
  color: var(--color-grey-700);

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
  color: var(--color-grey-500);
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
  border-bottom: 1px solid var(--color-grey-200);

  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.div`
  color: var(--color-grey-500);
`;

const SummaryValue = styled.div`
  font-weight: 600;
  color: var(--color-grey-700);
`;

const TotalRow = styled(SummaryItem)`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-grey-900);
  padding: 15px 0;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: var(--color-primary-500);
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
    background: var(--color-grey-600);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
  }
`;

const StatusButton = styled(ActionButton)`
  background: ${(props) =>
    props.status === "completed"
      ? "var(--color-green-700)"
      : props.status === "processing"
      ? "var(--color-yellow-700)"
      : props.status === "shipped"
      ? "var(--color-primary-500)"
      : props.status === "cancelled"
      ? "var(--color-red-600)"
      : "#94a3b8"};
  margin-top: 10px;
`;

const DeliveryInstructions = styled.div`
  background: var(--color-primary-100);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary-500);
`;

const InstructionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary-500);
  margin-bottom: 10px;
`;

const InstructionText = styled.div`
  font-size: 14px;
  color: var(--color-grey-700);
  line-height: 1.6;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MapLink = styled.a`
  display: inline-block;
  margin-top: 10px;
  color: var(--color-primary-500);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    text-decoration: underline;
    color: var(--color-primary-600);
  }
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
