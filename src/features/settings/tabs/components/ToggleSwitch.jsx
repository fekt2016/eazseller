import React from 'react';
import styled from 'styled-components';

const ToggleSwitch = ({ checked, onChange, disabled, label, description }) => {
  return (
    <Container>
      <LabelSection>
        {label && <Label>{label}</Label>}
        {description && <Description>{description}</Description>}
      </LabelSection>
      <SwitchContainer>
        <SwitchInput
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <SwitchSlider $checked={checked} $disabled={disabled} />
      </SwitchContainer>
    </Container>
  );
};

export default ToggleSwitch;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-grey-300);
    background: var(--color-grey-50);
  }
`;

const LabelSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
`;

const Label = styled.label`
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  color: var(--color-grey-900);
  cursor: pointer;
`;

const Description = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.4;
`;

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:focus + span {
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.2);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$checked ? 'var(--color-primary-500)' : 'var(--color-grey-300)'};
  transition: 0.3s;
  border-radius: 24px;
  opacity: ${props => props.$disabled ? 0.5 : 1};

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: var(--color-white-0);
    transition: 0.3s;
    border-radius: 50%;
    transform: ${props => props.$checked ? 'translateX(24px)' : 'translateX(0)'};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

