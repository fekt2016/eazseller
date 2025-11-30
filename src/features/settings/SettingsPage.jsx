import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaStore, FaCreditCard, FaCog, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { PageContainer, PageHeader, TitleSection } from '../../shared/components/ui/SpacingSystem';
import BusinessProfilePage from '../profile/BusinessProfilePage';
import PaymentMethodPage from '../profile/PaymentMethodPage';
import VerificationPage from '../profile/VerificationPage';

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Check if there's a tab in the URL hash
    const hash = location.hash.replace('#', '');
    if (hash === 'payment' || hash === 'payment-methods') {
      return 'payment';
    } else if (hash === 'verification' || hash === 'verify') {
      return 'verification';
    } else if (hash === 'profile' || hash === 'business-profile') {
      return 'profile';
    }
    return 'profile'; // Default to business profile
  });

  const tabs = [
    {
      id: 'profile',
      label: 'Business Profile',
      icon: <FaStore />,
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      icon: <FaCreditCard />,
    },
    {
      id: 'verification',
      label: 'Verification',
      icon: <FaShieldAlt />,
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Update URL hash without navigation
    window.history.replaceState(null, '', `${location.pathname}#${tabId}`);
  };

  // Sync with URL hash on mount
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'payment' || hash === 'payment-methods') {
      setActiveTab('payment');
    } else if (hash === 'verification' || hash === 'verify') {
      setActiveTab('verification');
    } else if (hash === 'profile' || hash === 'business-profile') {
      setActiveTab('profile');
    }
  }, [location.hash]);

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Settings</h1>
          <p>Manage your business profile and payment methods</p>
        </TitleSection>
        <Button
          variant="ghost"
          size="md"
          onClick={() => navigate(PATHS.DASHBOARD)}
        >
          <FaArrowLeft /> Back to Dashboard
        </Button>
      </PageHeader>

      {/* Tabs */}
      <TabsContainer>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </TabButton>
        ))}
      </TabsContainer>

      {/* Tab Content */}
      <TabContent>
        {activeTab === 'profile' && <BusinessProfilePage embedded />}
        {activeTab === 'payment' && <PaymentMethodPage embedded />}
        {activeTab === 'verification' && <VerificationPage embedded />}
      </TabContent>
    </PageContainer>
  );
};

export default SettingsPage;

// Styled Components
const TabsContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-grey-200);
  background: var(--color-white-0);
  padding: 0 var(--spacing-lg);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-grey-600);
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;
  position: relative;

  &:hover {
    color: var(--color-primary-600);
    background: var(--color-grey-50);
  }

  ${(props) =>
    props.$active &&
    `
    color: var(--color-primary-600);
    border-bottom-color: var(--color-primary-600);
    font-weight: var(--font-semibold);
  `}

  svg {
    font-size: var(--font-size-lg);
  }
`;

const TabContent = styled.div`
  background: transparent;
  min-height: 400px;
  
  /* When embedded, remove page container padding */
  > div {
    padding: 0;
  }
`;

