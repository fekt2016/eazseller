/**
 * Route Paths Configuration for EazSeller (Seller Dashboard)
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
  DISCOUNT_PRODUCTS: "/dashboard/products/discount",
  DISCOUNTPRODUCT: "/dashboard/products/discount", // Alias for backward compatibility
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
  CHAT_SUPPORT: "/dashboard/support/chat", // Chat support route
  
  // Press
  PRESS: "/dashboard/press",
  
  // About
  ABOUT: "/dashboard/about",
  
  // Contact
  CONTACT: "/dashboard/contact",
  
  // Return & Refund Policy
  RETURN_REFUND: "/dashboard/return-refund",
  TERMS: "/dashboard/terms",
  
  // Privacy Policy (Public)
  PRIVACY: "/privacy",
  PRIVACY_DASHBOARD: "/dashboard/privacy", // Alias for backward compatibility
  
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

  // Onboarding & Setup
  SETUP: "/dashboard/setup",
  ONBOARDING: "/dashboard/onboarding",

  // Reviews
  REVIEWS: "/dashboard/reviews",
  
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
    title: "Seller Dashboard - EazShop",
    description: "Manage your products, orders, and store on EazShop",
    keywords: "seller dashboard, EazShop seller",
  },

  [PATHS.PRODUCTS]: {
    title: "Products - Seller Dashboard | EazShop",
    description: "Manage your product listings",
    keywords: "products, seller, EazShop",
  },

  [PATHS.ADD_PRODUCT]: {
    title: "Add Product - Seller Dashboard | EazShop",
    description: "Add a new product to your store",
    keywords: "add product, seller, EazShop",
  },

  [PATHS.EDIT_PRODUCT]: {
    title: "Update Product - Seller Dashboard | EazShop",
    description: "Update your product information",
    keywords: "update product, seller, EazShop",
  },

  [PATHS.ORDERS]: {
    title: "Orders - Seller Dashboard | EazShop",
    description: "View and manage your orders",
    keywords: "orders, seller, EazShop",
  },

  [PATHS.ORDER_DETAIL]: {
    title: "Order Details - Seller Dashboard | EazShop",
    description: "View detailed order information",
    keywords: "order details, seller, EazShop",
  },

  [PATHS.ANALYTICS]: {
    title: "Analytics - Seller Dashboard | EazShop",
    description: "View your store analytics and insights",
    keywords: "analytics, seller, EazShop",
  },

  [PATHS.SALES]: {
    title: "Sales Analytics - Seller Dashboard | EazShop",
    description: "View your sales performance and trends",
    keywords: "sales, analytics, seller, EazShop",
  },

  [PATHS.MESSAGES]: {
    title: "Messages - Seller Dashboard | EazShop",
    description: "Manage customer messages and inquiries",
    keywords: "messages, seller, EazShop",
  },

  [PATHS.FINANCE]: {
    title: "Finance - Seller Dashboard | EazShop",
    description: "View your earnings and financial reports",
    keywords: "finance, earnings, seller, EazShop",
  },

  [PATHS.EARNINGS]: {
    title: "Earnings - Seller Dashboard | EazShop",
    description: "View your earnings breakdown",
    keywords: "earnings, seller, EazShop",
  },

  [PATHS.PAYOUTS]: {
    title: "Payouts - Seller Dashboard | EazShop",
    description: "Manage your payout requests and history",
    keywords: "payouts, seller, EazShop",
  },

  [PATHS.STORE_SETTINGS]: {
    title: "Store Settings - Seller Dashboard | EazShop",
    description: "Configure your store settings",
    keywords: "store settings, seller, EazShop",
  },

  [PATHS.SHIPPING_SETTINGS]: {
    title: "Shipping Settings - Seller Dashboard | EazShop",
    description: "Manage your shipping options and rates",
    keywords: "shipping, settings, seller, EazShop",
  },

  [PATHS.PROFILE]: {
    title: "Profile - Seller Dashboard | EazShop",
    description: "Manage your seller profile",
    keywords: "profile, seller, EazShop",
  },

  [PATHS.SETTINGS]: {
    title: "Settings - Seller Dashboard | EazShop",
    description: "Manage your seller account settings",
    keywords: "settings, seller, EazShop",
  },

  [PATHS.SUPPORT]: {
    title: "Support - Seller Dashboard | EazShop",
    description: "Get help and support for sellers",
    keywords: "support, help, seller, EazShop",
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

