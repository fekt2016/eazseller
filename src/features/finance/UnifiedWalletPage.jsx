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
  FaDollarSign,
  FaArrowDown,
  FaSync,
} from "react-icons/fa";
import styled from "styled-components";
import { useSellerBalance } from "../../shared/hooks/finance/useSellerBalance";
import { useGetPaymentRequests, useCreatePaymentRequest, useDeletePaymentRequest, useRequestReversal } from "../../shared/hooks/usePaymentRequest";
import ReversalModal from "./ReversalModal";
import { useGetPaymentMethods } from "../../shared/hooks/usePaymentMethod";
import useAuth from "../../shared/hooks/useAuth";
import { LoadingSpinner } from "../../shared/components/LoadingSpinner";
import useDynamicPageTitle from "../../shared/hooks/useDynamicPageTitle";
import TransactionList from "../../components/finance/TransactionList";

export default function UnifiedWalletPage() {
  const { seller } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [useSavedPaymentMethod, setUseSavedPaymentMethod] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    bank: { accountName: "", accountNumber: "", bankCode: "", bankName: "" },
    mobile: { phone: "", network: "" },
  });
  const [error, setError] = useState("");

  useDynamicPageTitle({
    title: 'Wallet & Withdrawals - Saiisai Seller',
    description: 'Manage your earnings, transactions, and withdrawals',
    defaultTitle: 'Wallet & Withdrawals - Saiisai Seller',
  });

  // Get balance using unified hook (includes payoutStatus)
  const {
    availableBalance: withdrawableBalance,
    pendingBalance,
    totalEarnings: totalRevenue,
    withdrawnAmount: totalWithdrawn,
    lockedBalance,
    isLoading: isBalanceLoading,
    error: balanceError,
    payoutStatus,
    payoutRejectionReason,
    refetch: refetchBalance,
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

  // ── Payout verification banner + gate ─────────────────────────────
  const verificationStatus = seller?.verificationStatus || 'pending';
  const isSellerVerified = verificationStatus === 'verified';
  const isPayoutVerified = payoutStatus === 'verified';
  const hasPaymentMethod = paymentMethods.length > 0;
  const canWithdraw =
    isSellerVerified &&
    isPayoutVerified &&
    hasPaymentMethod &&
    withdrawableBalance > 0;

  const payoutBanner = useMemo(() => {
    if (!isSellerVerified) {
      return {
        variant: 'pending',
        message:
          "Your seller account is still being verified. You'll be able to request withdrawals once an admin approves your account.",
        secondary: null,
        linkLabel: 'View settings',
        linkPath: PATHS.PROFILE,
      };
    }
    if (!isPayoutVerified) {
      if (payoutStatus === 'rejected') {
        return {
          variant: 'rejected',
          message:
            'Your payout was rejected. Please update your payment details and resubmit for verification.',
          secondary: payoutRejectionReason || null,
          linkLabel: 'Update payment methods',
          linkPath: PATHS.PAYMENT_METHODS,
        };
      }
      return {
        variant: 'pending',
        message:
          "Your payout is awaiting verification. You'll be able to request withdrawals once an admin approves your payment details.",
        secondary: null,
        linkLabel: 'View payment methods',
        linkPath: PATHS.PAYMENT_METHODS,
      };
    }
    if (!hasPaymentMethod) {
      return {
        variant: 'addMethod',
        message: 'Add a payment method to start receiving withdrawals.',
        secondary: null,
        linkLabel: 'Add payment method',
        linkPath: PATHS.PAYMENT_METHODS,
      };
    }
    return null;
  }, [
    isSellerVerified,
    isPayoutVerified,
    hasPaymentMethod,
    payoutStatus,
    payoutRejectionReason,
  ]);

  const withdrawDisabledReason =
    isSellerVerified &&
    isPayoutVerified &&
    hasPaymentMethod &&
    withdrawableBalance <= 0
      ? 'Insufficient balance for withdrawal.'
      : null;

  // Create payment request mutation
  const createPaymentRequest = useCreatePaymentRequest();
  const deletePaymentRequest = useDeletePaymentRequest();
  const requestReversal = useRequestReversal();

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
    // Priority 1: seller.paymentMethods (embedded)
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
      // Fallback: verified bank from PaymentMethod API
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
      // Fallback: verified mobile money from PaymentMethod API
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
        'telecel_cash': 'mobile_money',
        'at_money': 'mobile_money',
        'vodafone_cash': 'mobile_money',
        'airtel_tigo_money': 'mobile_money',
      };

      const paymentMethodToProvider = {
        'mtn_momo': 'MTN',
        'telecel_cash': 'Telecel',
        'at_money': 'AT',
        'vodafone_cash': 'Vodafone',
        'airtel_tigo_money': 'AirtelTigo',
      };

      // First, try to get from PaymentMethod model
      if (paymentMethod === "bank") {
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
      } else if (["mtn_momo", "telecel_cash", "at_money", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
        const provider = paymentMethodToProvider[paymentMethod];
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

      // Fallback to seller's saved payment methods
      if (!paymentDetailsToSend.accountNumber && !paymentDetailsToSend.phone) {
        if (paymentMethod === "bank" && seller?.paymentMethods?.bankAccount) {
          const bank = seller.paymentMethods.bankAccount;
          paymentDetailsToSend = {
            accountName: bank.accountName || "",
            accountNumber: bank.accountNumber || "",
            bankName: bank.bankName || "",
            branch: bank.branch || "",
          };
        } else if (["mtn_momo", "telecel_cash", "at_money", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod) && seller?.paymentMethods?.mobileMoney) {
          const mobile = seller.paymentMethods.mobileMoney;
          paymentDetailsToSend = {
            phone: mobile.phone || "",
            network: mobile.network || "",
            accountName: mobile.accountName || "",
          };
        }
      }

      if (!paymentDetailsToSend.accountNumber && !paymentDetailsToSend.phone) {
        setError("Please add payment method details in your account settings");
        return;
      }
    } else {
      if (paymentMethod === "bank") {
        paymentDetailsToSend = {
          accountName: paymentDetails.bank.accountName || "",
          accountNumber: paymentDetails.bank.accountNumber || "",
          bankName: paymentDetails.bank.bankName || "",
          branch: paymentDetails.bank.branch || "",
        };
      } else if (["mtn_momo", "telecel_cash", "at_money", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
        paymentDetailsToSend = {
          phone: paymentDetails.mobile.phone || "",
          network: paymentDetails.mobile.network || "",
          accountName: paymentDetails.mobile.accountName || "",
        };
      }
    }

    // Validate payment details
    if (paymentMethod === "bank") {
      if (!paymentDetailsToSend.accountName || !paymentDetailsToSend.accountNumber || !paymentDetailsToSend.bankName) {
        setError("Please provide all bank details: account name, account number, and bank name");
        return;
      }
    } else if (["mtn_momo", "telecel_cash", "at_money", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
      if (!paymentDetailsToSend.phone || !paymentDetailsToSend.network) {
        setError("Please provide phone number and network for mobile money");
        return;
      }
    }

    // Send request
    createPaymentRequest.mutate({
      amount: amountNum,
      paymentMethod: paymentMethod,
      paymentDetails: paymentDetailsToSend,
    }, {
      onSuccess: () => {
        setAmount("");
        setError("");
      },
      onError: (error) => {
        setError(error.response?.data?.message || error.message || 'Failed to create withdrawal request');
      }
    });
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
    const reversibleStatuses = ['pending', 'processing', 'awaiting_paystack_otp'];
    return reversibleStatuses.includes(request.status) && !request.reversed;
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

  const getPayoutStatusBadge = () => {
    if (payoutStatus === 'verified') {
      return (
        <PayoutStatusBadge $status="verified">
          <FaCheckCircle /> Payout Verified
        </PayoutStatusBadge>
      );
    } else if (payoutStatus === 'rejected') {
      return (
        <PayoutStatusBadge $status="rejected">
          <FaTimes /> Payout Rejected
          {payoutRejectionReason && (
            <PayoutStatusReason>{payoutRejectionReason}</PayoutStatusReason>
          )}
        </PayoutStatusBadge>
      );
    } else {
      return (
        <PayoutStatusBadge $status="pending">
          <FaClock /> Payout Verification Pending
        </PayoutStatusBadge>
      );
    }
  };

  if (isBalanceLoading) {
    return (
      <WalletPage>
        <LoadingSpinner />
      </WalletPage>
    );
  }

  return (
    <WalletPage>
      {/* Page Header */}
      <WalletHeader>
        <div>
          <WalletTitle>Wallet &amp; Withdrawals</WalletTitle>
          <WalletSubtitle>Manage your earnings, transactions, and withdrawals</WalletSubtitle>
        </div>
      </WalletHeader>

      {payoutBanner && (
        <PayoutNoticeBanner $variant={payoutBanner.variant} role="status">
          <PayoutNoticeBody>
            <PayoutNoticeText>{payoutBanner.message}</PayoutNoticeText>
            {payoutBanner.secondary ? (
              <PayoutNoticeSecondary>{payoutBanner.secondary}</PayoutNoticeSecondary>
            ) : null}
            <PayoutNoticeLink
              type="button"
              onClick={() => navigate(payoutBanner.linkPath)}
            >
              {payoutBanner.linkLabel}
            </PayoutNoticeLink>
            {payoutStatus === 'pending' && isSellerVerified && (
              <RefreshButton
                type="button"
                onClick={() => refetchBalance()}
                disabled={isBalanceLoading}
              >
                <FaSync className={isBalanceLoading ? 'spin' : ''} /> Refresh status
              </RefreshButton>
            )}
          </PayoutNoticeBody>
        </PayoutNoticeBanner>
      )}

      {/* 1️⃣ WALLET SUMMARY */}
      <BalanceCards>
        <BalanceCard $highlight $accent="#E8920A">
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount $highlight>GH₵{withdrawableBalance.toFixed(2)}</BalanceAmount>
          {getPayoutStatusBadge()}
        </BalanceCard>
        <BalanceCard $accent="#10B981">
          <BalanceLabel>Total Revenue</BalanceLabel>
          <BalanceAmount>GH₵{totalRevenue.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard $accent="#F59E0B">
          <BalanceLabel>Pending Balance</BalanceLabel>
          <BalanceAmount>GH₵{pendingBalance.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard $accent="#EF4444">
          <BalanceLabel>Locked Balance</BalanceLabel>
          <BalanceAmount>GH₵{lockedBalance.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard $accent="#6B7280">
          <BalanceLabel>Total Withdrawn</BalanceLabel>
          <BalanceAmount>GH₵{totalWithdrawn.toFixed(2)}</BalanceAmount>
        </BalanceCard>
      </BalanceCards>

      {/* Tabs */}
      <TabsContainer>
        <TabButton
          $active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          <FaWallet /> Overview
        </TabButton>
        <TabButton
          $active={activeTab === "withdraw"}
          onClick={() => setActiveTab("withdraw")}
        >
          <FaMoneyBillWave /> Request Withdrawal
        </TabButton>
        <TabButton
          $active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> Withdrawal History
        </TabButton>
      </TabsContainer>

      <TabContent>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <OverviewContent>
            <TransactionList limit={20} />
          </OverviewContent>
        )}

        {/* WITHDRAW TAB */}
        {activeTab === "withdraw" && (
          <>
            {/* 2️⃣ WITHDRAW ACTION SECTION */}
            {!canWithdraw && withdrawDisabledReason && (
              <ErrorMessage>
                <span><FaLock /> {withdrawDisabledReason}</span>
              </ErrorMessage>
            )}

            {/* 3️⃣ WITHDRAWAL FORM */}
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
                  disabled={!canWithdraw}
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
                  disabled={!canWithdraw}
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="telecel_cash">Telecel Cash</option>
                  <option value="at_money">AT Money</option>
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
                    disabled={!canWithdraw}
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
                          disabled={!canWithdraw}
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
                          disabled={!canWithdraw}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          type="text"
                          value={paymentDetails.bank.bankName}
                          onChange={(e) =>
                            handlePaymentDetailsChange("bankName", e.target.value, "bank")
                          }
                          required
                          disabled={!canWithdraw}
                        />
                      </FormGroup>
                    </>
                  )}

                  {["mtn_momo", "telecel_cash", "at_money", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod) && (
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
                          disabled={!canWithdraw}
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
                          disabled={!canWithdraw}
                        >
                          <option value="">Select network</option>
                          <option value="MTN">MTN</option>
                          <option value="Telecel">Telecel</option>
                          <option value="AT">AT</option>
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
                  !canWithdraw ||
                  createPaymentRequest.isPending ||
                  !amount ||
                  amount.trim() === "" ||
                  isNaN(parseFloat(amount)) ||
                  parseFloat(amount) <= 0
                }
                title={
                  !isSellerVerified
                    ? 'Your seller account is awaiting verification.'
                    : !isPayoutVerified
                      ? 'Complete payout verification in Settings before requesting a withdrawal.'
                      : !hasPaymentMethod
                        ? 'Add a payment method in Settings before requesting a withdrawal.'
                        : withdrawableBalance <= 0
                          ? 'No available balance to withdraw.'
                          : ''
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

            {/* Recent Withdrawals */}
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

                      {/* Cancel pending requests */}
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

                    </RequestCard>
                  ))}
                </RequestsList>
              </RecentWithdrawalsSection>
            )}
          </>
        )}

        {/* HISTORY TAB */}
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
                            </>
                          )}
                          {["mtn_momo", "telecel_cash", "at_money", "vodafone_cash", "airtel_tigo_money"].includes(request.paymentMethod) && request.paymentDetails.phone && (
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
                            </>
                          )}
                        </>
                      )}
                      {request.rejectionReason && (
                        <DetailItem>
                          <DetailLabel>Reason:</DetailLabel>
                          <DetailValue $error>{request.rejectionReason}</DetailValue>
                        </DetailItem>
                      )}
                    </RequestDetails>

                    {/* Action buttons */}
                    {(() => {
                      const needsOTP =
                        request.status === "awaiting_paystack_otp" ||
                        (request.status === "processing" && request.requiresPin) ||
                        (request.status === "approved" && request.requiresPin && !request.pinSubmitted);

                      return needsOTP;
                    })() && (
                        <RequestActions>
                          <VerifyOTPButton
                            onClick={() => {
                              const requestId = request._id || request.id;
                              const verifyOtpPath = PATHS.WITHDRAWAL_VERIFY_OTP.replace(':withdrawalId', requestId);
                              navigate(verifyOtpPath);
                            }}
                          >
                            <FaCheckCircle /> Verify OTP
                          </VerifyOTPButton>
                        </RequestActions>
                      )}

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

                    {canReverse(request) && (
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
    </WalletPage>
  );
}

