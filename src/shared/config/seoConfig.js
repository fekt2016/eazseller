/**
 * SEO Configuration for Saysay (Seller Dashboard)
 * Minimal SEO metadata - all pages set to noIndex by default
 */

const BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_SELLER_URL) || window.location.origin || 'https://seller.saysay.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/saysay-seller-og.jpg`;
const DEFAULT_DESCRIPTION = 'Saysay Seller Dashboard - Manage your online store';

const seoConfig = {
  // ────────────────────────────────────────────────
  // Dashboard
  // ────────────────────────────────────────────────
  dashboard: {
    title: 'Seller Dashboard - Saysay',
    description: 'Manage your products, orders, and store on Saysay',
    keywords: 'seller dashboard, Saysay seller',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/dashboard`,
    noIndex: true,
    noFollow: true,
  },

  // ────────────────────────────────────────────────
  // Orders
  // ────────────────────────────────────────────────
  orders: {
    title: 'Orders - Seller Dashboard | Saysay',
    description: 'View and manage your orders',
    keywords: 'orders, seller, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/orders`,
    noIndex: true,
    noFollow: true,
  },

  // ────────────────────────────────────────────────
  // Products
  // ────────────────────────────────────────────────
  products: {
    title: 'Products - Seller Dashboard | Saysay',
    description: 'Manage your product listings',
    keywords: 'products, seller, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/products`,
    noIndex: true,
    noFollow: true,
  },

  // ────────────────────────────────────────────────
  // Add Product
  // ────────────────────────────────────────────────
  addProduct: {
    title: 'Add Product - Seller Dashboard | Saysay',
    description: 'Add a new product to your store',
    keywords: 'add product, seller, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/products/add`,
    noIndex: true,
    noFollow: true,
  },

  // ────────────────────────────────────────────────
  // Update Product
  // ────────────────────────────────────────────────
  updateProduct: {
    title: 'Update Product - Seller Dashboard | Saysay',
    description: 'Update your product information',
    keywords: 'update product, seller, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/products/edit`,
    noIndex: true,
    noFollow: true,
  },

  // ────────────────────────────────────────────────
  // Messages
  // ────────────────────────────────────────────────
  messages: {
    title: 'Messages - Seller Dashboard | Saysay',
    description: 'Manage customer messages and inquiries',
    keywords: 'messages, seller, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/messages`,
    noIndex: true,
    noFollow: true,
  },

  // ────────────────────────────────────────────────
  // Finance
  // ────────────────────────────────────────────────
  finance: {
    title: 'Finance - Seller Dashboard | Saysay',
    description: 'View your earnings and financial reports',
    keywords: 'finance, earnings, seller, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/finance`,
    noIndex: true,
    noFollow: true,
  },

  // ────────────────────────────────────────────────
  // Settings
  // ────────────────────────────────────────────────
  settings: {
    title: 'Settings - Seller Dashboard | Saysay',
    description: 'Manage your seller account settings',
    keywords: 'settings, seller, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/settings`,
    noIndex: true,
    noFollow: true,
  },
};

export default seoConfig;

