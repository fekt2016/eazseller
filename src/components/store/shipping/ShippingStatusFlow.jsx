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
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #6B7280;
  
  margin-bottom: 1rem;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  padding-left: 1rem;
`;

const StatusIcon = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $color }) => {
    switch ($color) {
      case 'green': return '#3B6D11';
      case 'blue': return '#185FA5';
      case 'primary': return '#E8920A';
      case 'yellow': return '#854F0B';
      case 'red': return '#A32D2D';
      default: return '#F9F8F5';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'green': return '#3B6D11';
      case 'blue': return '#185FA5';
      case 'primary': return '#E8920A';
      case 'yellow': return '#854F0B';
      case 'red': return '#A32D2D';
      default: return '#374151';
    }
  }};
  font-size: 1.1rem;
  z-index: 2;
`;

const StatusContent = styled.div`
  flex: 1;
  padding-top: 1rem;
`;

const StatusLabel = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
  margin-bottom: 1rem;
`;

const StatusDescription = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  
  line-height: 1.5;
  margin: 0;
`;

const ConnectorLine = styled.div`
  position: absolute;
  left: 23px;
  top: 48px;
  width: 2px;
  height: calc(100% + 1rem);
  background: #E5E7EB;
  z-index: 1;
`;

