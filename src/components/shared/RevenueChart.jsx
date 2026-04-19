import styled from 'styled-components';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import CurrencyDisplay, { formatGHS } from './CurrencyDisplay';

const Card = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.8rem;
`;

const Title = styled.h3`
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
`;

const Period = styled.span`
  font-size: 1.1rem;
  color: #6B7280;
`;

const Sub = styled.div`
  margin: 0.35rem 0 0.75rem;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
`;

const Total = styled(CurrencyDisplay)`
  color: #E8920A;
  font-size: 1.9rem;
  font-weight: 600;
`;

const Note = styled.span`
  color: #6B7280;
  font-size: 1.1rem;
`;

const ChartWrap = styled.div`
  width: 100%;
  min-width: 0;
  height: 120px;
  min-height: 120px;
`;

const EmptyNote = styled.div`
  color: #6B7280;
  font-size: 1.1rem;
  margin-top: 0.4rem;
`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '0.5px solid #F1EFE8',
        borderRadius: '8px',
        padding: '6px 8px',
      }}
    >
      <div style={{ fontSize: '11px', color: '#6B7280' }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#111827', fontWeight: 600 }}>
        {formatGHS(payload[0].value)}
      </div>
    </div>
  );
}

export default function RevenueChart({
  title,
  periodLabel,
  subtitle,
  totalRevenue,
  data,
}) {
  const safe = Array.isArray(data) && data.length > 0
    ? data.map((d) => ({ ...d, amount: Number(d.amount || 0) }))
    : [
        { label: 'A', amount: 0 },
        { label: 'B', amount: 0 },
        { label: 'C', amount: 0 },
        { label: 'D', amount: 0 },
      ];
  const hasPositive = safe.some((d) => d.amount > 0);

  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        <Period>{periodLabel}</Period>
      </Header>
      <Sub>
        <Total amount={totalRevenue} />
        <Note>{subtitle}</Note>
      </Sub>
      <ChartWrap>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={safe}>
            <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `GH₵${Number(v || 0).toLocaleString('en-GH')}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="amount"
              radius={[4, 4, 0, 0]}
              fill="#E8920A"
              minPointSize={4}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrap>
      {!hasPositive ? <EmptyNote>No revenue data yet</EmptyNote> : null}
    </Card>
  );
}

