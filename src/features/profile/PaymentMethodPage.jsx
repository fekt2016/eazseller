import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCreditCard, FaMobileAlt, FaSave, FaArrowLeft, FaBuilding, FaPhone, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaStar, FaClock } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import useSellerStatus from '../../shared/hooks/useSellerStatus';
import { useGetPaymentMethods, useDeletePaymentMethod, useSetDefaultPaymentMethod, useCreatePaymentMethod, useUpdatePaymentMethod } from '../../shared/hooks/usePaymentMethod';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
import { getUserFriendlyErrorMessage } from '../../shared/utils/helpers';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import { detectGhanaPhoneNetwork } from '../../shared/utils/phoneNetworkDetector';
import { toast } from 'react-toastify';
import { GHANA_BANKS, MOBILE_NETWORKS } from '../../shared/constants/banksList';
import { ConfirmationModal } from '../../shared/components/modal/ConfirmationModal';

const PaymentMethodPage = ({ embedded = false }) => {
  const { seller, update, isUpdateLoading } = useAuth();
  const { updateOnboardingAsync } = useSellerStatus();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'mobile'

  // Fetch payment methods from PaymentMethod model
  const {
    data: paymentMethods = [],
    isLoading: isLoadingPaymentMethods,
    error: paymentMethodsError,
    refetch: refetchPaymentMethods
  } = useGetPaymentMethods();

  const hasPaymentMethod = paymentMethods.length > 0;
  const deletePaymentMethod = useDeletePaymentMethod();
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod();
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();

  // State for editing mode
  const [editingMethodId, setEditingMethodId] = useState(null);

  // State for reactivation
  const [requestReactivation, setRequestReactivation] = useState(false);

  // Get payout status from seller
  const payoutStatus = seller?.payoutStatus || 'pending';
  const payoutRejectionReason = seller?.payoutRejectionReason || null;
  const isPayoutRejected = payoutStatus === 'rejected';
  const isPayoutPending = payoutStatus === 'pending';

  // Check if any payment method needs activation/reactivation
  const hasPaymentMethodNeedingActivation = paymentMethods.some(method => {
    const methodStatus = method.verificationStatus || 'pending';
    return methodStatus === 'rejected' || (methodStatus === 'pending' && isPayoutPending);
  });

  // Check if there's a default payment method (used only when rendering default indicators)
  const hasDefaultPaymentMethod = paymentMethods.some(method => method.isDefault);

  // Handle set default payment method - invoked explicitly by user action.
  const handleSetDefault = async (id) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(id);
      await refetchPaymentMethods();
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      const message = getUserFriendlyErrorMessage(
        error,
        'We could not update your default payment method. Please try again.'
      );
      toast.error(message);
    }
  };

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


  // Load existing seller data (from seller.paymentMethods or verified PaymentMethod records)
  useEffect(() => {
    // Priority 1: seller.paymentMethods (embedded)
    if (seller?.paymentMethods?.bankAccount) {
      const bank = seller.paymentMethods.bankAccount;
      setBankDetails({
        accountName: bank.accountName || '',
        accountNumber: bank.accountNumber || '',
        bankName: bank.bankName || '',
        branch: bank.branch || '',
      });
    } else {
      // Fallback: verified bank from PaymentMethod API
      const bankMethod = paymentMethods.find(
        (pm) => pm.type === 'bank_transfer' && (pm.verificationStatus === 'verified' || pm.status === 'verified')
      );
      if (bankMethod) {
        setBankDetails({
          accountName: bankMethod.accountName || bankMethod.name || '',
          accountNumber: bankMethod.accountNumber || '',
          bankName: bankMethod.bankName || '',
          branch: bankMethod.branch || '',
        });
      }
    }

    if (seller?.paymentMethods?.mobileMoney) {
      const mobile = seller.paymentMethods.mobileMoney;
      setMobileMoneyDetails({
        accountName: mobile.accountName || '',
        phone: mobile.phone || '',
        network: mobile.network || '',
      });
    } else {
      // Fallback: verified mobile money from PaymentMethod API
      const mobileMethod = paymentMethods.find(
        (pm) => pm.type === 'mobile_money' && (pm.verificationStatus === 'verified' || pm.status === 'verified')
      );
      if (mobileMethod) {
        let network = mobileMethod.provider || mobileMethod.network || '';
        if (network.toLowerCase() === 'vodafone') network = 'Vodafone';
        else if (network.toLowerCase() === 'airteltigo' || network.toLowerCase() === 'airtel_tigo') network = 'AirtelTigo';
        else if (network.toLowerCase() === 'mtn') network = 'MTN';
        setMobileMoneyDetails({
          accountName: mobileMethod.accountName || mobileMethod.name || '',
          phone: mobileMethod.mobileNumber || mobileMethod.phone || '',
          network,
        });
      }
    }
  }, [seller, paymentMethods]);

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
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState(null);

  const handleDeletePaymentMethod = async (id) => {
    setPaymentMethodToDelete(id);
  };

  const handleConfirmDeletePaymentMethod = async () => {
    const id = paymentMethodToDelete;
    setPaymentMethodToDelete(null);
    try {
      await deletePaymentMethod.mutateAsync(id);
      refetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
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
    console.log('Edit button clicked for method:', method);
    const methodId = method._id || method.id;
    console.log('Setting editingMethodId to:', methodId);
    setEditingMethodId(methodId);

    // Check if payout is rejected and enable reactivation by default
    if (isPayoutRejected) {
      setRequestReactivation(true);
    }

    // Populate form based on payment method type
    if (method.type === 'bank_transfer') {
      setActiveTab('bank');
      const bankData = {
        accountName: method.accountName || method.name || '',
        accountNumber: method.accountNumber || '',
        bankName: method.bankName || '',
        branch: method.branch || '',
      };
      console.log('Setting bank details:', bankData);
      setBankDetails(bankData);
    } else if (method.type === 'mobile_money') {
      setActiveTab('mobile');
      // Map provider to network format (MTN, Vodafone, AirtelTigo)
      let network = method.provider || method.network || '';
      // Normalize network names
      if (network.toLowerCase() === 'vodafone') {
        network = 'Vodafone';
      } else if (network.toLowerCase() === 'airteltigo' || network.toLowerCase() === 'airtel_tigo') {
        network = 'AirtelTigo';
      } else if (network.toLowerCase() === 'mtn') {
        network = 'MTN';
      }

      const mobileData = {
        accountName: method.accountName || method.name || '',
        phone: method.mobileNumber || method.phone || '',
        network: network,
      };
      console.log('Setting mobile money details:', mobileData);
      setMobileMoneyDetails(mobileData);
    }

    // Clear any previous error/success messages
    setError(null);
    setSuccess(false);

    // Scroll to form after a small delay to ensure state is updated
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
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

        // If reactivation is requested and payout is rejected, update seller payment methods
        // This will trigger backend to reset payoutStatus from 'rejected' to 'pending'
        if (requestReactivation && isPayoutRejected) {
          try {
            // Update seller payment methods to trigger reactivation
            const paymentMethodsUpdate = activeTab === 'bank'
              ? {
                paymentMethods: {
                  bankAccount: {
                    accountName: bankDetails.accountName.trim(),
                    accountNumber: bankDetails.accountNumber.trim(),
                    bankName: bankDetails.bankName,
                    branch: bankDetails.branch.trim() || '',
                  }
                }
              }
              : {
                paymentMethods: {
                  mobileMoney: {
                    accountName: mobileMoneyDetails.accountName.trim(),
                    phone: mobileMoneyDetails.phone.replace(/\D/g, ''),
                    network: mobileMoneyDetails.network,
                  }
                }
              };

            await update(paymentMethodsUpdate);
            toast.success('Payment method updated and reactivation requested! Your payment status will be reviewed by admin.');
          } catch (reactivationError) {
            console.error('Error requesting reactivation:', reactivationError);
            toast.warning('Payment method updated, but reactivation request failed. Please contact support.');
          }
        } else {
          toast.success('Payment method updated successfully!');
        }

        setEditingMethodId(null); // Exit edit mode
        setRequestReactivation(false); // Reset reactivation flag
      } else {
        // Limit: only ONE payment method total per seller
        if (hasPaymentMethod) {
          setError('You can only have one payment method. Please edit or delete your existing payment method.');
          return;
        }

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

  // Single payment method limit: check if any method exists
  const hasAnyPaymentMethod = paymentMethods.length > 0;
  const hasBankLimitReached = paymentMethods.some((pm) => pm.type === 'bank_transfer');
  const hasMobileLimitReached = paymentMethods.some((pm) => pm.type === 'mobile_money');

  // Whether seller has configured bank or mobile money (for tab checkmarks)
  const hasBankDetails =
    !!seller?.paymentMethods?.bankAccount ||
    paymentMethods.some(
      (pm) => pm.type === 'bank_transfer' && (pm.verificationStatus === 'verified' || pm.status === 'verified')
    );
  const hasMobileMoneyDetails =
    !!seller?.paymentMethods?.mobileMoney ||
    paymentMethods.some(
      (pm) => pm.type === 'mobile_money' && (pm.verificationStatus === 'verified' || pm.status === 'verified')
    );

  const content = (
    <>
      {!embedded && (
        <PageHeader $padding="lg" $marginBottom="lg">
          <TitleSection>
            <h1>Payment Method</h1>
            <p>Add your preferred payment method to receive payments. You can only have one active method.</p>
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
          <h3>Current Payment Method</h3>
          <p>You can only have one payment method at a time. To change your method, edit the existing one. Changes require admin approval.</p>
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
                  <th>Verification Status</th>
                  <th>Default</th>
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
                        <VerificationStatusBadge $status={method.verificationStatus || method.status || 'pending'}>
                          {(method.verificationStatus === 'verified' || method.status === 'verified' || method.status === 'active') ? (
                            <>
                              <FaCheckCircle /> Verified
                            </>
                          ) : (method.verificationStatus === 'rejected' || method.status === 'rejected') ? (
                            <>
                              <FaTimesCircle /> Rejected
                              {method.rejectionReason && (
                                <RejectionTooltip>
                                  {method.rejectionReason}
                                </RejectionTooltip>
                              )}
                            </>
                          ) : (
                            <>
                              <FaClock /> Pending Admin Review
                            </>
                          )}
                        </VerificationStatusBadge>
                        {/* Show info tooltip for pending status */}
                        {(method.verificationStatus === 'pending' || method.status === 'pending' || !method.verificationStatus) && (
                          <StatusInfoTooltip>
                            Your payment method is awaiting admin verification. You will be notified once it's reviewed.
                          </StatusInfoTooltip>
                        )}
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
                          {/* Note: Payment method verification is done by admin only */}
                          {/* Sellers can only submit for verification, not activate */}
                          <ActionButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditPaymentMethod(method);
                            }}
                            title="Edit this payment method"
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
              <h3>{editingMethodId ? 'Edit Bank Account Details' : 'Bank Account Details'}</h3>
              {hasAnyPaymentMethod && !editingMethodId && (
                <InfoBanner style={{ marginTop: 'var(--spacing-sm)' }}>
                  <FaCheckCircle /> You already have a payment method. To use a bank account instead, please edit your existing method.
                </InfoBanner>
              )}
              {editingMethodId && (
                <InfoBanner style={{ marginTop: 'var(--spacing-sm)' }}>
                  <FaEdit /> You are editing an existing payment method. Make your changes and click "Update Payment Method" to save.
                </InfoBanner>
              )}
            </SectionHeader>
            <FormContent>
              {hasBankDetails && !hasBankLimitReached && (
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
                  {GHANA_BANKS.map((bank) => (
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

              {/* Reactivation Field - Show when editing and (payout is rejected OR payment method is rejected) */}
              {editingMethodId && (() => {
                const currentMethod = paymentMethods.find(m => (m._id || m.id) === editingMethodId);
                const isMethodRejected = currentMethod?.verificationStatus === 'rejected';
                const shouldShowReactivation = isPayoutRejected || isMethodRejected;

                return shouldShowReactivation ? (
                  <FormGroup>
                    <ReactivationCheckboxContainer>
                      <Checkbox
                        id="requestReactivation"
                        type="checkbox"
                        checked={requestReactivation}
                        onChange={(e) => setRequestReactivation(e.target.checked)}
                      />
                      <CheckboxLabel htmlFor="requestReactivation">
                        <ReactivationTitle>
                          <FaCheckCircle /> Request Payment Status Reactivation
                        </ReactivationTitle>
                        <ReactivationDescription>
                          {isPayoutRejected && isMethodRejected
                            ? 'Both your seller payout status and this payment method were rejected. Check this box to request reactivation after updating your payment details.'
                            : isPayoutRejected
                              ? 'Your seller payout status was rejected. Check this box to request reactivation after updating your payment details.'
                              : 'This payment method was rejected. Check this box to request reactivation after updating your payment details.'
                          }
                          {(payoutRejectionReason || currentMethod?.rejectionReason) && (
                            <RejectionReason>
                              <strong>Rejection Reason:</strong> {payoutRejectionReason || currentMethod?.rejectionReason}
                            </RejectionReason>
                          )}
                        </ReactivationDescription>
                      </CheckboxLabel>
                    </ReactivationCheckboxContainer>
                  </FormGroup>
                ) : null;
              })()}
            </FormContent>
          </Section>
        )}

        {/* Mobile Money Section */}
        {activeTab === 'mobile' && (
          <Section $marginBottom="lg">
            <SectionHeader $padding="md">
              <h3>{editingMethodId ? 'Edit Mobile Money Details' : 'Mobile Money Details'}</h3>
              {hasAnyPaymentMethod && !editingMethodId && (
                <InfoBanner style={{ marginTop: 'var(--spacing-sm)' }}>
                  <FaCheckCircle /> You already have a payment method. To use mobile money instead, please edit your existing method.
                </InfoBanner>
              )}
              {editingMethodId && (
                <InfoBanner style={{ marginTop: 'var(--spacing-sm)' }}>
                  <FaEdit /> You are editing an existing payment method. Make your changes and click "Update Payment Method" to save.
                </InfoBanner>
              )}
            </SectionHeader>
            <FormContent>
              {hasMobileMoneyDetails && !hasMobileLimitReached && (
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
                  {MOBILE_NETWORKS.map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* Reactivation Field - Show when editing and (payout is rejected OR payment method is rejected) */}
              {editingMethodId && (() => {
                const currentMethod = paymentMethods.find(m => (m._id || m.id) === editingMethodId);
                const isMethodRejected = currentMethod?.verificationStatus === 'rejected';
                const shouldShowReactivation = isPayoutRejected || isMethodRejected;

                return shouldShowReactivation ? (
                  <FormGroup>
                    <ReactivationCheckboxContainer>
                      <Checkbox
                        id="requestReactivation"
                        type="checkbox"
                        checked={requestReactivation}
                        onChange={(e) => setRequestReactivation(e.target.checked)}
                      />
                      <CheckboxLabel htmlFor="requestReactivation">
                        <ReactivationTitle>
                          <FaCheckCircle /> Request Payment Status Reactivation
                        </ReactivationTitle>
                        <ReactivationDescription>
                          {isPayoutRejected && isMethodRejected
                            ? 'Both your seller payout status and this payment method were rejected. Check this box to request reactivation after updating your payment details.'
                            : isPayoutRejected
                              ? 'Your seller payout status was rejected. Check this box to request reactivation after updating your payment details.'
                              : 'This payment method was rejected. Check this box to request reactivation after updating your payment details.'
                          }
                          {(payoutRejectionReason || currentMethod?.rejectionReason) && (
                            <RejectionReason>
                              <strong>Rejection Reason:</strong> {payoutRejectionReason || currentMethod?.rejectionReason}
                            </RejectionReason>
                          )}
                        </ReactivationDescription>
                      </CheckboxLabel>
                    </ReactivationCheckboxContainer>
                  </FormGroup>
                ) : null;
              })()}
            </FormContent>
          </Section>
        )}

        {/* Form Actions */}
        {!hasAnyPaymentMethod || editingMethodId ? (
          <FormActions>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              $fullWidth
              disabled={isSubmitting || isUpdateLoading}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <FaSave /> {editingMethodId ? 'Update Payment Method' : 'Save Payment Method'}
                </>
              )}
            </Button>
            {editingMethodId && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setEditingMethodId(null);
                  setError(null);
                  setSuccess(false);
                }}
                disabled={isSubmitting || isUpdateLoading}
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                Cancel Editing
              </Button>
            )}
          </FormActions>
        ) : (
          <Section $marginBottom="lg">
            <InfoBanner>
              <FaEdit /> To change your payment method or update details, click the <strong>Edit</strong> button in the table above.
            </InfoBanner>
          </Section>
        )}
      </Form>
    </>
  );

  if (embedded) {
    return (
      <>
        {content}
        <ConfirmationModal
          isOpen={!!paymentMethodToDelete}
          onClose={() => setPaymentMethodToDelete(null)}
          onConfirm={handleConfirmDeletePaymentMethod}
          title="Delete Payment Method"
          message="Are you sure you want to delete this payment method? This action cannot be undone."
          confirmText="Delete"
          confirmColor="#ef4444"
        />
      </>
    );
  }

  return (
    <PageContainer>
      {content}
      <ConfirmationModal
        isOpen={!!paymentMethodToDelete}
        onClose={() => setPaymentMethodToDelete(null)}
        onConfirm={handleConfirmDeletePaymentMethod}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        confirmColor="#ef4444"
      />
    </PageContainer>
  );
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

const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
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

const ReactivationCheckboxContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-yellow-50);
  border: 2px solid var(--color-yellow-200);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-yellow-100);
    border-color: var(--color-yellow-300);
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary-500);
  flex-shrink: 0;
  margin-top: 2px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  cursor: pointer;
  flex: 1;
