import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaStore, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaSave, FaArrowLeft, FaFileUpload, FaFile, FaTimes, FaCompass, FaSearchLocation, FaUser, FaEye, FaFileAlt } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import useSellerStatus from '../../shared/hooks/useSellerStatus';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import { compressImage } from '../../shared/utils/imageCompressor';

const BusinessProfilePage = ({ embedded = false }) => {
  const { seller, update, isUpdateLoading } = useAuth();
  const { updateOnboardingAsync } = useSellerStatus();
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
  const [idProof, setIdProof] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [addressProofPreview, setAddressProofPreview] = useState(null);

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
      });

          // Set previews for existing documents (from Cloudinary URLs)
          // Handle both old format (string) and new format (object with url property)
          if (seller.verificationDocuments?.businessCert) {
            const businessCert = seller.verificationDocuments.businessCert;
            setBusinessCertPreview(typeof businessCert === 'string' ? businessCert : businessCert.url || businessCert);
          }
          if (seller.verificationDocuments?.idProof) {
            const idProof = seller.verificationDocuments.idProof;
            setIdProofPreview(typeof idProof === 'string' ? idProof : idProof.url || idProof);
          }
          if (seller.verificationDocuments?.addresProof) {
            const addressProof = seller.verificationDocuments.addresProof;
            setAddressProofPreview(typeof addressProof === 'string' ? addressProof : addressProof.url || addressProof);
          }
    }
  }, [seller]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (businessCertPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(businessCertPreview);
      }
      if (idProofPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(idProofPreview);
      }
      if (addressProofPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(addressProofPreview);
      }
    };
  }, [businessCertPreview, idProofPreview, addressProofPreview]);

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
            digitalAddress: generateGhanaDigitalAddress(latitude, longitude),
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

  // Generate Ghana digital address from coordinates (mock implementation)
  const generateGhanaDigitalAddress = (lat, lng) => {
    // In a real app, you would use an actual Ghana Post GPS API here
    // This is a simplified mock implementation
    
    // Convert latitude to letters (GA for Ghana)
    const latSuffix = Math.floor((Math.abs(lat) % 1) * 10000);
    
    // Convert longitude to numbers
    const lngPrefix = Math.abs(Math.floor(lng));
    
    // Format as GA-XXX-YYYY
    return `GA-${String(lngPrefix).padStart(3, '0')}-${String(latSuffix).padStart(4, '0')}`;
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
    } else if (type === 'idProof') {
      setIdProof(file);
      if (file.type.startsWith('image/')) {
        setIdProofPreview(URL.createObjectURL(file));
      }
    } else if (type === 'addressProof') {
      setAddressProof(file);
      if (file.type.startsWith('image/')) {
        setAddressProofPreview(URL.createObjectURL(file));
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
    } else if (type === 'idProof') {
      setIdProof(null);
      if (idProofPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(idProofPreview);
      }
      setIdProofPreview(null);
    } else if (type === 'addressProof') {
      setAddressProof(null);
      if (addressProofPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(addressProofPreview);
      }
      setAddressProofPreview(null);
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

      // Validate digital address if provided
      if (formData.digitalAddress && formData.shopLocation.country === 'Ghana') {
        if (!validateDigitalAddress(formData.digitalAddress)) {
          setDigitalAddressError('Please use format: GA-123-4567');
          throw new Error('Invalid digital address format');
        }
      }

      // Check if we have files to upload
      const hasFiles = businessCert || idProof || addressProof;

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

        if (addressProof) {
          if (addressProof.type.startsWith('image/')) {
            try {
              const compressed = await compressImage(addressProof, { quality: 0.8, maxWidth: 1920, maxHeight: 1920 });
              submitFormData.append('addressProof', compressed);
            } catch (compressionError) {
              console.warn('Compression failed, using original:', compressionError);
              submitFormData.append('addressProof', addressProof);
            }
          } else {
            submitFormData.append('addressProof', addressProof);
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
    return (
      <LoadingState message="Loading seller information..." />
    );
  }

  const content = (
    <>
      {!embedded && (
        <PageHeader $padding="lg" $marginBottom="lg">
          <TitleSection>
            <h1>Complete Your Business Profile</h1>
            <p>Fill in your business information to start selling on EazShop</p>
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
                  <option value="Ghana">Ghana</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="South Africa">South Africa</option>
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
        <Section $marginBottom="lg">
          <SectionHeader $padding="md">
            <h3>Verification Documents</h3>
            <HelperText style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>
              Upload documents for account verification (Images or PDF, max 5MB each)
            </HelperText>
          </SectionHeader>
          <FormContent>
            {/* Business Certificate */}
            <FormGroup>
              <Label htmlFor="businessCert">
                <FaFile /> Business Certificate / Registration Document
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
                    <FaFileUpload /> {businessCert ? 'Change File' : 'Upload File'}
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

            {/* ID Proof */}
            <FormGroup>
              <Label htmlFor="idProof">
                <FaFile /> ID Proof (National ID, Passport, etc.)
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
                    <FaFileUpload /> {idProof ? 'Change File' : 'Upload File'}
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

            {/* Address Proof */}
            <FormGroup>
              <Label htmlFor="addressProof">
                <FaFile /> Address Proof (Utility Bill, Bank Statement, etc.)
              </Label>
              <FileUploadContainer>
                <FileInputWrapper>
                  <HiddenFileInput
                    id="addressProof"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, 'addressProof')}
                    disabled={isSubmitting || isUpdateLoading}
                  />
                  <FileUploadButton
                    type="button"
                    onClick={() => document.getElementById('addressProof')?.click()}
                    disabled={isSubmitting || isUpdateLoading}
                  >
                    <FaFileUpload /> {addressProof ? 'Change File' : 'Upload File'}
                  </FileUploadButton>
                </FileInputWrapper>
                {addressProof && (
                  <FileInfo>
                    <FileIcon>
                      <FaFile />
                    </FileIcon>
                    <FileDetails>
                      <FileName>{addressProof.name}</FileName>
                      <FileSize>{(addressProof.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                    </FileDetails>
                    <RemoveFileButton
                      type="button"
                      onClick={() => handleRemoveFile('addressProof')}
                      disabled={isSubmitting || isUpdateLoading}
                    >
                      <FaTimes />
                    </RemoveFileButton>
                  </FileInfo>
                )}
                {addressProofPreview && (
                  <DocumentPreviewWrapper>
                    {typeof addressProofPreview === 'string' && (addressProofPreview.endsWith('.pdf') || addressProofPreview.includes('/pdf')) ? (
                      <PDFPreview>
                        <FaFileAlt size={48} />
                        <PDFText>PDF Document</PDFText>
                        <PreviewLink href={addressProofPreview} target="_blank" rel="noopener noreferrer">
                          <FaEye /> View PDF
                        </PreviewLink>
                      </PDFPreview>
                    ) : (
                      <>
                        <PreviewImage src={addressProofPreview} alt="Address proof preview" />
                        <PreviewLink href={addressProofPreview} target="_blank" rel="noopener noreferrer">
                          <FaEye /> View Full Size
                        </PreviewLink>
                      </>
                    )}
                  </DocumentPreviewWrapper>
                )}
              </FileUploadContainer>
            </FormGroup>
          </FormContent>
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
  gap: var(--spacing-lg);
`;

const FormContent = styled.div`
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  svg {
    color: var(--color-grey-500);
  }
`;

const Required = styled.span`
  color: var(--color-red-500);
`;

const Input = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const HelperText = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
  margin-top: var(--spacing-xs);
`;

const ActionSection = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const SuccessBanner = styled.div`
  background: linear-gradient(135deg, var(--color-green-500), var(--color-green-600));
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-md);
`;

const SuccessTitle = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
`;

const SuccessMessage = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
  opacity: 0.95;
`;

const ErrorBanner = styled.div`
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  color: var(--color-red-700);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
`;

const ErrorTitle = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
`;

// File Upload Styled Components
const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary-600);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    font-size: var(--font-size-md);
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
`;

const FileIcon = styled.div`
  color: var(--color-primary-500);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
`;

const FileDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const FileName = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-900);
  word-break: break-all;
`;

const FileSize = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
`;

const RemoveFileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: var(--color-red-50);
  color: var(--color-red-600);
  border: 1px solid var(--color-red-200);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-red-100);
    border-color: var(--color-red-300);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    font-size: var(--font-size-sm);
  }
`;

const DocumentPreviewWrapper = styled.div`
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const PreviewImage = styled.img`
  width: 100%;
  max-width: 500px;
  max-height: 400px;
  object-fit: contain;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-grey-200);
  background: var(--color-grey-50);
  padding: var(--spacing-xs);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-primary-500);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }
`;

const PDFPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  background: var(--color-grey-50);
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-md);
  min-height: 200px;
  color: var(--color-grey-600);
`;

const PDFText = styled.span`
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  color: var(--color-grey-700);
`;

const PreviewLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-500);
  color: white;
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
  width: fit-content;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  }

  svg {
    font-size: var(--font-size-sm);
  }
`;

const LocationButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-left: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary-100);
    border-color: var(--color-primary-300);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: var(--font-size-sm);
  }
`;

const ErrorText = styled.span`
  color: var(--color-red-600);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
  display: block;
`;

