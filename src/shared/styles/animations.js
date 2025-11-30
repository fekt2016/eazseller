import { keyframes } from "styled-components";

// Spin animation - for rotating spinners
export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Pulse animation - for pulsing effects
export const pulse = keyframes`
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.5; 
    transform: scale(0.95);
  }
`;

// Float animation - for floating effects
export const float = keyframes`
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-10px); 
  }
`;

// Fade in animation - for smooth appearance
export const fadeIn = keyframes`
  0% { 
    opacity: 0; 
    transform: translateY(10px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
`;

// Slide down animation - for dropdowns and menus
export const slideDown = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Zoom in animation - for modal and overlay entrances
export const zoomIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Shimmer animation - for skeleton loaders
export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Bounce animation - for attention-grabbing elements
export const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Slide up animation - for bottom sheets
export const slideUp = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Fade out animation
export const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

