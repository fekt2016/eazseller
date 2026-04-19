export const PROMO_SYSTEM_ENABLED = true;
export const LEGACY_SELLER_DISCOUNTS_ENABLED = !PROMO_SYSTEM_ENABLED;

// Backward-compatible alias for older imports.
export const LEGACY_DISCOUNT_COUPON_UI_ENABLED =
  LEGACY_SELLER_DISCOUNTS_ENABLED;
