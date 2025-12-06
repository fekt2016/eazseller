import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStore,
  FaChartLine,
  FaTruck,
  FaWallet,
  FaShoppingBag,
  FaUserPlus,
  FaBox,
  FaDollarSign,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import usePageTitle from '../../shared/hooks/usePageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  LandingContainer,
  NavButton,
  MobileMenu,
  MobileNavLink,
  MobileNavButtons,
  HeroSection,
  HeroContent,
  HeroLeft,
  HeroIcon,
  HeroTitle,
  HeroSubtitle,
  HeroButtons,
  PrimaryButton,
  SecondaryButton,
  HeroRight,
  HeroIllustration,
  SectionWrapper,
  SectionTitle,
  SectionDescription,
  BenefitsGrid,
  BenefitCard,
  BenefitIcon,
  BenefitTitle,
  BenefitDescription,
  StepsSection,
  StepsContainer,
  StepsGrid,
  StepCard,
  StepNumber,
  StepIcon,
  StepTitle,
  StepDescription,
  TrustSection,
  TrustGrid,
  TrustCard,
  TrustNumber,
  TrustLabel,
  CTASection,
  CTAContainer,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButtonPrimary,
  CTAButtonSecondary,
  FooterSection,
  FooterContent,
  FooterLinks,
  FooterLink,
  FooterCopyright,
} from './homepage.styles';


/**
 * EazSeller Home Page
 * Pre-login homepage for sellers to learn about the platform
 */
