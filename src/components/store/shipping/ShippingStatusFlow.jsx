import styled from "styled-components";
import { FaCheckCircle, FaClock, FaBox, FaTruck, FaHome, FaTimesCircle, FaUndo } from "react-icons/fa";

const statusConfig = [
  {
    key: 'pending',
    label: 'Pending',
    description: 'Order placed; seller must prepare package',
    icon: FaClock,
    color: 'grey',
  },
  {
    key: 'ready_for_dispatch',
    label: 'Ready for Pickup',
    description: 'Seller marked order as ready',
    icon: FaBox,
    color: 'blue',
  },
  {
    key: 'picked_up',
    label: 'Picked Up',
    description: 'Courier collected the package',
    icon: FaTruck,
    color: 'blue',
  },
  {
    key: 'in_transit',
    label: 'In Transit',
    description: 'Package moving through Ghana logistics network',
    icon: FaTruck,
    color: 'blue',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Rider attempting final delivery',
    icon: FaHome,
    color: 'primary',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Customer received item',
    icon: FaCheckCircle,
    color: 'green',
  },
  {
    key: 'delivery_failed',
    label: 'Delivery Failed',
    description: 'Courier attempted but customer unavailable',
    icon: FaTimesCircle,
    color: 'yellow',
  },
  {
    key: 'returned_to_sender',
    label: 'Returned to Sender',
    description: 'Customer rejected item or delivery failed multiple times',
    icon: FaUndo,
    color: 'red',
  },
];

export default function ShippingStatusFlow() {
  return (
    <StatusFlowContainer>
      <SectionTitle>Shipping Status Flow</SectionTitle>
      <Description>
        Track your order through each stage of the delivery process
      </Description>
      
      <StatusList>
        {statusConfig.map((status, index) => {
          const Icon = status.icon;
          return (
            <StatusItem key={status.key}>
              <StatusIcon $color={status.color}>
                <Icon />
              </StatusIcon>
              <StatusContent>
                <StatusLabel>{status.label}</StatusLabel>
                <StatusDescription>{status.description}</StatusDescription>
              </StatusContent>
              {index < statusConfig.length - 1 && <ConnectorLine />}
            </StatusItem>
          );
        })}
      </StatusList>
    </StatusFlowContainer>
  );
}

// Styled Components
const StatusFlowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-xs);
`;

const Description = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  margin-bottom: var(--spacing-lg);
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: relative;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  position: relative;
  padding-left: var(--spacing-sm);
`;

const StatusIcon = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-cir);
  background: ${({ $color }) => {
    switch ($color) {
      case 'green': return 'var(--color-green-100)';
      case 'blue': return 'var(--color-blue-100)';
      case 'primary': return 'var(--color-primary-100)';
      case 'yellow': return 'var(--color-yellow-100)';
      case 'red': return 'var(--color-red-100)';
      default: return 'var(--color-grey-100)';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'green': return 'var(--color-green-700)';
      case 'blue': return 'var(--color-blue-700)';
      case 'primary': return 'var(--color-primary-700)';
      case 'yellow': return 'var(--color-yellow-700)';
      case 'red': return 'var(--color-red-700)';
      default: return 'var(--color-grey-700)';
    }
  }};
  font-size: var(--font-size-lg);
  z-index: 2;
`;

const StatusContent = styled.div`
  flex: 1;
  padding-top: var(--spacing-xs);
`;

const StatusLabel = styled.h4`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
  margin-bottom: var(--spacing-xs);
`;

const StatusDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  line-height: 1.5;
  margin: 0;
`;

const ConnectorLine = styled.div`
  position: absolute;
  left: 23px;
  top: 48px;
  width: 2px;
  height: calc(100% + var(--spacing-md));
  background: var(--color-grey-300);
  z-index: 1;
`;

