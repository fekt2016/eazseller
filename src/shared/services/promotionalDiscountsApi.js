import api from './api';

/**
 * Extract promotion key from ad link (e.g. https://site.com/offers/back-to-school -> "back-to-school")
 */
const getPromotionKeyFromLink = (link) => {
  if (!link || typeof link !== 'string') return '';
  try {
    const url = new URL(link);
    const path = url.pathname || '';
    const match = path.match(/\/offers\/([^/?#]+)/i);
    return match ? match[1].trim() : '';
  } catch {
    const match = String(link).match(/\/offers\/([^/?#]+)/i);
    return match ? match[1].trim() : '';
  }
};

/**
 * Fetch active promotional discounts (public endpoint).
 * Returns list of { key, title, discountPercent } for use in product form dropdowns.
 */
export const getActivePromotions = async () => {
  const response = await api.get('/promotional-discounts/public');
  const data = response?.data ?? response;
  const ads = Array.isArray(data?.data?.ads) ? data.data.ads : Array.isArray(data?.ads) ? data.ads : [];
  return ads
    .filter((ad) => ad.link)
    .map((ad) => ({
      key: getPromotionKeyFromLink(ad.link),
      title: ad.title || ad.link || 'Promotion',
      discountType: ad.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountPercent: typeof ad.discountPercent === 'number' ? ad.discountPercent : 0,
      discountFixed: typeof ad.discountFixed === 'number' ? ad.discountFixed : 0,
    }))
    .filter((p) => p.key);
};

export default { getActivePromotions };
