import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCreditCard, FaMobileAlt, FaSave, FaArrowLeft, FaBuilding, FaPhone, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaStar, FaClock } from 'react-icons/fa';
import useAuth from '../../shared/hooks/useAuth';
import { useGetPaymentMethods, useDeletePaymentMethod, useSetDefaultPaymentMethod, useCreatePaymentMethod, useUpdatePaymentMethod } from '../../shared/hooks/usePaymentMethod';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingComponents';
import { getUserFriendlyErrorMessage } from '../../shared/utils/helpers';
import { PageContainer, PageHeader, TitleSection, Section, SectionHeader } from '../../shared/components/ui/SpacingSystem';
import { detectGhanaPhoneNetwork } from '../../shared/utils/phoneNetworkDetector';
import { toast } from 'react-toastify';
import {
  GHANA_BANKS,
  MOBILE_NETWORKS,
  MOBILE_NETWORK_LABELS,
  normalizeMobileNetworkToken,
  formatMobileNetworkLabel,
} from '../../shared/constants/banksList';
import { ConfirmationModal } from '../../shared/components/modal/ConfirmationModal';

/** Map detector output to PaymentMethod provider token (MTN / AT / Telecel). */
function providerTokenFromDetector(det) {
  if (!det?.isValid || !det.network) return '';
  if (det.network === 'AirtelTigo') return 'AT';
  if (det.network === 'Telecel') return 'Telecel';
  if (det.network === 'MTN') return 'MTN';
  return '';
}

