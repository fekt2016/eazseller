import styled from 'styled-components';
import { formatGHS } from '../../shared/utils/dashboardFormatters';

export { formatGHS };

const Amount = styled.span`
  font-variant-numeric: tabular-nums;
`;

export default function CurrencyDisplay({ amount, className }) {
  return <Amount className={className}>{formatGHS(amount)}</Amount>;
}

