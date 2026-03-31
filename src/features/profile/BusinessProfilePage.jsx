import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaStore, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaSave, FaArrowLeft, FaFileUpload, FaFile, FaTimes, FaCompass, FaSearchLocation, FaUser, FaEye, FaFileAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import useSellerStatus from '../../shared/hooks/useSellerStatus';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { SkeletonTableRows } from '../../shared/components/ui/LoadingComponents';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import { compressImage } from '../../shared/utils/imageCompressor';
import { COUNTRIES } from '../../shared/constants/countries';
import { toast } from 'react-toastify';
import { detectGhanaNetwork, isValidGhanaPhone, normalizeGhanaPhone } from '../../shared/utils/detectGhanaNetwork';
import { getOptimizedImageUrl, IMAGE_SLOTS } from '../../shared/utils/cloudinaryConfig';
import NetworkBadge from '../../shared/components/ui/NetworkBadge';

const BusinessProfilePage = ({ embedded = false }) => {
  const { seller, update, isUpdateLoading } = useAuth();
  const { updateOnboardingAsync, businessDocumentsStatus } = useSellerStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [digitalAddressError, setDigitalAddressError] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // File states
  const [businessCert, setBusinessCert] = useState(null);
  const [businessCertPreview, setBusinessCertPreview] = useState(null);
  const [businessCertFormA, setBusinessCertFormA] = useState(null);
  const [businessCertFormAPreview, setBusinessCertFormAPreview] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    shopDescription: '',
    shopLocation: {
      street: '',
      city: '',
      town: '',
      region: '',
      country: 'Ghana',
      postalCode: '',
    },
    digitalAddress: '',
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      TikTok: '',
    },
    phone: '',
  });

  // Load existing seller data
  useEffect(() => {
    if (seller) {
      // Safely extract all fields with proper fallbacks and alternative field names
      // Support shopLocation (new), location (legacy), and shopAddress (legacy) for backward compatibility
      const addressData = seller.shopLocation || seller.location || seller.shopAddress || {};
      setFormData({
        name: seller.name ?? '',
        shopName: seller.shopName ?? '',
        shopDescription: seller.shopDescription ?? '',
        shopLocation: {
          street: addressData.street ?? addressData.streetAddress ?? '',
          city: addressData.city ?? '',
          town: addressData.town ?? '',
          region: addressData.region ?? addressData.state ?? '',
          country: addressData.country ?? 'Ghana',
          postalCode: addressData.postalCode ?? addressData.zipCode ?? '',
        },
        digitalAddress: seller.digitalAddress ?? '',
        socialMediaLinks: {
          facebook: seller.socialMediaLinks?.facebook ?? '',
          instagram: seller.socialMediaLinks?.instagram ?? '',
          twitter: seller.socialMediaLinks?.twitter ?? '',
          TikTok: seller.socialMediaLinks?.TikTok ?? seller.socialMediaLinks?.tiktok ?? '',
        },
        phone: (() => {
          const raw = seller.phone ?? seller.phoneNumber ?? '';
          const normalized = normalizeGhanaPhone(raw);
          return normalized || raw;
        })(),
      });

      // Set previews for existing documents (from Cloudinary URLs)
      // Handle both old format (string) and new format (object with url property)
      if (seller.verificationDocuments?.businessCert) {
        const businessCert = seller.verificationDocuments.businessCert;
        const certUrl = typeof businessCert === 'string' ? businessCert : businessCert.url || businessCert;
        setBusinessCertPreview(getOptimizedImageUrl(certUrl, IMAGE_SLOTS.AVATAR));
      }
      if (seller.verificationDocuments?.businessCertFormA) {
        const businessCertFormA = seller.verificationDocuments.businessCertFormA;
        const certUrl = typeof businessCertFormA === 'string' ? businessCertFormA : businessCertFormA.url || businessCertFormA;
        setBusinessCertFormAPreview(getOptimizedImageUrl(certUrl, IMAGE_SLOTS.AVATAR));
      }
      if (seller.verificationDocuments?.idProof) {
        const idProof = seller.verificationDocuments.idProof;
        const certUrl = typeof idProof === 'string' ? idProof : idProof.url || idProof;
        setIdProofPreview(getOptimizedImageUrl(certUrl, IMAGE_SLOTS.AVATAR));
      }
    }
  }, [seller]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      // Only revoke blob URLs (temporary file previews), not Cloudinary URLs
      if (typeof businessCertPreview === 'string' && businessCertPreview.startsWith('blob:')) {
        URL.revokeObjectURL(businessCertPreview);
      }
      if (typeof businessCertFormAPreview === 'string' && businessCertFormAPreview.startsWith('blob:')) {
        URL.revokeObjectURL(businessCertFormAPreview);
      }
      if (typeof idProofPreview === 'string' && idProofPreview.startsWith('blob:')) {
        URL.revokeObjectURL(idProofPreview);
      }
    };
  }, [businessCertPreview, businessCertFormAPreview, idProofPreview]);

  // Scroll to verification documents section when query parameter is present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scrollTo = searchParams.get('scrollTo');

    if (scrollTo === 'verification-documents') {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        const element = document.getElementById('verification-documents');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Clean up the query parameter after scrolling
          const newSearchParams = new URLSearchParams(location.search);
          newSearchParams.delete('scrollTo');
          const newSearch = newSearchParams.toString();
          window.history.replaceState(
            null,
            '',
            `${location.pathname}${newSearch ? `?${newSearch}` : ''}${location.hash || ''}`
          );
        }
      }, 500); // Increased delay to ensure tab content is rendered
    }
  }, [location.search, location.pathname, location.hash]);

  // Validate Ghana digital address format
  const validateDigitalAddress = (address) => {
    if (!address) return true; // Digital address is optional
    const cleaned = address.replace(/[^A-Z0-9]/g, '').toUpperCase();
    return /^[A-Z]{2}\d{7}$/.test(cleaned);
  };

  // Format digital address as GA-123-4567
  const formatDigitalAddress = (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    if (cleaned.length >= 9) {
      return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 5)}-${cleaned.substring(5, 9)}`;
    }
    return cleaned;
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear digital address error when user starts typing
    if (name === 'digitalAddress' && digitalAddressError) {
      setDigitalAddressError('');
    }

    if (name === 'digitalAddress') {
      // Format and validate digital address
      const formatted = formatDigitalAddress(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));

      // Validate if value is provided
      if (formatted && !validateDigitalAddress(formatted)) {
        setDigitalAddressError('Please use format: GA-123-4567');
      } else {
        setDigitalAddressError('');
      }
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        shopLocation: {
          ...prev.shopLocation,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        socialMediaLinks: {
          ...prev.socialMediaLinks,
          [socialField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Get current location and generate digital address
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsFetchingLocation(true);
    setLocationError('');
    setDigitalAddressError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get address details
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          // Extract address components
          const address = data.address || {};

          // Update form with location data
          setFormData((prev) => ({
            ...prev,
            shopLocation: {
              ...prev.shopLocation,
              street: address.road || address.highway || prev.shopLocation.street,
              city: address.city || address.town || address.village || prev.shopLocation.city,
              town: address.suburb || address.neighbourhood || address.quarter || prev.shopLocation.town,
              region: address.state || address.region || prev.shopLocation.region,
              country: prev.shopLocation.country || 'Ghana',
              postalCode: prev.shopLocation.postalCode || '',
            },
            digitalAddress: '', // Manual entry required or keep as is if no real API
          }));
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setLocationError('Failed to get address details. Please enter manually.');
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        // Handle different geolocation error codes
        let errorMessage = 'Unable to get your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please enter your address manually.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or enter your address manually.';
            break;
          default:
            errorMessage += 'Please enter your address manually.';
            break;
        }

        setLocationError(errorMessage);
        setIsFetchingLocation(false);

        // Only log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Geolocation error:', error.message || error);
        }
      },
      {
        enableHighAccuracy: false, // Set to false to allow less accurate but faster results
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    );
  };


  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      setError('Please upload an image (JPG, PNG) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (type === 'businessCert') {
      setBusinessCert(file);
      if (file.type.startsWith('image/')) {
        setBusinessCertPreview(URL.createObjectURL(file));
      }
    } else if (type === 'businessCertFormA') {
      setBusinessCertFormA(file);
      if (file.type.startsWith('image/')) {
        setBusinessCertFormAPreview(URL.createObjectURL(file));
      }
    } else if (type === 'idProof') {
      setIdProof(file);
      if (file.type.startsWith('image/')) {
        setIdProofPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleRemoveFile = (type) => {
    if (type === 'businessCert') {
      setBusinessCert(null);
      if (businessCertPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(businessCertPreview);
      }
      setBusinessCertPreview(null);
    } else if (type === 'businessCertFormA') {
      setBusinessCertFormA(null);
      if (businessCertFormAPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(businessCertFormAPreview);
      }
      setBusinessCertFormAPreview(null);
    } else if (type === 'idProof') {
      setIdProof(null);
      if (idProofPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(idProofPreview);
      }
      setIdProofPreview(null);
    }
  };

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
      if (!formData.shopName.trim()) {
        throw new Error('Shop name is required');
      }

      if (!formData.phone.trim()) {
        throw new Error('Phone number is required');
      }
      const phoneDigits = normalizeGhanaPhone(formData.phone);
      if (phoneDigits.length !== 10) {
        throw new Error('Phone number must be 10 digits');
      }
      if (!isValidGhanaPhone(formData.phone)) {
        throw new Error('Please enter a valid Ghana mobile number');
      }

      // Validate mandatory ID Proof (Ghana Card)
      if (!idProof && !idProofPreview) {
        throw new Error('Identity Proof (Ghana Card) is required for verification');
      }

      // Validate digital address if provided
      if (formData.digitalAddress && formData.shopLocation.country === 'Ghana') {
        if (!validateDigitalAddress(formData.digitalAddress)) {
          setDigitalAddressError('Please use format: GA-123-4567');
          throw new Error('Invalid digital address format');
        }
      }

      // Check if we have files to upload
      const hasFiles = businessCert || businessCertFormA || idProof;

      if (hasFiles) {
        // Use FormData for file uploads
        const submitFormData = new FormData();

        // Add text fields
        Object.keys(formData).forEach((key) => {
          if (key === 'shopLocation') {
            submitFormData.append('shopLocation', JSON.stringify(formData.shopLocation));
          } else if (key === 'socialMediaLinks') {
            submitFormData.append('socialMediaLinks', JSON.stringify(formData.socialMediaLinks));
          } else {
            submitFormData.append(key, formData[key]);
          }
        });

        // Add files with compression for images
        if (businessCert) {
          if (businessCert.type.startsWith('image/')) {
            try {
              const compressed = await compressImage(businessCert, { quality: 0.8, maxWidth: 1920, maxHeight: 1920 });
              submitFormData.append('businessCert', compressed);
            } catch (compressionError) {
              console.warn('Compression failed, using original:', compressionError);
              submitFormData.append('businessCert', businessCert);
            }
          } else {
            submitFormData.append('businessCert', businessCert);
          }
        }

        if (businessCertFormA) {
          if (businessCertFormA.type.startsWith('image/')) {
            try {
              const compressed = await compressImage(businessCertFormA, { quality: 0.8, maxWidth: 1920, maxHeight: 1920 });
              submitFormData.append('businessCertFormA', compressed);
            } catch (compressionError) {
              console.warn('Compression failed, using original:', compressionError);
              submitFormData.append('businessCertFormA', businessCertFormA);
            }
          } else {
            submitFormData.append('businessCertFormA', businessCertFormA);
          }
        }

        if (idProof) {
          if (idProof.type.startsWith('image/')) {
            try {
              const compressed = await compressImage(idProof, { quality: 0.8, maxWidth: 1920, maxHeight: 1920 });
              submitFormData.append('idProof', compressed);
            } catch (compressionError) {
              console.warn('Compression failed, using original:', compressionError);
              submitFormData.append('idProof', idProof);
            }
          } else {
            submitFormData.append('idProof', idProof);
          }
        }

        // Update seller profile with files
        await update.mutate(submitFormData);
      } else {
        // No files, use regular JSON update
        await update.mutate(formData);
      }
      // Update onboarding status
      try {
        await updateOnboardingAsync();
      } catch (onboardingError) {
        console.warn('Failed to update onboarding status:', onboardingError);
        toast.error('Profile saved, but failed to update status. Please refresh or contact support.');
      }

      setSuccess(true);

      // Redirect to payment method tab after a short delay
      setTimeout(() => {
        if (embedded) {
          // If embedded in settings page, update hash to switch to payment tab
          // Use navigate with replace to update hash without adding to history
          navigate(`${location.pathname}#payment`, { replace: true });
          // Scroll to top of the tab content
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // If standalone, navigate to settings page with payment tab
          navigate(`${PATHS.SETTINGS}#payment`);
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update business profile');
      console.error('Error updating business profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!seller) {
    return <SkeletonTableRows count={5} />;
  }

  const content = (
    <>
      {!embedded && (
        <PageHeader $padding="lg" $marginBottom="lg">
          <TitleSection>
            <h1>Complete Your Business Profile</h1>
            <p>Fill in your business information to start selling on Saiisai</p>
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
          <div>
            <SuccessTitle>Profile Updated Successfully!</SuccessTitle>
            <SuccessMessage>Redirecting to dashboard...</SuccessMessage>
          </div>
        </SuccessBanner>
      )}

      {/* Error Message */}
      {error && (
        <ErrorBanner>
          <div>
            <ErrorTitle>Error</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        </ErrorBanner>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <Section $marginBottom="lg">
          <SectionHeader $padding="md">
            <h3>Basic Information</h3>
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
              <Label htmlFor="shopName">
                Shop Name <Required>*</Required>
              </Label>
              <Input
                id="shopName"
                name="shopName"
                type="text"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Enter your shop name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">
                Phone Number <Required>*</Required>
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
                    required
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
              </PhoneInputWrapper>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="shopDescription">Shop Description</Label>
              <TextArea
                id="shopDescription"
                name="shopDescription"
                value={formData.shopDescription}
                onChange={handleChange}
                placeholder="Describe your business, products, and what makes you unique..."
                rows={5}
              />
              <HelperText>Help customers understand what you offer</HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="digitalAddress">
                <FaCompass /> Digital Address (Ghana Post GPS)
                <LocationButton
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isFetchingLocation || formData.shopLocation.country !== 'Ghana'}
                >
                  <FaSearchLocation />
                  {isFetchingLocation ? 'Detecting...' : 'Auto-detect'}
                </LocationButton>
              </Label>
              <Input
                id="digitalAddress"
                name="digitalAddress"
                type="text"
                value={formData.digitalAddress}
                onChange={handleChange}
                placeholder="GA-123-4567"
                maxLength={11}
                disabled={isSubmitting || isUpdateLoading || formData.shopLocation.country !== 'Ghana'}
                style={{ textTransform: 'uppercase' }}
              />
              {digitalAddressError && (
                <ErrorText>{digitalAddressError}</ErrorText>
              )}
              {locationError && <ErrorText>{locationError}</ErrorText>}
              <HelperText>
                {formData.shopLocation.country === 'Ghana'
                  ? 'Format: GA-123-4567 (Ghana Post GPS)'
                  : 'Digital address only available for Ghana'}
              </HelperText>
            </FormGroup>
          </FormContent>
        </Section>

        {/* Address Section */}
        <Section $marginBottom="lg">
          <SectionHeader $padding="md">
            <h3>Business Address</h3>
          </SectionHeader>
          <FormContent>
            <FormRow>
              <FormGroup>
                <Label htmlFor="address.street">Street Address</Label>
                <Input
                  id="address.street"
                  name="address.street"
                  type="text"
                  value={formData.shopLocation.street}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="address.city">City</Label>
                <Input
                  id="address.city"
                  name="address.city"
                  type="text"
                  value={formData.shopLocation.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="address.town">Town</Label>
                <Input
                  id="address.town"
                  name="address.town"
                  type="text"
                  value={formData.shopLocation.town}
                  onChange={handleChange}
                  placeholder="Town"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="address.region">Region</Label>
                <Input
                  id="address.region"
                  name="address.region"
                  type="text"
                  value={formData.shopLocation.region}
                  onChange={handleChange}
                  placeholder="Region"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="address.country">Country</Label>
                <Select
                  id="address.country"
                  name="address.country"
                  value={formData.shopLocation.country}
                  onChange={handleChange}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="address.postalCode">Postal Code</Label>
                <Input
                  id="address.postalCode"
                  name="address.postalCode"
                  type="text"
                  value={formData.shopLocation.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                />
              </FormGroup>
            </FormRow>
          </FormContent>
        </Section>

        {/* Social Media Links Section */}
        <Section $marginBottom="lg">
          <SectionHeader $padding="md">
            <h3>Social Media Links (Optional)</h3>
          </SectionHeader>
          <FormContent>
            <FormGroup>
              <Label htmlFor="social.facebook">
                <FaFacebook /> Facebook
              </Label>
              <Input
                id="social.facebook"
                name="social.facebook"
                type="url"
                value={formData.socialMediaLinks.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourpage"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="social.instagram">
                <FaInstagram /> Instagram
              </Label>
              <Input
                id="social.instagram"
                name="social.instagram"
                type="url"
                value={formData.socialMediaLinks.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourpage"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="social.twitter">
                <FaTwitter /> Twitter
              </Label>
              <Input
                id="social.twitter"
                name="social.twitter"
                type="url"
                value={formData.socialMediaLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourpage"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="social.TikTok">
                <FaTiktok /> TikTok
              </Label>
              <Input
                id="social.TikTok"
                name="social.TikTok"
                type="url"
                value={formData.socialMediaLinks.TikTok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@yourpage"
              />
            </FormGroup>
          </FormContent>
        </Section>

        {/* Verification Documents Section */}
        <Section id="verification-documents" $marginBottom="lg">
          <SectionHeader $padding="md">
            <h3>Verification Documents</h3>
            <HelperText style={{ margin: 0, fontSize: '0.8rem' }}>
              Upload documents for account verification (Images or PDF, max 5MB each)
            </HelperText>
          </SectionHeader>

          {/* Check if documents are submitted (only show status when seller has actually uploaded at least one document with a URL) */}
          {(() => {
            const hasDocumentWithUrl = (doc) => {
              if (!doc) return false;
              if (typeof doc === 'string') return String(doc).trim() !== '';
              return !!(doc.url && String(doc.url).trim() !== '');
            };

            const hasIdProof = hasDocumentWithUrl(seller?.verificationDocuments?.idProof);
            const hasBusinessCert = hasDocumentWithUrl(seller?.verificationDocuments?.businessCert);
            const hasBusinessCertFormA = hasDocumentWithUrl(seller?.verificationDocuments?.businessCertFormA);

            const hasAnyDocument = hasIdProof || hasBusinessCert || hasBusinessCertFormA;
            const isVerified = businessDocumentsStatus?.isVerified || false;
            const isPending = hasAnyDocument && !isVerified;

            return (
              <FormContent>
                {/* Status Card: Show if any document has been submitted */}
                {hasAnyDocument && (
                  <VerificationStatusCard $verified={isVerified} style={{ marginBottom: '1.5rem' }}>
                    <StatusIcon $verified={isVerified}>
                      {isVerified ? <FaCheckCircle /> : <FaClock />}
                    </StatusIcon>
                    <StatusContent>
                      <StatusTitle $verified={isVerified}>
                        {isVerified ? 'Documents Verified' : 'Waiting for Admin Verification'}
                      </StatusTitle>
                      <StatusMessage>
                        {isVerified
                          ? 'Your identity (and business documents if provided) have been verified by our admin team. You can now proceed with your seller account setup.'
                          : 'Your documents have been submitted and are currently under review by our admin team. We will notify you once the verification is complete.'}
                      </StatusMessage>
                      {isPending && (
                        <StatusNote>
                          This process typically takes 1-3 business days. Please check back later or contact support if you have any questions.
                        </StatusNote>
                      )}
                    </StatusContent>
                  </VerificationStatusCard>
                )}

                {/* ID Proof Section */}
                <h4 style={{ marginTop: '0.5rem', marginBottom: '0.5rem', color: '#1F2937' }}>Verify the seller id</h4>
                <FormGroup>
                  <Label htmlFor="idProof">
                    <FaFileAlt /> Identity Proof (Ghana Card) <Required>*</Required>
                  </Label>
                  <FileUploadContainer>
                    <FileInputWrapper>
                      <HiddenFileInput
                        id="idProof"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'idProof')}
                        disabled={isSubmitting || isUpdateLoading}
                      />
                      <FileUploadButton
                        type="button"
                        onClick={() => document.getElementById('idProof')?.click()}
                        disabled={isSubmitting || isUpdateLoading}
                      >
                        <FaFileUpload /> {idProof || hasIdProof ? 'Change File' : 'Upload File'}
                      </FileUploadButton>
                    </FileInputWrapper>
                    {idProof && (
                      <FileInfo>
                        <FileIcon>
                          <FaFile />
                        </FileIcon>
                        <FileDetails>
                          <FileName>{idProof.name}</FileName>
                          <FileSize>{(idProof.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                        </FileDetails>
                        <RemoveFileButton
                          type="button"
                          onClick={() => handleRemoveFile('idProof')}
                          disabled={isSubmitting || isUpdateLoading}
                        >
                          <FaTimes />
                        </RemoveFileButton>
                      </FileInfo>
                    )}
                    {idProofPreview && (
                      <DocumentPreviewWrapper>
                        {typeof idProofPreview === 'string' && (idProofPreview.endsWith('.pdf') || idProofPreview.includes('/pdf')) ? (
                          <PDFPreview>
                            <FaFileAlt size={48} />
                            <PDFText>PDF Document</PDFText>
                            <PreviewLink href={idProofPreview} target="_blank" rel="noopener noreferrer">
                              <FaEye /> View PDF
                            </PreviewLink>
                          </PDFPreview>
                        ) : (
                          <>
                            <PreviewImage src={idProofPreview} alt="ID proof preview" />
                            <PreviewLink href={idProofPreview} target="_blank" rel="noopener noreferrer">
                              <FaEye /> View Full Size
                            </PreviewLink>
                          </>
                        )}
                      </DocumentPreviewWrapper>
                    )}
                  </FileUploadContainer>
                </FormGroup>

                {/* Business Section */}
                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#1F2937' }}>Verify the seller business</h4>

                {/* Business Certificate */}
                <FormGroup>
                  <Label htmlFor="businessCert">
                    <FaFile /> Business Certificate / Registration Document (Optional)
                  </Label>
                  <FileUploadContainer>
                    <FileInputWrapper>
                      <HiddenFileInput
                        id="businessCert"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'businessCert')}
                        disabled={isSubmitting || isUpdateLoading}
                      />
                      <FileUploadButton
                        type="button"
                        onClick={() => document.getElementById('businessCert')?.click()}
                        disabled={isSubmitting || isUpdateLoading}
                      >
                        <FaFileUpload /> {businessCert || hasBusinessCert ? 'Change File' : 'Upload File'}
                      </FileUploadButton>
                    </FileInputWrapper>
                    {businessCert && (
                      <FileInfo>
                        <FileIcon>
                          <FaFile />
                        </FileIcon>
                        <FileDetails>
                          <FileName>{businessCert.name}</FileName>
                          <FileSize>{(businessCert.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                        </FileDetails>
                        <RemoveFileButton
                          type="button"
                          onClick={() => handleRemoveFile('businessCert')}
                          disabled={isSubmitting || isUpdateLoading}
                        >
                          <FaTimes />
                        </RemoveFileButton>
                      </FileInfo>
                    )}
                    {businessCertPreview && (
                      <DocumentPreviewWrapper>
                        {typeof businessCertPreview === 'string' && (businessCertPreview.endsWith('.pdf') || businessCertPreview.includes('/pdf')) ? (
                          <PDFPreview>
                            <FaFileAlt size={48} />
                            <PDFText>PDF Document</PDFText>
                            <PreviewLink href={businessCertPreview} target="_blank" rel="noopener noreferrer">
                              <FaEye /> View PDF
                            </PreviewLink>
                          </PDFPreview>
                        ) : (
                          <>
                            <PreviewImage src={businessCertPreview} alt="Business certificate preview" />
                            <PreviewLink href={businessCertPreview} target="_blank" rel="noopener noreferrer">
                              <FaEye /> View Full Size
                            </PreviewLink>
                          </>
                        )}
                      </DocumentPreviewWrapper>
                    )}
                  </FileUploadContainer>
                </FormGroup>

                {/* Business Certificate Form A */}
                <FormGroup style={{ marginTop: '1rem' }}>
                  <Label htmlFor="businessCertFormA">
                    <FaFile /> Business Certificate (Form A) (Optional)
                  </Label>
                  <FileUploadContainer>
                    <FileInputWrapper>
                      <HiddenFileInput
                        id="businessCertFormA"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'businessCertFormA')}
                        disabled={isSubmitting || isUpdateLoading}
                      />
                      <FileUploadButton
                        type="button"
                        onClick={() => document.getElementById('businessCertFormA')?.click()}
                        disabled={isSubmitting || isUpdateLoading}
                      >
                        <FaFileUpload /> {businessCertFormA || hasBusinessCertFormA ? 'Change File' : 'Upload File'}
                      </FileUploadButton>
                    </FileInputWrapper>
                    {businessCertFormA && (
                      <FileInfo>
                        <FileIcon>
                          <FaFile />
                        </FileIcon>
                        <FileDetails>
                          <FileName>{businessCertFormA.name}</FileName>
                          <FileSize>{(businessCertFormA.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                        </FileDetails>
                        <RemoveFileButton
                          type="button"
                          onClick={() => handleRemoveFile('businessCertFormA')}
                          disabled={isSubmitting || isUpdateLoading}
                        >
                          <FaTimes />
                        </RemoveFileButton>
                      </FileInfo>
                    )}
                    {businessCertFormAPreview && (
                      <DocumentPreviewWrapper>
                        {typeof businessCertFormAPreview === 'string' && (businessCertFormAPreview.endsWith('.pdf') || businessCertFormAPreview.includes('/pdf')) ? (
                          <PDFPreview>
                            <FaFileAlt size={48} />
                            <PDFText>PDF Document</PDFText>
                            <PreviewLink href={businessCertFormAPreview} target="_blank" rel="noopener noreferrer">
                              <FaEye /> View PDF
                            </PreviewLink>
                          </PDFPreview>
                        ) : (
                          <>
                            <PreviewImage src={businessCertFormAPreview} alt="Business certificate form A preview" />
                            <PreviewLink href={businessCertFormAPreview} target="_blank" rel="noopener noreferrer">
                              <FaEye /> View Full Size
                            </PreviewLink>
                          </>
                        )}
                      </DocumentPreviewWrapper>
                    )}
                  </FileUploadContainer>
                </FormGroup>
              </FormContent>
            );
          })()}

        </Section>

        {/* Submit Button */}
        <ActionSection>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting || isUpdateLoading}
            disabled={isSubmitting || isUpdateLoading}
          >
            <FaSave /> Save Business Profile
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

export default BusinessProfilePage;

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  svg { color: #9CA3AF; }
`;

const Required = styled.span`
  color: #EF4444;
`;

const Input = styled.input`
  height: 38px;
  padding: 0 0.85rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  background: #F9F8F5;
  color: #111827;
  outline: none;

  &:focus { border-color: #E8920A; background: #FFFFFF; }
  &::placeholder { color: #9CA3AF; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.85rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  background: #F9F8F5;
  color: #111827;
  resize: vertical;
  outline: none;
  min-height: 80px;

  &:focus { border-color: #E8920A; background: #FFFFFF; }
  &::placeholder { color: #9CA3AF; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Select = styled.select`
  height: 38px;
  padding: 0 0.85rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  background: #F9F8F5;
  color: #111827;
  outline: none;
  cursor: pointer;

  &:focus { border-color: #E8920A; background: #FFFFFF; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const HelperText = styled.p`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin: 0;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 0.5px solid #F1EFE8;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    button { width: 100%; }
  }
`;

const SuccessBanner = styled.div`
  background: #D1FAE5;
  border: 0.5px solid #A7F3D0;
  border-left: 3px solid #10B981;
  color: #065F46;
  padding: 0.85rem 1rem;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SuccessTitle = styled.h3`
  margin: 0 0 0.2rem;
  font-size: 0.9rem;
  font-weight: 600;
`;

const SuccessMessage = styled.p`
  margin: 0;
  font-size: 0.8rem;
`;

const ErrorBanner = styled.div`
  background: #FEF2F2;
  border: 0.5px solid #FECACA;
  border-left: 3px solid #EF4444;
  color: #991B1B;
  padding: 0.85rem 1rem;
  border-radius: 9px;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 0.2rem;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 0.8rem;
`;

// File Upload Styled Components
const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileInputWrapper = styled.div`
  position: relative;
`;

const HiddenFileInput = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
`;

const FileUploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 36px;
  padding: 0 1rem;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover:not(:disabled) { opacity: 0.88; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
`;

const FileIcon = styled.div`
  color: #E8920A;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
`;

const FileDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const FileName = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  word-break: break-all;
`;

const FileSize = styled.span`
  font-size: 0.72rem;
  color: #9CA3AF;
`;

const RemoveFileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: #FEE2E2;
  color: #991B1B;
  border: 0.5px solid #FECACA;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s;
  flex-shrink: 0;

  &:hover:not(:disabled) { background: #FECACA; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const DocumentPreviewWrapper = styled.div`
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-width: 500px;
  max-height: 400px;
  object-fit: contain;
  border-radius: 9px;
  border: 0.5px solid #F1EFE8;
  background: #F9F8F5;
  padding: 0.25rem;
  cursor: pointer;
  transition: border-color 0.12s;

  &:hover { border-color: #E8920A; }
`;

const PDFPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: #F9F8F5;
  border: 1px dashed #D1D5DB;
  border-radius: 9px;
  min-height: 160px;
  color: #9CA3AF;
`;

const PDFText = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
`;

const PreviewLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 34px;
  padding: 0 0.9rem;
  background: #E8920A;
  color: #FFFFFF;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 9px;
  transition: opacity 0.12s;
  width: fit-content;

  &:hover { opacity: 0.88; }
`;

const LocationButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: 0.5rem;
  height: 26px;
  padding: 0 0.65rem;
  background: #FDF3E3;
  color: #E8920A;
  border: 0.5px solid #FDE68A;
  border-radius: 7px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: #FEF3C7; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorText = styled.span`
  color: #EF4444;
  font-size: 0.75rem;
  display: block;
`;

const PhoneInputWrapper = styled.div``;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem 0 0;
  border: 0.5px solid ${(p) => (p.$hasError ? '#EF4444' : '#F1EFE8')};
  border-radius: 9px;
  background: #F9F8F5;
  min-height: 38px;

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
  padding: 0 0.5rem;
  border: none;
  font-size: 0.875rem;
  flex: 1;
  min-width: 0;
  background: transparent;
  color: #111827;
  outline: none;

  &::placeholder { color: #9CA3AF; }
  &:disabled { cursor: not-allowed; opacity: 0.6; }
`;

const VerificationStatusCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: ${(p) => p.$verified ? '#F0FDF4' : '#EFF6FF'};
  border: 0.5px solid ${(p) => p.$verified ? '#BBF7D0' : '#BFDBFE'};
  border-left: 3px solid ${(p) => p.$verified ? '#10B981' : '#3B82F6'};
  border-radius: 12px;
  transition: border-color 0.12s;
`;

const StatusIcon = styled.div`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${(p) => p.$verified ? '#10B981' : '#3B82F6'};
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
`;

const StatusContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const StatusTitle = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(p) => p.$verified ? '#065F46' : '#1E40AF'};
`;

const StatusMessage = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${(p) => p.$verified ? '#047857' : '#1D4ED8'};
  line-height: 1.5;
`;

const StatusNote = styled.p`
  margin: 0.2rem 0 0 0;
  font-size: 0.75rem;
  color: ${(p) => p.$verified ? '#065F46' : '#1E40AF'};
  font-style: italic;
  line-height: 1.5;
`;
