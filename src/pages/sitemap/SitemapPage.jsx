import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeadset, FaBook, FaComments } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  SitemapContainer,
  HeroSection,
  HeroTitle,
  HeroSubtext,
  SearchSection,
  SearchLabel,
  SearchInput,
  SectionsGrid,
  SitemapSection,
  SectionHeader,
  LinksList,
  LinkItem,
  SitemapLink,
  FooterCTA,
  CTATitle,
  CTAButtons,
  CTAButton,
} from './sitemap.styles';

/**
 * Sitemap Page for EazSeller
 * Displays all pages and resources in the seller portal
 */
const SitemapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // SEO
  useDynamicPageTitle({
    title: 'Sitemap | EazSeller',
    description: 'Explore all pages and resources in the EazSeller portal.',
    keywords: 'sitemap, seller portal, navigation, EazSeller',
    defaultTitle: 'Sitemap | EazSeller',
    defaultDescription: 'Explore all pages and resources in the EazSeller portal.',
  });

  // Sitemap sections data
  const sitemapSections = [
    {
      id: 'dashboard',
      title: 'Dashboard & Overview',
      links: [
        { label: 'Dashboard', path: PATHS.DASHBOARD },
        { label: 'Analytics', path: PATHS.ANALYTICS },
        { label: 'Sales Analytics', path: PATHS.SALES },
        { label: 'Product Analytics', path: PATHS.PRODUCTS_ANALYTICS },
        { label: 'Customer Analytics', path: PATHS.CUSTOMERS_ANALYTICS },
      ],
    },
    {
      id: 'products',
      title: 'Products & Listings',
      links: [
        { label: 'All Products', path: PATHS.PRODUCTS },
        { label: 'Add Product', path: PATHS.ADD_PRODUCT },
        { label: 'Discount Products', path: PATHS.DISCOUNT_PRODUCTS },
        { label: 'Product Reviews', path: PATHS.REVIEWS },
      ],
    },
    {
      id: 'orders',
      title: 'Orders & Fulfillment',
      links: [
        { label: 'All Orders', path: PATHS.ORDERS },
        { label: 'Order Tracking', path: PATHS.TRACKING },
      ],
    },
    {
      id: 'finance',
      title: 'Finance & Payments',
      links: [
        { label: 'Finance Overview', path: PATHS.FINANCE },
        { label: 'Earnings', path: PATHS.EARNINGS },
        { label: 'Payouts', path: PATHS.PAYOUTS },
        { label: 'Withdrawals', path: PATHS.WITHDRAWALS },
        { label: 'Transactions', path: PATHS.TRANSACTIONS },
        { label: 'Payment Methods', path: PATHS.PAYMENT_METHODS },
      ],
    },
    {
      id: 'store',
      title: 'Store Management',
      links: [
        { label: 'Store Settings', path: PATHS.STORE_SETTINGS },
        { label: 'Store Profile', path: PATHS.STORE_PROFILE },
        { label: 'Shipping Settings', path: PATHS.SHIPPING_SETTINGS },
        { label: 'Return Policy', path: PATHS.RETURN_POLICY },
      ],
    },
    {
      id: 'account',
      title: 'Account & Settings',
      links: [
        { label: 'Profile', path: PATHS.PROFILE },
        { label: 'Settings', path: PATHS.SETTINGS },
        { label: 'Security', path: PATHS.SECURITY },
        { label: 'Notifications', path: PATHS.NOTIFICATIONS },
        { label: 'Store Setup', path: PATHS.SETUP },
      ],
    },
    {
      id: 'support',
      title: 'Support & Help',
      links: [
        { label: 'Support Center', path: PATHS.SUPPORT },
        { label: 'Help Center', path: PATHS.HELP },
        { label: 'FAQ', path: PATHS.FAQ },
        { label: 'Chat Support', path: PATHS.CHAT_SUPPORT },
      ],
    },
    {
      id: 'external',
      title: 'External Resources',
      links: [
        { label: 'EazMain (Buyer App)', path: 'https://eazworld.com', external: true },
        { label: 'EazAdmin Portal', path: 'https://admin.eazworld.com', external: true },
        { label: 'EazWorld Website', path: 'https://eazworld.com', external: true },
      ],
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <SitemapContainer>
      {/* Hero Section */}
      <HeroSection
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroTitle>Sitemap</HeroTitle>
        <HeroSubtext>
          Explore all pages and resources in the seller portal.
        </HeroSubtext>
      </HeroSection>

      {/* Search Bar */}
      <SearchSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <SearchLabel htmlFor="sitemap-search">
          Find a page
        </SearchLabel>
        <SearchInput
          id="sitemap-search"
          type="text"
          placeholder="Search for a page..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchSection>

      {/* Sitemap Sections Grid */}
      <SectionsGrid
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sitemapSections.map((section) => (
          <SitemapSection
            key={section.id}
            variants={sectionVariants}
          >
            <SectionHeader>{section.title}</SectionHeader>
            <LinksList>
              {section.links.map((link, index) => (
                <LinkItem key={index}>
                  {link.external ? (
                    <SitemapLink
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </SitemapLink>
                  ) : (
                    <SitemapLink as={Link} to={link.path}>
                      {link.label}
                    </SitemapLink>
                  )}
                </LinkItem>
              ))}
            </LinksList>
          </SitemapSection>
        ))}
      </SectionsGrid>

      {/* Footer CTA */}
      <FooterCTA
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <CTATitle>Still can't find a page?</CTATitle>
        <CTAButtons>
          <CTAButton
            as={Link}
            to={PATHS.SUPPORT}
            $variant="primary"
          >
            <FaHeadset style={{ marginRight: 'var(--spacing-xs)' }} />
            Contact Support
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.HELP}
            $variant="secondary"
          >
            <FaBook style={{ marginRight: 'var(--spacing-xs)' }} />
            Visit Help Center
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.CHAT_SUPPORT}
            $variant="secondary"
          >
            <FaComments style={{ marginRight: 'var(--spacing-xs)' }} />
            Open Chat
          </CTAButton>
        </CTAButtons>
      </FooterCTA>
    </SitemapContainer>
  );
};

export default SitemapPage;

