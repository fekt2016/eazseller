import { useMemo } from 'react';
import styled from 'styled-components';

const TimelineWrap = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.2rem 1.4rem 1.6rem;
`;

const Banner = styled.div`
  margin-bottom: 1rem;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  font-size: 1.2rem;
  font-weight: 600;
  background: ${({ $error }) => ($error ? '#FCEBEB' : '#FAEEDA')};
  color: ${({ $error }) => ($error ? '#A32D2D' : '#854F0B')};
`;

const Rail = styled.div`
  position: relative;
  padding: 0 1rem;
`;

const Track = styled.div`
  position: absolute;
  top: 15px;
  left: 28px;
  right: 28px;
  height: 2px;
  background: #F1EFE8;
`;

const Fill = styled.div`
  position: absolute;
  top: 15px;
  left: 28px;
  height: 2px;
  background: #E8920A;
  width: ${({ $pct }) => `${$pct}%`};
  transition: width 600ms ease;
`;

const StepList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(6, minmax(70px, 1fr));
  gap: 0.6rem;
`;

const StepItem = styled.li`
  text-align: center;
`;

const Dot = styled.div`
  width: 26px;
  height: 26px;
  margin: 0 auto 0.4rem;
  border-radius: 9999px;
  font-size: 1.2rem;
  display: grid;
  place-items: center;
  font-weight: 600;
  border: ${({ $state }) => ($state === 'active' ? '2px solid #E8920A' : '1.5px solid #D1D5DB')};
  background: ${({ $state }) => ($state === 'done' ? '#E8920A' : $state === 'active' ? '#FDF3E3' : '#F1EFE8')};
  color: ${({ $state }) => ($state === 'done' ? '#FFFFFF' : $state === 'active' ? '#E8920A' : '#6B7280')};
`;

const Label = styled.div`
  font-size: 1.1rem;
  color: #4B5563;
`;

const STATUS_STEPS = [
  { key: 'pending', label: 'Order placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const normalizeStatus = (value) => {
  const raw = String(value || '').toLowerCase();
  if (!raw || raw === 'pending_payment') return 'pending';
  if (raw === 'delievered' || raw === 'completed') return 'delivered';
  if (raw === 'ready_for_dispatch' || raw === 'preparing') return 'processing';
  if (raw === 'partially_shipped') return 'shipped';
  return raw;
};

export default function OrderTimeline({ status, paymentStatus }) {
  const normalized = normalizeStatus(status);
  const isCancelled = normalized === 'cancelled';
  const isFailed = normalizeStatus(paymentStatus) === 'failed';

  const currentStep = useMemo(() => {
    const idx = STATUS_STEPS.findIndex((step) => step.key === normalized);
    if (idx === -1) return 0;
    return idx + 1;
  }, [normalized]);

  const fillPct = ((Math.max(currentStep - 1, 0)) / (STATUS_STEPS.length - 1)) * 100;

  return (
    <TimelineWrap>
      {isCancelled ? <Banner $error>Order cancelled</Banner> : null}
      {!isCancelled && isFailed ? <Banner $error>Payment failed</Banner> : null}
      <Rail>
        <Track />
        {!isCancelled ? <Fill $pct={fillPct} /> : null}
        <StepList>
          {STATUS_STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            let state = 'upcoming';
            if (!isCancelled && stepNum < currentStep) state = 'done';
            if (!isCancelled && stepNum === currentStep) state = 'active';
            return (
              <StepItem key={step.key}>
                <Dot $state={state}>{state === 'done' ? '✓' : stepNum}</Dot>
                <Label>{step.label}</Label>
              </StepItem>
            );
          })}
        </StepList>
      </Rail>
    </TimelineWrap>
  );
}