`;

const ReactivationTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-semibold);
  color: var(--color-yellow-800);
  font-size: var(--font-size-sm);

  svg {
    color: var(--color-yellow-600);
  }
`;

const ReactivationDescription = styled.p`
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-yellow-700);
  line-height: 1.5;
`;

const RejectionReason = styled.div`
  margin-top: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-red-50);
  border-left: 3px solid var(--color-red-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-red-700);

  strong {
    font-weight: var(--font-semibold);
    display: block;
    margin-bottom: var(--spacing-xs);
  }
`;

const VerificationStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  position: relative;
  
  ${(props) => {
    switch (props.$status) {
      case 'verified':
        return `
          background: var(--color-green-50);
          color: var(--color-green-700);
          border: 1px solid var(--color-green-200);
        `;
      case 'rejected':
        return `
          background: var(--color-red-50);
          color: var(--color-red-700);
          border: 1px solid var(--color-red-200);
        `;
      case 'pending':
      default:
        return `
          background: var(--color-yellow-50);
          color: var(--color-yellow-700);
          border: 1px solid var(--color-yellow-200);
        `;
    }
  }}
  
  svg {
    font-size: var(--font-size-sm);
  }
`;

const RejectionTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-grey-900);
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
  
  ${VerificationStatusBadge}:hover & {
    opacity: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--color-grey-900);
  }
`;

const StatusInfoTooltip = styled.div`
  margin-top: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-blue-50);
  border-left: 3px solid var(--color-blue-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-blue-700);
  line-height: 1.4;
`;