// Styled Components
const PayoutNoticeBanner = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid;
  background: ${({ $variant }) =>
    $variant === 'rejected' ? '#fef2f2' :
    $variant === 'addMethod' ? '#eff6ff' : '#fffbeb'};
  border-color: ${({ $variant }) =>
    $variant === 'rejected' ? '#fecaca' :
    $variant === 'addMethod' ? '#bfdbfe' : '#fde68a'};
  color: ${({ $variant }) =>
    $variant === 'rejected' ? '#991b1b' :
    $variant === 'addMethod' ? '#1e40af' : '#92400e'};
`;

const PayoutNoticeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PayoutNoticeText = styled.div`
  font-size: 14px;
  line-height: 1.4;
`;

const PayoutNoticeSecondary = styled.div`
  font-size: 13px;
  opacity: 0.8;
`;

const PayoutNoticeLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  color: inherit;
  align-self: flex-start;
  &:hover { opacity: 0.85; }
`;

const WalletPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const WalletHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WalletTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;
`;

const WalletSubtitle = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0;
`;

const BalanceCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.75rem;
`;

const BalanceCard = styled.div`
  padding: 1.1rem 1.25rem;
  background: #FFFFFF;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BalanceLabel = styled.div`
  font-size: 0.775rem;
  color: #9CA3AF;
  font-weight: 500;
