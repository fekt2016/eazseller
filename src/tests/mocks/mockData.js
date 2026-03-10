/**
 * Mock data for EazSeller tests.
 * Field names match what page components and APIs expect.
 */

export const MOCK_SELLER = {
  _id: 'seller-001',
  id: 'seller-001',
  name: 'Kwame Mensah',
  email: 'kwame@test.com',
  shopName: 'TechHub Ghana',
  shopDescription: 'Best tech in Accra',
  role: 'seller',
  status: 'active',
  isVerified: true,
  phone: '0244123456',
  avatar: null,
  address: {
    street: '12 Independence Ave',
    city: 'Accra',
    region: 'Greater Accra',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const MOCK_PRODUCTS = [
  {
    _id: 'prod-001',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone model',
    price: 5000,
    stock: 10,
    status: 'active',
    imageCover: 'https://res.cloudinary.com/eazworld/image/upload/v1/test.jpg',
    images: [],
    category: { _id: 'cat-001', name: 'Electronics' },
    seller: 'seller-001',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'prod-002',
    name: 'Samsung Galaxy S24',
    description: 'Latest Samsung model',
    price: 4500,
    stock: 5,
    status: 'pending',
    imageCover: 'https://res.cloudinary.com/eazworld/image/upload/v1/test2.jpg',
    images: [],
    category: { _id: 'cat-001', name: 'Electronics' },
    seller: 'seller-001',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

export const MOCK_ORDERS = [
  {
    _id: 'order-001',
    orderNumber: 'SAI-2026-001',
    status: 'pending',
    total: 5000,
    currency: 'GHS',
    buyer: {
      _id: 'buyer-001',
      name: 'Ama Owusu',
      email: 'ama@test.com',
      phone: '0201234567',
    },
    items: [
      {
        product: MOCK_PRODUCTS[0],
        quantity: 1,
        price: 5000,
      },
    ],
    shippingFee: 50,
    deliveryAddress: {
      street: '5 Ring Road',
      city: 'Accra',
      region: 'Greater Accra',
    },
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

export const MOCK_DASHBOARD_STATS = {
  totalRevenue: 12500,
  totalOrders: 25,
  pendingOrders: 3,
  totalProducts: 15,
  activeProducts: 12,
  revenueGrowth: 15.5,
  ordersThisMonth: 8,
  currency: 'GHS',
};
