import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaEnvelope, FaMobile, FaSave, FaCheckCircle } from 'react-icons/fa';
import { useNotificationSettings, useUpdateNotificationSettings } from '../../../shared/hooks/useNotifications';
import Button from '../../../shared/components/ui/Button';
import { LoadingState, ErrorState } from '../../../shared/components/ui/LoadingComponents';
import ToggleSwitch from './components/ToggleSwitch';
import { toast } from 'react-toastify';

const NotificationsTab = () => {
  const { data: settings, isLoading, isError, error } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const [localSettings, setLocalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (channel, type) => {
    if (!localSettings) return;

    const newSettings = {
      ...localSettings,
      [channel]: {
        ...localSettings[channel],
        [type]: !localSettings[channel][type],
      },
    };

    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!localSettings) return;

    updateSettings.mutate(localSettings, {
      onSuccess: () => {
        toast.success('Notification settings saved successfully');
        setHasChanges(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to save settings');
      },
    });
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading notification settings..." />;
  }

  if (isError) {
    return <ErrorState title="Failed to load settings" message={error?.message || 'Please try again later'} />;
  }

  if (!localSettings) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>Notification Preferences</Title>
        <Description>
          Choose how you want to receive notifications about your account, orders, and updates.
        </Description>
      </Header>

      {/* Email Notifications */}
      <Section>
        <SectionHeader>
          <SectionIcon $color="blue">
            <FaEnvelope />
          </SectionIcon>
          <SectionInfo>
            <SectionTitle>Email Notifications</SectionTitle>
            <SectionDescription>
              Receive notifications via email
            </SectionDescription>
          </SectionInfo>
        </SectionHeader>
        <SectionContent>
          <ToggleSwitch
            label="Order Updates"
            description="Get notified when orders are placed, updated, or completed"
            checked={localSettings.email?.orderUpdates || false}
            onChange={() => handleToggle('email', 'orderUpdates')}
          />
          <ToggleSwitch
            label="Payment Notifications"
            description="Receive alerts about payments, withdrawals, and transactions"
            checked={localSettings.email?.paymentNotifications || false}
            onChange={() => handleToggle('email', 'paymentNotifications')}
          />
          <ToggleSwitch
            label="Product Alerts"
            description="Get notified about product reviews, low stock, and other product updates"
            checked={localSettings.email?.productAlerts || false}
            onChange={() => handleToggle('email', 'productAlerts')}
          />
          <ToggleSwitch
            label="Account Security"
            description="Important security alerts like login attempts and password changes"
            checked={localSettings.email?.accountSecurity || false}
            onChange={() => handleToggle('email', 'accountSecurity')}
          />
          <ToggleSwitch
            label="Marketing Emails"
            description="Promotional emails, tips, and updates about new features"
            checked={localSettings.email?.marketingEmails || false}
            onChange={() => handleToggle('email', 'marketingEmails')}
          />
        </SectionContent>
      </Section>

      {/* Push Notifications */}
      <Section>
        <SectionHeader>
          <SectionIcon $color="green">
            <FaBell />
          </SectionIcon>
          <SectionInfo>
            <SectionTitle>Push Notifications</SectionTitle>
            <SectionDescription>
              Browser and app notifications
            </SectionDescription>
          </SectionInfo>
        </SectionHeader>
        <SectionContent>
          <ToggleSwitch
            label="Order Updates"
            description="Real-time notifications about order status changes"
            checked={localSettings.push?.orderUpdates || false}
            onChange={() => handleToggle('push', 'orderUpdates')}
          />
          <ToggleSwitch
            label="New Messages"
            description="Get notified when you receive new customer messages"
            checked={localSettings.push?.newMessages || false}
            onChange={() => handleToggle('push', 'newMessages')}
          />
          <ToggleSwitch
            label="System Alerts"
            description="Important system notifications and announcements"
            checked={localSettings.push?.systemAlerts || false}
            onChange={() => handleToggle('push', 'systemAlerts')}
          />
        </SectionContent>
      </Section>

      {/* SMS Notifications */}
      <Section>
        <SectionHeader>
          <SectionIcon $color="purple">
            <FaMobile />
          </SectionIcon>
          <SectionInfo>
            <SectionTitle>SMS Notifications</SectionTitle>
            <SectionDescription>
              Text message alerts (if phone number is verified)
            </SectionDescription>
          </SectionInfo>
        </SectionHeader>
        <SectionContent>
          <ToggleSwitch
            label="Critical Alerts"
            description="Urgent notifications like security breaches or account issues"
            checked={localSettings.sms?.criticalAlerts || false}
            onChange={() => handleToggle('sms', 'criticalAlerts')}
          />
          <ToggleSwitch
            label="Security Notifications"
            description="Important security updates and login alerts"
            checked={localSettings.sms?.securityNotifications || false}
            onChange={() => handleToggle('sms', 'securityNotifications')}
          />
        </SectionContent>
      </Section>

      {/* Save Button */}
      {hasChanges && (
        <Actions>
          <Button
            variant="outline"
            size="md"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            <FaSave />
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Actions>
      )}

      {updateSettings.isSuccess && (
        <SuccessMessage>
          <FaCheckCircle />
          Settings saved successfully!
        </SuccessMessage>
      )}
    </Container>
  );
};

export default NotificationsTab;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
`;

const Title = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
`;

const Description = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => {
    if (props.$color === 'blue') return 'var(--color-blue-100)';
    if (props.$color === 'green') return 'var(--color-green-100)';
    if (props.$color === 'purple') return 'var(--color-indigo-100)';
    return 'var(--color-grey-100)';
  }};
  border-radius: var(--border-radius-md);
  color: ${props => {
    if (props.$color === 'blue') return 'var(--color-blue-600)';
    if (props.$color === 'green') return 'var(--color-green-600)';
    if (props.$color === 'purple') return 'var(--color-indigo-600)';
    return 'var(--color-grey-600)';
  }};
  font-size: var(--font-size-xl);
`;

const SectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
`;

const SectionDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: var(--border-radius-md);
  color: var(--color-green-700);
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);

  svg {
    font-size: var(--font-size-lg);
  }
`;

