import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarAlt, FaClipboard, FaMapMarkerAlt, FaMoneyBillWave, FaPrint, FaTruck, FaUser } from 'react-icons/fa';
import BreadcrumbNav from '../../components/shared/BreadcrumbNav';
import DispatchInstructions from '../../components/shared/DispatchInstructions';
import EarningsPanel from '../../components/shared/EarningsPanel';
import InfoCard from '../../components/shared/InfoCard';
import InfoRow from '../../components/shared/InfoRow';
import OrderItemsList from '../../components/shared/OrderItemsList';
import OrderTimeline from '../../components/shared/OrderTimeline';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatOrderDate, formatOrderNumber } from '../../shared/utils/dashboardFormatters';
import { PATHS } from '../../routes/routePaths';
import { useGetSellerOrder, useUpdateSellerOrderStatus } from '../../shared/hooks/useOrder';
import { useGetEarningsByOrder } from '../../shared/hooks/useBalance';

const DELIVERY_LABELS = {
  saiisai_dispatch_rider: 'Saiisai Dispatch Rider',
  pickup: 'Store Pickup',
  pickup_center: 'Store Pickup',
  dispatch: 'Saiisai Dispatch Rider',
  seller_delivery: 'Seller delivery',
  eazshop_dispatch: 'Eazshop Dispatch',
};

const NEXT_STATUS_MAP = {
  pending: { label: 'Confirm order', next: 'confirmed' },
  pending_payment: { label: 'Confirm order', next: 'confirmed' },
  confirmed: { label: 'Mark as processing', next: 'processing' },
  processing: { label: 'Mark as shipped', next: 'shipped' },
  preparing: { label: 'Mark as shipped', next: 'shipped' },
  ready_for_dispatch: { label: 'Mark as shipped', next: 'shipped' },
  shipped: { label: 'Mark as delivered', next: 'delivered' },
  out_for_delivery: { label: 'Mark as delivered', next: 'delivered' },
  delivered: null,
  completed: null,
  cancelled: null,
};

const normalizeStatus = (status) => {
  const raw = String(status || '').toLowerCase();
  if (!raw) return 'pending';
  if (raw === 'delievered') return 'delivered';
  return raw;
};