const PaymentMethodPage = ({ embedded = false }) => {
  const { seller, update, isUpdateLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'mobile'

  // Fetch payment methods from PaymentMethod model
  const {
    data: paymentMethods = [],
    isLoading: isLoadingPaymentMethods,
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

  // Handle set default payment method - invoked explicitly by user action.
  const handleSetDefault = async (id) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(id);
      await refetchPaymentMethods();
      toast.success('Default payment method updated');
    } catch (error) {
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

  const detectedMobileNetwork = useMemo(
    () => detectGhanaPhoneNetwork(mobileMoneyDetails.phone || ''),
    [mobileMoneyDetails.phone],
  );

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
        network: normalizeMobileNetworkToken(mobile.network || ''),
      });
    } else {
      // Fallback: verified mobile money from PaymentMethod API
      const mobileMethod = paymentMethods.find(
        (pm) => pm.type === 'mobile_money' && (pm.verificationStatus === 'verified' || pm.status === 'verified')
      );
      if (mobileMethod) {
        let network = normalizeMobileNetworkToken(
          mobileMethod.provider || mobileMethod.network || '',
        );
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
          network:
            networkDetection.network === 'Telecel'
              ? 'Telecel'
              : networkDetection.network === 'AirtelTigo'
                ? 'AT'
                : networkDetection.network === 'MTN'
                  ? 'MTN'
                  : normalizeMobileNetworkToken(networkDetection.network || ''),
        }));
      } else {
        setMobileMoneyDetails((prev) => ({
          ...prev,
          phone: value,
          network: '',
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
    return /^0(20|23|24|25|26|27|50|54|55|56|57|59)\d{7}$/.test(cleaned);
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
      const message = getUserFriendlyErrorMessage(
        error,
        'We could not delete this payment method. Please try again.',
      );
      toast.error(message);
    }
  };

  // Format payment method details for display
  const formatPaymentMethodDetails = (method) => {
    if (method.type === 'mobile_money') {
      return {
        type: 'Mobile Money',
        primary: method.mobileNumber || method.phone || 'N/A',
        secondary: formatMobileNetworkLabel(method.provider || method.network || '') || 'N/A',
        accountName: method.accountName || method.name || 'N/A',
        fullDetails: {
          accountName: method.accountName || method.name || 'N/A',
          phone: method.mobileNumber || method.phone || 'N/A',
          network: formatMobileNetworkLabel(method.provider || method.network || '') || 'N/A',
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
    const methodId = method._id || method.id;
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
      setBankDetails(bankData);
    } else if (method.type === 'mobile_money') {
      setActiveTab('mobile');
      let network = normalizeMobileNetworkToken(
        method.provider || method.network || '',
      );

      const mobileData = {
        accountName: method.accountName || method.name || '',
        phone: method.mobileNumber || method.phone || '',
        network: network,
      };
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
        const resolvedMobileNetwork =
          mobileMoneyDetails.network ||
          providerTokenFromDetector(detectGhanaPhoneNetwork(mobileMoneyDetails.phone));
        if (!resolvedMobileNetwork) {
          throw new Error('Please select a mobile network');
        }

        // Prepare mobile money payment method data
        paymentMethodData = {
          type: 'mobile_money',
          name: mobileMoneyDetails.accountName.trim(),
          accountName: mobileMoneyDetails.accountName.trim(),
          mobileNumber: mobileMoneyDetails.phone.replace(/\D/g, ''), // Remove non-digits
          provider: resolvedMobileNetwork,
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
                    network:
                      mobileMoneyDetails.network ||
                      providerTokenFromDetector(detectGhanaPhoneNetwork(mobileMoneyDetails.phone)),
                  }
                }
              };

            await update(paymentMethodsUpdate);
            toast.success('Payment method updated and reactivation requested! Your payment status will be reviewed by admin.');
          } catch {
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
          <>
            <SingleMethodPolicyBanner role="status">
              You can only have one payment method at a time. Delete this one to switch to a
              different type.
            </SingleMethodPolicyBanner>
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
                            <FaMobileAlt style={{ color: '#E8920A' }} />
                          ) : (
                            <FaBuilding style={{ color: '#E8920A' }} />
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
                            Your payment method is awaiting admin verification. You cannot edit it while it's being reviewed.
                          </StatusInfoTooltip>
                        )}
                      </td>
                      <td>
                        <DefaultSelector>
                          <RadioButton
                            id={`payment-method-${method._id || method.id}`}
                            type="radio"
                            name="defaultPaymentMethod"
                            checked={method.isDefault}
                            onChange={() => !method.isDefault && handleSetDefault(method._id || method.id)}
                            disabled={setDefaultPaymentMethod.isPending}
                          />
                          <RadioLabel
                            htmlFor={`payment-method-${method._id || method.id}`}
                            title={!(method.status === 'verified' || method.status === 'active' || method.verificationStatus === 'verified')
                              ? "Note: Only verified payment methods can be used for actual payouts."
                              : ""}
                          >
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
                            title={method.status === 'pending' ? "Cannot edit while pending" : "Edit this payment method"}
                            disabled={method.status === 'pending'}
                          >
                            <FaEdit /> Edit
                          </ActionButton>
                          <ActionButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePaymentMethod(method._id)}
                            disabled={deletePaymentMethod.isPending || method.status === 'pending'}
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
          </>
        )}
      </Section>

      {/* Tabs - Only show if no method exists or if editing an existing one */}
      {(!hasAnyPaymentMethod || editingMethodId) && (
        <TabsContainer>
          <TabButton
            $active={activeTab === 'bank'}
            onClick={() => setActiveTab('bank')}
          >
            <FaBuilding /> Bank Account
            {hasBankDetails && <FaCheckCircle style={{ marginLeft: '8px', color: '#3B6D11' }} />}
          </TabButton>
          <TabButton
            $active={activeTab === 'mobile'}
            onClick={() => setActiveTab('mobile')}
          >
            <FaMobileAlt /> Mobile Money
            {hasMobileMoneyDetails && <FaCheckCircle style={{ marginLeft: '8px', color: '#3B6D11' }} />}
          </TabButton>
        </TabsContainer>
      )}

      {/* Form - Only show if no method exists or if editing an existing one */}
      {(!hasAnyPaymentMethod || editingMethodId) && (
        <Form onSubmit={handleSubmit}>
          {/* Bank Account Section */}
          {activeTab === 'bank' && (
            <Section $marginBottom="lg">
              <SectionHeader $padding="md">
                <h3>{editingMethodId ? 'Edit Bank Account Details' : 'Bank Account Details'}</h3>
                {hasAnyPaymentMethod && !editingMethodId && (
                  <InfoBanner style={{ marginTop: '0.5rem' }}>
                    <FaCheckCircle /> You already have a payment method. To use a bank account instead, please edit your existing method.
                  </InfoBanner>
                )}
                {editingMethodId && (
                  <InfoBanner style={{ marginTop: '0.5rem' }}>
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
                  <InfoBanner style={{ marginTop: '0.5rem' }}>
                    <FaCheckCircle /> You already have a payment method. To use mobile money instead, please edit your existing method.
                  </InfoBanner>
                )}
                {editingMethodId && (
                  <InfoBanner style={{ marginTop: '0.5rem' }}>
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
                    {mobileMoneyDetails.phone && detectedMobileNetwork.isValid
                      ? `Network detected: ${formatMobileNetworkLabel(providerTokenFromDetector(detectedMobileNetwork))} — no need to pick manually.`
                      : 'Enter your mobile money number (10 digits); we will detect your network automatically.'}
                  </HelperText>
                </FormGroup>

                {!detectedMobileNetwork.isValid && (
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
                          {MOBILE_NETWORK_LABELS[network]}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                )}

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
                  style={{ marginTop: '1rem' }}
                >
                  Cancel Editing
                </Button>
              )}
            </FormActions>
          ) : null}
        </Form>
      )}
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
  gap: 1rem;
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
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

const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 1rem;
  border-top: 0.5px solid #F1EFE8;
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