`;

const BalanceAmount = styled.div`
  font-size: 1.9rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.03em;
`;

const PayoutStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 22px;
  padding: 0 0.6rem;
  border-radius: 20px;
  margin-top: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;

  ${(p) => {
    switch (p.$status) {
      case 'verified':   return `background: #D1FAE5; color: #065F46;`;
      case 'rejected':   return `background: #FEE2E2; color: #991B1B;`;
      case 'pending':    return `background: #FEF3C7; color: #92400E;`;
      default:           return `background: #F3F4F6; color: #374151;`;
    }
  }}
`;

const PayoutStatusReason = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 0.3rem;
  font-style: italic;
`;

const TabsContainer = styled.div`
  display: inline-flex;
  gap: 2px;
  background: #F3F0EB;
  border-radius: 9px;
  padding: 3px;
  flex-wrap: wrap;
  align-self: flex-start;
`;

const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 30px;
  padding: 0 1rem;
  background: ${(p) => p.$active ? '#FFFFFF' : 'transparent'};
  color: ${(p) => p.$active ? '#111827' : '#6B7280'};
  border: none;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: ${(p) => p.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  box-shadow: ${(p) => p.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};

  &:hover { color: ${(p) => p.$active ? '#111827' : '#374151'}; }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const OverviewContent = styled.div`
  min-height: 400px;
`;

const RequestForm = styled.form`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  height: 38px;
  padding: 0 0.85rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  background: #F9F8F5;
  color: #111827;
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: #9CA3AF; }
  &:focus { border-color: #E8920A; background: #FFFFFF; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Select = styled.select`
  width: 100%;
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

const HelperText = styled.div`
  font-size: 0.875rem;
  color: #9CA3AF;
  margin-top: 0.3rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
`;

const ErrorMessage = styled.div`
  padding: 0.85rem 1rem;
  background: #FEF2F2;
  border: 0.5px solid #FECACA;
  border-left: 3px solid #EF4444;
  border-radius: 9px;
  color: #991B1B;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  span { flex: 1; min-width: 200px; }
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 30px;
  padding: 0 0.75rem;
  background: #FEE2E2;
  color: #991B1B;
  border: 0.5px solid #FECACA;
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: #FECACA; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }

  .spin { animation: spin 1s linear infinite; }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
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
  gap: 0.45rem;
  transition: opacity 0.12s;

  &:hover:not(:disabled) { opacity: 0.88; }
  &:disabled { background: #D1D5DB; cursor: not-allowed; }

  .spinner { animation: spin 1s linear infinite; }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const RecentWithdrawalsSection = styled.div`
  margin-top: 1rem;

  h3 {
    font-size: 0.8rem;
    font-weight: 600;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem;
  }
`;

const HistoryContainer = styled.div`
  min-height: 400px;
`;

const EmptyState = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  color: #9CA3AF;
  font-size: 0.875rem;
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RequestCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  transition: border-color 0.12s;

  &:hover { border-color: #E8920A; background: #FFFDF9; }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.85rem;
`;

const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const RequestAmount = styled.div`
  font-size: 1.15rem;
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
  text-transform: capitalize;
  flex-shrink: 0;

  ${(p) => {
    switch (p.$status) {
      case 'paid':              return `background: #D1FAE5; color: #065F46;`;
      case 'processing':
      case 'approved':          return `background: #DBEAFE; color: #1E40AF;`;
      case 'failed':
      case 'rejected':          return `background: #FEE2E2; color: #991B1B;`;
      case 'pending':           return `background: #FEF3C7; color: #92400E;`;
      case 'awaiting_paystack_otp': return `background: #FDF3E3; color: #92400E;`;
      case 'reversed':          return `background: #EDE9FE; color: #5B21B6;`;
      default:                  return `background: #F3F4F6; color: #374151;`;
    }
  }}
