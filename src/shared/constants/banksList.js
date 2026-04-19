export const GHANA_BANKS = [
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
    'United Bank for Africa (UBA)',
    'Access Bank',
    'Prudential Bank',
    'Universal Merchant Bank (UMB)',
    'FBNBank',
    'Societe Generale Ghana',
    'Bank of Africa',
    'OmniBSIC Bank',
    'First Atlantic Bank',
].sort();

/** Stored / API provider tokens (order: MTN, AT, Telecel) */
export const MOBILE_NETWORKS = ['MTN', 'AT', 'Telecel'];

/** User-facing labels for payment method network pickers */
export const MOBILE_NETWORK_LABELS = {
    MTN: 'MTN',
    AT: 'AT (AirtelTigo)',
    Telecel: 'Telecel (Vodafone)',
};

/**
 * Map legacy or mixed-case provider strings to MOBILE_NETWORKS tokens.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeMobileNetworkToken(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const n = raw.trim().toLowerCase();
    if (n === 'mtn') return 'MTN';
    if (n === 'at' || n === 'airteltigo' || n === 'airtel_tigo' || n === 'airtel tigo') return 'AT';
    if (n === 'telecel' || n === 'vodafone') return 'Telecel';
    return raw.trim();
}

export function formatMobileNetworkLabel(token) {
    if (!token) return '';
    const key = normalizeMobileNetworkToken(token);
    return MOBILE_NETWORK_LABELS[key] || token;
}
