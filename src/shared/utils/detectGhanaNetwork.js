/**
 * Ghana mobile network detection by phone prefix (3-digit).
 * Used for seller registration phone input and network badge.
 */

const GHANA_NETWORKS = {
  MTN: {
    prefixes: ['024', '025', '053', '054', '055', '059'],
    color: '#FFCC00',
    bgColor: '#FFF9E6',
    textColor: '#B8860B',
    logo: 'MTN',
  },
  TELECEL: {
    prefixes: ['020', '050'],
    color: '#E40520',
    bgColor: '#FEE8EB',
    textColor: '#C0021A',
    logo: 'Telecel',
  },
  AIRTELTIGO: {
    prefixes: ['023', '026', '027', '056', '057'],
    color: '#E40000',
    bgColor: '#FDE8E8',
    textColor: '#990000',
    logo: 'AT',
  },
};

/**
 * Normalize and clean phone number: strip spaces/dashes, convert +233/233 to 0.
 * @param {string} phoneNumber
 * @returns {string} e.g. "0241234567"
 */
function normalizeGhanaPhone(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') return '';
  const cleaned = phoneNumber
    .replace(/\s|-/g, '')
    .replace(/^\+233/, '0')
    .replace(/^233/, '0')
    .replace(/\D/g, '');
  return cleaned;
}

/**
 * Detect Ghana mobile network from phone number (3-digit prefix).
 * Returns null if fewer than 3 digits (no badge). For 3+ digits returns network or Unknown.
 * @param {string} phoneNumber - Any format (+233..., 233..., 0XX..., with spaces/dashes)
 * @returns {Object|null} Network info or null if fewer than 3 digits
 */
export const detectGhanaNetwork = (phoneNumber) => {
  const cleaned = normalizeGhanaPhone(phoneNumber);

  // Need at least 3 digits (0 + 2 more) to show prefix-based badge
  if (cleaned.length < 3 || !cleaned.startsWith('0')) return null;

  const prefix = cleaned.substring(0, 3);

  for (const [network, data] of Object.entries(GHANA_NETWORKS)) {
    if (data.prefixes.includes(prefix)) {
      const fullNumberValid = /^0\d{9}$/.test(cleaned);
      return {
        network,
        displayName: data.logo,
        color: data.color,
        bgColor: data.bgColor,
        textColor: data.textColor,
        prefix,
        isValid: fullNumberValid,
      };
    }
  }

  // Prefix not recognized (3+ digits)
  const fullNumberValid = /^0\d{9}$/.test(cleaned);
  return {
    network: null,
    displayName: 'Unknown',
    color: '#999999',
    bgColor: '#F5F5F5',
    textColor: '#666666',
    prefix,
    isValid: false,
  };
};

/**
 * Validate full Ghana phone number (10 digits, recognized prefix).
 * @param {string} phoneNumber
 * @returns {boolean}
 */
export const isValidGhanaPhone = (phoneNumber) => {
  const result = detectGhanaNetwork(phoneNumber);
  return result !== null && result.isValid === true;
};

export { GHANA_NETWORKS, normalizeGhanaPhone };