const formatDateTime = (value) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const addressToText = (address) => {
  if (!address) return 'Not provided';
  const parts = [
    address.streetAddress || address.street,
    address.area || address.landmark,
    address.city,
    address.region || address.state,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Not provided';
};

export default function OrderDetailPage() {
  const { id: sellerOrderId } = useParams();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState(false);
  const { data, isLoading, isError, error, refetch } = useGetSellerOrder(sellerOrderId);
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateSellerOrderStatus();
  const { data: earningsData, isLoading: isEarningsLoading } = useGetEarningsByOrder(sellerOrderId);

  const sellerOrder = useMemo(() => data?.data?.data?.order || null, [data]);
  const parentOrder = sellerOrder?.order || {};
  const buyer = parentOrder?.user || {};

  const orderNumberDisplay = formatOrderNumber(
    parentOrder?.orderNumber || sellerOrder?.orderNumber,
    sellerOrder?._id || parentOrder?._id
  );
  const orderStatus = normalizeStatus(
    parentOrder?.currentStatus || sellerOrder?.status || parentOrder?.status
  );
  const paymentStatus = normalizeStatus(parentOrder?.paymentStatus);
  const payoutStatus = normalizeStatus(
    sellerOrder?.payoutStatus || parentOrder?.sellerPayoutStatus
  );
  const deliveryMethod = parentOrder?.deliveryMethod || sellerOrder?.deliveryMethod;
  const trackingNumber = parentOrder?.trackingNumber || sellerOrder?.tracking?.number || '';
  const nextAction = NEXT_STATUS_MAP[orderStatus] || null;

  const earningsPayload =
    earningsData?.data || earningsData || null;

  const handleUpdateStatus = async (status) => {
    if (!parentOrder?._id || !status) return;
    setActionError('');
    try {
      await updateStatus({ orderId: parentOrder._id, status });
      await refetch();
    } catch (e) {
      setActionError(e?.message || 'Failed to update status');
    }
  };

  const handleCancel = async () => {
    if (!parentOrder?._id) return;
    const ok = window.confirm('Cancel this order? This action cannot be undone.');
    if (!ok) return;
    await handleUpdateStatus('cancelled');
  };

  const handleCopyTracking = async () => {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setActionError('Could not copy tracking number');
    }
  };

  if (isLoading) {
    return (
      <StateCard>
        <h3>Loading order details...</h3>
      </StateCard>
    );
  }

  if (isError) {
    return (
      <StateCard>
        <h3>Failed to load order</h3>
        <p>{error?.message || 'Something went wrong'}</p>
        <ActionBtn type="button" onClick={() => refetch()}>
          Try again
        </ActionBtn>
      </StateCard>
    );
  }

  if (!sellerOrder?._id) {
    return (
      <StateCard>
        <h3>Order not found</h3>
        <ActionBtn type="button" onClick={() => navigate(PATHS.ORDERS)}>
          Back to orders
        </ActionBtn>
      </StateCard>
    );
  }

  return (
    <Page>
      <Topbar>
        <BreadcrumbNav orderNumber={orderNumberDisplay} ordersPath={PATHS.ORDERS} />
      </Topbar>

        <Header>
        <div>
          <Title>{orderNumberDisplay}</Title>
          <Sub>{formatOrderDate(parentOrder?.createdAt || sellerOrder?.createdAt)}</Sub>
        </div>
        <HeaderActions>
          <GhostBtn type="button" onClick={() => window.print()}>
            <FaPrint size={12} />
            <span>Print Invoice</span>
          </GhostBtn>
          {nextAction ? (
            <ActionBtn
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus(nextAction.next)}
            >
              {isUpdating ? 'Updating...' : nextAction.label}
            </ActionBtn>
          ) : null}
        </HeaderActions>
        </Header>

      {actionError ? <ErrorText>{actionError}</ErrorText> : null}

      <OrderTimeline status={orderStatus} paymentStatus={paymentStatus} />

      <Grid>
        <InfoCard icon={<FaUser size={12} />} title="Customer information">
          <InfoRow label="Customer" value={buyer?.name || 'Not provided'} />
          <InfoRow label="Email" value={buyer?.email || 'Not provided'} />
          <InfoRow label="Phone" value={buyer?.phone || 'Not provided'} />
          <InfoRow label="Shipping address" value={addressToText(parentOrder?.shippingAddress)} />
          <InfoRow label="Billing address" value={addressToText(parentOrder?.billingAddress)} last />
                  </InfoCard>

        <InfoCard icon={<FaCalendarAlt size={12} />} title="Order information">
          <InfoRow
            label="Order date"
            value={formatDateTime(parentOrder?.createdAt || sellerOrder?.createdAt)}
          />
          <InfoRow
            label="Delivery method"
            value={DELIVERY_LABELS[deliveryMethod] || deliveryMethod || 'Not provided'}
          />
          <InfoRow label="Payment method" value={parentOrder?.paymentMethod || 'Not provided'} />
          <InfoRow
            label="Payment status"
            valueAs={<StatusBadge status={paymentStatus} />}
          />
          <InfoRow
            label="Payout status"
            valueAs={<StatusBadge status={payoutStatus} />}
          />
          <InfoRow
            label="Tracking number"
            valueAs={
              trackingNumber ? (
                <TrackWrap>
                  <TrackCode>{trackingNumber}</TrackCode>
                  <CopyBtn type="button" onClick={handleCopyTracking} aria-label="Copy tracking number">
                    <FaClipboard size={11} />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </CopyBtn>
                </TrackWrap>
              ) : (
                'Not provided'
              )
            }
            last
          />
          <DispatchWrap>
            <DispatchInstructions deliveryMethod={deliveryMethod} />
          </DispatchWrap>
                  </InfoCard>

        <RightColumn>
          <EarningsPanel
            earnings={earningsPayload}
            isLoading={isEarningsLoading}
          />

          <ActionCard>
            <ActionTitle>Order status action</ActionTitle>
            <ActionRow>
              <span>Current status</span>
              <StatusBadge status={orderStatus} />
            </ActionRow>
            {nextAction ? (
              <ActionBtn
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(nextAction.next)}
              >
                {isUpdating ? 'Updating...' : nextAction.label}
              </ActionBtn>
            ) : (
              <Muted>Final state reached</Muted>
            )}
            {(orderStatus === 'pending' || orderStatus === 'confirmed') ? (
              <DangerGhostBtn type="button" onClick={handleCancel} disabled={isUpdating}>
                Cancel order
              </DangerGhostBtn>
            ) : null}
          </ActionCard>

          <OrderItemsList items={sellerOrder?.items || []} />
        </RightColumn>
      </Grid>
    </Page>
  );
}

const Page = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
`;

const Topbar = styled.div`
  height: 52px;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
`;

const Header = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #111827;
  font-size: 1.8rem;
  font-weight: 500;
`;

const Sub = styled.p`
  color: #6B7280;
  font-size: 1.2rem;
  margin-top: 0.2rem;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const BaseBtn = styled.button`
  height: 36px;
  border-radius: 9px;
  padding: 0 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  border: 0.5px solid transparent;
`;

const GhostBtn = styled(BaseBtn)`
  background: #FFFFFF;
  color: #374151;
  border-color: #F1EFE8;
`;

const ActionBtn = styled(BaseBtn)`
  background: #E8920A;
  color: #FFFFFF;
`;

const DangerGhostBtn = styled(BaseBtn)`
  width: 100%;
  justify-content: center;
  background: #FFFFFF;
  color: #A32D2D;
  border-color: #FCEBEB;
`;

const ErrorText = styled.div`
  color: #A32D2D;
  font-size: 1.2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 300px;
  gap: 1rem;

  @media (max-width: 1160px) {
    grid-template-columns: 1fr;
  }
`;

const RightColumn = styled.div`
  display: grid;
  gap: 1rem;
  align-content: start;
`;

const ActionCard = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.2rem;
`;

const ActionTitle = styled.h3`
  font-size: 1.2rem;
  color: #111827;
  margin-bottom: 0.8rem;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
  color: #6B7280;
  font-size: 1.2rem;
`;

const Muted = styled.div`
  color: #6B7280;
  font-size: 1.2rem;
`;

const TrackWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
`;

const TrackCode = styled.code`
  font-size: 1.2rem;
  color: #185FA5;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
`;

const CopyBtn = styled.button`
  border: 0.5px solid #F1EFE8;
  background: #FFFFFF;
  border-radius: 9px;
  height: 28px;
  padding: 0 0.5rem;
  color: #374151;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
`;

const DispatchWrap = styled.div`
  margin-top: 0.8rem;
`;

const StateCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.8rem;
  text-align: center;
  display: grid;
  gap: 0.8rem;
`;
