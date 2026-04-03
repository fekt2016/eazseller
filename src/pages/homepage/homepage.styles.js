import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

/**
 * Saiisai Seller Landing Page — Premium Redesign
 * Modern glassmorphism, bold typography, scroll-reveal animations
 */

// ── Keyframes ─────────────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ── Main Container ────────────────────────────────────────────────
export const LandingContainer = styled.div`
  min-height: 100vh;
  background: #FAFBFC;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
`;

// ── Navigation (kept for compatibility) ───────────────────────────
export const NavButton = styled(motion.button)`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${props => props.$variant === 'primary' ? css`
    background: #00C896;
    color: #fff;
    &:hover { background: #00B386; }
  ` : css`
    background: transparent;
    color: #00C896;
    border: 1.5px solid #00C896;
    &:hover { background: #00C896; color: #fff; }
  `}
`;

export const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  padding: 24px;
  z-index: 999;
  @media (max-width: 768px) { display: block; }
`;

export const MobileNavLink = styled.a`
  display: block;
  color: #1a1a2e;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  &:hover { color: #00C896; }
`;

export const MobileNavButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
`;

// ── Hero Section ──────────────────────────────────────────────────
export const HeroSection = styled(motion.section)`
  position: relative;
  padding: 100px 24px 80px;
  min-height: 92vh;
  display: flex;
  align-items: center;
  background: linear-gradient(160deg, #f8fffe 0%, #eafaf5 30%, #f0fdf9 60%, #fafbfc 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -20%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -15%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0,200,150,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 80px 20px 60px;
    min-height: auto;
  }
`;

export const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  width: 100%;

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
`;

export const HeroLeft = styled.div`
  @media (max-width: 768px) {
    text-align: center;
  }
`;

export const HeroIcon = styled(motion.div)`
  display: none;
`;

export const HeroTag = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 200, 150, 0.08);
  border: 1px solid rgba(0, 200, 150, 0.15);
  border-radius: 100px;
  padding: 8px 18px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #00A67E;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 24px;

  svg {
    font-size: 0.7rem;
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 6px 14px;
  }
`;

export const HeroTitle = styled(motion.h1)`
  font-size: 3.8rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
  line-height: 1.1;
  letter-spacing: -1.5px;

  span {
    background: linear-gradient(135deg, #00C896 0%, #00A67E 50%, #008F6B 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
  }

  @media (max-width: 768px) {
    font-size: 2.4rem;
    letter-spacing: -0.8px;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

export const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #64748b;
  max-width: 500px;
  margin-bottom: 36px;
  line-height: 1.7;

  @media (max-width: 768px) {
    font-size: 1.05rem;
    margin: 0 auto 32px;
  }
`;

export const HeroButtons = styled(motion.div)`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: ${props => props.$justify || 'flex-start'};

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const PrimaryButton = styled(motion.button)`
  padding: 16px 32px;
  background: linear-gradient(135deg, #00C896 0%, #00B386 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 16px rgba(0, 200, 150, 0.25), 0 1px 3px rgba(0, 200, 150, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 200, 150, 0.35), 0 2px 6px rgba(0, 200, 150, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 0.85rem;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

export const SecondaryButton = styled(motion.button)`
  padding: 16px 32px;
  background: rgba(0, 200, 150, 0.06);
  color: #00A67E;
  border: 1.5px solid rgba(0, 200, 150, 0.2);
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: rgba(0, 200, 150, 0.12);
    border-color: rgba(0, 200, 150, 0.35);
    transform: translateY(-2px);
  }
`;

export const HeroRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 768px) {
    margin-top: 48px;
  }
`;

export const HeroIllustration = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  height: 420px;
  background: linear-gradient(145deg, #00C896 0%, #00A67E 40%, #008F6B 100%);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 200, 150, 0.2), 0 10px 30px rgba(0, 200, 150, 0.1);

  svg {
    font-size: 8rem;
    color: rgba(255, 255, 255, 0.15);
    animation: ${float} 6s ease-in-out infinite;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
    animation: ${pulse} 4s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(0,0,0,0.08), transparent);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    max-width: 320px;
    height: 280px;
    border-radius: 24px;
    margin: 0 auto;

    svg {
      font-size: 5rem;
    }
  }
`;

// ── Floating Stats Card (Hero) ────────────────────────────────────
export const FloatingCard = styled(motion.div)`
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 14px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;

  ${props => props.$position === 'top-right' && css`
    top: 20px;
    right: -30px;
    @media (max-width: 768px) {
      top: -10px;
      right: 0;
      transform: scale(0.85);
    }
  `}

  ${props => props.$position === 'bottom-left' && css`
    bottom: 30px;
    left: -30px;
    @media (max-width: 768px) {
      bottom: -10px;
      left: 0;
      transform: scale(0.85);
    }
  `}
`;

export const FloatingCardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${props => props.$bg || 'rgba(0, 200, 150, 0.1)'};
  color: ${props => props.$color || '#00C896'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

export const FloatingCardText = styled.div`
  .value {
    font-size: 1.1rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
  }
  .label {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 500;
  }
`;

// ── Section Shared ────────────────────────────────────────────────
export const SectionWrapper = styled(motion.section)`
  padding: 100px 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 64px 20px;
  }
`;

export const SectionTag = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 200, 150, 0.06);
  border: 1px solid rgba(0, 200, 150, 0.12);
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00A67E;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 auto 16px;
  text-align: center;
  width: fit-content;
`;

export const SectionTitle = styled.h2`
  font-size: 2.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 14px;
  line-height: 1.15;
  letter-spacing: -0.8px;
  text-align: center;

  span {
    color: #00C896;
  }

  @media (max-width: 768px) {
    font-size: 1.9rem;
    letter-spacing: -0.4px;
  }
`;

export const SectionDescription = styled.p`
  font-size: 1.1rem;
  color: #64748b;
  text-align: center;
  max-width: 560px;
  margin: 0 auto 48px;
  line-height: 1.7;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 36px;
  }
`;

// ── Benefits Grid ─────────────────────────────────────────────────
export const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const BenefitCard = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  padding: 36px 32px;
  border: 1px solid #f1f5f9;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 20px;
  align-items: flex-start;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #00C896, #00A67E);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: rgba(0, 200, 150, 0.15);
    box-shadow: 0 12px 40px rgba(0, 200, 150, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 28px 24px;
  }
`;

export const BenefitIcon = styled.div`
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(0, 200, 150, 0.1) 0%, rgba(0, 200, 150, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00C896;
  font-size: 1.2rem;
`;

export const BenefitTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  line-height: 1.3;
`;

export const BenefitDescription = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
`;

export const BenefitTextWrapper = styled.div`
  flex: 1;
`;

// ── Steps Section ─────────────────────────────────────────────────
export const StepsSection = styled(motion.section)`
  background: linear-gradient(180deg, #f8fffe 0%, #f0fdf9 50%, #fafbfc 100%);
  padding: 100px 24px;
  position: relative;

  @media (max-width: 768px) {
    padding: 64px 20px;
  }
`;

export const StepsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const StepCard = styled(motion.div)`
  background: #fff;
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  position: relative;
  border: 1px solid #f1f5f9;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(0, 200, 150, 0.15);
    box-shadow: 0 16px 48px rgba(0, 200, 150, 0.08), 0 4px 12px rgba(0, 0, 0, 0.02);
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

export const StepNumber = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #00C896 0%, #00B386 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(0, 200, 150, 0.3);
`;

export const StepIcon = styled.div`
  font-size: 2rem;
  color: #00C896;
  margin-bottom: 16px;
  opacity: 0.85;
`;

export const StepTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
`;

export const StepDescription = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
`;

// ── Connector Line between steps ──────────────────────────────────
export const StepConnector = styled.div`
  position: absolute;
  top: 60px;
  left: calc(33.33% + 12px);
  width: calc(33.33% - 24px);
  height: 2px;
  background: linear-gradient(90deg, #00C896, rgba(0, 200, 150, 0.3));

  &:last-of-type {
    left: calc(66.66% + 12px);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// ── Trust / Metrics Section ───────────────────────────────────────
export const TrustSection = styled(motion.section)`
  padding: 100px 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 64px 20px;
  }
