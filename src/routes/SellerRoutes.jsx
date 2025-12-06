import { Route, Routes, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PATHS } from "./routePaths";
import ProtectedRoute from "../routes/ProtectedRoute";
import SellerProtectedRoute from "../routes/SellerProtectedRoute";
import { LoadingSpinner } from '../shared/components/LoadingSpinner';

const AuthPage = lazy(() => import("../features/auth/AuthPage"));
const HomePage = lazy(() => import("../features/products/HomePage"));
const DashboardLayout = lazy(() => import("../shared/layout/DashboardLayout"));
const Dashboard = lazy(() => import("../features/products/Dashboard"));
const AddProduct = lazy(() => import("../features/products/AddProduct"));
const Orders = lazy(() => import("../features/orders/Orders"));
const OrderDetail = lazy(() => import("../features/orders/OrderDetail"));
const Products = lazy(() => import("../features/products/Products"));
// PaymentRequest removed - using withdrawal system instead
const DiscountProducts = lazy(() => import("../features/products/DiscountProducts"));
const ChatSupport = lazy(() => import("../features/profile/ChatSupport"));
const EditProduct = lazy(() => import("../features/products/EditProduct"));
const VariantsListPage = lazy(() => import("../pages/products/variants/VariantsListPage"));
const VariantCreatePage = lazy(() => import("../pages/products/variants/VariantCreatePage"));
const VariantEditPage = lazy(() => import("../pages/products/variants/VariantEditPage"));
const SetupPage = lazy(() => import("../features/onboarding/SetupPage"));
const BusinessProfilePage = lazy(() => import("../features/profile/BusinessProfilePage"));
const PaymentMethodPage = lazy(() => import("../features/profile/PaymentMethodPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));
const ProductReviewsPage = lazy(() => import("../features/reviews/ProductReviewsPage"));
const TrackingPage = lazy(() => import("../features/orders/TrackingPage"));
const WithdrawalsPage = lazy(() => import("../features/finance/WithdrawalsPage"));
const SellerWithdrawalVerifyOTP = lazy(() => import("../features/finance/SellerWithdrawalVerifyOTP"));
const WalletOverviewPage = lazy(() => import("../pages/finance/WalletOverviewPage"));
const TransactionHistoryPage = lazy(() => import("../pages/finance/TransactionHistoryPage"));
const TransactionDetailPage = lazy(() => import("../pages/finance/TransactionDetailPage"));
const ShippingInfoPage = lazy(() => import("../pages/store/ShippingInfoPage"));
const SellerAnalyticsDashboard = lazy(() => import("../features/analytics/SellerAnalyticsDashboard"));
const SellerSupportPage = lazy(() => import("../pages/support/SellerSupportPage"));
const SellerTicketsListPage = lazy(() => import("../pages/support/SellerTicketsListPage"));
const SellerTicketDetailPage = lazy(() => import("../pages/support/SellerTicketDetailPage"));
const SitemapPage = lazy(() => import("../pages/sitemap/SitemapPage"));
const Press = lazy(() => import("../features/Press"));
const EazSellerHomePage = lazy(() => import("../pages/homepage/EazSellerHomePage"));
const AboutPage = lazy(() => import("../pages/about/AboutPage"));
const ContactPage = lazy(() => import("../pages/contact/ContactPage"));
const ReturnRefundPolicyPage = lazy(() => import("../pages/policies/ReturnRefundPolicyPage"));
const TermsPage = lazy(() => import("../pages/policies/TermsPage"));
const SellerPrivacyPolicyPage = lazy(() => import("../pages/policies/SellerPrivacyPolicyPage"));
const SellerEducationCenterPage = lazy(() => import("../pages/education/SellerEducationCenterPage"));
const HelpCenterPage = lazy(() => import("../pages/help/HelpCenterPage"));
const PickupLocationsListPage = lazy(() => import("../pages/store/pickup/PickupLocationsListPage"));
const PickupLocationCreatePage = lazy(() => import("../pages/store/pickup/PickupLocationCreatePage"));
const PickupLocationEditPage = lazy(() => import("../pages/store/pickup/PickupLocationEditPage"));
const SellerReturnAndFundsPage = lazy(() => import("../features/sellerReturns/pages/SellerReturnAndFundsPage"));
const SellerFundsPage = lazy(() => import("../features/sellerFunds/pages/SellerFundsPage"));
const SellerNotificationsPage = lazy(() => import("../pages/notifications/SellerNotificationsPage"));

// Redirect component for /dashboard/tracking/* to /tracking/*
const TrackingRedirect = () => {
  const { trackingNumber } = useParams();
  return <Navigate to={`/tracking/${trackingNumber}`} replace />;
};

export default function SellerRoutes() {
  return (
    <Routes>
      {/* Home Page - Root Route - Public with Header, No Sidebar */}
      <Route 
        path={PATHS.LANDING}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <EazSellerHomePage />
            </Suspense>
          }
        />
      </Route>
      
      {/* Auth Routes - Public with Header, No Sidebar */}
      <Route 
        path={PATHS.LOGIN}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <AuthPage />
            </Suspense>
          }
        />
      </Route>
      
      <Route 
        path={PATHS.SIGNUP}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <AuthPage />
            </Suspense>
          }
        />
      </Route>
      
      {/* Public Education Page - Public with Header, No Sidebar */}
      <Route 
        path={PATHS.EDUCATION}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <SellerEducationCenterPage />
            </Suspense>
          }
        />
      </Route>
      
      {/* Public Privacy Policy Page - Public with Header, No Sidebar */}
      <Route 
        path={PATHS.PRIVACY}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <SellerPrivacyPolicyPage />
            </Suspense>
          }
        />
      </Route>
      
      {/* Public Shipping Info Page - Public with Header, No Sidebar */}
      <Route
        path={PATHS.SHIPPING_INFO}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <ShippingInfoPage />
            </Suspense>
          }
        />
      </Route>
      
      {/* Public Terms Page - Public with Header, No Sidebar */}
      <Route
        path={PATHS.TERMS}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <TermsPage />
            </Suspense>
          }
        />
      </Route>
      
      {/* Public Help Center Page - Public with Header, No Sidebar */}
      <Route
        path={PATHS.HELP}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLayout showSidebar={false} />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <HelpCenterPage />
            </Suspense>
          }
        />
      </Route>
      
      {/* Redirect /auth/login to /login for backward compatibility */}
      <Route path="/auth/login" element={<Navigate to={PATHS.LOGIN} replace />} />
      {/* Dashboard Routes - All under /dashboard */}
      <Route
        path={PATHS.DASHBOARD}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        {/* Dashboard Home */}
        <Route
          index
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Products Routes */}
        <Route
          path="products"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Products />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/add"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <AddProduct />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:id/edit"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <EditProduct />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/discount"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <DiscountProducts />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        {/* Variants Routes */}
        <Route
          path="products/:productId/variants"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <VariantsListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:productId/variants/create"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <VariantCreatePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:productId/variants/:variantId/edit"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <VariantEditPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Orders Routes */}
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Orders />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <OrderDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Finance Routes */}
        <Route
          path="finance"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <WalletOverviewPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="finance/withdrawals"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <WithdrawalsPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="finance/withdrawals/:withdrawalId/verify-otp"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <SellerWithdrawalVerifyOTP />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="finance/transactions"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <TransactionHistoryPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="finance/transactions/:id"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <TransactionDetailPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        {/* Support Routes */}
        <Route
          path="support/chat"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <ChatSupport />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="support/tickets"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SellerTicketsListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="support/tickets/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SellerTicketDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="support"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SellerSupportPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Notifications Route */}
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SellerNotificationsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Setup & Settings Routes */}
        <Route
          path="setup"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SetupPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="store/settings"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <BusinessProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Pickup Locations Routes */}
        <Route
          path="store/pickup-locations"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PickupLocationsListPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="store/pickup-locations/create"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PickupLocationCreatePage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="store/pickup-locations/:id/edit"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PickupLocationEditPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        {/* Returns Management Route */}
        <Route
          path="returns"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <SellerReturnAndFundsPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        {/* Funds Management Route */}
        <Route
          path="funds"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <SellerFundsPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="finance/payment-methods"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <PaymentMethodPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SettingsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Other Routes */}
        <Route
          path="reviews"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <ProductReviewsPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="tracking/:trackingNumber"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <TrackingPage />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute>
              <SellerProtectedRoute allowedStage="verified">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <SellerAnalyticsDashboard />
                </Suspense>
              </SellerProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="press"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Press />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="sitemap"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SitemapPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="about"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <AboutPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="contact"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <ContactPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="return-refund"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <ReturnRefundPolicyPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="education"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SellerEducationCenterPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Note: Public education page is also available at /education */}

        {/* Add other dashboard routes here */}
      </Route>
      {/* Catch-all route - redirect unknown paths to login */}
      <Route path="*" element={<Navigate to={PATHS.LOGIN} replace />} />
    </Routes>
  );
}
