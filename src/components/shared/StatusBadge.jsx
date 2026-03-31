import styled from 'styled-components';

export const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: '#FAEEDA', color: '#854F0B' },
  pending_payment: { label: 'Pending payment', bg: '#FAEEDA', color: '#854F0B' },
  confirmed: { label: 'Confirmed', bg: '#E6F1FB', color: '#185FA5' },
  processing: { label: 'Processing', bg: '#E6F1FB', color: '#185FA5' },
  preparing: { label: 'Preparing', bg: '#E6F1FB', color: '#185FA5' },
  ready_for_dispatch: { label: 'Ready for dispatch', bg: '#E6F1FB', color: '#185FA5' },
  shipped: { label: 'Shipped', bg: '#FDF3E3', color: '#E8920A' },
  partially_shipped: { label: 'Partially shipped', bg: '#FDF3E3', color: '#E8920A' },
  out_for_delivery: { label: 'Out for delivery', bg: '#FDF3E3', color: '#E8920A' },
  delivered: { label: 'Delivered', bg: '#EAF3DE', color: '#3B6D11' },
  completed: { label: 'Completed', bg: '#EAF3DE', color: '#3B6D11' },
  cancelled: { label: 'Cancelled', bg: '#FCEBEB', color: '#A32D2D' },
  failed: { label: 'Failed', bg: '#FCEBEB', color: '#A32D2D' },
  refunded: { label: 'Refunded', bg: '#E6F1FB', color: '#185FA5' },
  partial_refund: { label: 'Partial refund', bg: '#FDF3E3', color: '#E8920A' },
  paid: { label: 'Paid', bg: '#EAF3DE', color: '#3B6D11' },
  payment_completed: { label: 'Payment completed', bg: '#EAF3DE', color: '#3B6D11' },
  hold: { label: 'On hold', bg: '#FAEEDA', color: '#854F0B' },
  reversed: { label: 'Reversed', bg: '#FCEBEB', color: '#A32D2D' },
  returned: { label: 'Returned', bg: '#FCEBEB', color: '#A32D2D' },
};

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  padding: 0.3rem 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  text-transform: none;
  white-space: nowrap;
`;

const normalizeStatus = (status) => {
  if (!status) return 'pending';
  const value = String(status).toLowerCase();
  if (value === 'delievered') return 'delivered';
  return value;
};

export default function StatusBadge({ status, className }) {
  const key = normalizeStatus(status);
  const config = STATUS_CONFIG[key] || {
    label: key.replace(/_/g, ' '),
    bg: '#F1EFE8',
    color: '#374151',
  };

  return (
    <Badge className={className} $bg={config.bg} $color={config.color}>
      {config.label}
    </Badge>
  );
}

