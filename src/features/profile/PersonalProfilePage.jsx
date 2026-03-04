import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaArrowLeft, FaCamera, FaLock } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import { detectGhanaNetwork, isValidGhanaPhone, normalizeGhanaPhone } from '../../shared/utils/detectGhanaNetwork';
import NetworkBadge from '../../shared/components/ui/NetworkBadge';

const PersonalProfilePage = ({ embedded = false }) => {
  const { seller, update, isUpdateLoading, refetchAuth } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Load existing seller data (normalize phone to 0XXXXXXXXX for display)
  useEffect(() => {
    if (seller) {
      const rawPhone = seller.phone || '';
      const normalized = normalizeGhanaPhone(rawPhone);
      setFormData({
        name: seller.name || '',
        email: seller.email || '',
        phone: normalized || rawPhone,
      });
    }
  }, [seller]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const formatPhoneDisplay = (stripped) => {
    const d = normalizeGhanaPhone(stripped || '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const stripped = normalizeGhanaPhone(raw);
    let limited = stripped;
    if (!stripped) limited = '';
    else if (stripped.startsWith('0')) limited = stripped.slice(0, 10);
    else limited = ('0' + stripped).slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: limited }));
    if (error) setError(null);
  };

  const phoneNetworkResult = formData.phone ? detectGhanaNetwork(formData.phone) : null;
  const phoneDigits = normalizeGhanaPhone(formData.phone);
  const phoneLengthError = phoneDigits.length >= 3 && phoneDigits.length !== 10;
  const phoneUnknownError = phoneDigits.length === 10 && phoneNetworkResult && !phoneNetworkResult.isValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.phone.trim()) {
        const digits = normalizeGhanaPhone(formData.phone);
        if (digits.length !== 10) {
          throw new Error('Phone number must be 10 digits');
        }
        if (!isValidGhanaPhone(formData.phone)) {
          throw new Error('Please enter a valid Ghana mobile number');
        }
      }

      // Update seller profile (send stripped phone)
      await update.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() ? formData.phone.replace(/\D/g, '') : undefined,
      });

      // Refetch auth to get updated data
      await refetchAuth();

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating personal profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!seller) {
    return <LoadingState message="Loading seller information..." />;
  }

  const content = (
    <>
      {!embedded && (
        <PageHeader $padding="lg" $marginBottom="lg">
          <TitleSection>
            <h1>Personal Profile</h1>
            <p>Update your personal information and account details</p>
          </TitleSection>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate(PATHS.DASHBOARD)}
          >
            <FaArrowLeft /> Back to Dashboard
          </Button>
        </PageHeader>
      )}

      {/* Success Message */}
      {success && (
        <SuccessBanner>
          <FaSave size={20} />
          <span>Profile updated successfully!</span>
        </SuccessBanner>
      )}

      {/* Error Message */}
      {error && (
        <ErrorBanner>
          <span>{error}</span>
        </ErrorBanner>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <Section $marginBottom="lg">
          <SectionHeader $padding="md">
            <h3>Personal Information</h3>
          </SectionHeader>
          <FormContent>
            <FormGroup>
              <Label htmlFor="name">
                <FaUser /> Full Name <Required>*</Required>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting || isUpdateLoading}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">
                <FaEnvelope /> Email Address <Required>*</Required>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting || isUpdateLoading}
              />
              <HelperText>
                Your email address is used for account verification and notifications
              </HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">
                <FaPhone /> Phone Number
              </Label>
              <PhoneInputWrapper>
                <PhoneInputContainer $hasError={!!(phoneLengthError || phoneUnknownError)}>
                  <PhonePrefix>🇬🇭</PhonePrefix>
                  <PhoneInput
                    id="phone"
                    name="phone"
                    type="text"
                    inputMode="tel"
                    value={formatPhoneDisplay(formData.phone)}
                    onChange={handlePhoneChange}
                    placeholder="024 123 4567"
                    disabled={isSubmitting || isUpdateLoading}
                  />
                  {phoneNetworkResult && (
                    <PhoneBadgeSlot>
                      <NetworkBadge network={phoneNetworkResult} />
                    </PhoneBadgeSlot>
                  )}
                </PhoneInputContainer>
                {phoneLengthError && <ErrorText>Phone number must be 10 digits</ErrorText>}
                {!phoneLengthError && phoneUnknownError && (
                  <ErrorText>Please enter a valid Ghana mobile number</ErrorText>
                )}
                {!phoneLengthError && !phoneUnknownError && (
                  <HelperText>
                    Your phone number is used for notifications and account communication
                  </HelperText>
                )}
              </PhoneInputWrapper>
            </FormGroup>
          </FormContent>
        </Section>

        {/* Action Buttons */}
        <ActionSection>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting || isUpdateLoading}
            disabled={isSubmitting || isUpdateLoading}
          >
            <FaSave /> Save Changes
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => navigate(PATHS.DASHBOARD)}
            disabled={isSubmitting || isUpdateLoading}
          >
            Cancel
          </Button>
        </ActionSection>
      </Form>
    </>
  );

  if (embedded) {
    return content;
  }

  return <PageContainer>{content}</PageContainer>;
};

export default PersonalProfilePage;

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormContent = styled.div`
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const Required = styled.span`
  color: var(--color-red-600);
  margin-left: var(--spacing-xs);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);

  svg {
    color: var(--color-grey-500);
  }
`;

const Input = styled.input`
  padding: var(--spacing-md);
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  color: var(--color-grey-900);
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const HelperText = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  margin: var(--spacing-xs) 0 0 0;
`;

const ErrorText = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-red-600);
  margin: var(--spacing-xs) 0 0 0;
`;

const PhoneInputWrapper = styled.div`
  margin-top: var(--spacing-xs);
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem 0 0;
  border: 2px solid ${(p) => (p.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)')};
  border-radius: var(--border-radius-md);
  background: #fff;
  min-height: 44px;
  &:focus-within {
    border-color: ${(p) => (p.$hasError ? 'var(--color-red-500)' : 'var(--color-primary-500)')};
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
`;

const PhoneBadgeSlot = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

const PhonePrefix = styled.span`
  color: var(--color-grey-700);
  font-size: var(--font-size-md);
  padding-left: var(--spacing-md);
  flex-shrink: 0;
`;

const PhoneInput = styled.input`
  padding: var(--spacing-md) 0.5rem var(--spacing-md) 0;
  border: none;
  font-size: var(--font-size-md);
  flex: 1;
  min-width: 0;
  background: transparent;
  color: var(--color-grey-900);
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--color-grey-400);
  }
  &:disabled {
    background: transparent;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const SuccessBanner = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: var(--border-radius-md);
  color: var(--color-green-700);
  margin-bottom: var(--spacing-lg);

  svg {
    color: var(--color-green-600);
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--border-radius-md);
  color: var(--color-red-700);
  margin-bottom: var(--spacing-lg);
`;

const ActionSection = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

