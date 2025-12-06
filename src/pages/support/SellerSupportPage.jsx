import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaHeadset,
  FaWallet,
  FaBox,
  FaTruck,
  FaUserCheck,
  FaBook,
  FaFileContract,
  FaGraduationCap,
  FaComments,
  FaTicketAlt,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/routePaths';
import {
  SupportContainer,
  HeroSection,
  HeroContent,
  HeroIcon,
  HeroTitle,
  HeroSubtext,
  GridContainer,
  SupportCard,
  CardIcon,
  CardTitle,
  CardDescription,
  CardButton,
  QuickLinksSection,
  SectionTitle,
  LinksGrid,
  QuickLink,
  ChatSection,
  ChatButton,
} from './support.styles';
import ContactFormModal from './ContactFormModal';


/**
 * Seller Support Center Page
 * Comprehensive support page for sellers with categories, contact form, and quick links
 */
const SellerSupportPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Seller support categories
  const supportCategories = [
    {
      id: 'payout',
      title: 'Payout & Revenue Issues',
      description:
        'Get help with payment processing, withdrawals, revenue tracking, and financial queries.',
      icon: <FaWallet />,
      department: 'Payout & Finance',
      iconColor: '#00C896',
      bgColor: '#E6F7F3',
    },
    {
      id: 'listing',
      title: 'Product Upload / Listing Support',
      description:
        'Assistance with adding products, managing inventory, updating listings, and product optimization.',
      icon: <FaBox />,
      department: 'Listings',
      iconColor: '#2b7aff',
      bgColor: '#E6F0FF',
    },
    {
      id: 'orders',
      title: 'Order & Delivery Issues',
      description:
        'Support for order management, shipping, delivery tracking, and customer order inquiries.',
      icon: <FaTruck />,
      department: 'Orders',
      iconColor: '#FF9800',
      bgColor: '#FFF3E0',
    },
    {
      id: 'verification',
      title: 'Account Verification / KYC',
      description:
        'Help with account verification, KYC processes, document submission, and compliance requirements.',
      icon: <FaUserCheck />,
      department: 'Account Verification',
      iconColor: '#9C27B0',
      bgColor: '#F3E5F5',
    },
  ];

  // Quick help links
  const quickLinks = [
    {
      title: 'Help Center',
      path: PATHS.HELP,
      icon: <FaBook />,
      external: false,
    },
    {
      title: 'Seller Policies',
      path: '/seller/policies',
      icon: <FaFileContract />,
    },
    {
      title: 'View Tutorials',
      path: PATHS.EDUCATION,
      icon: <FaGraduationCap />,
    },
  ];

  const handleOpenModal = (department = null) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleChatSupport = () => {
    // Trigger existing chat widget
    if (window.chatWidget) {
      window.chatWidget.open();
    } else {
      // Fallback: show alert or redirect
      alert('Chat support will be available soon. Please use the contact form.');
    }
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <SupportContainer>
      {/* Hero Section */}
      <HeroSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        $primaryColor="#00C896"
        $secondaryColor="#00A67E"
      >
        <HeroContent>
          <HeroIcon>
            <FaHeadset />
          </HeroIcon>
          <HeroTitle>We're Here to Support Your Business</HeroTitle>
          <HeroSubtext>
            Get help with payouts, orders, onboarding, and store management.
            Our support team is ready to assist you 24/7.
          </HeroSubtext>
        </HeroContent>
      </HeroSection>

      {/* Support Categories Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <SectionTitle>How Can We Help You?</SectionTitle>
        <GridContainer>
          {supportCategories.map((category) => (
            <SupportCard
              key={category.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              $accentColor={category.iconColor}
            >
              <CardIcon
                $bgColor={category.bgColor}
                $iconColor={category.iconColor}
              >
                {category.icon}
              </CardIcon>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
              <CardButton
                onClick={() => handleOpenModal(category.department)}
                $bgColor={category.iconColor}
                $hoverColor={category.iconColor}
                style={{ opacity: 0.9 }}
              >
                Open Ticket
              </CardButton>
            </SupportCard>
          ))}
        </GridContainer>
      </motion.div>

      {/* Quick Help Links */}
      <QuickLinksSection>
        <SectionTitle>Quick Help Resources</SectionTitle>
        <LinksGrid>
          {quickLinks.map((link, index) => (
            <QuickLink
              key={index}
              href={link.external ? link.path : '#'}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (!link.external) {
                  e.preventDefault();
                  navigate(link.path);
                }
              }}
              $accentColor="#00C896"
              aria-label={link.title}
            >
              {link.icon}
              <span>{link.title}</span>
            </QuickLink>
          ))}
        </LinksGrid>
      </QuickLinksSection>

      {/* My Tickets Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 'var(--spacing-2xl)' }}
      >
        <SectionTitle>My Support Tickets</SectionTitle>
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
          <p style={{ color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-md)' }}>
            View and manage all your support tickets
          </p>
          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <ChatButton
              onClick={() => navigate(PATHS.SUPPORT_TICKETS)}
              $bgColor="#00C896"
              $hoverColor="#00A67E"
              style={{ textDecoration: 'none' }}
            >
              <FaTicketAlt />
              View My Tickets
            </ChatButton>
            <ChatButton
              onClick={() => navigate(`${PATHS.SUPPORT_TICKETS}?type=product-related`)}
              $bgColor="#2b7aff"
              $hoverColor="#1e5fcc"
              style={{ textDecoration: 'none' }}
            >
              <FaBox />
              Product-Related Tickets
            </ChatButton>
          </div>
        </div>
      </motion.section>

      {/* Live Chat CTA */}
      <ChatSection>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-sm)' }}>
            Need Immediate Assistance?
          </h3>
          <p style={{ color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-md)' }}>
            Chat with our support agents in real-time for instant help
          </p>
          <ChatButton
            onClick={handleChatSupport}
            $bgColor="#00C896"
            $hoverColor="#00A67E"
          >
            <FaComments />
            Chat With Support Agent
          </ChatButton>
        </motion.div>
      </ChatSection>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preselectedDepartment={selectedDepartment}
        role="seller"
        departments={[
          'Payout & Finance',
          'Orders',
          'Listings',
          'Account Verification',
        ]}
        showPriority={false}
        primaryColor="#00C896"
      />
    </SupportContainer>
  );
};

export default SellerSupportPage;

