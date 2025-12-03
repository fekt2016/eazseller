import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaGraduationCap,
  FaRocket,
  FaTags,
  FaBoxOpen,
  FaWallet,
  FaBullhorn,
  FaShieldAlt,
  FaSearch,
  FaPlay,
  FaFileAlt,
  FaGavel,
  FaImage,
  FaList,
  FaMoneyBillWave,
  FaCheckCircle,
  FaHeadset,
  FaQuestionCircle,
  FaVideo,
} from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  PageContainer,
  HeroSection,
  HeroContent,
  HeroIcon,
  HeroTitle,
  HeroSubtitle,
  SearchBarContainer,
  SearchInput,
  SearchIcon,
  SectionWrapper,
  SectionTitle,
  SectionDescription,
  CategoriesGrid,
  CategoryCard,
  CategoryIcon,
  CategoryTitle,
  CategoryDescription,
  VideosGrid,
  VideoCard,
  VideoThumbnail,
  VideoInfo,
  VideoTitle,
  VideoDuration,
  GuidesSection,
  GuideCard,
  GuideTitle,
  GuideSteps,
  GuideList,
  ResourceList,
  ResourceItem,
  ResourceLeft,
  ResourceIcon,
  ResourceText,
  ResourceArrow,
  CTASection,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButton,
} from './education.styles';

/**
 * Seller Education Center Page
 * Knowledge base and training hub for EazSeller sellers
 */
