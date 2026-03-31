import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/routePaths";
import {
  FaMoneyBillWave,
  FaPlus,
  FaHistory,
  FaCheck,
  FaClock,
  FaTimes,
  FaWallet,
  FaSpinner,
  FaLock,
  FaCheckCircle,
  FaUndo,
} from "react-icons/fa";
import styled from "styled-components";
import { useSellerBalance } from "../../shared/hooks/finance/useSellerBalance";
import { useGetPaymentRequests, useCreatePaymentRequest, useDeletePaymentRequest, useRequestReversal } from "../../shared/hooks/usePaymentRequest";
import { useSubmitPinForWithdrawal } from "../../shared/hooks/usePayout";
import ReversalModal from "./ReversalModal";
import { useGetPaymentMethods } from "../../shared/hooks/usePaymentMethod";
import useAuth from "../../shared/hooks/useAuth";
import { LoadingSpinner } from "../../shared/components/LoadingSpinner";
import Button from "../../shared/components/ui/Button";

export default function WithdrawalsPage() {
  const { seller } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("request");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [useSavedPaymentMethod, setUseSavedPaymentMethod] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    bank: { accountName: "", accountNumber: "", bankCode: "", bankName: "" },
    mobile: { phone: "", network: "" },
  });
  const [error, setError] = useState("");

  // Get balance using unified hook
  const {
    availableBalance: withdrawableBalance,
    pendingBalance,
    totalEarnings: totalRevenue,
    withdrawnAmount: totalWithdrawn,
    lockedBalance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useSellerBalance();

  // Get payment requests (all for history tab)
  const {
    data: requestsData,
    isLoading: isLoadingRequests,
  } = useGetPaymentRequests();

  const requests = requestsData?.paymentRequests || [];

  // Get recent payment requests (last 5) for display below form
  const recentRequests = requests.slice(0, 5);

  // Get payment methods from PaymentMethod model
  const {
    data: paymentMethods = [],
    isLoading: isLoadingPaymentMethods,
  } = useGetPaymentMethods();

  // Create payment request mutation
  const createPaymentRequest = useCreatePaymentRequest();
  const deletePaymentRequest = useDeletePaymentRequest();
  const requestReversal = useRequestReversal();
  const submitPin = useSubmitPinForWithdrawal();

  // State for PIN submission
  const [pinInputs, setPinInputs] = useState({});

  // Track which request is being deleted (for individual loading state)
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  // State for reversal modal
  const [reversalModal, setReversalModal] = useState({
    isOpen: false,
    request: null,
  });

  // Load seller's saved payment methods (from seller.paymentMethods or verified PaymentMethod records)
  useEffect(() => {
    if (seller?.paymentMethods?.bankAccount) {
      const bank = seller.paymentMethods.bankAccount;
      setPaymentDetails((prev) => ({
        ...prev,
        bank: {
          accountName: bank.accountName || "",
          accountNumber: bank.accountNumber || "",
          bankCode: bank.bankCode || "",
          bankName: bank.bankName || "",
        },
      }));
    } else {
      const bankMethod = paymentMethods.find(
        (pm) => pm.type === 'bank_transfer' && (pm.verificationStatus === 'verified' || pm.status === 'verified')
      );
      if (bankMethod) {
        setPaymentDetails((prev) => ({
          ...prev,
          bank: {
            accountName: bankMethod.accountName || bankMethod.name || "",
            accountNumber: bankMethod.accountNumber || "",
            bankCode: bankMethod.bankCode || "",
            bankName: bankMethod.bankName || "",
          },
        }));
      }
    }

    if (seller?.paymentMethods?.mobileMoney) {
      const mobile = seller.paymentMethods.mobileMoney;
      setPaymentDetails((prev) => ({
        ...prev,
        mobile: {
          phone: mobile.phone || "",
          network: mobile.network || "",
        },
      }));
    } else {
      const mobileMethod = paymentMethods.find(
        (pm) => pm.type === 'mobile_money' && (pm.verificationStatus === 'verified' || pm.status === 'verified')
      );
      if (mobileMethod) {
        setPaymentDetails((prev) => ({
          ...prev,
          mobile: {
            phone: mobileMethod.mobileNumber || mobileMethod.phone || "",
            network: mobileMethod.provider || mobileMethod.network || "",
          },
        }));
      }
    }
  }, [seller, paymentMethods]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum > withdrawableBalance) {
      setError(`Amount exceeds withdrawable balance of GH₵${withdrawableBalance.toFixed(2)}`);
      return;
    }

    if (amountNum < 10) {
      setError("Minimum withdrawal amount is GH₵10");
      return;
    }

    let paymentDetailsToSend = {};

    if (useSavedPaymentMethod) {
      // Map payment method to PaymentMethod model type and provider
      const paymentMethodToType = {
        'bank': 'bank_transfer',
        'mtn_momo': 'mobile_money',
        'vodafone_cash': 'mobile_money',
        'airtel_tigo_money': 'mobile_money',
      };

      const paymentMethodToProvider = {
        'mtn_momo': 'MTN',
        'vodafone_cash': 'Vodafone',
        'airtel_tigo_money': 'AirtelTigo',
      };

      // First, try to get from PaymentMethod model
      if (paymentMethod === "bank") {
        // Find default bank transfer method, or any bank transfer method
        const bankMethod = paymentMethods.find(pm =>
          pm.type === 'bank_transfer' && pm.isDefault
        ) || paymentMethods.find(pm => pm.type === 'bank_transfer');

        if (bankMethod && bankMethod.accountNumber && bankMethod.accountName && bankMethod.bankName) {
          paymentDetailsToSend = {
            accountName: bankMethod.accountName || "",
            accountNumber: bankMethod.accountNumber || "",
            bankName: bankMethod.bankName || "",
            branch: bankMethod.branch || "",
          };
        }
      } else if (["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
        const provider = paymentMethodToProvider[paymentMethod];
        // Find default mobile money method with matching provider, or any matching provider
        const mobileMethod = paymentMethods.find(pm =>
          pm.type === 'mobile_money' &&
          pm.provider === provider &&
          pm.isDefault
        ) || paymentMethods.find(pm =>
          pm.type === 'mobile_money' &&
          pm.provider === provider
        );

        if (mobileMethod && mobileMethod.mobileNumber) {
          paymentDetailsToSend = {
            phone: mobileMethod.mobileNumber || "",
            network: mobileMethod.provider || "",
            accountName: mobileMethod.name || seller?.name || seller?.shopName || "",
          };
        }
      }

      // Fallback to seller's saved payment methods if PaymentMethod model doesn't have it
      if (!paymentDetailsToSend.accountNumber && !paymentDetailsToSend.phone) {
        if (paymentMethod === "bank" && seller?.paymentMethods?.bankAccount) {
          const bank = seller.paymentMethods.bankAccount;
          paymentDetailsToSend = {
            accountName: bank.accountName || "",
            accountNumber: bank.accountNumber || "",
            bankName: bank.bankName || "",
            branch: bank.branch || "",
          };
        } else if (["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod) && seller?.paymentMethods?.mobileMoney) {
          const mobile = seller.paymentMethods.mobileMoney;
          paymentDetailsToSend = {
            phone: mobile.phone || "",
            network: mobile.network || "",
            accountName: mobile.accountName || "",
          };
        }
      }

      // If still no payment details, show error
      if (!paymentDetailsToSend.accountNumber && !paymentDetailsToSend.phone) {
        setError("Please add payment method details in your account settings");
        return;
      }
    } else {
      // Use manually entered details
      if (paymentMethod === "bank") {
        paymentDetailsToSend = {
          accountName: paymentDetails.bank.accountName || "",
          accountNumber: paymentDetails.bank.accountNumber || "",
          bankName: paymentDetails.bank.bankName || "",
          branch: paymentDetails.bank.branch || "",
        };
      } else if (["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
        paymentDetailsToSend = {
          phone: paymentDetails.mobile.phone || "",
          network: paymentDetails.mobile.network || "",
          accountName: paymentDetails.mobile.accountName || "",
        };
      }
    }

    // Validate payment details before sending
    if (paymentMethod === "bank") {
      if (!paymentDetailsToSend.accountName || !paymentDetailsToSend.accountNumber || !paymentDetailsToSend.bankName) {
        setError("Please provide all bank details: account name, account number, and bank name");
        return;
      }
    } else if (["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
      if (!paymentDetailsToSend.phone || !paymentDetailsToSend.network) {
        setError("Please provide phone number and network for mobile money");
        return;
      }
    }

    // Send request with correct field name (paymentMethod, not payoutMethod)
    createPaymentRequest.mutate({
      amount: amountNum,
      paymentMethod: paymentMethod, // Fixed: was payoutMethod
      paymentDetails: paymentDetailsToSend,
    });

    // Reset form
    setAmount("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setAmount(value);
    } else if (name === "paymentMethod") {
      setPaymentMethod(value);
    }
  };

  const handlePaymentDetailsChange = (field, value, type) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FaCheck />;
      case "processing":
      case "approved":
        return <FaClock />;
      case "failed":
      case "rejected":
        return <FaTimes />;
      case "pending":
        return <FaClock />;
      case "awaiting_paystack_otp":
        return <FaCheckCircle />;
      case "reversed":
        return <FaUndo />;
      default:
        return <FaClock />;
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'awaiting_paystack_otp') {
      return 'Awaiting OTP';
    }
    if (status === 'reversed') {
      return 'Reversed';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  const canReverse = (request) => {
    // Can reverse if status is pending, processing, or awaiting_paystack_otp
    // Cannot reverse if already reversed or if it's completed/paid (admin only)
    const reversibleStatuses = ['pending', 'processing', 'awaiting_paystack_otp'];
    const canReverseResult = reversibleStatuses.includes(request.status) && !request.reversed;

    return canReverseResult;
  };

  const handleReversalConfirm = (reason) => {
    const requestId = reversalModal.request?._id || reversalModal.request?.id;
    if (!requestId) return;

    requestReversal.mutate(
      { requestId, reason },
      {
        onSuccess: () => {
          setReversalModal({ isOpen: false, request: null });
        },
      }
    );
  };

  return (
    <WithdrawalsPage_>
      <WdHeader>
        <div>
          <WdTitle>Withdrawals</WdTitle>
          <WdSubtitle>Request withdrawals from your earnings</WdSubtitle>
        </div>
      </WdHeader>

      <BalanceCards>
        <BalanceCard>
          <BalanceLabel>Total Revenue Balance</BalanceLabel>
          <BalanceAmount>GH₵{totalRevenue.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>GH₵{withdrawableBalance.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard>
          <BalanceLabel>Pending Balance</BalanceLabel>
          <BalanceAmount>GH₵{pendingBalance.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard>
          <BalanceLabel>Locked Balance</BalanceLabel>
          <BalanceAmount>GH₵{lockedBalance.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard $highlight>
          <BalanceLabel>Total Withdrawn</BalanceLabel>
          <BalanceAmount $highlight>GH₵{totalWithdrawn.toFixed(2)}</BalanceAmount>
        </BalanceCard>
      </BalanceCards>

      <TabsContainer>
        <TabButton
          $active={activeTab === "request"}
          onClick={() => setActiveTab("request")}
        >
          <FaPlus /> Request Withdrawal
        </TabButton>
        <TabButton
          $active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> History
        </TabButton>
      </TabsContainer>

      <TabContent>
        {activeTab === "request" && (
          <>
            <RequestForm onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  step="0.01"
                  min="10"
                  max={withdrawableBalance}
                  required
                />
                <HelperText>
                  Minimum: GH₵10 | Available: GH₵{withdrawableBalance.toFixed(2)}
                </HelperText>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="vodafone_cash">Vodafone Cash</option>
                  <option value="airtel_tigo_money">AirtelTigo Money</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={useSavedPaymentMethod}
                    onChange={(e) => setUseSavedPaymentMethod(e.target.checked)}
                  />
                  Use saved payment method
                </CheckboxLabel>
              </FormGroup>

              {!useSavedPaymentMethod && (
                <>
                  {paymentMethod === "bank" && (
                    <>
                      <FormGroup>
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          id="accountName"
                          type="text"
                          value={paymentDetails.bank.accountName}
                          onChange={(e) =>
                            handlePaymentDetailsChange("accountName", e.target.value, "bank")
                          }
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          value={paymentDetails.bank.accountNumber}
                          onChange={(e) =>
                            handlePaymentDetailsChange("accountNumber", e.target.value, "bank")
                          }
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="bankCode">Bank Code</Label>
                        <Input
                          id="bankCode"
                          type="text"
                          value={paymentDetails.bank.bankCode}
                          onChange={(e) =>
                            handlePaymentDetailsChange("bankCode", e.target.value, "bank")
                          }
                          required
                        />
                      </FormGroup>
                    </>
                  )}

                  {["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod) && (
                    <>
                      <FormGroup>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={paymentDetails.mobile.phone}
                          onChange={(e) =>
                            handlePaymentDetailsChange("phone", e.target.value, "mobile")
                          }
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="network">Network</Label>
                        <Select
                          id="network"
                          value={paymentDetails.mobile.network}
                          onChange={(e) =>
                            handlePaymentDetailsChange("network", e.target.value, "mobile")
                          }
                          required
                        >
                          <option value="">Select network</option>
                          <option value="MTN">MTN</option>
                          <option value="Vodafone">Vodafone</option>
                          <option value="AirtelTigo">AirtelTigo</option>
                        </Select>
                      </FormGroup>
                    </>
                  )}
                </>
              )}

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <SubmitButton
                type="submit"
                disabled={
                  createPaymentRequest.isPending ||
                  !amount ||
                  amount.trim() === "" ||
                  isNaN(parseFloat(amount)) ||
                  parseFloat(amount) <= 0
                }
              >
                {createPaymentRequest.isPending ? (
                  <>
                    <FaSpinner className="spinner" /> Processing...
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave /> Request Withdrawal
                  </>
                )}
              </SubmitButton>
            </RequestForm>

            {recentRequests.length > 0 && (
              <RecentWithdrawalsSection>
                <h3>Recent Withdrawals</h3>
                <RequestsList>
                  {recentRequests.map((request) => (
                    <RequestCard key={request._id || request.id}>
                      <RequestHeader>
                        <RequestInfo>
                          <RequestAmount>GH₵{request.amountRequested || request.amount?.toFixed(2)}</RequestAmount>
                          <RequestMethod>{request.paymentMethod?.replace(/_/g, " ").toUpperCase()}</RequestMethod>
                        </RequestInfo>
                        <RequestStatus $status={request.status}>
                          {getStatusIcon(request.status)}
                          {getStatusLabel(request.status)}
                        </RequestStatus>
                      </RequestHeader>
                      {/* Show withholding tax breakdown if available */}
                      {request.withholdingTax > 0 && (
                        <WithholdingTaxInfo style={{ margin: '0.75rem 1rem' }}>
                          <TaxLabel>Withholding Tax ({((request.withholdingTaxRate || 0) * 100).toFixed(0)}%):</TaxLabel>
                          <TaxAmount>GH₵{request.withholdingTax.toFixed(2)}</TaxAmount>
                          <NetAmountLabel>Amount You'll Receive:</NetAmountLabel>
                          <NetAmount>GH₵{(request.amountPaidToSeller || (request.amountRequested || request.amount) - request.withholdingTax).toFixed(2)}</NetAmount>
                        </WithholdingTaxInfo>
                      )}

                      {/* Payment Details Section */}
                      {request.paymentDetails && (
                        <RequestDetails style={{ margin: '0.75rem 1rem', padding: '0.75rem', background: '#F9F8F5', borderRadius: '9px' }}>
                          <DetailLabel style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>Payment Details:</DetailLabel>
                          {request.paymentMethod === "bank" && request.paymentDetails.accountNumber && (
                            <>
                              {request.paymentDetails.accountName && (
                                <DetailItem style={{ marginBottom: '0.5rem' }}>
                                  <DetailLabel style={{ fontSize: '0.8rem' }}>Account Name:</DetailLabel>
                                  <DetailValue style={{ fontSize: '0.875rem', fontWeight: 500 }}>{request.paymentDetails.accountName}</DetailValue>
                                </DetailItem>
                              )}
                              <DetailItem style={{ marginBottom: '0.5rem' }}>
                                <DetailLabel style={{ fontSize: '0.8rem' }}>Account Number:</DetailLabel>
                                <DetailValue style={{ fontSize: '0.875rem', fontWeight: 500 }}>{request.paymentDetails.accountNumber}</DetailValue>
                              </DetailItem>
                              {request.paymentDetails.bankName && (
                                <DetailItem style={{ marginBottom: '0.5rem' }}>
                                  <DetailLabel style={{ fontSize: '0.8rem' }}>Bank:</DetailLabel>
                                  <DetailValue style={{ fontSize: '0.875rem', fontWeight: 500 }}>{request.paymentDetails.bankName}</DetailValue>
                                </DetailItem>
                              )}
                              {request.paymentDetails.branch && (
                                <DetailItem style={{ marginBottom: '0.5rem' }}>
                                  <DetailLabel style={{ fontSize: '0.8rem' }}>Branch:</DetailLabel>
                                  <DetailValue style={{ fontSize: '0.875rem', fontWeight: 500 }}>{request.paymentDetails.branch}</DetailValue>
                                </DetailItem>
                              )}
                            </>
                          )}
                          {["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(request.paymentMethod) && request.paymentDetails.phone && (
                            <>
                              <DetailItem style={{ marginBottom: '0.5rem' }}>
                                <DetailLabel style={{ fontSize: '0.8rem' }}>Phone Number:</DetailLabel>
                                <DetailValue style={{ fontSize: '0.875rem', fontWeight: 500 }}>{request.paymentDetails.phone}</DetailValue>
                              </DetailItem>
                              {request.paymentDetails.network && (
                                <DetailItem style={{ marginBottom: '0.5rem' }}>
                                  <DetailLabel style={{ fontSize: '0.8rem' }}>Network:</DetailLabel>
                                  <DetailValue style={{ fontSize: '0.875rem', fontWeight: 500 }}>{request.paymentDetails.network}</DetailValue>
                                </DetailItem>
                              )}
                              {request.paymentDetails.accountName && (
                                <DetailItem style={{ marginBottom: '0.5rem' }}>
                                  <DetailLabel style={{ fontSize: '0.8rem' }}>Account Name:</DetailLabel>
                                  <DetailValue style={{ fontSize: '0.875rem', fontWeight: 500 }}>{request.paymentDetails.accountName}</DetailValue>
                                </DetailItem>
                              )}
                            </>
                          )}
                        </RequestDetails>
                      )}

                      {request.status === "pending" && (
                        <RequestActions>
                          <DeleteButton
                            $isConfirming={pendingCancelId === (request._id || request.id)}
                            onClick={() => {
                              const requestId = request._id || request.id;
                              if (pendingCancelId === requestId) {
                                // Second click - confirmed
                                setPendingCancelId(null);
                                setDeletingRequestId(requestId);
                                deletePaymentRequest.mutate(requestId, {
                                  onSettled: () => {
                                    setDeletingRequestId(null);
                                  }
                                });
                              } else {
                                // First click - arm confirm
                                setPendingCancelId(requestId);
                                setTimeout(() => setPendingCancelId(cur => cur === requestId ? null : cur), 4000);
                              }
                            }}
                            disabled={deletingRequestId === (request._id || request.id)}
                          >
                            {deletingRequestId === (request._id || request.id) ? (
                              <>
                                <FaSpinner className="spinner" /> Cancelling...
                              </>
                            ) : pendingCancelId === (request._id || request.id) ? (
                              <>
                                <FaCheck /> Click to confirm
                              </>
                            ) : (
                              <>
                                <FaTimes /> Cancel
                              </>
                            )}
                          </DeleteButton>
                        </RequestActions>
                      )}
                      {/* Show reversal button for processing, awaiting_paystack_otp, or pending statuses (if not already reversed) */}
                      {((request.status === "processing" || request.status === "awaiting_paystack_otp" || request.status === "pending") && !request.reversed) && (
                        <RequestActions>
                          <ReversalButton
                            onClick={() => {
                              setReversalModal({ isOpen: true, request });
                            }}
                          >
                            <FaUndo /> Request Reversal
                          </ReversalButton>
                        </RequestActions>
                      )}
                      {request.reversed && (
                        <ReversalInfo>
                          <FaUndo /> This withdrawal has been reversed
                          {request.reverseReason && (
                            <ReversalReason>Reason: {request.reverseReason}</ReversalReason>
                          )}
                        </ReversalInfo>
                      )}
                    </RequestCard>
                  ))}
                </RequestsList>
              </RecentWithdrawalsSection>
            )}
          </>
        )}

        {activeTab === "history" && (
          <HistoryContainer>
            {isLoadingRequests ? (
              <LoadingSpinner />
            ) : requests.length === 0 ? (
              <EmptyState>
                <FaHistory size={48} />
                <p>No withdrawal requests yet</p>
              </EmptyState>
            ) : (
              <RequestsList>
                {requests.map((request) => (
                  <RequestCard key={request._id || request.id}>
                    <RequestHeader>
                      <RequestInfo>
                        <RequestAmount>GH₵{request.amountRequested || request.amount?.toFixed(2)}</RequestAmount>
                        <RequestMethod>{request.paymentMethod?.replace(/_/g, " ").toUpperCase()}</RequestMethod>
                      </RequestInfo>
                      <RequestStatus $status={request.status}>
                        {getStatusIcon(request.status)}
                        {getStatusLabel(request.status)}
                      </RequestStatus>
                    </RequestHeader>
                    <RequestDetails>
                      {/* Show withholding tax breakdown if available */}
                      {request.withholdingTax > 0 && (
                        <WithholdingTaxInfo>
                          <TaxLabel>Withholding Tax ({((request.withholdingTaxRate || 0) * 100).toFixed(0)}%):</TaxLabel>
                          <TaxAmount>GH₵{request.withholdingTax.toFixed(2)}</TaxAmount>
                          <NetAmountLabel>Amount You'll Receive:</NetAmountLabel>
                          <NetAmount>GH₵{(request.amountPaidToSeller || (request.amountRequested || request.amount) - request.withholdingTax).toFixed(2)}</NetAmount>
                        </WithholdingTaxInfo>
                      )}
                      <DetailItem>
                        <DetailLabel>Date:</DetailLabel>
                        <DetailValue>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </DetailValue>
                      </DetailItem>

                      {/* Payment Method Details */}
                      {request.paymentDetails && (
                        <>
                          {request.paymentMethod === "bank" && request.paymentDetails.accountNumber && (
                            <>
                              <DetailItem>
                                <DetailLabel>Account Name:</DetailLabel>
                                <DetailValue>{request.paymentDetails.accountName || "N/A"}</DetailValue>
                              </DetailItem>
                              <DetailItem>
                                <DetailLabel>Account Number:</DetailLabel>
                                <DetailValue>{request.paymentDetails.accountNumber}</DetailValue>
                              </DetailItem>
                              {request.paymentDetails.bankName && (
                                <DetailItem>
                                  <DetailLabel>Bank:</DetailLabel>
                                  <DetailValue>{request.paymentDetails.bankName}</DetailValue>
                                </DetailItem>
                              )}
                              {request.paymentDetails.branch && (
                                <DetailItem>
                                  <DetailLabel>Branch:</DetailLabel>
                                  <DetailValue>{request.paymentDetails.branch}</DetailValue>
                                </DetailItem>
                              )}
                            </>
                          )}
                          {["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(request.paymentMethod) && request.paymentDetails.phone && (
                            <>
                              <DetailItem>
                                <DetailLabel>Phone Number:</DetailLabel>
                                <DetailValue>{request.paymentDetails.phone}</DetailValue>
                              </DetailItem>
                              {request.paymentDetails.network && (
                                <DetailItem>
                                  <DetailLabel>Network:</DetailLabel>
                                  <DetailValue>{request.paymentDetails.network}</DetailValue>
                                </DetailItem>
                              )}
                              {request.paymentDetails.accountName && (
                                <DetailItem>
                                  <DetailLabel>Account Name:</DetailLabel>
                                  <DetailValue>{request.paymentDetails.accountName}</DetailValue>
                                </DetailItem>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {request.paystackReference && (
                        <DetailItem>
                          <DetailLabel>Reference:</DetailLabel>
                          <DetailValue>{request.paystackReference}</DetailValue>
                        </DetailItem>
                      )}
                      {request.rejectionReason && (
                        <DetailItem>
                          <DetailLabel>Reason:</DetailLabel>
                          <DetailValue $error>{request.rejectionReason}</DetailValue>
                        </DetailItem>
                      )}
                    </RequestDetails>

                    {/* Show cancel button for pending requests */}
                    {request.status === "pending" && (
                      <RequestActions>
                        <DeleteButton
                          $isConfirming={pendingCancelId === (request._id || request.id)}
                          onClick={() => {
                            const requestId = request._id || request.id;
                            if (pendingCancelId === requestId) {
                              // Second click
                              setPendingCancelId(null);
                              setDeletingRequestId(requestId);
                              deletePaymentRequest.mutate(requestId, {
                                onSettled: () => {
                                  setDeletingRequestId(null);
                                }
                              });
                            } else {
                              // First click
                              setPendingCancelId(requestId);
                              setTimeout(() => setPendingCancelId(cur => cur === requestId ? null : cur), 4000);
                            }
                          }}
                          disabled={deletingRequestId === (request._id || request.id)}
                        >
                          {deletingRequestId === (request._id || request.id) ? (
                            <>
                              <FaSpinner className="spinner" /> Cancelling...
                            </>
                          ) : pendingCancelId === (request._id || request.id) ? (
                            <>
                              <FaCheck /> Click to confirm
                            </>
                          ) : (
                            <>
                              <FaTimes /> Cancel
                            </>
                          )}
                        </DeleteButton>
                      </RequestActions>
                    )}
                    {/* Show reversal button for processing, awaiting_paystack_otp, or pending statuses (if not already reversed) */}
                    {((request.status === "processing" || request.status === "awaiting_paystack_otp" || request.status === "pending") && !request.reversed) && (
                      <RequestActions>
                        <ReversalButton
                          onClick={() => {
                            setReversalModal({ isOpen: true, request });
                          }}
                        >
                          <FaUndo /> Request Reversal
                        </ReversalButton>
                      </RequestActions>
                    )}
                    {request.reversed && (
                      <ReversalInfo>
                        <FaUndo /> This withdrawal has been reversed
                        {request.reverseReason && (
                          <ReversalReason>Reason: {request.reverseReason}</ReversalReason>
                        )}
                      </ReversalInfo>
                    )}
                  </RequestCard>
                ))}
              </RequestsList>
            )}
          </HistoryContainer>
        )}
      </TabContent>

      {/* Reversal Modal */}
      <ReversalModal
        isOpen={reversalModal.isOpen}
        onClose={() => setReversalModal({ isOpen: false, request: null })}
        onConfirm={handleReversalConfirm}
        request={reversalModal.request}
        isLoading={requestReversal.isPending}
      />
    </WithdrawalsPage_>
  );
}

// Styled Components
const WithdrawalsPage_ = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const WdHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const WdTitle = styled.h1`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.1rem;
`;

const WdSubtitle = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0;
`;

const BalanceCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const BalanceCard = styled.div`
  padding: 1rem 1.25rem;
  background: #FFFFFF;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const BalanceLabel = styled.div`
  font-size: 0.72rem;
  color: #9CA3AF;
  font-weight: 500;
`;

const BalanceAmount = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.02em;
`;

const TabsContainer = styled.div`
  display: inline-flex;
  gap: 2px;
  background: #F3F0EB;
  border-radius: 9px;
  padding: 3px;
`;

const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 28px;
  padding: 0 0.9rem;
  background: ${(p) => p.$active ? '#FFFFFF' : 'transparent'};
  color: ${(p) => p.$active ? '#111827' : '#6B7280'};
  border: none;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: ${(p) => p.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: ${(p) => p.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  white-space: nowrap;

  &:hover { color: ${(p) => p.$active ? '#111827' : '#374151'}; }
`;

const TabContent = styled.div`
  min-height: 200px;
`;

const RequestForm = styled.form`
  background: #FFFFFF;
  padding: 1.5rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 0.85rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  height: 38px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background: #F9F8F5;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.12s, background 0.12s;

  &:focus {
    border-color: #E8920A;
    background: #FFFFFF;
  }
`;

const Select = styled.select`
  width: 100%;
  height: 38px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  background: #F9F8F5;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.12s, background 0.12s;

  &:focus {
    border-color: #E8920A;
    background: #FFFFFF;
  }
`;

const HelperText = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 0.3rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6B7280;
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: #E8920A;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.7rem 0.85rem;
  background: #FEF2F2;
  border: 0.5px solid #FECACA;
  border-left: 3px solid #EF4444;
  border-radius: 9px;
  color: #DC2626;
  font-size: 0.9rem;
  margin-bottom: 0.85rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 40px;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: opacity 0.12s;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const WithholdingTaxInfo = styled.div`
  margin-top: 0.65rem;
  padding: 0.75rem 0.9rem;
  background: #FFFBEB;
  border: 0.5px solid #FDE68A;
  border-left: 3px solid #F59E0B;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const TaxLabel = styled.div`
  font-size: 0.875rem;
  color: #92400E;
  font-weight: 500;
`;

const TaxAmount = styled.div`
  font-size: 0.875rem;
  color: #D97706;
  font-weight: 600;
`;

const NetAmountLabel = styled.div`
  font-size: 0.875rem;
  color: #92400E;
  font-weight: 500;
  margin-top: 0.15rem;
`;

const NetAmount = styled.div`
  font-size: 1rem;
  color: #059669;
  font-weight: 700;
`;

const RecentWithdrawalsSection = styled.div`
  margin-top: 1rem;

  h3 {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
`;

const HistoryContainer = styled.div`
  min-height: 200px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  color: #9CA3AF;
  font-size: 0.9rem;
  text-align: center;
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RequestCard = styled.div`
  padding: 1.25rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  background: #FFFFFF;
  transition: border-color 0.12s;

  &:hover {
    border-color: #E8920A;
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
`;

const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const RequestAmount = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
`;

const RequestMethod = styled.div`
  font-size: 0.875rem;
  color: #9CA3AF;
`;

const RequestStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 22px;
  padding: 0 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;

  ${(props) => {
    switch (props.$status) {
      case "paid":
        return `background: #D1FAE5; color: #065F46;`;
      case "processing":
      case "approved":
        return `background: #DBEAFE; color: #1D4ED8;`;
      case "failed":
      case "rejected":
        return `background: #FEE2E2; color: #991B1B;`;
      case "pending":
        return `background: #FEF9C3; color: #854D0E;`;
      case "awaiting_paystack_otp":
        return `background: #FDF3E3; color: #92400E;`;
      case "reversed":
        return `background: #EDE9FE; color: #5B21B6;`;
      default:
        return `background: #F3F4F6; color: #4B5563;`;
    }
  }}
`;

const RequestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #9CA3AF;
`;

const DetailValue = styled.div`
  color: #6B7280;
  ${(props) => props.$error && `color: #DC2626;`}
`;

const RequestActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

const VerifyOTPButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  height: 30px;
  padding: 0 0.85rem;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  height: 30px;
  padding: 0 0.85rem;
  background: #EF4444;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  .spinner { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const ReversalButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  height: 30px;
  padding: 0 0.85rem;
  background: #F97316;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ReversalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.75rem 0.9rem;
  background: #EDE9FE;
  border: 0.5px solid #DDD6FE;
  border-left: 3px solid #7C3AED;
  border-radius: 9px;
  margin-top: 0.75rem;
  color: #5B21B6;
  font-size: 0.875rem;
`;

const ReversalReason = styled.div`
  font-size: 0.75rem;
  color: #6D28D9;
  font-style: italic;
`;

const PinSubmissionSection = styled.div`
  margin-top: 0.75rem;
  padding: 0.85rem 1rem;
  background: #EFF6FF;
  border: 0.5px solid #BFDBFE;
  border-left: 3px solid #3B82F6;
  border-radius: 9px;
`;

const PinInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #1D4ED8;
  font-size: 0.9rem;
`;

const PinInfoText = styled.span`
  flex: 1;
`;

const PinForm = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const PinInput = styled.input`
  flex: 1;
  height: 36px;
  padding: 0 0.75rem;
  border: 0.5px solid #BFDBFE;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-align: center;
  background: #FFFFFF;
  outline: none;
  transition: border-color 0.12s;

  &:focus { border-color: #3B82F6; }
  &:disabled { background: #F3F4F6; cursor: not-allowed; }
`;

const PinSubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  height: 36px;
  padding: 0 0.85rem;
  background: #3B82F6;
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.12s;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  .spinner { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
