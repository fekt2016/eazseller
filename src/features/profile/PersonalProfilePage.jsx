import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaArrowLeft, FaCamera, FaLock } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
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
        <ProfileHeader>
          <div>
            <ProfileTitle>Personal Profile</ProfileTitle>
            <ProfileSubtitle>Update your personal information and account details</ProfileSubtitle>
          </div>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate(PATHS.DASHBOARD)}
          >
            <FaArrowLeft /> Back to Dashboard
          </Button>
        </ProfileHeader>
      )}

      {success && (
        <SuccessBanner>
          <FaSave size={16} />
          <span>Profile updated successfully!</span>
        </SuccessBanner>
      )}

      {error && (
        <ErrorBanner>
          <span>{error}</span>
        </ErrorBanner>
      )}

      <Form onSubmit={handleSubmit}>
        <ProfileSection>
          <SectionTitle>Personal Information</SectionTitle>
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
        </ProfileSection>

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

  return <PersonalPage>{content}</PersonalPage>;
};

export default PersonalProfilePage;

// Styled Components
const PersonalPage = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const ProfileHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid #E8920A;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ProfileTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;
`;

const ProfileSubtitle = styled.p`
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
`;

const ProfileSection = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  padding: 1rem 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FormContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Required = styled.span`
  color: #EF4444;
  margin-left: 0.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;

  svg {
    color: #9CA3AF;
    font-size: 0.75rem;
  }
`;

const Input = styled.input`
  height: 38px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background: #F9F8F5;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.12s, background 0.12s;

  &:focus {
    border-color: #E8920A;
    background: #FFFFFF;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #D1D5DB;
  }
`;

const HelperText = styled.p`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin: 0.2rem 0 0;
`;

const ErrorText = styled.p`
  font-size: 0.75rem;
  color: #EF4444;
  margin: 0.2rem 0 0;
`;

const PhoneInputWrapper = styled.div``;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.75rem 0 0;
  border: 0.5px solid ${(p) => (p.$hasError ? '#EF4444' : '#F1EFE8')};
  border-radius: 9px;
  background: #F9F8F5;
  min-height: 38px;
  transition: border-color 0.12s, background 0.12s;

  &:focus-within {
    border-color: ${(p) => (p.$hasError ? '#EF4444' : '#E8920A')};
    background: #FFFFFF;
  }
`;

const PhoneBadgeSlot = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

const PhonePrefix = styled.span`
  color: #374151;
  font-size: 0.875rem;
  padding-left: 0.75rem;
  flex-shrink: 0;
`;

const PhoneInput = styled.input`
  padding: 0 0.4rem;
  border: none;
  font-size: 0.9rem;
  flex: 1;
  min-width: 0;
  background: transparent;
  color: #111827;
  outline: none;

  &::placeholder { color: #D1D5DB; }
  &:disabled { cursor: not-allowed; opacity: 0.6; }
`;

const SuccessBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #D1FAE5;
  border: 0.5px solid #A7F3D0;
  border-left: 3px solid #10B981;
  border-radius: 9px;
  color: #065F46;
  font-size: 0.9rem;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #FEF2F2;
  border: 0.5px solid #FECACA;
  border-left: 3px solid #EF4444;
  border-radius: 9px;
  color: #DC2626;
  font-size: 0.9rem;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem 1.25rem;
  border-top: 0.5px solid #F1EFE8;
  background: #FAFAF9;

  @media (max-width: 640px) {
    flex-direction: column;
    button { width: 100%; }
  }
`;