`;

export const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const TrustCard = styled(motion.div)`
  background: #fff;
  border-radius: 24px;
  padding: 48px 32px;
  text-align: center;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #00C896, #00A67E);
    border-radius: 3px 3px 0 0;
    opacity: 0;
    transition: opacity 0.3s ease, width 0.3s ease;
  }

  &:hover {
    border-color: rgba(0, 200, 150, 0.12);
    box-shadow: 0 12px 40px rgba(0, 200, 150, 0.06);
    &::after {
      opacity: 1;
      width: 80px;
    }
  }
`;

export const TrustNumber = styled.div`
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #00C896 0%, #00A67E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  line-height: 1.1;
  letter-spacing: -1px;
`;

export const TrustLabel = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
`;

// ── Testimonial Section ───────────────────────────────────────────
export const TestimonialSection = styled(motion.section)`
  padding: 100px 24px;
  background: #fff;

  @media (max-width: 768px) {
    padding: 64px 20px;
  }
`;

export const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const TestimonialCard = styled(motion.div)`
  background: ${({ $bgImage, $fallbackBg }) =>
    $bgImage
      ? `linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.95) 0%,
          rgba(255, 255, 255, 0.88) 100%
        ), url(${$bgImage})`
      : $fallbackBg || '#fafbfc'};
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 200, 150, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  }
`;

export const TestimonialQuote = styled.p`
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.7;
  margin-bottom: 20px;
  font-style: italic;
`;

export const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TestimonialAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00C896, #00A67E);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
`;

export const TestimonialInfo = styled.div`
  .name {
    font-size: 0.9rem;
    font-weight: 700;
    color: #0f172a;
  }
  .shop {
    font-size: 0.78rem;
    color: #94a3b8;
  }
`;

// ── CTA Section ───────────────────────────────────────────────────
export const CTASection = styled(motion.section)`
  padding: 0 24px;
  margin: 0 auto 80px;
  max-width: 1200px;

  @media (max-width: 768px) {
    padding: 0 20px;
    margin-bottom: 60px;
  }
`;

export const CTAContainer = styled.div`
  background: linear-gradient(145deg, #00C896 0%, #00A67E 40%, #008F6B 100%);
  background-size: 200% 200%;
  animation: ${gradientShift} 8s ease infinite;
  border-radius: 32px;
  padding: 80px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 56px 28px;
    border-radius: 24px;
  }
`;

export const CTATitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: -0.8px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1.9rem;
  }
`;

export const CTASubtitle = styled.p`
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 36px;
  line-height: 1.7;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

export const CTAButtonPrimary = styled(motion.button)`
  padding: 16px 36px;
  background: #fff;
  color: #00A67E;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

export const CTAButtonSecondary = styled(motion.button)`
  padding: 16px 36px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

// ── Footer Section ────────────────────────────────────────────────
export const FooterSection = styled(motion.footer)`
  background: #0f172a;
  color: #fff;
  padding: 56px 24px 40px;

  @media (max-width: 768px) {
    padding: 40px 20px 32px;
  }
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

export const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 28px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 16px 24px;
  }
`;

export const FooterLink = styled.a`
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #00C896;
  }
`;

export const FooterCopyright = styled.p`
  color: #475569;
  font-size: 0.8rem;
  margin: 0;
`;
