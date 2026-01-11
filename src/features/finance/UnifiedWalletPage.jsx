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
} from "react-icons/fa";
import styled from "styled-components";
import { useSellerBalance } from "../../shared/hooks/finance/useSellerBalance";
import { useGetPaymentRequests, useCreatePaymentRequest, useDeletePaymentRequest, useRequestReversal } from "../../shared/hooks/usePaymentRequest";
import { useSubmitPinForWithdrawal } from "../../shared/hooks/usePayout";
import ReversalModal from "./ReversalModal";
import { useGetPaymentMethods } from "../../shared/hooks/usePaymentMethod";
import useAuth from "../../shared/hooks/useAuth";
import { LoadingSpinner } from "../../shared/components/LoadingSpinner";
import { PageContainer, PageHeader, TitleSection } from "../../shared/components/ui/SpacingSystem";
import Button from "../../shared/components/ui/Button";
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
    title: 'Wallet & Withdrawals - EazSeller',
    description: 'Manage your earnings, transactions, and withdrawals',
    defaultTitle: 'Wallet & Withdrawals - EazSeller',
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
  
  // Track which request is being deleted (for individual loading state)
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  
  // State for reversal modal
  const [reversalModal, setReversalModal] = useState({
    isOpen: false,
    request: null,
  });

  // Load seller's saved payment methods
  useEffect(() => {
    if (seller?.paymentMethods) {
      if (seller.paymentMethods.bankAccount) {
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
      }

      if (seller.paymentMethods.mobileMoney) {
        const mobile = seller.paymentMethods.mobileMoney;
        setPaymentDetails((prev) => ({
          ...prev,
          mobile: {
            phone: mobile.phone || "",
            network: mobile.network || "",
          },
        }));
      }
    }
  }, [seller]);

  // Check if withdrawal is allowed
  const canWithdraw = payoutStatus === 'verified' && withdrawableBalance > 0;
  const withdrawDisabledReason = 
    payoutStatus === 'rejected' 
      ? payoutRejectionReason || 'Payout details were rejected. Please update your payment details and resubmit for verification.'
      : payoutStatus === 'pending'
      ? 'Your payout details must be verified by an admin before you can withdraw funds.'
      : withdrawableBalance <= 0
      ? 'Insufficient balance for withdrawal.'
      : null;

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
        } else if (["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod) && seller?.paymentMethods?.mobileMoney) {
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
      } else if (["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
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
    } else if (["mtn_momo", "vodafone_cash", "airtel_tigo_money"].includes(paymentMethod)) {
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
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Wallet & Withdrawals</h1>
          <p>Manage your earnings, transactions, and withdrawals</p>
        </TitleSection>
      </PageHeader>

      {/* 1️⃣ WALLET SUMMARY */}
      <BalanceCards>
        <BalanceCard $highlight>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount $highlight>GH₵{withdrawableBalance.toFixed(2)}</BalanceAmount>
          {getPayoutStatusBadge()}
        </BalanceCard>
        <BalanceCard>
          <BalanceLabel>Total Revenue</BalanceLabel>
          <BalanceAmount>GH₵{totalRevenue.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard>
          <BalanceLabel>Pending Balance</BalanceLabel>
          <BalanceAmount>GH₵{pendingBalance.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard>
          <BalanceLabel>Locked Balance</BalanceLabel>
          <BalanceAmount>GH₵{lockedBalance.toFixed(2)}</BalanceAmount>
        </BalanceCard>
        <BalanceCard>
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
                <FaLock /> {withdrawDisabledReason}
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
                      {request.status === "pending" && (
                        <RequestActions>
                          <DeleteButton
                            onClick={() => {
                              if (window.confirm("Are you sure you want to cancel this withdrawal request?")) {
                                const requestId = request._id || request.id;
                                setDeletingRequestId(requestId);
                                deletePaymentRequest.mutate(requestId, {
                                  onSettled: () => {
                                    setDeletingRequestId(null);
                                  }
                                });
                              }
                            }}
                            disabled={deletingRequestId === (request._id || request.id)}
                          >
                            {deletingRequestId === (request._id || request.id) ? (
                              <>
                                <FaSpinner className="spinner" /> Cancelling...
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
                    {request.status === "awaiting_paystack_otp" || (request.status === "processing" && request.requiresPin) ? (
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
                    ) : null}
                    
                    {request.status === "pending" && (
                      <RequestActions>
                        <DeleteButton
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel this withdrawal request?")) {
                              const requestId = request._id || request.id;
                              setDeletingRequestId(requestId);
                              deletePaymentRequest.mutate(requestId, {
                                onSettled: () => {
                                  setDeletingRequestId(null);
                                }
                              });
                            }
                          }}
                          disabled={deletingRequestId === (request._id || request.id)}
                        >
                          {deletingRequestId === (request._id || request.id) ? (
                            <>
                              <FaSpinner className="spinner" /> Cancelling...
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
    </PageContainer>
  );
}

// Styled Components
const BalanceCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const BalanceCard = styled.div`
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  ${(props) =>
    props.$highlight &&
    `
    background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
    border: 2px solid var(--color-primary-300);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
  `}
`;

const BalanceLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin-bottom: var(--spacing-xs);
`;

const BalanceAmount = styled.div`
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary-600);

  ${(props) =>
    props.$highlight &&
    `
    color: var(--color-primary-700);
    font-size: var(--font-size-2xl);
  `}
`;

const PayoutStatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;

  ${(props) => {
    switch (props.$status) {
      case 'verified':
        return `
          background: var(--color-green-50);
          color: var(--color-green-700);
        `;
      case 'rejected':
        return `
          background: var(--color-red-50);
          color: var(--color-red-700);
        `;
      case 'pending':
        return `
          background: var(--color-yellow-50);
          color: var(--color-yellow-700);
        `;
      default:
        return `
          background: var(--color-grey-50);
          color: var(--color-grey-700);
        `;
    }
  }}
`;

const PayoutStatusReason = styled.div`
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
  font-style: italic;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-grey-200);
`;

const TabButton = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  background: ${(props) => (props.$active ? "var(--color-primary-600)" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "var(--color-grey-700)")};
  border: none;
  border-bottom: 2px solid ${(props) => (props.$active ? "var(--color-primary-600)" : "transparent")};
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "var(--color-primary-700)" : "var(--color-grey-50)")};
  }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const OverviewContent = styled.div`
  min-height: 400px;
`;

const RequestForm = styled.form`
  background: var(--color-white-0);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--spacing-lg);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
  color: var(--color-grey-700);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);

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

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);

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

const HelperText = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin-top: var(--spacing-xs);
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  padding: var(--spacing-md);
  background: var(--color-red-50);
  color: var(--color-red-700);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary-700);
  }

  &:disabled {
    background: var(--color-grey-300);
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const RecentWithdrawalsSection = styled.div`
  margin-top: var(--spacing-lg);
  
  h3 {
    margin-bottom: var(--spacing-md);
    color: var(--color-grey-700);
  }
`;

const HistoryContainer = styled.div`
  min-height: 400px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: var(--color-grey-500);
  text-align: center;
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const RequestCard = styled.div`
  padding: var(--spacing-lg);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background: var(--color-white-0);
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const RequestAmount = styled.div`
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-grey-900);
`;

const RequestMethod = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
`;

const RequestStatus = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;

  ${(props) => {
    switch (props.$status) {
      case "paid":
        return `
          background: var(--color-green-50);
          color: var(--color-green-700);
        `;
      case "processing":
      case "approved":
        return `
          background: var(--color-blue-50);
          color: var(--color-blue-700);
        `;
      case "failed":
      case "rejected":
        return `
          background: var(--color-red-50);
          color: var(--color-red-700);
        `;
      case "pending":
        return `
          background: var(--color-yellow-50);
          color: var(--color-yellow-700);
        `;
      case "awaiting_paystack_otp":
        return `
          background: var(--color-orange-50);
          color: var(--color-orange-700);
        `;
      case "reversed":
        return `
          background: var(--color-purple-50);
          color: var(--color-purple-700);
        `;
      default:
        return `
          background: var(--color-grey-50);
          color: var(--color-grey-700);
        `;
    }
  }}
`;

const RequestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: var(--color-grey-600);
`;

const DetailValue = styled.div`
  color: var(--color-grey-700);
  ${(props) => props.$error && `color: var(--color-red-600);`}
`;

const RequestActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  flex-wrap: wrap;
`;

const VerifyOTPButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: background 0.2s;

  &:hover {
    background: var(--color-primary-700);
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-red-500);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-red-600);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }
`;

const ReversalButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-orange-500);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-orange-600);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ReversalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-purple-50);
  border: 1px solid var(--color-purple-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-md);
  color: var(--color-purple-900);
  font-size: var(--font-size-sm);
`;

const ReversalReason = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-purple-700);
  margin-top: var(--spacing-xs);
  font-style: italic;
`;

const WithholdingTaxInfo = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 3px solid #f59e0b;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TaxLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const TaxAmount = styled.div`
  font-size: 1rem;
  color: #f59e0b;
  font-weight: 600;
`;

const NetAmountLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.25rem;
`;

const NetAmount = styled.div`
  font-size: 1.125rem;
  color: #10b981;
  font-weight: 700;
`;

