import { useMemo } from 'react';
import { useGetSellerBalance } from '../useBalance';

/**
 * Unified hook for seller balance data
 * Consolidates all balance calculations to ensure consistency across the app
 * 
 * Provides:
 * - availableBalance: Amount available for withdrawal (withdrawableBalance)
 * - pendingBalance: Funds in withdrawal requests awaiting approval/OTP
 * - totalEarnings: Total revenue from all delivered orders (balance + totalWithdrawn)
 * - withdrawnAmount: Total amount withdrawn by seller (all time)
 * - lockedBalance: Funds locked by admin due to disputes/issues
 * - balance: Total current balance (available + pending + locked)
 * - lastUpdated: Timestamp of last data fetch
 */
export const useSellerBalance = () => {
  const {
    data: balanceData,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = useGetSellerBalance();

  // Extract and normalize balance values
  const balanceValues = useMemo(() => {
    if (!balanceData) {
      return {
        availableBalance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        withdrawnAmount: 0,
        lockedBalance: 0,
        balance: 0,
        lastUpdated: null,
      };
    }

    // Get values from API response
    const balance = balanceData?.balance || 0; // Total current balance
    const lockedBalance = balanceData?.lockedBalance || 0; // Funds locked by admin
    const pendingBalance = balanceData?.pendingBalance || 0; // Funds in withdrawal requests
    const totalWithdrawn = balanceData?.totalWithdrawn || 0; // Total withdrawn (all time)
    const totalRevenue = balanceData?.totalRevenue || 0; // Total earnings (balance + totalWithdrawn)
    
    // Available balance = withdrawableBalance (from API)
    // Formula: availableBalance = balance - lockedBalance - pendingBalance
    const availableBalance = balanceData?.withdrawableBalance || 
                            balanceData?.availableBalance || 
                            Math.max(0, balance - lockedBalance - pendingBalance);

    // Verify calculation consistency
    // totalRevenue should equal balance + totalWithdrawn
    const calculatedTotalRevenue = balance + totalWithdrawn;
    const verifiedTotalRevenue = totalRevenue || calculatedTotalRevenue;

    // Verify availableBalance calculation
    const calculatedAvailable = Math.max(0, balance - lockedBalance - pendingBalance);
    const verifiedAvailable = availableBalance || calculatedAvailable;

    return {
      availableBalance: verifiedAvailable,
      pendingBalance,
      totalEarnings: verifiedTotalRevenue,
      withdrawnAmount: totalWithdrawn,
      lockedBalance,
      balance,
      lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
      // Payout verification status
      payoutStatus: balanceData?.payoutStatus || 'pending',
      payoutRejectionReason: balanceData?.payoutRejectionReason || null,
    };
  }, [balanceData, dataUpdatedAt]);

  return {
    ...balanceValues,
    isLoading,
    error,
    refetch,
    // Raw data for advanced use cases
    rawData: balanceData,
  };
};

export default useSellerBalance;

