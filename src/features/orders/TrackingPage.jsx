import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaExclamationCircle,
  FaShoppingBag,
  FaCreditCard,
  FaDollarSign,
  FaCalendarAlt,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../shared/services/orderApi";
import { LoadingSpinner } from "../../shared/components/LoadingSpinner";
import { toast } from "react-toastify";

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    message: '',
    location: '',
  });

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Add a small delay to ensure backend is ready (helps with connection issues)
        await new Promise(resolve => setTimeout(resolve, 100));

        const response = await orderService.getOrderByTrackingNumber(trackingNumber);
        const order = response.data?.order;
        console.log('Tracking Page - Order Data:', order);
        console.log('Tracking Page - Shipping Address:', order?.shippingAddress);
        setOrderData(order);
      } catch (err) {
        console.error('Tracking Page Error:', err);

        // Better error handling for connection issues
        if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message?.includes('CONNECTION_REFUSED')) {
          setError("Unable to connect to the server. Please ensure the backend server is running on port 4000.");
        } else if (err.response?.status === 404) {
          setError("Order not found with this tracking number. Please verify the tracking number is correct.");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to load tracking information");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (trackingNumber) {
      fetchTrackingData();
    }
  }, [trackingNumber]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (error || !orderData) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorTitle>Tracking Not Found</ErrorTitle>
          <ErrorMessage>{error || "Order not found with this tracking number"}</ErrorMessage>
        </ErrorContainer>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Go Back
        </BackButton>
      </PageContainer>
    );
  }

  const getStatusIcon = (status, iconType) => {
    if (iconType === 'order') return <FaBox />;
    if (iconType === 'payment') return <FaCreditCard />;
    if (iconType === 'processing') return <FaBox />;
    if (iconType === 'preparing') return <FaBox />;
    if (iconType === 'rider') return <FaTruck />;
    if (iconType === 'delivery') return <FaTruck />;
    if (iconType === 'delivered') return <FaCheckCircle />;

    switch (status) {
      case "pending_payment":
        return <FaClock />;
      case "payment_completed":
        return <FaCreditCard />;
      case "processing":
      case "confirmed":
      case "preparing":
        return <FaBox />;
      case "ready_for_dispatch":
      case "out_for_delivery":
        return <FaTruck />;
      case "delivered":
        return <FaCheckCircle />;
      case "cancelled":
      case "refunded":
        return <FaExclamationCircle />;
      default:
        return <FaClock />;
    }
  };

  const getStepColor = (step) => {
    if (step.isCompleted) {
      return "#F7C948"; // Yellow for completed
    } else if (step.isActive) {
      return "#2D7FF9"; // Blue for active
    } else {
      return "#D1D5DB"; // Gray for pending
    }
  };

  const getStepBgColor = (step) => {
    if (step.isCompleted) {
      return "#F7C948"; // Yellow background
    } else if (step.isActive) {
      return "#2D7FF9"; // Blue background
    } else {
      return "#E5E7EB"; // Gray background
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const trackingHistory = orderData.trackingHistory || [];
  const currentStatus = orderData.currentStatus || "pending_payment";
  const orderItems = orderData.orderItems || [];
  const paymentStatus = orderData.paymentStatus || "pending";

  // Define all possible tracking steps in order
  const ALL_TRACKING_STEPS = [
    { status: 'pending_payment', label: 'Order Placed', icon: 'order' },
    { status: 'payment_completed', label: 'Payment Completed', icon: 'payment' },
    { status: 'processing', label: 'Processing Order', icon: 'processing' },
    { status: 'preparing', label: 'Preparing for Dispatch', icon: 'preparing' },
    { status: 'ready_for_dispatch', label: 'Rider Assigned', icon: 'rider' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: 'delivery' },
    { status: 'delivered', label: 'Delivered', icon: 'delivered' },
  ];

  // Map currentStatus to active step index
  const getActiveStepIndex = () => {
    // If payment is paid but status hasn't been updated, show payment_completed as active
    if ((paymentStatus === 'paid' || paymentStatus === 'completed') && currentStatus === 'pending_payment') {
      return 1; // payment_completed
    }

    const statusToIndex = {
      'pending_payment': 0,
      'payment_completed': 1,
      'processing': 2,
      'confirmed': 2,
      'preparing': 3,
      'ready_for_dispatch': 4,
      'out_for_delivery': 5,
      'delivered': 6,
    };
    return statusToIndex[currentStatus] ?? 0;
  };

  const activeStepIndex = getActiveStepIndex();

  // Build complete timeline with all steps
  const buildCompleteTimeline = () => {
    return ALL_TRACKING_STEPS.map((step, index) => {
      // Check if this step has a tracking history entry
      let historyEntry = trackingHistory.find(entry => entry.status === step.status);

      // Special handling: If payment is paid but no payment_completed entry exists,
      // create a virtual entry for display
      if (step.status === 'payment_completed' && (paymentStatus === 'paid' || paymentStatus === 'completed') && !historyEntry) {
        historyEntry = {
          status: 'payment_completed',
          message: 'Your payment has been confirmed.',
          timestamp: orderData.paidAt || orderData.createdAt,
        };
      }

      const isCompleted = index < activeStepIndex;
      const isActive = index === activeStepIndex;
      const isPending = index > activeStepIndex;

      return {
        ...step,
        historyEntry,
        isCompleted,
        isActive,
        isPending,
        stepIndex: index,
      };
    });
  };

  const completeTimeline = buildCompleteTimeline();

  // Get estimated delivery from shipping options (stored in order)
  const getEstimatedDelivery = () => {
    if (orderData.deliveryEstimate) {
      if (orderData.deliveryEstimate.includes('Today') ||
        orderData.deliveryEstimate.includes('Business Day') ||
        orderData.deliveryEstimate.includes('Arrives')) {
        return orderData.deliveryEstimate;
      }

      const days = parseInt(orderData.deliveryEstimate);
      if (!isNaN(days) && orderData.createdAt) {
        const orderDate = new Date(orderData.createdAt);
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(estimatedDate.getDate() + days);

        return estimatedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      return orderData.deliveryEstimate;
    }

    return null;
  };

  const estimatedDelivery = getEstimatedDelivery();

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back
        </BackButton>
        <Title>Order Tracking</Title>
        {orderData && orderData.currentStatus !== 'delivered' && (
          <UpdateTrackingButton onClick={() => setShowUpdateModal(true)}>
            <FaPlus />
            Update Tracking
          </UpdateTrackingButton>
        )}
      </Header>

      <ContentGrid>
        {/* Main Tracking Card */}
        <MainCard>
          <TrackingHeader>
            <TrackingNumber>
              Tracking Number: <strong>{orderData.trackingNumber}</strong>
            </TrackingNumber>
            <OrderNumber>
              Order Number: <strong>{orderData.orderNumber}</strong>
            </OrderNumber>
            {estimatedDelivery && (
              <EstimatedDeliveryHeader>
                <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                Expected Delivery: <strong>{estimatedDelivery}</strong>
              </EstimatedDeliveryHeader>
            )}
          </TrackingHeader>

          <CurrentStatus>
            <StatusLabel>Current Status</StatusLabel>
            <StatusBadge $color={getStepColor(completeTimeline.find(s => s.isActive) || completeTimeline[0])}>
              {getStatusIcon(currentStatus)}
              {formatStatusLabel(currentStatus)}
            </StatusBadge>
          </CurrentStatus>

          {estimatedDelivery && (
            <DeliveryEstimateSection>
              <DeliveryEstimateLabel>
                <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                Estimated Delivery Date
              </DeliveryEstimateLabel>
              <DeliveryEstimateValue>
                {estimatedDelivery}
              </DeliveryEstimateValue>
            </DeliveryEstimateSection>
          )}

          <TimelineSection>
            <TimelineTitle>Tracking History</TimelineTitle>
            <Timeline>
              {completeTimeline.map((step, index) => {
                const isLast = index === completeTimeline.length - 1;
                const stepColor = getStepColor(step);
                const stepBgColor = getStepBgColor(step);

                return (
                  <TimelineItem key={step.status} $completed={step.isCompleted} $isActive={step.isActive} $isLast={isLast}>
                    <TimelineIcon $color={stepColor} $bgColor={stepBgColor} $completed={step.isCompleted} $isActive={step.isActive}>
                      {getStatusIcon(step.status, step.icon)}
                    </TimelineIcon>
                    <TimelineContent>
                      <TimelineStatus $color={stepColor}>
                        {step.isCompleted && <FaCheckCircle style={{ marginRight: '0.5rem', color: stepColor }} />}
                        {step.label}
                      </TimelineStatus>
                      {step.historyEntry && step.historyEntry.message && (
                        <TimelineMessage>{step.historyEntry.message}</TimelineMessage>
                      )}
                      {step.historyEntry && step.historyEntry.timestamp && (
                        <TimelineDate>{formatDate(step.historyEntry.timestamp)}</TimelineDate>
                      )}
                      {step.historyEntry && step.historyEntry.location && (
                        <TimelineLocation>
                          <FaMapMarkerAlt />
                          {step.historyEntry.location}
                        </TimelineLocation>
                      )}
                    </TimelineContent>
                    {!isLast && <TimelineLine $color={step.isCompleted ? stepColor : "#E5E7EB"} />}
                  </TimelineItem>
                );
              })}
            </Timeline>
          </TimelineSection>

          <ShippingInfo>
            <InfoTitle>
              <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
              Shipping Address
            </InfoTitle>
            {orderData.shippingAddress && Object.keys(orderData.shippingAddress).length > 0 ? (
              <AddressGrid>
                {orderData.shippingAddress.fullName && (
                  <AddressItem>
                    <AddressLabel>Full Name</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.fullName}</AddressValue>
                  </AddressItem>
                )}
                {orderData.shippingAddress.streetAddress && (
                  <AddressItem>
                    <AddressLabel>Street Address</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.streetAddress}</AddressValue>
                  </AddressItem>
                )}
                {orderData.shippingAddress.area && (
                  <AddressItem>
                    <AddressLabel>Area/Neighborhood</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.area}</AddressValue>
                  </AddressItem>
                )}
                {orderData.shippingAddress.landmark && (
                  <AddressItem>
                    <AddressLabel>Landmark</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.landmark}</AddressValue>
                  </AddressItem>
                )}
                {(orderData.shippingAddress.city || orderData.shippingAddress.state) && (
                  <AddressItem>
                    <AddressLabel>City/State</AddressLabel>
                    <AddressValue>
                      {orderData.shippingAddress.city && typeof orderData.shippingAddress.city === 'string' && orderData.shippingAddress.city.charAt(0).toUpperCase() + orderData.shippingAddress.city.slice(1)}
                      {orderData.shippingAddress.city && orderData.shippingAddress.state && ', '}
                      {orderData.shippingAddress.state && typeof orderData.shippingAddress.state === 'string' && orderData.shippingAddress.state.charAt(0).toUpperCase() + orderData.shippingAddress.state.slice(1)}
                    </AddressValue>
                  </AddressItem>
                )}
                {orderData.shippingAddress.region && (
                  <AddressItem>
                    <AddressLabel>Region</AddressLabel>
                    <AddressValue>
                      {typeof orderData.shippingAddress.region === 'string'
                        ? orderData.shippingAddress.region.split(' ').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                        : orderData.shippingAddress.region}
                    </AddressValue>
                  </AddressItem>
                )}
                {(orderData.shippingAddress.digitalAddress || orderData.shippingAddress.digitalAdress) && (
                  <AddressItem>
                    <AddressLabel>Digital Address</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.digitalAddress || orderData.shippingAddress.digitalAdress}</AddressValue>
                  </AddressItem>
                )}
                {orderData.shippingAddress.contactPhone && (
                  <AddressItem>
                    <AddressLabel>Contact Phone</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.contactPhone}</AddressValue>
                  </AddressItem>
                )}
                {orderData.shippingAddress.country && (
                  <AddressItem>
                    <AddressLabel>Country</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.country}</AddressValue>
                  </AddressItem>
                )}
                {orderData.shippingAddress.additionalInformation && (
                  <AddressItem $fullWidth>
                    <AddressLabel>Additional Information</AddressLabel>
                    <AddressValue>{orderData.shippingAddress.additionalInformation}</AddressValue>
                  </AddressItem>
                )}
              </AddressGrid>
            ) : (
              <EmptyAddress>
                Shipping address information is not available for this order.
              </EmptyAddress>
            )}
          </ShippingInfo>
        </MainCard>

        {/* Sidebar - Order Summary & Items */}
        <Sidebar>
          {/* Order Items */}
          {orderItems.length > 0 && (
            <SidebarCard>
              <CardTitle>
                <FaShoppingBag />
                Order Items
              </CardTitle>
              <ItemsList>
                {orderItems.map((item, index) => (
                  <ItemCard key={index}>
                    {item.product?.imageCover && (
                      <ItemImage src={item.product.imageCover} alt={item.product?.name || 'Product'} />
                    )}
                    <ItemInfo>
                      <ItemName>{item.product?.name || 'Product'}</ItemName>
                      <ItemDetails>
                        <ItemQuantity>Qty: {item.quantity || 1}</ItemQuantity>
                        <ItemPrice>GH₵{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</ItemPrice>
                      </ItemDetails>
                    </ItemInfo>
                  </ItemCard>
                ))}
              </ItemsList>
            </SidebarCard>
          )}

          {/* Order Summary */}
          <SidebarCard>
            <CardTitle>
              <FaDollarSign />
              Order Summary
            </CardTitle>
            <SummaryList>
              <SummaryRow>
                <SummaryLabel>Subtotal</SummaryLabel>
                <SummaryValue>GH₵{(orderData.subtotal || 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Shipping</SummaryLabel>
                <SummaryValue>GH₵{(orderData.shippingCost || 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
              {orderData.tax > 0 && (
                <SummaryRow>
                  <SummaryLabel>Tax</SummaryLabel>
                  <SummaryValue>GH₵{(orderData.tax || 0).toFixed(2)}</SummaryValue>
                </SummaryRow>
              )}
              <SummaryRow $total>
                <SummaryLabel>Total</SummaryLabel>
                <SummaryValue>GH₵{(orderData.totalPrice || 0).toFixed(2)}</SummaryValue>
              </SummaryRow>
            </SummaryList>
          </SidebarCard>

          {/* Payment Information */}
          <SidebarCard>
            <CardTitle>
              <FaCreditCard />
              Payment Information
            </CardTitle>
            <InfoList>
              <InfoRow>
                <InfoLabel>Payment Method</InfoLabel>
                <InfoValue>
                  {orderData.paymentMethod
                    ? orderData.paymentMethod.split('_').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')
                    : 'N/A'}
                </InfoValue>
              </InfoRow>
              {orderData.paidAt && (
                <InfoRow>
                  <InfoLabel>Paid On</InfoLabel>
                  <InfoValue>{formatDate(orderData.paidAt)}</InfoValue>
                </InfoRow>
              )}
            </InfoList>
          </SidebarCard>

          {/* Delivery Information */}
          {(orderData.deliveryMethod || orderData.deliveryEstimate) && (
            <SidebarCard>
              <CardTitle>
                <FaTruck />
                Delivery Information
              </CardTitle>
              <InfoList>
                {orderData.deliveryMethod && (
                  <InfoRow>
                    <InfoLabel>Delivery Method</InfoLabel>
                    <InfoValue>
                      {orderData.deliveryMethod === 'pickup_center'
                        ? 'Pickup from Saiisai Center'
                        : orderData.deliveryMethod === 'dispatch'
                          ? 'Saiisai Dispatch Rider'
                          : orderData.deliveryMethod === 'seller_delivery'
                            ? "Seller's Own Delivery"
                            : orderData.deliveryMethod.split('_').map(word =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                    </InfoValue>
                  </InfoRow>
                )}
                {estimatedDelivery && (
                  <InfoRow>
                    <InfoLabel>
                      <FaCalendarAlt style={{ marginRight: '0.25rem' }} />
                      Estimated Delivery Date
                    </InfoLabel>
                    <InfoValue>{estimatedDelivery}</InfoValue>
                  </InfoRow>
                )}
                {orderData.deliveryZone && (
                  <InfoRow>
                    <InfoLabel>Delivery Zone</InfoLabel>
                    <InfoValue>
                      Zone {orderData.deliveryZone}
                      {orderData.deliveryZone === 'A' && ' (Same City)'}
                      {orderData.deliveryZone === 'B' && ' (Nearby City)'}
                      {orderData.deliveryZone === 'C' && ' (Nationwide)'}
                    </InfoValue>
                  </InfoRow>
                )}
                {orderData.deliveryMethod === 'pickup_center' && orderData.pickupCenter && (
                  <>
                    <InfoRow>
                      <InfoLabel>
                        <FaMapMarkerAlt style={{ marginRight: '0.25rem' }} />
                        Pickup Center
                      </InfoLabel>
                      <InfoValue>
                        <strong>{orderData.pickupCenter.pickupName || 'Saiisai Pickup Center'}</strong>
                      </InfoValue>
                    </InfoRow>
                    {orderData.pickupCenter.address && (
                      <InfoRow>
                        <InfoLabel>Address</InfoLabel>
                        <InfoValue>{orderData.pickupCenter.address}</InfoValue>
                      </InfoRow>
                    )}
                    {(orderData.pickupCenter.city || orderData.pickupCenter.area) && (
                      <InfoRow>
                        <InfoLabel>Location</InfoLabel>
                        <InfoValue>
                          {orderData.pickupCenter.area && (
                            <span>{orderData.pickupCenter.area}</span>
                          )}
                          {orderData.pickupCenter.area && orderData.pickupCenter.city && ', '}
                          {orderData.pickupCenter.city && (
                            <span>{orderData.pickupCenter.city.charAt(0).toUpperCase() + orderData.pickupCenter.city.slice(1)}</span>
                          )}
                        </InfoValue>
                      </InfoRow>
                    )}
                    {orderData.pickupCenter.openingHours && (
                      <InfoRow>
                        <InfoLabel>
                          <FaClock style={{ marginRight: '0.25rem' }} />
                          Opening Hours
                        </InfoLabel>
                        <InfoValue>{orderData.pickupCenter.openingHours}</InfoValue>
                      </InfoRow>
                    )}
                    {orderData.pickupCenter.instructions && (
                      <InfoRow $fullWidth>
                        <InfoLabel>Pickup Instructions</InfoLabel>
                        <InfoValue style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#4a5568' }}>
                          {orderData.pickupCenter.instructions}
                        </InfoValue>
                      </InfoRow>
                    )}
                    {orderData.pickupCenter.googleMapLink && (
                      <InfoRow>
                        <InfoLabel>Map</InfoLabel>
                        <InfoValue>
                          <PickupMapLink
                            href={orderData.pickupCenter.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaMapMarkerAlt style={{ marginRight: '0.25rem' }} />
                            View on Google Maps
                          </PickupMapLink>
                        </InfoValue>
                      </InfoRow>
                    )}
                  </>
                )}
              </InfoList>
            </SidebarCard>
          )}
        </Sidebar>
      </ContentGrid>

      {/* Update Tracking Modal */}
      {showUpdateModal && orderData && (
        <UpdateTrackingModal
          orderId={orderData._id}
          currentStatus={orderData.currentStatus}
          onClose={() => {
            setShowUpdateModal(false);
            setUpdateForm({ status: '', message: '', location: '' });
          }}
          onSuccess={() => {
            // Refetch tracking data
            const fetchTrackingData = async () => {
              try {
                const response = await orderService.getOrderByTrackingNumber(trackingNumber);
                setOrderData(response.data?.order);
              } catch (err) {
                console.error('Error refetching tracking data:', err);
              }
            };
            fetchTrackingData();
          }}
        />
      )}
    </PageContainer>
  );
};

export default TrackingPage;

// Styled Components
const PageContainer = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const Header = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid #E8920A;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 34px;
  padding: 0 0.85rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6B7280;
  transition: border-color 0.12s, color 0.12s;

  &:hover {
    border-color: #E8920A;
    color: #E8920A;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.5rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const SidebarCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.25rem;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem;
`;

const TrackingHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-bottom: 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
  margin-bottom: 1.25rem;
`;

const TrackingNumber = styled.div`
  font-size: 0.875rem;
  color: #6B7280;

  strong {
    color: #111827;
    font-weight: 600;
  }
`;

const OrderNumber = styled.div`
  font-size: 0.9rem;
  color: #9CA3AF;

  strong {
    color: #6B7280;
    font-weight: 600;
  }
`;

const EstimatedDeliveryHeader = styled.div`
  font-size: 0.9rem;
  color: #111827;
  display: flex;
  align-items: center;
  padding: 0.6rem 0.85rem;
  background: #EFF6FF;
  border: 0.5px solid #BFDBFE;
  border-left: 3px solid #3B82F6;
  border-radius: 9px;
  margin-top: 0.25rem;

  strong {
    color: #1D4ED8;
    font-weight: 700;
    margin-left: 0.25rem;
  }
`;

const CurrentStatus = styled.div`
  margin-bottom: 1.25rem;
`;

const StatusLabel = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  background: ${(props) => `${props.$color}18`};
  color: ${(props) => props.$color};
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;

  svg {
    font-size: 1rem;
  }
`;

const DeliveryEstimateSection = styled.div`
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  background: #FDF3E3;
  border: 0.5px solid #FDE3BB;
  border-left: 3px solid #E8920A;
  border-radius: 12px;
`;

const DeliveryEstimateLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: #92400E;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const DeliveryEstimateValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #E8920A;
  display: flex;
  align-items: center;
`;

const TimelineSection = styled.div`
  margin-bottom: 1.25rem;
`;

const TimelineTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 1.5rem;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 1.5rem;
  padding-left: 2.5rem;

  &:not(:last-child)::before {
    content: "";
    position: absolute;
    left: 0.75rem;
    top: 2rem;
    width: 2px;
    height: calc(100% - 0.75rem);
    background: ${props => {
    if (props.$completed) return '#E8920A';
    if (props.$isActive) return '#3B82F6';
    return '#E5E7EB';
  }};
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: ${(props) => {
    if (props.$completed) return props.$bgColor || '#E8920A';
    if (props.$isActive) return props.$bgColor || '#3B82F6';
    return props.$bgColor || '#F3F4F6';
  }};
  color: ${(props) => {
    if (props.$completed || props.$isActive) return "#FFFFFF";
    return "#9CA3AF";
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  z-index: 1;
  border: 2px solid ${(props) => props.$color || '#E5E7EB'};
`;

const TimelineContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const TimelineStatus = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.$color || '#111827'};
  display: flex;
  align-items: center;
`;

const TimelineMessage = styled.div`
  font-size: 0.9rem;
  color: #6B7280;
  line-height: 1.5;
`;

const TimelineDate = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
`;

const TimelineLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 0.15rem;

  svg {
    font-size: 0.65rem;
  }
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 2rem;
  width: 2px;
  height: calc(100% - 0.75rem);
  background: ${(props) => props.$color || '#E5E7EB'};
  z-index: 0;
`;

const ShippingInfo = styled.div`
  padding-top: 1.25rem;
  border-top: 0.5px solid #F1EFE8;
`;

const InfoTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.85rem;
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const AddressItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const AddressLabel = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  font-weight: 600;
`;

const AddressValue = styled.div`
  font-size: 0.9rem;
  color: #111827;
  font-weight: 500;
`;

const EmptyAddress = styled.div`
  text-align: center;
  padding: 1.25rem;
  color: #9CA3AF;
  font-size: 0.9rem;
  font-style: italic;
  background: #F9F8F5;
  border-radius: 9px;
`;

const ItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const ItemCard = styled.li`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
`;

const ItemImage = styled.img`
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 8px;
  background-color: #FFFFFF;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ItemName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
`;

const ItemDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #9CA3AF;
`;

const ItemQuantity = styled.span``;

const ItemPrice = styled.span`
  font-weight: 600;
  color: #6B7280;
`;

const SummaryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SummaryRow = styled.li`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.$total ? '0.75rem 0' : '0.35rem 0'};
  border-top: ${props => props.$total ? '0.5px solid #F1EFE8' : 'none'};
  font-weight: ${props => props.$total ? '700' : '500'};
  font-size: ${props => props.$total ? '0.875rem' : '0.8rem'};
`;

const SummaryLabel = styled.span`
  color: #6B7280;
`;

const SummaryValue = styled.span`
  color: #111827;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const InfoValue = styled.div`
  font-size: 0.9rem;
  color: #111827;
  font-weight: 500;
`;

const PickupMapLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #E8920A;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: opacity 0.12s;

  &:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  svg {
    font-size: 0.75rem;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2.5rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
`;

const ErrorTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #EF4444;
  margin: 0 0 0.5rem;
`;

const ErrorMessage = styled.p`
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
`;

// Update Tracking Modal Component
const UpdateTrackingModal = ({ orderId, currentStatus, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: currentStatus || 'processing',
    message: '',
    location: '',
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await orderService.addTrackingUpdate(orderId, data);
    },
    onSuccess: (response, variables) => {
      toast.success('Tracking update added successfully!');
      queryClient.invalidateQueries({ queryKey: ['orderTracking'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sellerOrder', orderId] });

      // If order status is "delivered", invalidate balance queries to update available balance
      if (variables.status === 'delivered' || variables.status === 'Delivered') {
        queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
        queryClient.invalidateQueries({ queryKey: ['sellerBalance'] });
        queryClient.refetchQueries({
          queryKey: ['payoutBalance'],
          type: 'active'
        });
        queryClient.refetchQueries({
          queryKey: ['sellerBalance'],
          type: 'active'
        });
      }

      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update tracking');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.status || !formData.message.trim()) {
      toast.error('Status and message are required');
      return;
    }
    updateMutation.mutate({
      status: formData.status,
      message: formData.message.trim(),
      location: formData.location.trim() || '',
    });
  };

  const statusOptions = [
    { value: 'payment_completed', label: 'Payment Completed' },
    { value: 'processing', label: 'Processing Order' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing for Dispatch' },
    { value: 'ready_for_dispatch', label: 'Rider Assigned' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Update Tracking Status</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Status *</Label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Message *</Label>
            <TextArea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter tracking update message..."
              rows={4}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Location (Optional)</Label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location if applicable..."
            />
          </FormGroup>
          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Tracking'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  color: #9CA3AF;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: #F9F8F5;
    color: #111827;
  }
`;

const Form = styled.form`
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
`;

const Select = styled.select`
  height: 38px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background: #F9F8F5;
  cursor: pointer;
  outline: none;
  transition: border-color 0.12s, background 0.12s;

  &:focus {
    border-color: #E8920A;
    background: #FFFFFF;
  }
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background: #F9F8F5;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.12s, background 0.12s;

  &:focus {
    border-color: #E8920A;
    background: #FFFFFF;
  }
`;

const Input = styled.input`
  height: 38px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background: #F9F8F5;
  outline: none;
  transition: border-color 0.12s, background 0.12s;

  &:focus {
    border-color: #E8920A;
    background: #FFFFFF;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const CancelButton = styled.button`
  height: 36px;
  padding: 0 1rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  background: #FFFFFF;
  color: #6B7280;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;

  &:hover:not(:disabled) {
    border-color: #D1D5DB;
    color: #111827;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  height: 36px;
  padding: 0 1rem;
  border: none;
  border-radius: 9px;
  background: #E8920A;
  color: #FFFFFF;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UpdateTrackingButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 34px;
  padding: 0 0.9rem;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;
  margin-left: auto;

  &:hover {
    opacity: 0.85;
  }

  svg {
    font-size: 0.75rem;
  }
`;

