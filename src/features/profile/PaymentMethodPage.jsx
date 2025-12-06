import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCreditCard, FaMobileAlt, FaSave, FaArrowLeft, FaBuilding, FaPhone, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import useSellerStatus from '../../shared/hooks/useSellerStatus';
import { useGetPaymentMethods, useDeletePaymentMethod, useSetDefaultPaymentMethod, useCreatePaymentMethod, useUpdatePaymentMethod } from '../../shared/hooks/usePaymentMethod';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import { detectGhanaPhoneNetwork } from '../../shared/utils/phoneNetworkDetector';
import { toast } from 'react-toastify';

const PaymentMethodPage = ({ embedded = false }) => {
  const { seller, update, isUpdateLoading } = useAuth();
  const { updateOnboardingAsync } = useSellerStatus();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'mobile'
  
  // Fetch payment methods from PaymentMethod model
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods, refetch: refetchPaymentMethods } = useGetPaymentMethods();
  console.log("paymentMethods", paymentMethods);
  const deletePaymentMethod = useDeletePaymentMethod();
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod();
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  
  // State for editing mode
  const [editingMethodId, setEditingMethodId] = useState(null);

  // Check if there's a default payment method
  const hasDefaultPaymentMethod = paymentMethods.some(method => method.isDefault);
  
  // Handle set default payment method
  const handleSetDefault = async (id) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(id);
      await refetchPaymentMethods();
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to set default payment method');
    }
  };
  
  // Auto-set first payment method as default if none exists
  useEffect(() => {
    if (paymentMethods.length > 0 && !hasDefaultPaymentMethod && !isLoadingPaymentMethods) {
      // Automatically set the first payment method as default
      const firstMethodId = paymentMethods[0]._id || paymentMethods[0].id;
      if (firstMethodId) {
        handleSetDefault(firstMethodId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethods.length, hasDefaultPaymentMethod, isLoadingPaymentMethods]);

  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
  });

  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    accountName: '',
    phone: '',
    network: '',
  });

  // Ghanaian banks
  const ghanaBanks = [
    'GCB Bank',
    'Absa Ghana',
    'Stanbic Bank',
    'Ecobank Ghana',
    'Fidelity Bank',
    'CalBank',
    'Zenith Bank',
    'GT Bank',
    'Republic Bank',
    'Standard Chartered',
    'First National Bank',
  ];

  // Mobile networks
  const mobileNetworks = ['MTN', 'Vodafone', 'AirtelTigo'];

  // Load existing seller data
  useEffect(() => {
    if (seller) {
      // Load bank details if they exist
      if (seller.paymentMethods?.bankAccount) {
        setBankDetails({
          accountName: seller.paymentMethods.bankAccount.accountName || '',
          accountNumber: seller.paymentMethods.bankAccount.accountNumber || '',
          bankName: seller.paymentMethods.bankAccount.bankName || '',
          branch: seller.paymentMethods.bankAccount.branch || '',
        });
      }

      // Load mobile money details if they exist
      if (seller.paymentMethods?.mobileMoney) {
        setMobileMoneyDetails({
          accountName: seller.paymentMethods.mobileMoney.accountName || '',
          phone: seller.paymentMethods.mobileMoney.phone || '',
          network: seller.paymentMethods.mobileMoney.network || '',
        });
      }
    }
  }, [seller]);

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMobileMoneyChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-detect network when phone number changes
    if (name === 'phone' && value) {
      const networkDetection = detectGhanaPhoneNetwork(value);
      if (networkDetection.isValid && networkDetection.network) {
        // Auto-set network based on detected network
        setMobileMoneyDetails((prev) => ({
          ...prev,
          phone: value,
          network: networkDetection.network === 'Telecel' ? 'vodafone' : 
                   networkDetection.network === 'AirtelTigo' ? 'airteltigo' : 
                   networkDetection.network.toLowerCase(),
        }));
      } else {
        // Clear network if phone is invalid or network can't be detected
        setMobileMoneyDetails((prev) => ({
          ...prev,
          phone: value,
        }));
      }
    } else {
      setMobileMoneyDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Validate Ghana phone number
  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^0(24|54|55|59|20|50|27|57|26|56|23|28)\d{7}$/.test(cleaned);
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod.mutateAsync(id);
        refetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  // Format payment method details for display
  const formatPaymentMethodDetails = (method) => {
    if (method.type === 'mobile_money') {
      return {
        type: 'Mobile Money',
        primary: method.mobileNumber || method.phone || 'N/A',
        secondary: method.provider || method.network || 'N/A',
        accountName: method.accountName || method.name || 'N/A',
        fullDetails: {
          accountName: method.accountName || method.name || 'N/A',
          phone: method.mobileNumber || method.phone || 'N/A',
          network: method.provider || method.network || 'N/A',
        },
      };
    } else if (method.type === 'bank_transfer') {
      return {
        type: 'Bank Transfer',
        primary: method.accountNumber || 'N/A',
        secondary: method.bankName || 'N/A',
        accountName: method.accountName || method.name || 'N/A',
        branch: method.branch || '',
        fullDetails: {
          accountName: method.accountName || method.name || 'N/A',
          accountNumber: method.accountNumber || 'N/A',
          bankName: method.bankName || 'N/A',
          branch: method.branch || 'N/A',
        },
      };
    }
    return {
      type: method.type || 'Unknown',
      primary: 'N/A',
      secondary: 'N/A',
      accountName: method.name || 'N/A',
      fullDetails: {},
    };
  };

  // Handle edit payment method
  const handleEditPaymentMethod = (method) => {
    setEditingMethodId(method._id || method.id);
    
    // Populate form based on payment method type
    if (method.type === 'bank_transfer') {
      setActiveTab('bank');
      setBankDetails({
        accountName: method.accountName || method.name || '',
        accountNumber: method.accountNumber || '',
        bankName: method.bankName || '',
        branch: method.branch || '',
      });
    } else if (method.type === 'mobile_money') {
      setActiveTab('mobile');
      setMobileMoneyDetails({
        accountName: method.accountName || method.name || '',
        phone: method.mobileNumber || '',
        network: method.provider || '',
      });
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      let paymentMethodData;

      // Validate and prepare data based on active tab
      if (activeTab === 'bank') {
        if (!bankDetails.accountName.trim()) {
          throw new Error('Account name is required');
        }
        if (!bankDetails.accountNumber.trim()) {
          throw new Error('Account number is required');
        }
        if (!bankDetails.bankName) {
          throw new Error('Please select a bank');
        }

        // Prepare bank transfer payment method data
        paymentMethodData = {
          type: 'bank_transfer',
          name: bankDetails.accountName.trim(),
          accountName: bankDetails.accountName.trim(),
          accountNumber: bankDetails.accountNumber.trim(),
          bankName: bankDetails.bankName,
          branch: bankDetails.branch.trim() || undefined,
        };
      } else if (activeTab === 'mobile') {
        if (!mobileMoneyDetails.accountName.trim()) {
          throw new Error('Account name is required');
        }
        if (!mobileMoneyDetails.phone.trim()) {
          throw new Error('Phone number is required');
        }
        if (!validatePhoneNumber(mobileMoneyDetails.phone)) {
          throw new Error('Please enter a valid Ghana phone number');
        }
        if (!mobileMoneyDetails.network) {
          throw new Error('Please select a mobile network');
        }

        // Prepare mobile money payment method data
        paymentMethodData = {
          type: 'mobile_money',
          name: mobileMoneyDetails.accountName.trim(),
          accountName: mobileMoneyDetails.accountName.trim(),
          mobileNumber: mobileMoneyDetails.phone.replace(/\D/g, ''), // Remove non-digits
          provider: mobileMoneyDetails.network,
        };
      }

      // If editing, update existing payment method
      if (editingMethodId) {
        await updatePaymentMethod.mutateAsync({
          id: editingMethodId,
          data: paymentMethodData,
        });
        toast.success('Payment method updated successfully!');
        setEditingMethodId(null); // Exit edit mode
      } else {
        // If this is the first payment method, set it as default
        const isFirstPaymentMethod = paymentMethods.length === 0;
        if (isFirstPaymentMethod) {
          paymentMethodData.isDefault = true;
        }

        // Create payment method in PaymentMethod model
        await createPaymentMethod.mutateAsync(paymentMethodData);
        toast.success('Payment method saved successfully!');
      }
      
      // Refetch payment methods to show updated list
      await refetchPaymentMethods();
      
      // Reset form
      if (activeTab === 'bank') {
        setBankDetails({
          accountName: '',
          accountNumber: '',
          bankName: '',
          branch: '',
        });
      } else {
        setMobileMoneyDetails({
          accountName: '',
          phone: '',
          network: '',
        });
      }

      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save payment method';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error saving payment method:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!seller) {
    return <LoadingState message="Loading seller information..." />;
  }

  const hasBankDetails = seller.paymentMethods?.bankAccount?.accountNumber;
  const hasMobileMoneyDetails = seller.paymentMethods?.mobileMoney?.phone;

  const content = (
    <>
      {!embedded && (
        <PageHeader $padding="lg" $marginBottom="lg">
          <TitleSection>
            <h1>Payment Methods</h1>
            <p>Add your bank account or mobile money details to receive payments</p>
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
          <FaCheckCircle size={20} />
          <div>
            <SuccessTitle>Payment Method Saved Successfully!</SuccessTitle>
            <SuccessMessage>Your payment method has been added to the list below.</SuccessMessage>
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

      {/* Payment Methods Table */}
      <Section $marginBottom="lg">
        <SectionHeader $padding="md">
          <h3>Saved Payment Methods</h3>
          <p>Manage your saved payment methods from the PaymentMethod model</p>
        </SectionHeader>
        {isLoadingPaymentMethods ? (
          <LoadingState message="Loading payment methods..." />
        ) : paymentMethods.length === 0 ? (
          <EmptyState>
            <FaCreditCard size={48} />
            <EmptyTitle>No Payment Methods</EmptyTitle>
            <EmptyMessage>You haven't saved any payment methods yet. Add one below to get started.</EmptyMessage>
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Account Name</th>
                  <th>Account Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((method) => {
                  const details = formatPaymentMethodDetails(method);
                  return (
                    <tr key={method._id}>
                      <td>
                        <TypeCell>
                          {method.type === 'mobile_money' ? (
                            <FaMobileAlt style={{ color: 'var(--color-primary-500)' }} />
                          ) : (
                            <FaBuilding style={{ color: 'var(--color-primary-500)' }} />
                          )}
                          <span>{details.type}</span>
                        </TypeCell>
                      </td>
                      <td>
                        <AccountName>{details.accountName}</AccountName>
                      </td>
                      <td>
                        <AccountDetails>
                          {method.type === 'mobile_money' ? (
                            <>
                              <PrimaryDetail>
                                <strong>Phone:</strong> {details.fullDetails.phone}
                              </PrimaryDetail>
                              <SecondaryDetail>
                                <strong>Network:</strong> {details.fullDetails.network}
                              </SecondaryDetail>
                              <SecondaryDetail>
                                <strong>Account Name:</strong> {details.fullDetails.accountName}
                              </SecondaryDetail>
                            </>
                          ) : (
                            <>
                              <PrimaryDetail>
                                <strong>Account Number:</strong> {details.fullDetails.accountNumber}
                              </PrimaryDetail>
                              <SecondaryDetail>
                                <strong>Bank:</strong> {details.fullDetails.bankName}
                              </SecondaryDetail>
                              <SecondaryDetail>
                                <strong>Account Name:</strong> {details.fullDetails.accountName}
                              </SecondaryDetail>
                              {details.fullDetails.branch && details.fullDetails.branch !== 'N/A' && (
                                <SecondaryDetail>
                                  <strong>Branch:</strong> {details.fullDetails.branch}
                                </SecondaryDetail>
                              )}
                            </>
                          )}
                        </AccountDetails>
                      </td>
                      <td>
                        <DefaultSelector>
                          <RadioButton
                            type="radio"
                            name="defaultPaymentMethod"
                            checked={method.isDefault}
                            onChange={() => !method.isDefault && handleSetDefault(method._id)}
                            disabled={setDefaultPaymentMethod.isPending}
                          />
                          <RadioLabel onClick={() => !method.isDefault && handleSetDefault(method._id)}>
                            {method.isDefault ? (
                              <DefaultBadge>
                                <FaStar /> Default
                              </DefaultBadge>
                            ) : (
                              <DefaultText>Set as Default</DefaultText>
                            )}
                          </RadioLabel>
                        </DefaultSelector>
                      </td>
                      <td>
                        <ActionButtons>
                          <ActionButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPaymentMethod(method)}
                          >
                            <FaEdit /> Edit
                          </ActionButton>
                          <ActionButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePaymentMethod(method._id)}
                            disabled={deletePaymentMethod.isPending}
                            $danger
                          >
                            <FaTrash /> Delete
                          </ActionButton>
                        </ActionButtons>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* Tabs */}
      <TabsContainer>
        <TabButton
          $active={activeTab === 'bank'}
          onClick={() => setActiveTab('bank')}
        >
          <FaBuilding /> Bank Account
          {hasBankDetails && <FaCheckCircle style={{ marginLeft: '8px', color: 'var(--color-green-600)' }} />}
        </TabButton>
        <TabButton
          $active={activeTab === 'mobile'}
          onClick={() => setActiveTab('mobile')}
        >
          <FaMobileAlt /> Mobile Money
          {hasMobileMoneyDetails && <FaCheckCircle style={{ marginLeft: '8px', color: 'var(--color-green-600)' }} />}
        </TabButton>
      </TabsContainer>

      <Form onSubmit={handleSubmit}>
        {/* Bank Account Section */}
        {activeTab === 'bank' && (
          <Section $marginBottom="lg">
            <SectionHeader $padding="md">
              <h3>Bank Account Details</h3>
            </SectionHeader>
            <FormContent>
              {hasBankDetails && (
                <InfoBanner>
                  <FaCheckCircle /> You have a bank account configured. Update the details below if needed.
                </InfoBanner>
              )}

              <FormGroup>
                <Label htmlFor="accountName">
                  Account Name <Required>*</Required>
                </Label>
                <Input
                  id="accountName"
                  name="accountName"
                  type="text"
                  value={bankDetails.accountName}
                  onChange={handleBankChange}
                  placeholder="Enter account holder name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="accountNumber">
                  Account Number <Required>*</Required>
                </Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={handleBankChange}
                  placeholder="Enter account number"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="bankName">
                  Bank Name <Required>*</Required>
                </Label>
                <Select
                  id="bankName"
                  name="bankName"
                  value={bankDetails.bankName}
                  onChange={handleBankChange}
                  required
                >
                  <option value="">Select a bank</option>
                  {ghanaBanks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="branch">Branch (Optional)</Label>
                <Input
                  id="branch"
                  name="branch"
                  type="text"
                  value={bankDetails.branch}
                  onChange={handleBankChange}
                  placeholder="Enter branch name"
                />
              </FormGroup>
            </FormContent>
          </Section>
        )}

        {/* Mobile Money Section */}
        {activeTab === 'mobile' && (
          <Section $marginBottom="lg">
            <SectionHeader $padding="md">
              <h3>Mobile Money Details</h3>
            </SectionHeader>
            <FormContent>
              {hasMobileMoneyDetails && (
                <InfoBanner>
                  <FaCheckCircle /> You have a mobile money account configured. Update the details below if needed.
                </InfoBanner>
              )}

              <FormGroup>
                <Label htmlFor="accountName">
                  Account Name <Required>*</Required>
                </Label>
                <Input
                  id="accountName"
                  name="accountName"
                  type="text"
                  value={mobileMoneyDetails.accountName}
                  onChange={handleMobileMoneyChange}
                  placeholder="Enter account holder name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">
                  <FaPhone /> Phone Number <Required>*</Required>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={mobileMoneyDetails.phone}
                  onChange={handleMobileMoneyChange}
                  placeholder="0244123456"
                  maxLength={10}
                  required
                />
                <HelperText>
                  {mobileMoneyDetails.phone && detectGhanaPhoneNetwork(mobileMoneyDetails.phone).isValid
                    ? `Detected network: ${detectGhanaPhoneNetwork(mobileMoneyDetails.phone).network || 'Unknown'}`
                    : 'Enter your mobile money number (10 digits)'}
                </HelperText>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="network">
                  <FaMobileAlt /> Mobile Network <Required>*</Required>
                </Label>
                <Select
                  id="network"
                  name="network"
                  value={mobileMoneyDetails.network}
                  onChange={handleMobileMoneyChange}
                  required
                >
                  <option value="">Select network</option>
                  {mobileNetworks.map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormContent>
          </Section>
        )}

        {/* Submit Button */}
        <ActionSection>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting || isUpdateLoading}
            disabled={isSubmitting || isUpdateLoading}
          >
            <FaSave /> Save Payment Method
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

export default PaymentMethodPage;

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

const TabsContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-grey-200);
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
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

const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  color: var(--color-blue-700);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);

  svg {
    color: var(--color-blue-600);
    flex-shrink: 0;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  background: var(--color-white-0);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);

  thead {
    background: var(--color-grey-50);
    border-bottom: 2px solid var(--color-grey-200);
  }

  th {
    padding: var(--spacing-md);
    text-align: left;
    font-weight: var(--font-semibold);
    color: var(--color-grey-700);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--color-grey-100);
      transition: background-color 0.2s ease;

      &:hover {
        background: var(--color-grey-50);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: var(--spacing-md);
      color: var(--color-grey-700);
      vertical-align: middle;
    }
  }
`;

const TypeCell = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-medium);

  svg {
    font-size: var(--font-size-lg);
  }
`;

const AccountName = styled.div`
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
`;

const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 200px;
`;

const PrimaryDetail = styled.div`
  font-weight: var(--font-medium);
  color: var(--color-grey-900);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  
  strong {
    font-weight: var(--font-semibold);
    color: var(--color-grey-700);
    margin-right: var(--spacing-xs);
  }
`;

const SecondaryDetail = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  line-height: 1.5;
  
  strong {
    font-weight: var(--font-semibold);
    color: var(--color-grey-700);
    margin-right: var(--spacing-xs);
  }
`;

const DefaultSelector = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const RadioButton = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary-500);
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const RadioLabel = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const DefaultBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-yellow-50);
  color: var(--color-yellow-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);

  svg {
    color: var(--color-yellow-600);
  }
`;

const DefaultText = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  font-weight: var(--font-medium);
  
  &:hover {
    color: var(--color-primary-600);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
`;

const ActionButton = styled(Button)`
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);

  ${(props) =>
    props.$danger &&
    `
    color: var(--color-red-600);
    
    &:hover {
      background: var(--color-red-50);
      color: var(--color-red-700);
    }
  `}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-grey-500);

  svg {
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }
`;

const EmptyTitle = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
`;

const EmptyMessage = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  max-width: 400px;
`;

