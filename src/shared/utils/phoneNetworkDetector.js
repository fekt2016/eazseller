/**
 * Ghana mobile prefixes (local format 0XXXXXXXXX — first three characters):
 * - MTN: 024, 054, 055, 059, 025; new blocks 0597, 0598, 0599, 0256, 0257 (covered by 59 / 25)
 * - Telecel (formerly Vodafone): 020, 050
 * - AT (AirtelTigo): 023, 026, 027, 056, 057
 *
 * @param {string} phone - Phone number in any format (0XXXXXXXXX, 233XXXXXXXXX, +233XXXXXXXXX)
 * @returns {Object} - { network: string|null, isValid: boolean, formatted: string }
 */
const PREFIX_MTN = new Set(['24', '54', '55', '59', '25']);
const PREFIX_TELECEL = new Set(['20', '50']);
const PREFIX_AT = new Set(['23', '26', '27', '56', '57']);

export const detectGhanaPhoneNetwork = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { network: null, isValid: false, formatted: null };
  }

  const cleanedPhone = phone.replace(/\D/g, '');

  let localNumber = cleanedPhone;
  if (cleanedPhone.startsWith('233') && cleanedPhone.length === 12) {
    localNumber = '0' + cleanedPhone.substring(3);
  }

  if (!/^0\d{9}$/.test(localNumber)) {
    return { network: null, isValid: false, formatted: localNumber };
  }

  const prefix = localNumber.substring(1, 3);

  let detectedNetwork = null;
  if (PREFIX_MTN.has(prefix)) {
    detectedNetwork = 'MTN';
  } else if (PREFIX_TELECEL.has(prefix)) {
    detectedNetwork = 'Telecel';
  } else if (PREFIX_AT.has(prefix)) {
    detectedNetwork = 'AirtelTigo';
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
    AT: 'airtel_tigo_money',
    AirtelTigo: 'airtel_tigo_money',
    Vodafone: 'vodafone_cash',
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
    airtel_tigo_money: 'AT',
  };
  return mapping[paymentMethod] || null;
};

export default detectGhanaPhoneNetwork;

