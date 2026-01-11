import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaShieldAlt, FaKey, FaDesktop, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { use2FA, usePasswordChange, useSessions } from '../../../shared/hooks/useSecurity';
import Button from '../../../shared/components/ui/Button';
import { LoadingState, ErrorState } from '../../../shared/components/ui/LoadingComponents';
import QRCodeDisplay from './components/QRCodeDisplay';
import BackupCodesDisplay from './components/BackupCodesDisplay';
import SessionCard from './components/SessionCard';
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator';
import { toast } from 'react-toastify';

const SecurityTab = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    is2FAEnabled,
    enable2FA,
    get2FASetup,
    verify2FA,
    disable2FA,
    getBackupCodes,
    regenerateBackupCodes,
  } = use2FA();

  const { changePassword, isChanging, changeError } = usePasswordChange();
  const { sessions, isLoading: sessionsLoading, refetch: refetchSessions, revokeSession, revokeAllOtherSessions } = useSessions();

  // Fetch 2FA setup data when enabling
  useEffect(() => {
    if (enable2FA.isSuccess && !is2FAEnabled) {
      // Refetch setup data to get QR code
      get2FASetup.refetch();
    }
  }, [enable2FA.isSuccess, is2FAEnabled, get2FASetup]);

  // Fetch backup codes when 2FA is enabled and user wants to see them
  useEffect(() => {
    if (is2FAEnabled && showBackupCodes) {
      getBackupCodes.refetch();
    }
  }, [is2FAEnabled, showBackupCodes, getBackupCodes]);

  const handleEnable2FA = () => {
    enable2FA.mutate(undefined, {
      onSuccess: () => {
        toast.success('2FA setup initiated. Please scan the QR code.');
        get2FASetup.refetch();
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to enable 2FA');
      },
    });
  };

  const handleVerify2FA = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    verify2FA.mutate(verificationCode, {
      onSuccess: () => {
        toast.success('2FA enabled successfully!');
        setVerificationCode('');
        getBackupCodes.refetch();
        setShowBackupCodes(true);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Invalid verification code');
      },
    });
  };

  const handleDisable2FA = () => {
    if (window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      disable2FA.mutate(undefined, {
        onSuccess: () => {
          toast.success('2FA disabled successfully');
          setShowBackupCodes(false);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to disable 2FA');
        },
      });
    }
  };

  const handleRegenerateBackupCodes = () => {
    if (window.confirm('Are you sure? This will invalidate your existing backup codes.')) {
      regenerateBackupCodes.mutate(undefined, {
        onSuccess: () => {
          toast.success('Backup codes regenerated');
          getBackupCodes.refetch();
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to regenerate backup codes');
        },
      });
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword, passwordConfirm: confirmPassword },
      {
        onSuccess: () => {
          toast.success('Password changed successfully');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (error) => {
          setPasswordError(error?.response?.data?.message || 'Failed to change password');
        },
      }
    );
  };

  const handleRevokeSession = (sessionId) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      revokeSession.mutate(sessionId, {
        onSuccess: () => {
          toast.success('Session revoked successfully');
          refetchSessions();
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to revoke session');
        },
      });
    }
  };

  const handleRevokeAllOtherSessions = () => {
    if (window.confirm('Are you sure you want to revoke all other sessions? You will remain logged in on this device.')) {
      revokeAllOtherSessions.mutate(undefined, {
        onSuccess: () => {
          toast.success('All other sessions revoked successfully');
          refetchSessions();
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to revoke sessions');
        },
      });
    }
  };

  // Get setup data from either enable2FA response or get2FASetup query
  const setupData = enable2FA.data?.data || 
                    get2FASetup.data?.data || 
                    get2FASetup.data;
  
  // Get backup codes
  const backupCodes = getBackupCodes.data?.data?.backupCodes || 
                      getBackupCodes.data?.backupCodes || 
                      [];

  return (
    <Container>
      {/* Two-Factor Authentication Section */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <FaShieldAlt />
          </SectionIcon>
          <SectionTitle>Two-Factor Authentication</SectionTitle>
        </SectionHeader>
        <SectionContent>
          {is2FAEnabled ? (
            <EnabledState>
              <StatusBadge $enabled={true}>
                <FaCheckCircle />
                Enabled
              </StatusBadge>
              <Description>
                Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when logging in.
              </Description>
              
              {showBackupCodes && backupCodes.length > 0 && (
                <BackupCodesDisplay
                  backupCodes={backupCodes}
                  onRegenerate={handleRegenerateBackupCodes}
                />
              )}

              {!showBackupCodes && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    getBackupCodes.refetch();
                    setShowBackupCodes(true);
                  }}
                >
                  Show Backup Codes
                </Button>
              )}

              <DisableButton
                variant="outline"
                size="md"
                onClick={handleDisable2FA}
                disabled={disable2FA.isPending}
              >
                {disable2FA.isPending ? 'Disabling...' : 'Disable 2FA'}
              </DisableButton>

              {disable2FA.isError && (
                <ErrorText>{disable2FA.error?.response?.data?.message || 'Failed to disable 2FA'}</ErrorText>
              )}
            </EnabledState>
          ) : setupData ? (
            <SetupState>
              <QRCodeDisplay
                otpAuthUrl={setupData.otpAuthUrl || setupData.twoFactor?.otpAuthUrl}
                secret={setupData.base32SecretMasked || setupData.twoFactor?.base32}
                onCopySecret={() => toast.success('Secret copied to clipboard')}
              />
              
              <VerificationForm>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleVerify2FA}
                  disabled={verificationCode.length !== 6 || verify2FA.isPending}
                >
                  {verify2FA.isPending ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </VerificationForm>

              {verify2FA.isError && (
                <ErrorText>{verify2FA.error?.response?.data?.message || 'Verification failed'}</ErrorText>
              )}
            </SetupState>
          ) : (
            <DisabledState>
              <StatusBadge $enabled={false}>
                <FaTimesCircle />
                Disabled
              </StatusBadge>
              <Description>
                Add an extra layer of security to your account by enabling two-factor authentication.
              </Description>
              <Button
                variant="primary"
                size="md"
                onClick={handleEnable2FA}
                disabled={enable2FA.isPending}
              >
                {enable2FA.isPending ? 'Setting up...' : 'Enable 2FA'}
              </Button>

              {enable2FA.isError && (
                <ErrorText>{enable2FA.error?.response?.data?.message || 'Failed to enable 2FA'}</ErrorText>
              )}
            </DisabledState>
          )}
        </SectionContent>
      </Section>

      {/* Password Section */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <FaKey />
          </SectionIcon>
          <SectionTitle>Change Password</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <PasswordForm onSubmit={handleChangePassword}>
            <FormGroup>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <PasswordStrengthIndicator password={newPassword} />
            </FormGroup>

            <FormGroup>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </FormGroup>

            {passwordError && <ErrorText>{passwordError}</ErrorText>}
            {changeError && <ErrorText>{changeError?.response?.data?.message || 'Failed to change password'}</ErrorText>}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isChanging}
            >
              {isChanging ? 'Changing...' : 'Change Password'}
            </Button>
          </PasswordForm>
        </SectionContent>
      </Section>

      {/* Active Sessions Section */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <FaDesktop />
          </SectionIcon>
          <SectionTitle>Active Sessions</SectionTitle>
        </SectionHeader>
        <SectionContent>
          {sessionsLoading ? (
            <LoadingState message="Loading sessions..." />
          ) : sessions.length === 0 ? (
            <EmptyState>No active sessions found</EmptyState>
          ) : (
            <>
              <SessionsList>
                {sessions.map((session) => (
                  <SessionCard
                    key={session.sessionId}
                    session={session}
                    onRevoke={handleRevokeSession}
                    isCurrentDevice={session.isCurrentDevice}
                  />
                ))}
              </SessionsList>
              
              {sessions.filter(s => !s.isCurrentDevice).length > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleRevokeAllOtherSessions}
                  disabled={revokeAllOtherSessions.isPending}
                >
                  {revokeAllOtherSessions.isPending ? 'Revoking...' : 'Revoke All Other Sessions'}
                </Button>
              )}
            </>
          )}
        </SectionContent>
      </Section>
    </Container>
  );
};

export default SecurityTab;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
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
  width: 40px;
  height: 40px;
  background: var(--color-primary-100);
  border-radius: var(--border-radius-md);
  color: var(--color-primary-600);
  font-size: var(--font-size-lg);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  background: ${props => props.$enabled ? 'var(--color-green-100)' : 'var(--color-red-100)'};
  color: ${props => props.$enabled ? 'var(--color-green-700)' : 'var(--color-red-700)'};
  width: fit-content;
`;

const Description = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
`;

const EnabledState = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const DisabledState = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const SetupState = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const VerificationForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 400px;
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 500px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-700);
`;

const Input = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background: var(--color-white-0);
  color: var(--color-grey-900);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const ErrorText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-red-600);
  margin-top: var(--spacing-xs);
`;

const DisableButton = styled(Button)`
  align-self: flex-start;
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const EmptyState = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-500);
  text-align: center;
  padding: var(--spacing-xl);
`;