const EazSellerHomePage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // SEO
  usePageTitle({
    title: 'Sell on EazShop • EazSeller',
    description: 'Join thousands of sellers on EazShop. Create your store, list products, and start selling.',
    keywords: 'EazSeller, sell on EazShop, seller portal, marketplace, online selling',
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Benefits data
  const benefits = [
    {
      icon: <FaStore />,
      title: 'Open Your Store Instantly',
      description: 'Set up your seller account and start selling in minutes.',
    },
    {
      icon: <FaChartLine />,
      title: 'Reach More Customers',
      description: 'Sell to thousands of buyers on EazShop daily.',
    },
    {
      icon: <FaTruck />,
      title: 'Simple Order & Shipping Flow',
      description: 'Manage orders, shipping, and returns easily.',
    },
    {
      icon: <FaWallet />,
      title: 'Fast & Secure Payouts',
      description: 'Receive your earnings quickly through multiple payment options.',
    },
  ];

  // Steps data
  const steps = [
    {
      number: '1',
      icon: <FaUserPlus />,
      title: 'Create an Account',
      description: 'Sign up as a seller and complete your profile verification.',
    },
    {
      number: '2',
      icon: <FaBox />,
      title: 'Add Your Products',
      description: 'List your products with images, descriptions, and pricing.',
    },
    {
      number: '3',
      icon: <FaDollarSign />,
      title: 'Receive Orders & Get Paid',
      description: 'Start receiving orders and get paid securely through our platform.',
    },
  ];

  // Trust metrics
  const metrics = [
    { number: '500+', label: 'Active Sellers' },
    { number: '10,000+', label: 'Monthly Orders' },
    { number: '95%', label: 'Seller Satisfaction' },
  ];

  return (
    <LandingContainer>
      {/* Header is now provided by DashboardLayout */}
      {/* Mobile Menu - Keep for mobile navigation if needed */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <MobileNavLink onClick={() => scrollToSection('benefits')}>
              Features
            </MobileNavLink>
            <MobileNavLink onClick={() => scrollToSection('steps')}>
              How It Works
            </MobileNavLink>
            <MobileNavLink onClick={() => scrollToSection('trust')}>
              Why Choose Us
            </MobileNavLink>
            <MobileNavLink onClick={() => {
              navigate(PATHS.EDUCATION);
              setIsMobileMenuOpen(false);
            }}>
              Education
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => {
                navigate(PATHS.HELP);
                setIsMobileMenuOpen(false);
              }}
              aria-label="Help Center"
            >
              Help Center
            </MobileNavLink>
            <MobileNavButtons>
              <NavButton
                $variant="outline"
                onClick={() => {
                  navigate(PATHS.LOGIN);
                  setIsMobileMenuOpen(false);
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Login
              </NavButton>
            </MobileNavButtons>
          </MobileMenu>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <HeroContent>
          <HeroLeft>
            <HeroIcon variants={fadeUp} $align="flex-start">
              <FaStore />
            </HeroIcon>
            <HeroTitle variants={fadeUp}>
              Grow Your Business with EazSeller
            </HeroTitle>
            <HeroSubtitle variants={fadeUp}>
              Create your store, manage your orders, and reach thousands of customers on EazShop.
            </HeroSubtitle>
            <HeroButtons variants={fadeUp} $justify="flex-start">
              <SecondaryButton
                onClick={() => navigate(PATHS.SIGNUP)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Seller Account
              </SecondaryButton>
            </HeroButtons>
          </HeroLeft>
          <HeroRight>
            <HeroIllustration
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <FaShoppingBag />
            </HeroIllustration>
          </HeroRight>
        </HeroContent>
      </HeroSection>

      {/* Benefits Section */}
      <SectionWrapper
        id="benefits"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Why Choose EazSeller?</SectionTitle>
        <SectionDescription>
          Everything you need to grow your online business
        </SectionDescription>
        <BenefitsGrid>
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <BenefitTitle>{benefit.title}</BenefitTitle>
              <BenefitDescription>{benefit.description}</BenefitDescription>
            </BenefitCard>
          ))}
        </BenefitsGrid>
      </SectionWrapper>

      {/* Steps Section */}
      <StepsSection
        id="steps"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <StepsContainer>
          <SectionTitle>Get Started in 3 Simple Steps</SectionTitle>
          <SectionDescription>
            Start selling on EazShop today
          </SectionDescription>
          <StepsGrid>
            {steps.map((step, index) => (
              <StepCard
                key={index}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepIcon>{step.icon}</StepIcon>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepCard>
            ))}
          </StepsGrid>
        </StepsContainer>
      </StepsSection>

      {/* Trust Section */}
      <TrustSection
        id="trust"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Join a Growing Community</SectionTitle>
        <SectionDescription>
          Trusted by sellers across the region
        </SectionDescription>
        <TrustGrid>
          {metrics.map((metric, index) => (
            <TrustCard
              key={index}
              variants={staggerItem}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <TrustNumber>{metric.number}</TrustNumber>
              <TrustLabel>{metric.label}</TrustLabel>
            </TrustCard>
          ))}
        </TrustGrid>
      </TrustSection>

      {/* Final CTA Section */}
      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CTAContainer>
          <CTATitle>Ready to Start Selling?</CTATitle>
          <CTASubtitle>
            Join the EazShop marketplace today and start growing your business.
          </CTASubtitle>
          <CTAButtons>
            <CTAButtonSecondary
              onClick={() => navigate(PATHS.SIGNUP)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Seller Account
            </CTAButtonSecondary>
          </CTAButtons>
        </CTAContainer>
      </CTASection>

      {/* Footer */}
      <FooterSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <FooterContent>
          <FooterLinks>
            <FooterLink as={Link} to={PATHS.PRIVACY}>
              Privacy Policy
            </FooterLink>
            <FooterLink as={Link} to={PATHS.TERMS}>
              Terms of Service
            </FooterLink>
            <FooterLink as={Link} to={PATHS.EDUCATION}>
              Education
            </FooterLink>
            <FooterLink 
              as={Link}
              to={PATHS.HELP}
              aria-label="Help Center"
            >
              Help Center
            </FooterLink>
            <FooterLink 
              as={Link}
              to={PATHS.SHIPPING_INFO}
              aria-label="Shipping Information"
            >
              Shipping Info
            </FooterLink>
          </FooterLinks>
          <FooterCopyright>
            © {new Date().getFullYear()} EazShop / EazWorld. All rights reserved.
          </FooterCopyright>
        </FooterContent>
      </FooterSection>
    </LandingContainer>
  );
};

export default EazSellerHomePage;

