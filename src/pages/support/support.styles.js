import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * Shared styled components for Support pages
 * Used by both Seller and Admin support pages
 */

export const SupportContainer = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

/* Hero */
export const HeroSection = styled(motion.section)`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid #E8920A;
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

export const HeroContent = styled.div``;

export const HeroIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #FDF3E3;
  color: #E8920A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

export const HeroTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.3rem;
`;

export const HeroSubtext = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;
`;

/* Grids */
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
`;

export const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

/* Support Cards */
export const SupportCard = styled(motion.div)`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
  border-left: 3px solid ${(p) => p.$accentColor || '#E8920A'};

  &:hover { background: #FFFDF9; border-color: ${(p) => p.$accentColor || '#E8920A'}; }
`;

export const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(p) => p.$bgColor || '#FDF3E3'};
  color: ${(p) => p.$iconColor || '#E8920A'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-bottom: 0.85rem;
`;

export const CardTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.4rem;
`;

export const CardDescription = styled.p`
  font-size: 0.8rem;
  color: #6B7280;
  line-height: 1.55;
  margin: 0 0 0.85rem;
`;

export const CardButton = styled.button`
  width: 100%;
  height: 34px;
  background: ${(p) => p.$bgColor || '#E8920A'};
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;
  &:hover { opacity: 0.88; }
`;

/* Alert Cards */
export const AlertCard = styled(motion.div)`
  background: ${(p) => p.$priority === 'critical' ? '#FEF2F2' : p.$priority === 'high' ? '#FFFBEB' : '#EFF6FF'};
  border-left: 3px solid ${(p) => p.$priority === 'critical' ? '#EF4444' : p.$priority === 'high' ? '#F59E0B' : '#3B82F6'};
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.5rem;
`;

export const AlertTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(p) => p.$priority === 'critical' ? '#DC2626' : p.$priority === 'high' ? '#D97706' : '#2563EB'};
  margin: 0 0 0.3rem;
`;

export const AlertDescription = styled.p`
  font-size: 0.8rem;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
`;

/* Quick Links */
export const QuickLinksSection = styled.section``;

export const SectionTitle = styled.h2`
  font-size: 0.8rem;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
`;

export const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
`;

export const QuickLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  text-decoration: none;
  color: #374151;
  font-size: 0.825rem;
  transition: all 0.12s;

  &:hover { border-color: #E8920A; color: #E8920A; background: #FFFDF9; }
`;

/* Chat Section */
export const ChatSection = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

export const ChatButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 36px;
  padding: 0 1.1rem;
  background: ${(p) => p.$bgColor || '#E8920A'};
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;
  &:hover { opacity: 0.88; }
`;

/* Tools */
export const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

export const ToolButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  text-decoration: none;
  color: #374151;
  font-size: 0.825rem;
  text-align: center;
  transition: all 0.12s;

  &:hover { border-color: ${(p) => p.$accentColor || '#E8920A'}; color: ${(p) => p.$accentColor || '#E8920A'}; }
`;

export const ToolIcon = styled.div`
  font-size: 1.5rem;
  color: ${(p) => p.$iconColor || '#E8920A'};
`;

