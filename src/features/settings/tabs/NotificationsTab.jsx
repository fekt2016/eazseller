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
          <SectionIcon>
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
          <SectionIcon>
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
          <SectionIcon>
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
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-bottom: 1rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const Title = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #9CA3AF;
  line-height: 1.5;
  margin: 0;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #FDF3E3;
  border-radius: 9px;
  color: #E8920A;
  font-size: 1rem;
  flex-shrink: 0;
`;

const SectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: 0.875rem;
  color: #9CA3AF;
  margin: 0;
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  background: #D1FAE5;
  border: 0.5px solid #A7F3D0;
  border-radius: 9px;
  color: #065F46;
  font-size: 0.875rem;
  font-weight: 500;
`;

