import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaShieldAlt,
  FaRocket,
} from 'react-icons/fa';
import usePageTitle from '../../shared/hooks/usePageTitle';
import { PATHS } from '../../routes/routePaths';
import { useGetPublicTestimonials } from '../../shared/hooks/useTestimonial';
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
  HeroTag,
  HeroTitle,
  HeroSubtitle,
  HeroButtons,
  PrimaryButton,
  SecondaryButton,
  HeroRight,
  HeroIllustration,
  FloatingCard,
  FloatingCardIcon,
  FloatingCardText,
  SectionWrapper,
  SectionTag,
  SectionTitle,
  SectionDescription,
  BenefitsGrid,
  BenefitCard,
  BenefitIcon,
  BenefitTitle,
  BenefitDescription,
  BenefitTextWrapper,
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
  TestimonialSection,
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialAvatar,
  TestimonialInfo,
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


const EazSellerHomePage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: liveTestimonials } = useGetPublicTestimonials({ limit: 3 });

  usePageTitle({
    title: 'Sell on Saiisai - Start Your Online Store Today',
    description: 'Join thousands of sellers on Saiisai. Create your store, list products, and start selling to customers across Ghana.',
    keywords: 'Saiisai Seller, sell online Ghana, seller portal, marketplace, e-commerce',
  });

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  // ── Animation Variants ──────────────────────────────────────────
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const fadeUpDelay = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
  });

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  // ── Data ────────────────────────────────────────────────────────
  const benefits = [
    {
      icon: <FaRocket />,
      title: 'Launch in Minutes',
      description: 'Set up your seller profile, add payment details, and start listing products — no technical skills needed.',
    },
    {
      icon: <FaChartLine />,
      title: 'Grow Your Reach',
      description: 'Access thousands of active buyers across Ghana who are ready to discover and purchase your products.',
    },
    {
      icon: <FaTruck />,
      title: 'Effortless Fulfillment',
      description: 'Manage orders, track shipments, and handle returns with our streamlined logistics flow.',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Payouts',
      description: 'Get paid directly to your mobile money or bank account with transparent fees and fast settlements.',
    },
  ];

  const steps = [
    {
      number: '1',
      icon: <FaUserPlus />,
      title: 'Create Your Account',
      description: 'Sign up for free and verify your seller profile in just a few minutes.',
    },
    {
      number: '2',
      icon: <FaBox />,
      title: 'List Your Products',
      description: 'Upload photos, set prices, and describe your products to attract buyers.',
    },
    {
      number: '3',
      icon: <FaDollarSign />,
      title: 'Start Earning',
      description: 'Receive orders, fulfill them, and watch your earnings grow in real-time.',
    },
  ];

  const metrics = [
    { number: '500+', label: 'Active Sellers' },
    { number: '10,000+', label: 'Monthly Orders' },
    { number: '95%', label: 'Seller Satisfaction' },
  ];

  const staticTestimonials = [
    {
      quote: 'Saiisai made it so easy for me to go from a physical market stall to selling online. My revenue doubled in the first month!',
      name: 'Ama K.',
      shop: 'Ama Fashion House',
      initials: 'AK',
      rating: 5,
    },
    {
      quote: 'The payout system is incredibly fast. I receive my earnings the same day. Best marketplace platform in Ghana.',
      name: 'Kwame O.',
      shop: 'KO Electronics',
      initials: 'KO',
      rating: 5,
    },
    {
      quote: 'Simple to use, great customer base, and the support team is always there when I need help. Highly recommend!',
      name: 'Efua M.',
      shop: 'Efua Natural Beauty',
      initials: 'EM',
      rating: 5,
    },
  ];

  const getFallbackBackground = (name = 'Seller') => {
    const palettes = [
      'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
    ];
    const hash = Array.from(name).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    return palettes[hash % palettes.length];
  };

  const testimonials = (liveTestimonials && liveTestimonials.length > 0)
    ? liveTestimonials.map((t) => {
        const name = t.seller?.businessName || 'Seller';
        const words = name.trim().split(' ');
        const initials = words.length >= 2
          ? `${words[0][0]}${words[1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase();
        return {
          quote: t.content,
          name,
          shop: t.seller?.businessName || 'Saiisai Seller',
          initials,
          rating: t.rating,
          backgroundImage:
            t.seller?.backgroundImage ||
            t.seller?.coverImage ||
            t.seller?.bannerImage ||
            null,
          fallbackBackground: getFallbackBackground(name),
        };
      })
    : staticTestimonials.map((t) => ({
        ...t,
        fallbackBackground: getFallbackBackground(t.name),
      }));

  return (
    <LandingContainer>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <MobileNavLink onClick={() => scrollToSection('benefits')}>Features</MobileNavLink>
            <MobileNavLink onClick={() => scrollToSection('steps')}>How It Works</MobileNavLink>
            <MobileNavLink onClick={() => scrollToSection('trust')}>Community</MobileNavLink>
            <MobileNavLink onClick={() => { navigate(PATHS.EDUCATION); setIsMobileMenuOpen(false); }}>Education</MobileNavLink>
            <MobileNavLink onClick={() => { navigate(PATHS.HELP); setIsMobileMenuOpen(false); }}>Help Center</MobileNavLink>
            <MobileNavButtons>
              <NavButton $variant="outline" onClick={() => { navigate(PATHS.LOGIN); setIsMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>
                Login
              </NavButton>
            </MobileNavButtons>
          </MobileMenu>
        )}
      </AnimatePresence>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <HeroSection initial="hidden" animate="visible" variants={staggerContainer}>
        <HeroContent>
          <HeroLeft>
            <HeroTag variants={staggerItem}>
              <FaStar /> Trusted by 500+ sellers
            </HeroTag>

            <HeroTitle variants={staggerItem}>
              Turn Your Products Into a <span>Thriving Online Business</span>
            </HeroTitle>

            <HeroSubtitle variants={staggerItem}>
              Join Ghana's fastest-growing marketplace. Set up your store, reach thousands of buyers, and get paid securely.
            </HeroSubtitle>

            <HeroButtons variants={staggerItem} $justify="flex-start">
              <PrimaryButton
                onClick={() => navigate(PATHS.SIGNUP)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Selling Free <FaArrowRight />
              </PrimaryButton>
              <SecondaryButton
                onClick={() => scrollToSection('steps')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                See How It Works
              </SecondaryButton>
            </HeroButtons>
          </HeroLeft>

          <HeroRight>
            <motion.div style={{ position: 'relative' }} variants={slideInRight}>
              <HeroIllustration
                initial={{ opacity: 0, scale: 0.9, rotateY: 8 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <FaShoppingBag />
              </HeroIllustration>

              {/* Floating metric cards */}
              <FloatingCard
                $position="top-right"
                initial={{ opacity: 0, x: 30, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              >
                <FloatingCardIcon $bg="rgba(0,200,150,0.1)" $color="#00C896">
                  <FaChartLine />
                </FloatingCardIcon>
                <FloatingCardText>
                  <div className="value">+240%</div>
                  <div className="label">Avg. Growth</div>
                </FloatingCardText>
              </FloatingCard>

              <FloatingCard
                $position="bottom-left"
                initial={{ opacity: 0, x: -30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 1.0 }}
              >
                <FloatingCardIcon $bg="rgba(251,191,36,0.1)" $color="#f59e0b">
                  <FaCheckCircle />
                </FloatingCardIcon>
                <FloatingCardText>
                  <div className="value">Same-Day</div>
                  <div className="label">Payouts</div>
                </FloatingCardText>
              </FloatingCard>
            </motion.div>
          </HeroRight>
        </HeroContent>
      </HeroSection>

      {/* ── Benefits Section ───────────────────────────────────────── */}
      <SectionWrapper
        id="benefits"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <SectionTag variants={staggerItem}>Why Saiisai</SectionTag>
        <SectionTitle variants={staggerItem}>
          Everything You Need to <span>Succeed</span>
        </SectionTitle>
        <SectionDescription variants={staggerItem}>
          From store setup to secure payments, we handle the heavy lifting so you can focus on growing.
        </SectionDescription>

        <BenefitsGrid>
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <BenefitTextWrapper>
                <BenefitTitle>{benefit.title}</BenefitTitle>
                <BenefitDescription>{benefit.description}</BenefitDescription>
              </BenefitTextWrapper>
            </BenefitCard>
          ))}
        </BenefitsGrid>
      </SectionWrapper>

      {/* ── Steps Section ──────────────────────────────────────────── */}
      <StepsSection
        id="steps"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <StepsContainer>
          <SectionTag variants={staggerItem}>How It Works</SectionTag>
          <SectionTitle variants={staggerItem}>
            Get Started in <span>3 Easy Steps</span>
          </SectionTitle>
          <SectionDescription variants={staggerItem}>
            From sign-up to first sale — it only takes minutes.
          </SectionDescription>

          <StepsGrid>
            {steps.map((step, index) => (
              <StepCard
                key={index}
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
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

      {/* ── Trust / Metrics Section ────────────────────────────────── */}
      <TrustSection
        id="trust"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <SectionTag variants={staggerItem}>Our Community</SectionTag>
        <SectionTitle variants={staggerItem}>
          Join a <span>Growing Network</span> of Sellers
        </SectionTitle>
        <SectionDescription variants={staggerItem}>
          Trusted by entrepreneurs and businesses across Ghana
        </SectionDescription>

        <TrustGrid>
          {metrics.map((metric, index) => (
            <TrustCard
              key={index}
              variants={staggerItem}
              whileHover={{ scale: 1.04, transition: { duration: 0.3 } }}
            >
              <TrustNumber>{metric.number}</TrustNumber>
              <TrustLabel>{metric.label}</TrustLabel>
            </TrustCard>
          ))}
        </TrustGrid>
      </TrustSection>

      {/* ── Testimonials Section ───────────────────────────────────── */}
      <TestimonialSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SectionTag variants={staggerItem}>Seller Stories</SectionTag>
          <SectionTitle variants={staggerItem}>
            Hear From Our <span>Sellers</span>
          </SectionTitle>
          <SectionDescription variants={staggerItem}>
            Real stories from real people building businesses on Saiisai
          </SectionDescription>
        </div>

        <TestimonialGrid>
          {testimonials.map((t, index) => (
            <TestimonialCard
              key={index}
              $bgImage={t.backgroundImage}
              $fallbackBg={t.fallbackBackground}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
            >
              <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
                {[1,2,3,4,5].map((s) => (
                  <FaStar key={s} size={13} color={s <= (t.rating || 5) ? '#E8920A' : '#E5E7EB'} />
                ))}
              </div>
              <TestimonialQuote>"{t.quote}"</TestimonialQuote>
              <TestimonialAuthor>
                <TestimonialAvatar>{t.initials}</TestimonialAvatar>
                <TestimonialInfo>
                  <div className="name">{t.name}</div>
                  <div className="shop">{t.shop}</div>
                </TestimonialInfo>
              </TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialGrid>
      </TestimonialSection>

      {/* ── CTA Section ────────────────────────────────────────────── */}
      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CTAContainer>
          <CTATitle>Ready to Build Your Online Store?</CTATitle>
          <CTASubtitle>
            Join hundreds of successful sellers on Saiisai. It's free to start — no monthly fees, no hidden charges.
          </CTASubtitle>
          <CTAButtons>
            <CTAButtonPrimary
              onClick={() => navigate(PATHS.SIGNUP)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Create Free Account <FaArrowRight />
            </CTAButtonPrimary>
            <CTAButtonSecondary
              onClick={() => navigate(PATHS.LOGIN)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              I Already Have an Account
            </CTAButtonSecondary>
          </CTAButtons>
        </CTAContainer>
      </CTASection>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <FooterSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <FooterContent>
          <FooterLinks>
            <FooterLink as={Link} to={PATHS.PRIVACY}>Privacy Policy</FooterLink>
            <FooterLink as={Link} to={PATHS.TERMS}>Terms of Service</FooterLink>
            <FooterLink as={Link} to={PATHS.DATA_DELETION}>Data Deletion</FooterLink>
            <FooterLink as={Link} to={PATHS.VAT_TAX_POLICY}>VAT & Tax Policy</FooterLink>
            <FooterLink as={Link} to={PATHS.COOKIE_POLICY}>Cookie Policy</FooterLink>
            <FooterLink as={Link} to={PATHS.EDUCATION}>Education</FooterLink>
            <FooterLink as={Link} to={PATHS.HELP}>Help Center</FooterLink>
            <FooterLink as={Link} to={PATHS.SHIPPING_INFO}>Shipping Info</FooterLink>
          </FooterLinks>
          <FooterCopyright>
            &copy; {new Date().getFullYear()} Saiisai. All rights reserved.
          </FooterCopyright>
        </FooterContent>
      </FooterSection>
    </LandingContainer>
  );
};

export default EazSellerHomePage;
