import React from 'react';
import styled from 'styled-components';

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: 'transparent' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) {
      return { level: 1, label: 'Weak', color: 'var(--color-red-500)' };
    } else if (strength <= 4) {
      return { level: 2, label: 'Fair', color: 'var(--color-yellow-500)' };
    } else if (strength <= 5) {
      return { level: 3, label: 'Good', color: 'var(--color-blue-500)' };
    } else {
      return { level: 4, label: 'Strong', color: 'var(--color-green-500)' };
    }
  };

  const strength = getStrength(password);

  return (
    <Container>
      <BarContainer>
        {[1, 2, 3, 4].map((level) => (
          <Bar
            key={level}
            $active={level <= strength.level}
            $color={strength.color}
          />
        ))}
      </BarContainer>
      {password && (
        <Label $color={strength.color}>
          Password Strength: {strength.label}
        </Label>
      )}
    </Container>
  );
};

export default PasswordStrengthIndicator;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const BarContainer = styled.div`
  display: flex;
  gap: 4px;
  height: 4px;
`;

const Bar = styled.div`
  flex: 1;
  height: 100%;
  background: ${props => props.$active ? props.$color : 'var(--color-grey-200)'};
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const Label = styled.span`
  font-size: var(--font-size-xs);
  color: ${props => props.$color};
  font-weight: var(--font-medium);
`;

