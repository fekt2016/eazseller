/**
 * Detects Ghana mobile network from phone number
 * Supports MTN, Telecel (Vodafone), and AirtelTigo
 * 
 * @param {string} phone - Phone number in any format (0XXXXXXXXX, 233XXXXXXXXX, +233XXXXXXXXX)
 * @returns {Object} - { network: string|null, isValid: boolean, formatted: string }
 */
export const detectGhanaPhoneNetwork = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { network: null, isValid: false, formatted: null };
  }

  // Remove all non-digit characters
  const cleanedPhone = phone.replace(/\D/g, '');

  // Handle international format (233XXXXXXXXX)
  let localNumber = cleanedPhone;
  if (cleanedPhone.startsWith('233') && cleanedPhone.length === 12) {
    localNumber = '0' + cleanedPhone.substring(3);
  }

  // Validate Ghana phone number format (0XXXXXXXXX - 10 digits)
  if (!/^0\d{9}$/.test(localNumber)) {
    return { network: null, isValid: false, formatted: localNumber };
  }

  // Extract prefix (first 2 digits after 0)
  const prefix = localNumber.substring(1, 3);

  // Network prefixes mapping
  const networkPrefixes = {
    MTN: ['24', '54', '55', '59', '50'],
    Telecel: ['27', '57', '28', '20'], // Telecel (formerly Vodafone)
    AirtelTigo: ['26', '56', '23'],
  };

  // Detect network
  let detectedNetwork = null;
  for (const [network, prefixes] of Object.entries(networkPrefixes)) {
    if (prefixes.includes(prefix)) {
      detectedNetwork = network;
      break;
    }
  }

  return {
    network: detectedNetwork,
    isValid: detectedNetwork !== null,
    formatted: localNumber,
  };
};

/**
 * Maps network name to payment method enum value
 * @param {string} network - Network name (MTN, Telecel, AirtelTigo)
 * @returns {string|null} - Payment method value or null
 */
export const networkToPaymentMethod = (network) => {
  const mapping = {
    MTN: 'mtn_momo',
    Telecel: 'vodafone_cash', // Telecel uses vodafone_cash in the system
    AirtelTigo: 'airtel_tigo_money',
  };
  return mapping[network] || null;
};

/**
 * Maps payment method to network name
 * @param {string} paymentMethod - Payment method (mtn_momo, vodafone_cash, airtel_tigo_money)
 * @returns {string|null} - Network name or null
 */
export const paymentMethodToNetwork = (paymentMethod) => {
  const mapping = {
    mtn_momo: 'MTN',
    vodafone_cash: 'Telecel',
    airtel_tigo_money: 'AirtelTigo',
  };
  return mapping[paymentMethod] || null;
};

export default detectGhanaPhoneNetwork;

