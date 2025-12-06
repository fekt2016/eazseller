import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaQuestionCircle,
  FaShoppingBag,
  FaCreditCard,
  FaTruck,
  FaUserCircle,
  FaBox,
  FaUndo,
  FaShieldAlt,
  FaBook,
  FaSearch,
  FaChartLine,
  FaWallet,
  FaStore,
} from 'react-icons/fa';
import usePageTitle from '../../shared/hooks/usePageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  HelpContainer,
  HeroSection,
  HeroContent,
  HeroIcon,
  HeroTitle,
  HeroSubtitle,
  SectionWrapper,
  SectionTitle,
  SectionDescription,
  CategoriesGrid,
  CategoryCard,
  CategoryIcon,
  CategoryTitle,
  CategoryDescription,
  CategoryLink,
  SearchSection,
  SearchInput,
  SearchButton,
  QuickLinksGrid,
  QuickLinkCard,
  QuickLinkIcon,
  QuickLinkTitle,
  QuickLinkDescription,
  CTASection,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButton,
} from './help.styles';

/**
 * Help Center Page for EazSeller
 * Provides help resources, FAQs, and support information for sellers
 */
const HelpCenterPage = () => {
  const navigate = useNavigate();

  // SEO
  usePageTitle({
    title: 'Help Center - EazSeller',
    description: 'Get help with your seller account, products, orders, payments, and more. Find answers to frequently asked questions.',
    keywords: 'help, support, FAQ, seller support, EazSeller',
  });

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
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Help categories specific to sellers
  const helpCategories = [
    {
      id: 'products',
      title: 'Products & Listings',
      description: 'Add products, manage inventory, update listings, and optimize your store',
      icon: <FaBox />,
      bgColor: 'var(--color-blue-100)',
      iconColor: 'var(--color-blue-700)',
      href: `${PATHS.HELP}/category/products`,
    },
    {
      id: 'orders',
      title: 'Orders & Fulfillment',
      description: 'Manage orders, shipping, delivery tracking, and customer inquiries',
      icon: <FaShoppingBag />,
      bgColor: 'var(--color-green-100)',
      iconColor: 'var(--color-green-700)',
      href: `${PATHS.HELP}/category/orders`,
    },
    {
      id: 'payments',
      title: 'Payments & Payouts',
      description: 'Payment processing, withdrawals, revenue tracking, and financial queries',
      icon: <FaWallet />,
      bgColor: 'var(--color-indigo-100)',
      iconColor: 'var(--color-indigo-700)',
      href: `${PATHS.HELP}/category/payments`,
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'View sales data, track performance, and understand your store metrics',
      icon: <FaChartLine />,
      bgColor: 'var(--color-yellow-100)',
      iconColor: 'var(--color-yellow-700)',
      href: `${PATHS.HELP}/category/analytics`,
    },
    {
      id: 'account',
      title: 'Account & Verification',
      description: 'Account management, KYC verification, profile updates, and security',
      icon: <FaUserCircle />,
      bgColor: 'var(--color-red-100)',
      iconColor: 'var(--color-red-700)',
      href: `${PATHS.HELP}/category/account`,
    },
    {
      id: 'store',
      title: 'Store Settings',
      description: 'Configure your store, shipping options, return policies, and branding',
      icon: <FaStore />,
      bgColor: 'var(--color-green-100)',
      iconColor: 'var(--color-green-700)',
      href: `${PATHS.HELP}/category/store`,
    },
  ];

  // Quick links
  const quickLinks = [
    {
      title: 'Contact Support',
      description: 'Get in touch with our seller support team',
      icon: <FaShieldAlt />,
      href: PATHS.SUPPORT,
    },
    {
      title: 'Seller Education',
      description: 'Learn how to grow your business',
      icon: <FaBook />,
      href: PATHS.EDUCATION,
    },
    {
      title: 'Support Tickets',
      description: 'View and manage your support tickets',
      icon: <FaQuestionCircle />,
      href: PATHS.SUPPORT_TICKETS,
    },
    {
      title: 'Privacy Policy',
      description: 'How we protect your data',
      icon: <FaShieldAlt />,
      href: PATHS.PRIVACY,
    },
  ];

  return (
    <HelpContainer>
      {/* SECTION 1 — HERO */}
      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <HeroContent>
          <HeroIcon variants={fadeUp}>
            <FaBook />
          </HeroIcon>
          <HeroTitle variants={fadeUp}>Seller Help Center</HeroTitle>
          <HeroSubtitle variants={fadeUp}>
            Find answers to your questions and get the support you need to grow your business
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>

      {/* SECTION 2 — SEARCH */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Search for help articles, FAQs, or topics..."
          />
          <SearchButton>
            <FaSearch />
            Search
          </SearchButton>
        </SearchSection>
      </SectionWrapper>

      {/* SECTION 3 — HELP CATEGORIES */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <SectionTitle>Browse by Category</SectionTitle>
        <SectionDescription>
          Find help articles organized by topic
        </SectionDescription>
        <CategoriesGrid>
          {helpCategories.map((category) => (
            <CategoryCard
              key={category.id}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <CategoryIcon $bgColor={category.bgColor} $iconColor={category.iconColor}>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
              <CategoryDescription>{category.description}</CategoryDescription>
              <CategoryLink
                as={Link}
                to={category.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More →
              </CategoryLink>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </SectionWrapper>

      {/* SECTION 4 — QUICK LINKS */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Quick Links</SectionTitle>
        <SectionDescription>
          Common resources and support options
        </SectionDescription>
        <QuickLinksGrid>
          {quickLinks.map((link, index) => (
            <QuickLinkCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <QuickLinkIcon>
                {link.icon}
              </QuickLinkIcon>
              <QuickLinkTitle>{link.title}</QuickLinkTitle>
              <QuickLinkDescription>{link.description}</QuickLinkDescription>
              <CategoryLink
                as={Link}
                to={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Visit →
              </CategoryLink>
            </QuickLinkCard>
          ))}
        </QuickLinksGrid>
      </SectionWrapper>

      {/* SECTION 5 — CTA */}
      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CTATitle>Still Need Help?</CTATitle>
        <CTASubtitle>
          Our seller support team is here to assist you 24/7
        </CTASubtitle>
        <CTAButtons>
          <CTAButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.SUPPORT_TICKETS}
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Tickets
          </CTAButton>
        </CTAButtons>
      </CTASection>
    </HelpContainer>
  );
};

export default HelpCenterPage;

