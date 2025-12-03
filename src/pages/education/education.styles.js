import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Styled components for Seller Education Center Page
 * Modern, clean design inspired by Shopify Learn and Amazon Seller University
 */

// Main Container
export const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-white-0);
  overflow-x: hidden;
`;

// Hero Section
export const HeroSection = styled(motion.section)`
  position: relative;
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: linear-gradient(135deg, 
    var(--color-brand-50) 0%, 
    var(--color-white-0) 50%,
    var(--color-primary-50) 100%
  );
  text-align: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const HeroContent = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

export const HeroIcon = styled(motion.div)`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: var(--color-brand-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  color: var(--color-brand-500);
  font-size: var(--font-size-3xl);
  
  @media ${devicesMax.md} {
    width: 6rem;
    height: 6rem;
    font-size: var(--font-size-2xl);
  }
`;

export const HeroTitle = styled(motion.h1)`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  line-height: 1.2;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-3xl);
  }
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
  }
`;

export const HeroSubtitle = styled(motion.p)`
  font-size: var(--font-size-xl);
  color: var(--color-grey-600);
  max-width: 80rem;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.6;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-md);
  }
`;

// Search Bar
export const SearchBarContainer = styled(motion.div)`
  max-width: 60rem;
  margin: 0 auto;
  position: relative;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-md) var(--spacing-xl);
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  transition: all var(--transition-base);
  background: var(--color-white-0);
  box-shadow: var(--shadow-sm);
  
  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1), var(--shadow-md);
  }
  
  &::placeholder {
    color: var(--color-grey-400);
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-400);
  font-size: var(--font-size-lg);
  pointer-events: none;
`;

// Section Wrapper
export const SectionWrapper = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  max-width: 120rem;
  margin: 0 auto;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  text-align: center;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const SectionDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  max-width: 70rem;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.7;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

// Categories Grid
export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const CategoryCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  cursor: pointer;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
`;

export const CategoryIcon = styled.div`
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: ${props => props.$bgColor || 'var(--color-brand-50)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  color: ${props => props.$iconColor || 'var(--color-brand-500)'};
  font-size: var(--font-size-2xl);
`;

export const CategoryTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

export const CategoryDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
`;

// Videos Grid
export const VideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const VideoCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  cursor: pointer;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
`;

export const VideoThumbnail = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &::before {
    content: '▶';
    position: absolute;
    font-size: 4rem;
    color: var(--color-white-0);
    background: rgba(0, 0, 0, 0.6);
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
`;

export const VideoInfo = styled.div`
  padding: var(--spacing-lg);
`;

export const VideoTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-heading);
`;

export const VideoDuration = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-weight: var(--font-medium);
`;

// Guides Section
export const GuidesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const GuideCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
`;

export const GuideTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
`;

export const GuideSteps = styled.ol`
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
  margin: 0;
  
  li {
    counter-increment: step-counter;
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-xl);
    position: relative;
    font-size: var(--font-size-md);
    color: var(--color-grey-700);
    line-height: 1.6;
    
    &::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: var(--color-brand-500);
      color: var(--color-white-0);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-bold);
      font-size: var(--font-size-sm);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const GuideList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    margin-bottom: var(--spacing-sm);
    padding-left: var(--spacing-lg);
    position: relative;
    font-size: var(--font-size-md);
    color: var(--color-grey-700);
    line-height: 1.6;
    
    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--color-brand-500);
      font-weight: var(--font-bold);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

// Resource Section
export const ResourceList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const ResourceItem = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  text-decoration: none;
  transition: all var(--transition-base);
  
  &:hover {
    border-color: var(--color-brand-500);
    box-shadow: var(--shadow-md);
    transform: translateX(4px);
  }
`;

export const ResourceLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

export const ResourceIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--color-brand-50);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-500);
  font-size: var(--font-size-lg);
`;

export const ResourceText = styled.div`
  h4 {
    font-size: var(--font-size-md);
    font-weight: var(--font-semibold);
    color: var(--color-grey-900);
    margin-bottom: 0.2rem;
    font-family: var(--font-heading);
  }
  
  p {
    font-size: var(--font-size-sm);
    color: var(--color-grey-600);
    margin: 0;
  }
`;

export const ResourceArrow = styled.div`
  color: var(--color-brand-500);
  font-size: var(--font-size-lg);
`;

// CTA Section
export const CTASection = styled(motion.section)`
  background: linear-gradient(135deg, 
    var(--color-brand-500) 0%, 
    var(--color-brand-600) 100%
  );
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  margin: var(--spacing-3xl) var(--spacing-lg);
  max-width: 120rem;
  margin-left: auto;
  margin-right: auto;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
    margin: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const CTATitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const CTASubtitle = styled.p`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
  opacity: 0.95;
  max-width: 60rem;
  margin-left: auto;
  margin-right: auto;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
`;

export const CTAButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: ${props => props.$variant === 'outline' 
    ? 'transparent' 
    : 'var(--color-white-0)'};
  color: ${props => props.$variant === 'outline' 
    ? 'var(--color-white-0)' 
    : 'var(--color-brand-500)'};
  border: 2px solid var(--color-white-0);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  text-decoration: none;
  transition: all var(--transition-base);
  font-family: var(--font-heading);
  
  &:hover {
    background: ${props => props.$variant === 'outline' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'var(--color-grey-50)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
