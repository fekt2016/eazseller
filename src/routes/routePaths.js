/**
 * Route Paths Configuration for Saiisai Seller (Seller Dashboard)
 * Centralized route definitions for seller dashboard
 */

// ---------- SELLER ROUTES ----------
export const PATHS = {
  // Landing & Dashboard
  LANDING: "/",
  DASHBOARD: "/dashboard",
  HOME: "/dashboard",

  // Products
  PRODUCTS: "/dashboard/products",
  ADD_PRODUCT: "/dashboard/products/add",
  ADDPRODUCT: "/dashboard/products/add", // Alias for backward compatibility
  EDIT_PRODUCT: "/dashboard/products/:id/edit",
  EDITPRODUCT: "/dashboard/products/:id/edit", // Alias for backward compatibility
  PRODUCT_DETAIL: "/dashboard/products/:id",
  FLASH_DEALS: "/dashboard/flash-deals",
  PROMOS: "/dashboard/promos",
  PROMO_DETAIL: "/dashboard/promos/:id",
  PROMO_SUBMIT: "/dashboard/promos/:id/submit",
  MY_PROMO_SUBMISSIONS: "/dashboard/my-submissions",
  PRODUCT_VARIANTS: "/dashboard/products/:productId/variants",
  PRODUCT_VARIANT_CREATE: "/dashboard/products/:productId/variants/create",
  PRODUCT_VARIANT_EDIT: "/dashboard/products/:productId/variants/:variantId/edit",

  // Orders
  ORDERS: "/dashboard/orders",
  ORDER: "/dashboard/orders", // Alias for backward compatibility
  ORDER_DETAIL: "/dashboard/orders/:id",
  ORDERDETAILS: "/dashboard/orders/:id", // Alias for backward compatibility

  // Analytics
  ANALYTICS: "/dashboard/analytics",
  SALES: "/dashboard/analytics/sales",
  PRODUCTS_ANALYTICS: "/dashboard/analytics/products",
  CUSTOMERS_ANALYTICS: "/dashboard/analytics/customers",

  // Messages
  MESSAGES: "/dashboard/messages",
  MESSAGE_DETAIL: "/dashboard/messages/:id",

  // Finance
  FINANCE: "/dashboard/finance",
  EARNINGS: "/dashboard/finance/earnings",
  PAYOUTS: "/dashboard/finance/payouts",
  TRANSACTIONS: "/dashboard/finance/transactions",
  PAYMENT_REQUESTS: "/dashboard/finance/payment-requests",
  PAYMENTS: "/dashboard/finance/payment-requests", // Alias for backward compatibility
  PAYMENT_METHODS: "/dashboard/finance/payment-methods",

  // Store
  STORE_SETTINGS: "/dashboard/store/settings",
  STORE_PROFILE: "/dashboard/store/profile",
  SHIPPING_SETTINGS: "/dashboard/store/shipping",
  SHIPPING_INFO: "/dashboard/store/shipping",
  RETURN_POLICY: "/dashboard/store/return-policy",

  // Account
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
  SECURITY: "/dashboard/settings/security",
  NOTIFICATIONS: "/dashboard/notifications",
  
  // Settings (for seller settings page)
  SELLER_SETTINGS: "/dashboard/settings",

  // Support
  SUPPORT: "/dashboard/support",
  SUPPORT_TICKETS: "/dashboard/support/tickets",
  SUPPORT_TICKET_DETAIL: "/dashboard/support/tickets/:id",
  HELP: "/dashboard/help",
  FAQ: "/dashboard/faq",
  
  // Press
  PRESS: "/dashboard/press",
  
  // About
  ABOUT: "/dashboard/about",
  
  // Contact
  CONTACT: "/dashboard/contact",
  
  // Return & Refund Policy
  RETURN_REFUND: "/dashboard/return-refund",
  TERMS: "/dashboard/terms",
  VAT_TAX_POLICY: "/dashboard/vat-tax-policy",

  // Privacy Policy (Public)
  PRIVACY: "/privacy",
  PRIVACY_DASHBOARD: "/dashboard/privacy", // Alias for backward compatibility

  // Data Deletion (Public)
  DATA_DELETION: "/data-deletion",

  // Cookie Policy (Public)
  COOKIE_POLICY: "/cookie-policy",

  // Education (Public)
  EDUCATION: "/education",
  EDUCATION_DASHBOARD: "/dashboard/education",
  
  // Sitemap
  SITEMAP: "/dashboard/sitemap",

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",
  VERIFY_ACCOUNT: "/verify-account",
  // Onboarding & Setup
  SETUP: "/dashboard/setup",
  ONBOARDING: "/dashboard/onboarding",

  // Reviews
  REVIEWS: "/dashboard/reviews",

  // Testimonials
  TESTIMONIALS: "/dashboard/testimonials",
  
  // Tracking
  TRACKING: "/dashboard/tracking/:trackingNumber",
  
  // Withdrawals
  WITHDRAWALS: "/dashboard/finance/withdrawals",
  WITHDRAWAL_VERIFY_OTP: "/dashboard/finance/withdrawals/:withdrawalId/verify-otp",

  // Pickup Locations
  PICKUP_LOCATIONS: "/dashboard/store/pickup-locations",
  PICKUP_LOCATION_CREATE: "/dashboard/store/pickup-locations/create",
  PICKUP_LOCATION_EDIT: "/dashboard/store/pickup-locations/:id/edit",

  // Returns & Funds
  RETURNS: "/dashboard/returns",
  FUNDS: "/dashboard/funds",
};