const TabsContainer = styled.div`
  display: flex;
  gap: 0.4rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.6rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 34px;
  padding: 0 1rem;
  background: ${(p) => p.$active ? '#E8920A' : 'transparent'};
  color: ${(p) => p.$active ? '#FFFFFF' : '#374151'};
  border: 0.5px solid ${(p) => p.$active ? '#E8920A' : 'transparent'};
  border-radius: 9px;
  font-size: 0.825rem;
  font-weight: ${(p) => p.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.12s;

  &:hover { background: ${(p) => p.$active ? '#D97706' : '#F9F8F5'}; }
`;

const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  background: #EFF6FF;
  border: 0.5px solid #BFDBFE;
  border-left: 3px solid #3B82F6;
  border-radius: 9px;
  color: #1D4ED8;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;

  svg { flex-shrink: 0; color: #3B82F6; }
`;

const SingleMethodPolicyBanner = styled.div`
  padding: 0.65rem 0.9rem;
  margin-bottom: 0.75rem;
  background: #FFF8F0;
  border: 0.5px solid #FDE68A;
  border-left: 3px solid #E8920A;
  border-radius: 9px;
  color: #92400E;
  font-size: 0.8rem;
  line-height: 1.45;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  background: #FFFFFF;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;

  thead {
    background: #F9F8F5;
    border-bottom: 0.5px solid #F1EFE8;
  }

  th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #9CA3AF;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tbody {
    tr {
      border-bottom: 0.5px solid #F1EFE8;
      transition: background 0.12s;

      &:hover { background: #FFFDF9; }
      &:last-child { border-bottom: none; }
    }

    td {
      padding: 0.85rem 1rem;
      color: #374151;
      vertical-align: middle;
    }
  }
`;

const TypeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const AccountName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
`;

const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 180px;
`;

const PrimaryDetail = styled.div`
  font-size: 0.8rem;
  color: #374151;
  line-height: 1.5;

  strong { font-weight: 600; color: #6B7280; margin-right: 0.25rem; }
`;

const SecondaryDetail = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  line-height: 1.5;

  strong { font-weight: 600; color: #6B7280; margin-right: 0.25rem; }
`;

const DefaultSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const RadioButton = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #E8920A;

  &:disabled { cursor: not-allowed; opacity: 0.5; }
`;

const RadioLabel = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const DefaultBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 22px;
  padding: 0 0.6rem;
  background: #FEF3C7;
  color: #92400E;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const DefaultText = styled.span`
  font-size: 0.75rem;
  color: #9CA3AF;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.35rem;
  align-items: center;
`;

const ActionButton = styled(Button)`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;

  ${(p) => p.$danger && `
    color: #EF4444;
    &:hover { background: #FEF2F2; color: #DC2626; }
  `}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: #9CA3AF;

  svg { margin-bottom: 0.75rem; opacity: 0.5; }
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.3rem;
  font-size: 0.975rem;
  font-weight: 600;
  color: #374151;
`;

const EmptyMessage = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #9CA3AF;
  max-width: 400px;
`;

const ReactivationCheckboxContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: #FFFBEB;
  border: 0.5px solid #FDE68A;
  border-left: 3px solid #F59E0B;
  border-radius: 9px;
  transition: background 0.12s;

  &:hover { background: #FEF3C7; }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #E8920A;
  flex-shrink: 0;
  margin-top: 2px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  cursor: pointer;
  flex: 1;
`;

const ReactivationTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: #92400E;
  font-size: 0.8rem;

  svg { color: #D97706; }
`;

const ReactivationDescription = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: #78350F;
  line-height: 1.5;
`;

const RejectionReason = styled.div`
  margin-top: 0.3rem;
  padding: 0.5rem 0.75rem;
  background: #FEF2F2;
  border-left: 3px solid #EF4444;
  border-radius: 7px;
  font-size: 0.75rem;
  color: #991B1B;

  strong { font-weight: 600; display: block; margin-bottom: 0.2rem; }
`;

const VerificationStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 22px;
  padding: 0 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  position: relative;

  ${(p) => {
    switch (p.$status) {
      case 'verified': return `background: #D1FAE5; color: #065F46;`;
      case 'rejected': return `background: #FEE2E2; color: #991B1B;`;
      default:         return `background: #FEF3C7; color: #92400E;`;
    }
  }}
`;

const RejectionTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.3rem;
  padding: 0.35rem 0.6rem;
  background: #111827;
  color: #FFFFFF;
  border-radius: 7px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s;
  z-index: 1000;

  ${VerificationStatusBadge}:hover & { opacity: 1; }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #111827;
  }
`;

const StatusInfoTooltip = styled.div`
  margin-top: 0.3rem;
  padding: 0.5rem 0.75rem;
  background: #EFF6FF;
  border-left: 3px solid #3B82F6;
  border-radius: 7px;
  font-size: 0.75rem;
  color: #1D4ED8;
  line-height: 1.4;
`;
