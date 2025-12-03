import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * Shared styled components for Support pages
 * Used by both Seller and Admin support pages
 */

// Container
export const SupportContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: var(--spacing-lg);
  
  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

// Hero Section
export const HeroSection = styled(motion.section)`
  background: linear-gradient(135deg, 
    ${props => props.$primaryColor || 'var(--color-primary-500)'} 0%, 
    ${props => props.$secondaryColor || 'var(--color-primary-600)'} 100%
  );
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-3xl) var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  color: var(--color-white-0);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

export const HeroIcon = styled.div`
  font-size: 6rem;
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

export const HeroTitle = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }
`;

export const HeroSubtext = styled.p`
  font-size: var(--font-size-lg);
  opacity: 0.95;
  max-width: 70rem;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`;

// Grid Layouts
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

export const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  
  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Cards
export const SupportCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$accentColor || 'var(--color-primary-500)'};
    transform: scaleY(0);
    transition: transform var(--transition-base);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: ${props => props.$accentColor || 'var(--color-primary-500)'};
    
    &::before {
      transform: scaleY(1);
    }
  }
`;

export const CardIcon = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: var(--border-radius-lg);
  background: ${props => props.$bgColor || 'var(--color-primary-100)'};
  color: ${props => props.$iconColor || 'var(--color-primary-500)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-base);
  
  ${SupportCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

export const CardTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--color-grey-800);
  font-family: var(--font-heading);
`;

export const CardDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
`;

export const CardButton = styled.button`
  background: ${props => props.$bgColor || 'var(--color-primary-500)'};
  color: var(--color-white-0);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  width: 100%;
  
  &:hover {
    background: ${props => props.$hoverColor || 'var(--color-primary-600)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Alert/Critical Cards (Admin)
export const AlertCard = styled(motion.div)`
  background: ${props => {
    if (props.$priority === 'critical') return 'var(--color-red-100)';
    if (props.$priority === 'high') return 'var(--color-yellow-100)';
    return 'var(--color-blue-100)';
  }};
  border-left: 4px solid ${props => {
    if (props.$priority === 'critical') return 'var(--color-red-700)';
    if (props.$priority === 'high') return 'var(--color-yellow-700)';
    return 'var(--color-blue-700)';
  }};
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
`;

export const AlertTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: ${props => {
    if (props.$priority === 'critical') return 'var(--color-red-700)';
    if (props.$priority === 'high') return 'var(--color-yellow-700)';
    return 'var(--color-blue-700)';
  }};
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

export const AlertDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  line-height: 1.6;
`;

// Quick Links Section
export const QuickLinksSection = styled.section`
  margin-bottom: var(--spacing-2xl);
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-grey-800);
  font-family: var(--font-heading);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xl);
  }
`;

export const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const QuickLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--color-grey-700);
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
  
  &:hover {
    border-color: ${props => props.$accentColor || 'var(--color-primary-500)'};
    color: ${props => props.$accentColor || 'var(--color-primary-500)'};
    transform: translateX(4px);
    box-shadow: var(--shadow-sm);
  }
`;

// Chat CTA Section
export const ChatSection = styled.section`
  background: linear-gradient(135deg, var(--color-grey-50) 0%, var(--color-white-0) 100%);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  border: 1px solid var(--color-grey-200);
`;

export const ChatButton = styled.button`
  background: ${props => props.$bgColor || 'var(--color-primary-500)'};
  color: var(--color-white-0);
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  
  &:hover {
    background: ${props => props.$hoverColor || 'var(--color-primary-600)'};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Admin Tools Section
export const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
`;

export const ToolButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border: 2px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: var(--color-grey-700);
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
  text-align: center;
  
  &:hover {
    border-color: ${props => props.$accentColor || 'var(--color-primary-500)'};
    color: ${props => props.$accentColor || 'var(--color-primary-500)'};
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

export const ToolIcon = styled.div`
  font-size: 2.4rem;
  color: ${props => props.$iconColor || 'var(--color-primary-500)'};
`;