// ---------- ROUTE CONFIG (SEO META) ----------
export const ROUTE_CONFIG = {
  [PATHS.DASHBOARD]: {
    title: "Seller Dashboard - Saiisai",
    description: "Manage your products, orders, and store on Saiisai",
    keywords: "seller dashboard, Saiisai seller",
  },

  [PATHS.PRODUCTS]: {
    title: "Products - Seller Dashboard | Saiisai",
    description: "Manage your product listings",
    keywords: "products, seller, Saiisai",
  },

  [PATHS.ADD_PRODUCT]: {
    title: "Add Product - Seller Dashboard | Saiisai",
    description: "Add a new product to your store",
    keywords: "add product, seller, Saiisai",
  },

  [PATHS.EDIT_PRODUCT]: {
    title: "Update Product - Seller Dashboard | Saiisai",
    description: "Update your product information",
    keywords: "update product, seller, Saiisai",
  },

  [PATHS.ORDERS]: {
    title: "Orders - Seller Dashboard | Saiisai",
    description: "View and manage your orders",
    keywords: "orders, seller, Saiisai",
  },

  [PATHS.ORDER_DETAIL]: {
    title: "Order Details - Seller Dashboard | Saiisai",
    description: "View detailed order information",
    keywords: "order details, seller, Saiisai",
  },

  [PATHS.ANALYTICS]: {
    title: "Analytics - Seller Dashboard | Saiisai",
    description: "View your store analytics and insights",
    keywords: "analytics, seller, Saiisai",
  },

  [PATHS.SALES]: {
    title: "Sales Analytics - Seller Dashboard | Saiisai",
    description: "View your sales performance and trends",
    keywords: "sales, analytics, seller, Saiisai",
  },

  [PATHS.MESSAGES]: {
    title: "Messages - Seller Dashboard | Saiisai",
    description: "Manage customer messages and inquiries",
    keywords: "messages, seller, Saiisai",
  },

  [PATHS.FINANCE]: {
    title: "Finance - Seller Dashboard | Saiisai",
    description: "View your earnings and financial reports",
    keywords: "finance, earnings, seller, Saiisai",
  },

  [PATHS.EARNINGS]: {
    title: "Earnings - Seller Dashboard | Saiisai",
    description: "View your earnings breakdown",
    keywords: "earnings, seller, Saiisai",
  },

  [PATHS.PAYOUTS]: {
    title: "Payouts - Seller Dashboard | Saiisai",
    description: "Manage your payout requests and history",
    keywords: "payouts, seller, Saiisai",
  },

  [PATHS.STORE_SETTINGS]: {
    title: "Store Settings - Seller Dashboard | Saiisai",
    description: "Configure your store settings",
    keywords: "store settings, seller, Saiisai",
  },

  [PATHS.SHIPPING_SETTINGS]: {
    title: "Shipping Settings - Seller Dashboard | Saiisai",
    description: "Manage your shipping options and rates",
    keywords: "shipping, settings, seller, Saiisai",
  },

  [PATHS.PROFILE]: {
    title: "Profile - Seller Dashboard | Saiisai",
    description: "Manage your seller profile",
    keywords: "profile, seller, Saiisai",
  },

  [PATHS.SETTINGS]: {
    title: "Settings - Seller Dashboard | Saiisai",
    description: "Manage your seller account settings",
    keywords: "settings, seller, Saiisai",
  },

  [PATHS.SUPPORT]: {
    title: "Support - Seller Dashboard | Saiisai",
    description: "Get help and support for sellers",
    keywords: "support, help, seller, Saiisai",
  },
};

// ---------- NAVIGATION MENU ----------
export const NAVIGATION_MENU = {
  main: [
    { path: PATHS.DASHBOARD, label: "Dashboard", icon: "dashboard" },
    { path: PATHS.PRODUCTS, label: "Products", icon: "products" },
    { path: PATHS.ORDERS, label: "Orders", icon: "orders" },
    { path: PATHS.ANALYTICS, label: "Analytics", icon: "analytics" },
    { path: PATHS.MESSAGES, label: "Messages", icon: "messages" },
    { path: PATHS.FINANCE, label: "Finance", icon: "finance" },
  ],

  store: [
    { path: PATHS.STORE_SETTINGS, label: "Store Settings" },
    { path: PATHS.STORE_PROFILE, label: "Store Profile" },
    { path: PATHS.SHIPPING_SETTINGS, label: "Shipping" },
    { path: PATHS.RETURN_POLICY, label: "Return Policy" },
  ],

  account: [
    { path: PATHS.PROFILE, label: "Profile" },
    { path: PATHS.SETTINGS, label: "Settings" },
    { path: PATHS.SECURITY, label: "Security" },
    { path: PATHS.NOTIFICATIONS, label: "Notifications" },
  ],

  support: [
    { path: PATHS.SUPPORT, label: "Support" },
    { path: PATHS.HELP, label: "Help Center" },
    { path: PATHS.FAQ, label: "FAQ" },
  ],
};

export default PATHS;

