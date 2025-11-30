/**
 * SEO Configuration for EazSeller (Seller Dashboard)
 * Minimal SEO metadata - all pages set to noIndex by default
 */

const BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_SELLER_URL) || window.location.origin || 'https://seller.eazshop.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/eazshop-seller-og.jpg`;
const DEFAULT_DESCRIPTION = 'EazShop Seller Dashboard - Manage your online store';

const seoConfig = {
  // ────────────────────────────────────────────────
  // Dashboard
  // ────────────────────────────────────────────────
  dashboard: {
    title: 'Seller Dashboard - EazShop',
    description: 'Manage your products, orders, and store on EazShop',
    keywords: 'seller dashboard, EazShop seller',
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
    title: 'Orders - Seller Dashboard | EazShop',
    description: 'View and manage your orders',
    keywords: 'orders, seller, EazShop',
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
    title: 'Products - Seller Dashboard | EazShop',
    description: 'Manage your product listings',
    keywords: 'products, seller, EazShop',
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
    title: 'Add Product - Seller Dashboard | EazShop',
    description: 'Add a new product to your store',
    keywords: 'add product, seller, EazShop',
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
    title: 'Update Product - Seller Dashboard | EazShop',
    description: 'Update your product information',
    keywords: 'update product, seller, EazShop',
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
    title: 'Messages - Seller Dashboard | EazShop',
    description: 'Manage customer messages and inquiries',
    keywords: 'messages, seller, EazShop',
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
    title: 'Finance - Seller Dashboard | EazShop',
    description: 'View your earnings and financial reports',
    keywords: 'finance, earnings, seller, EazShop',
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
    title: 'Settings - Seller Dashboard | EazShop',
    description: 'Manage your seller account settings',
    keywords: 'settings, seller, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/settings`,
    noIndex: true,
    noFollow: true,
  },
};

export default seoConfig;

