import styled from 'styled-components';

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #F1EFE8;
  border-radius: 8px;
  padding: 3px;
`;

const Item = styled.button`
  border: 0.5px solid transparent;
  background: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  color: ${({ $active }) => ($active ? '#E8920A' : '#6B7280')};
  height: 30px;
  padding: 0 0.75rem;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  cursor: pointer;

  ${({ $active }) =>
    $active
      ? 'border-color: #F1EFE8;'
      : '&:hover { background: rgba(255,255,255,0.4); }'}
`;

export default function PeriodSelector({ options, value, onChange }) {
  return (
    <Container role="tablist" aria-label="Period selector">
      {options.map((option) => (
        <Item
          key={option.key}
          type="button"
          role="tab"
          aria-selected={value === option.key}
          $active={value === option.key}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </Item>
      ))}
    </Container>
  );
}

