import styled, { css, keyframes } from "styled-components";
import { devicesMax } from "../styles/breakpoint";

const imageFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  background-color: ${({ $bg }) => $bg || "#F9F8F5"};
  border-radius: ${({ $radius }) => $radius || "9px"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledImage = styled.img`
  display: block;
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain;
  object-position: center;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  animation: ${({ $loaded }) => ($loaded ? css`${imageFadeIn} 0.4s ease-out` : "none")};
  transform: none;
`;

export const Skeleton = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #F9F8F5 0%,
    #F1EFE8 50%,
    #F9F8F5 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
