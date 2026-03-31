import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaShieldAlt, FaKey, FaDesktop, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import useAuth from '../../../shared/hooks/useAuth';
import { use2FA, usePasswordChange, useSessions } from '../../../shared/hooks/useSecurity';
import Button from '../../../shared/components/ui/Button';
import { LoadingState, ErrorState } from '../../../shared/components/ui/LoadingComponents';
import QRCodeDisplay from './components/QRCodeDisplay';
import BackupCodesDisplay from './components/BackupCodesDisplay';
import SessionCard from './components/SessionCard';
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator';
import { toast } from 'react-toastify';
import { ConfirmationModal } from '../../../shared/components/modal/ConfirmationModal';

const SecurityTab = () => {
  const { seller, refetchAuth } = useAuth();
  const connectedAccounts = seller?.connectedAccounts || {};
  const googleConnected = !!connectedAccounts.google;
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }

  // Refetch auth when Security tab mounts so connectedAccounts (e.g. after Google login) is up to date
  useEffect(() => {
    refetchAuth();
  }, [refetchAuth]);
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
    setConfirmModal({
      title: 'Disable Two-Factor Authentication',
      message: 'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
      onConfirm: () => {
        setConfirmModal(null);
        disable2FA.mutate(undefined, {
          onSuccess: () => {
            toast.success('2FA disabled successfully');
            setShowBackupCodes(false);
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to disable 2FA');
          },
        });
      },
    });
  };

  const handleRegenerateBackupCodes = () => {
    setConfirmModal({
      title: 'Regenerate Backup Codes',
      message: 'Are you sure? This will invalidate your existing backup codes.',
      onConfirm: () => {
        setConfirmModal(null);
        regenerateBackupCodes.mutate(undefined, {
          onSuccess: () => {
            toast.success('Backup codes regenerated');
            getBackupCodes.refetch();
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to regenerate backup codes');
          },
        });
      },
    });
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
    setConfirmModal({
      title: 'Revoke Session',
      message: 'Are you sure you want to revoke this session?',
      onConfirm: () => {
        setConfirmModal(null);
        revokeSession.mutate(sessionId, {
          onSuccess: () => {
            toast.success('Session revoked successfully');
            refetchSessions();
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to revoke session');
          },
        });
      },
    });
  };

  const handleRevokeAllOtherSessions = () => {
    setConfirmModal({
      title: 'Revoke All Other Sessions',
      message: 'Are you sure you want to revoke all other sessions? You will remain logged in on this device.',
      onConfirm: () => {
        setConfirmModal(null);
        revokeAllOtherSessions.mutate(undefined, {
          onSuccess: () => {
            toast.success('All other sessions revoked successfully');
            refetchSessions();
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to revoke sessions');
          },
        });
      },
    });
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
    <>
      <Container>
        {/* Connected accounts */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <FaKey />
            </SectionIcon>
            <SectionTitle>Connected accounts</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <SignInMethodList>
              <SignInMethodItem>
                <FcGoogle size={20} />
                <span>Google</span>
                {googleConnected ? (
                  <ConnectedBadge $connected>Connected</ConnectedBadge>
                ) : (
                  <ConnectedBadge>Not connected</ConnectedBadge>
                )}
              </SignInMethodItem>
            </SignInMethodList>
            <SignInMethodNote>
              Sign in with Google on the login page to link your account. You can then use Google to sign in.
            </SignInMethodNote>
          </SectionContent>
        </Section>

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

      <ConfirmationModal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm || (() => { })}
        title={confirmModal?.title || 'Confirm'}
        message={confirmModal?.message || ''}
        confirmText="Confirm"
        confirmColor="#ef4444"
      />
    </>
  );
};

export default SecurityTab;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-bottom: 1rem;
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

const SectionTitle = styled.h2`
  font-size: 0.975rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const SignInMethodList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SignInMethodItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;

  > span:first-of-type {
    flex: 1;
    font-weight: 500;
    font-size: 0.875rem;
    color: #374151;
  }
`;

const SignInMethodNote = styled.span`
  font-size: 0.875rem;
  color: #9CA3AF;
  line-height: 1.5;
`;

const ConnectedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${(p) => p.$connected ? '#D1FAE5' : '#F3F4F6'};
  color: ${(p) => p.$connected ? '#065F46' : '#6B7280'};
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 24px;
  padding: 0 0.7rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(p) => p.$enabled ? '#D1FAE5' : '#FEE2E2'};
  color: ${(p) => p.$enabled ? '#065F46' : '#991B1B'};
  width: fit-content;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
`;

const EnabledState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const DisabledState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const SetupState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VerificationForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-width: 400px;
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-width: 500px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  height: 38px;
  padding: 0 0.85rem;
  font-size: 0.875rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  background: #F9F8F5;
  color: #111827;
  outline: none;

  &:focus { border-color: #E8920A; background: #FFFFFF; }
  &::placeholder { color: #9CA3AF; }
`;

const ErrorText = styled.p`
  font-size: 0.875rem;
  color: #EF4444;
  margin: 0;
`;

const DisableButton = styled(Button)`
  align-self: flex-start;
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EmptyState = styled.p`
  font-size: 0.875rem;
  color: #9CA3AF;
  text-align: center;
  padding: 1.5rem;
  margin: 0;
`;