const SellerEducationCenterPage = () => {
  // SEO
  useDynamicPageTitle({
    title: 'Seller Education Center • EazSeller',
    description: 'Learn how to grow your business on EazShop with tutorials, guides, training videos, and best practices.',
    keywords: 'seller education, tutorials, guides, training, EazSeller, EazShop seller resources',
    defaultTitle: 'Seller Education Center • EazSeller',
    defaultDescription: 'Learn how to grow your business on EazShop with tutorials, guides, training videos, and best practices.',
  });

  const [searchQuery, setSearchQuery] = useState('');

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

  // Learning Categories Data
  const categories = [
    {
      icon: <FaRocket />,
      title: 'Getting Started',
      description: 'Create your seller account & set up your store.',
      bgColor: 'var(--color-blue-100)',
      iconColor: 'var(--color-blue-700)',
    },
    {
      icon: <FaTags />,
      title: 'Product Listings',
      description: 'How to upload products, optimize titles, and manage inventory.',
      bgColor: 'var(--color-green-100)',
      iconColor: 'var(--color-green-700)',
    },
    {
      icon: <FaBoxOpen />,
      title: 'Orders & Fulfillment',
      description: 'Learn how to process, ship, and manage returns.',
      bgColor: 'var(--color-yellow-100)',
      iconColor: 'var(--color-yellow-700)',
    },
    {
      icon: <FaWallet />,
      title: 'Payments & Payouts',
      description: 'Understand payouts, fees, and seller balances.',
      bgColor: 'var(--color-indigo-100)',
      iconColor: 'var(--color-indigo-700)',
    },
    {
      icon: <FaBullhorn />,
      title: 'Marketing & Growth',
      description: 'Boost your sales with promotions and store improvements.',
      bgColor: 'var(--color-brand-100)',
      iconColor: 'var(--color-brand-500)',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Policies & Compliance',
      description: 'Learn seller rules, safety policies, and compliance guidelines.',
      bgColor: 'var(--color-red-100)',
      iconColor: 'var(--color-red-700)',
    },
  ];

  // Featured Videos Data
  const featuredVideos = [
    {
      title: 'How to Upload Your First Product',
      duration: '3:12',
    },
    {
      title: 'Understanding Order Management',
      duration: '4:45',
    },
    {
      title: 'How Payouts Work on EazSeller',
      duration: '2:30',
    },
  ];

  // Starter Guides Data
  const starterGuides = [
    {
      title: 'Start Selling in 3 Steps',
      type: 'steps',
      content: [
        'Create Your Seller Account',
        'Add Your Products',
        'Start Receiving Orders',
      ],
    },
    {
      title: 'Optimize Your Store',
      type: 'list',
      content: [
        'Write clear product titles',
        'Use high-quality images',
        'Select correct categories',
        'Set competitive pricing',
      ],
    },
    {
      title: 'How to Avoid Order Cancellations',
      type: 'list',
      content: [
        'Keep inventory updated',
        'Ship quickly',
        'Respond to messages',
        'Follow packaging guidelines',
      ],
    },
  ];

  // Resources Data
  const resources = [
    {
      icon: <FaGavel />,
      title: 'Seller Terms & Conditions',
      description: 'Read our seller agreement',
      href: '#',
    },
    {
      icon: <FaFileAlt />,
      title: 'Return & Refund Policy',
      description: 'Understand return processes',
      href: PATHS.RETURN_REFUND || '#',
    },
    {
      icon: <FaImage />,
      title: 'Image Upload Guidelines',
      description: 'Best practices for product images',
      href: '#',
    },
    {
      icon: <FaList />,
      title: 'Category & Attribute Guide',
      description: 'How to categorize products',
      href: '#',
    },
    {
      icon: <FaMoneyBillWave />,
      title: 'Payout Schedule',
      description: 'When you receive payments',
      href: '#',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Seller Compliance Rules',
      description: 'Stay compliant with policies',
      href: '#',
    },
  ];

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <PageContainer>
      {/* SECTION 1 — HERO */}
      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <HeroContent>
          <HeroIcon variants={fadeUp}>
            <FaGraduationCap />
          </HeroIcon>
          <HeroTitle variants={fadeUp}>EazSeller Education Center</HeroTitle>
          <HeroSubtitle variants={fadeUp}>
            Learn how to succeed on EazShop. Tutorials, guides, tools, and best practices for every seller.
          </HeroSubtitle>
          <SearchBarContainer variants={fadeUp}>
            <form onSubmit={handleSearch}>
              <SearchInput
                type="text"
                placeholder="Search: 'How to list a product', 'Order management', etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
            </form>
          </SearchBarContainer>
        </HeroContent>
      </HeroSection>

      {/* SECTION 2 — LEARNING CATEGORIES */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Learning Categories</SectionTitle>
        <SectionDescription>
          Explore our comprehensive guides organized by topic.
        </SectionDescription>
        <CategoriesGrid>
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <CategoryIcon $bgColor={category.bgColor} $iconColor={category.iconColor}>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
              <CategoryDescription>{category.description}</CategoryDescription>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </SectionWrapper>

      {/* SECTION 3 — FEATURED TRAINING VIDEOS */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Featured Training Videos</SectionTitle>
        <SectionDescription>
          Watch step-by-step tutorials to master EazSeller.
        </SectionDescription>
        <VideosGrid>
          {featuredVideos.map((video, index) => (
            <VideoCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <VideoThumbnail>
                {/* Video thumbnail placeholder */}
              </VideoThumbnail>
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>
                <VideoDuration>{video.duration}</VideoDuration>
              </VideoInfo>
            </VideoCard>
          ))}
        </VideosGrid>
      </SectionWrapper>

      {/* SECTION 4 — STEP-BY-STEP STARTER GUIDES */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Step-by-Step Starter Guides</SectionTitle>
        <SectionDescription>
          Quick guides to get you started and optimize your store.
        </SectionDescription>
        <GuidesSection>
          {starterGuides.map((guide, index) => (
            <GuideCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <GuideTitle>{guide.title}</GuideTitle>
              {guide.type === 'steps' ? (
                <GuideSteps>
                  {guide.content.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </GuideSteps>
              ) : (
                <GuideList>
                  {guide.content.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </GuideList>
              )}
            </GuideCard>
          ))}
        </GuidesSection>
      </SectionWrapper>

      {/* SECTION 5 — RESOURCE SECTION */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Helpful Resources</SectionTitle>
        <SectionDescription>
          Access important documents, guidelines, and policies.
        </SectionDescription>
        <ResourceList>
          {resources.map((resource, index) => (
            <ResourceItem
              key={index}
              href={resource.href}
              variants={staggerItem}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
            >
              <ResourceLeft>
                <ResourceIcon>{resource.icon}</ResourceIcon>
                <ResourceText>
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                </ResourceText>
              </ResourceLeft>
              <ResourceArrow>→</ResourceArrow>
            </ResourceItem>
          ))}
        </ResourceList>
      </SectionWrapper>

      {/* SECTION 6 — CTA */}
      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CTATitle>Need More Help?</CTATitle>
        <CTASubtitle>
          Visit our Support Center or contact our Seller Success Team.
        </CTASubtitle>
        <CTAButtons>
          <CTAButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHeadset />
            Seller Support Center
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.CONTACT}
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaQuestionCircle />
            Contact Support
          </CTAButton>
          <CTAButton
            href="#"
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaVideo />
            Watch Full Tutorials
          </CTAButton>
        </CTAButtons>
      </CTASection>
    </PageContainer>
  );
};

export default SellerEducationCenterPage;
