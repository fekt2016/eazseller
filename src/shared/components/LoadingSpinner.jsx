import styled from "styled-components";
import { spin } from "../styles/animations";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ fullScreen }) => fullScreen && `min-height: 100vh;`}
`;

const Spinner = styled.div`
  animation: ${spin} 1s linear infinite;
  border-radius: 50%;
  border: 2px solid transparent;

  ${({ size }) => {
    switch (size) {
      case "sm":
        return `
        width: 1.5rem;
        height: 1.5rem;
        border-width: 1.5px;
      `;
      case "lg":
        return `
        width: 4rem;
        height: 4rem;
        border-width: 3px;
      `;
      default:
        return `
        width: 3rem;
        height: 3rem;
        border-width: 2px;
      `;
    }
  }}

  border-top-color: ${({ color }) =>
    color || "var(--color-primary-500)"};
  border-bottom-color: ${({ color }) =>
    color || "var(--color-primary-500)"};
`;
export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
export function LoadingSpinner({ size = "md", color, fullScreen = false }) {
  return (
    <Container fullScreen={fullScreen} role="status" aria-live="polite">
      <Spinner size={size} color={color} aria-label="Loading..." />
    </Container>
  );
}
