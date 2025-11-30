/**
 * Route Paths Configuration for EazSeller (Seller Dashboard)
 * Centralized route definitions for seller dashboard
 */

// ---------- SELLER ROUTES ----------
export const PATHS = {
  // Dashboard
  DASHBOARD: "/",
  HOME: "/dashboard",

  // Products
  PRODUCTS: "/products",
  ADD_PRODUCT: "/products/add",
  ADDPRODUCT: "/products/add", // Alias for backward compatibility
  EDIT_PRODUCT: "/products/:id/edit",
  EDITPRODUCT: "/products/:id/edit", // Alias for backward compatibility
  PRODUCT_DETAIL: "/products/:id",
  DISCOUNT_PRODUCTS: "/products/discount",
  DISCOUNTPRODUCT: "/products/discount", // Alias for backward compatibility

  // Orders
  ORDERS: "/orders",
  ORDER: "/orders", // Alias for backward compatibility
  ORDER_DETAIL: "/orders/:id",
  ORDERDETAILS: "/orders/:id", // Alias for backward compatibility

  // Analytics
  ANALYTICS: "/analytics",
  SALES: "/analytics/sales",
  PRODUCTS_ANALYTICS: "/analytics/products",
  CUSTOMERS_ANALYTICS: "/analytics/customers",

  // Messages
  MESSAGES: "/messages",
  MESSAGE_DETAIL: "/messages/:id",

  // Finance
  FINANCE: "/finance",
  EARNINGS: "/finance/earnings",
  PAYOUTS: "/finance/payouts",
  TRANSACTIONS: "/finance/transactions",
  PAYMENT_REQUESTS: "/finance/payment-requests",
  PAYMENTS: "/finance/payment-requests", // Alias for backward compatibility
  PAYMENT_METHODS: "/finance/payment-methods",

  // Store
  STORE_SETTINGS: "/store/settings",
  STORE_PROFILE: "/store/profile",
  SHIPPING_SETTINGS: "/store/shipping",
  RETURN_POLICY: "/store/return-policy",

  // Account
  PROFILE: "/profile",
  SETTINGS: "/settings",
  SECURITY: "/settings/security",
  NOTIFICATIONS: "/notifications",
  
  // Settings (for seller settings page)
  SELLER_SETTINGS: "/settings",

  // Support
  SUPPORT: "/support",
  HELP: "/help",
  FAQ: "/faq",
  CHAT_SUPPORT: "/support/chat", // Chat support route

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",

  // Onboarding & Setup
  SETUP: "/setup",
  ONBOARDING: "/onboarding",

  // Reviews
  REVIEWS: "/reviews",
  
  // Tracking
  TRACKING: "/tracking/:trackingNumber",
  
  // Withdrawals
  WITHDRAWALS: "/finance/withdrawals",
  WITHDRAWAL_VERIFY_OTP: "/finance/withdrawals/:withdrawalId/verify-otp",
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