`;

const RequestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: #9CA3AF;
`;

const DetailValue = styled.div`
  color: #374151;
  font-weight: 500;
  ${(p) => p.$error && `color: #EF4444;`}
`;

const RequestActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.85rem;
  flex-wrap: wrap;
`;

const VerifyOTPButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 32px;
  padding: 0 0.9rem;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover { opacity: 0.88; }
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 32px;
  padding: 0 0.9rem;
  background: #FEE2E2;
  color: #991B1B;
  border: 0.5px solid #FECACA;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: #FECACA; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }

  .spinner { animation: spin 1s linear infinite; }
`;

const ReversalButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 32px;
  padding: 0 0.9rem;
  background: #FDF3E3;
  color: #92400E;
  border: 0.5px solid #FDE68A;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: #FEF3C7; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ReversalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  background: #EDE9FE;
  border-left: 3px solid #8B5CF6;
  border-radius: 9px;
  margin-top: 0.75rem;
  color: #5B21B6;
  font-size: 0.8rem;
`;

const ReversalReason = styled.div`
  font-size: 0.75rem;
  color: #7C3AED;
  margin-top: 0.15rem;
  font-style: italic;
`;

const WithholdingTaxInfo = styled.div`
  margin-top: 0.75rem;
  padding: 0.85rem 1rem;
  background: #FFFDF9;
  border: 0.5px solid #F1EFE8;
  border-left: 3px solid #F59E0B;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const TaxLabel = styled.div`
  font-size: 0.875rem;
  color: #9CA3AF;
  font-weight: 500;
`;

const TaxAmount = styled.div`
  font-size: 0.9rem;
  color: #D97706;
  font-weight: 600;
`;

const NetAmountLabel = styled.div`
  font-size: 0.875rem;
  color: #9CA3AF;
  font-weight: 500;
  margin-top: 0.25rem;
`;

const NetAmount = styled.div`
  font-size: 1rem;
  color: #10B981;
  font-weight: 700;
`;

