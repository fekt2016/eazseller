import styled from 'styled-components';
import CurrencyDisplay from './CurrencyDisplay';

const toneMap = {
  primary: { bg: '#FDF3E3', color: '#E8920A' },
  success: { bg: '#EAF3DE', color: '#3B6D11' },
  warning: { bg: '#FAEEDA', color: '#854F0B' },
  info: { bg: '#E6F1FB', color: '#185FA5' },
  neutral: { bg: '#F1EFE8', color: '#6B7280' },
};

const Card = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.95rem 1rem 0.9rem;
  position: relative;
  min-height: 108px;
`;

const Accent = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 12px 0 0 12px;
  background: ${({ $color }) => $color};
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const Label = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.div`
  margin-top: 0.6rem;
  color: ${({ $color }) => $color || '#111827'};
  font-size: ${({ $small }) => ($small ? '1.8rem' : '2.2rem')};
  font-weight: 500;
  letter-spacing: -0.02em;
`;

const Trend = styled.div`
  margin-top: 0.4rem;
  font-size: 1.1rem;
  color: ${({ $tone }) =>
    $tone === 'up' ? '#3B6D11' : $tone === 'down' ? '#A32D2D' : '#6B7280'};
`;

export default function KPICard({
  label,
  value,
  icon,
  tone = 'neutral',
  accent = false,
  trendText = '',
  trendTone = 'neutral',
  currency = false,
  smallValue = false,
}) {
  const t = toneMap[tone] || toneMap.neutral;
  return (
    <Card>
      {accent ? <Accent $color={t.color} /> : null}
      <Top>
        <IconWrap $bg={t.bg} $color={t.color}>
          {icon}
        </IconWrap>
        <Label>{label}</Label>
      </Top>
      <Value $color={tone === 'primary' ? '#E8920A' : '#111827'} $small={smallValue}>
        {currency ? <CurrencyDisplay amount={value} /> : value}
      </Value>
      <Trend $tone={trendTone}>{trendText}</Trend>
    </Card>
  );
}

