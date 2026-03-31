import styled from 'styled-components';
import { devicesMax } from '../../styles/breakpoint';

export const Overlay = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

export const Banner = styled.div`
  max-width: 48rem;
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #F1EFE8;
  overflow: hidden;

  @media ${devicesMax.sm} {
    max-width: 100%;
  }
`;

export const BannerContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media ${devicesMax.sm} {
    padding: 1.5rem;
  }
`;

export const BannerText = styled.div``;

export const BannerTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;

  @media ${devicesMax.sm} {
    font-size: 0.9rem;
  }
`;

export const BannerDescription = styled.p`
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;

  a {
    color: #E8920A;
    text-decoration: underline;
    font-weight: 500;

    &:hover {
      color: #D97706;
    }
  }
`;

export const BannerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

export const PrimaryButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: linear-gradient(
    135deg,
    #E8920A 0%,
    #E8920A 100%
  );
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;

  &:hover {
    opacity: 0.95;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SecondaryButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: #ffffff;
  color: #374151;
  border: 2px solid #E5E7EB;
  border-radius: 9px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: #F9F8F5;
    border-color: #9CA3AF;
  }
`;

export const TertiaryButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #E8920A;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

export const CustomizePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #F1EFE8;
`;

export const CustomizeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  small {
    font-size: 0.8rem;
    color: #6B7280;
    margin-left: 1.75rem;
  }
`;

export const CustomizeLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1F2937;
  cursor: pointer;
  font-weight: 500;
`;

export const CustomizeCheckbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: #E8920A;
`;
