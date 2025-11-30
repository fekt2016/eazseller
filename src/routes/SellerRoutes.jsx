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
const SetupPage = lazy(() => import("../features/onboarding/SetupPage"));
const BusinessProfilePage = lazy(() => import("../features/profile/BusinessProfilePage"));
const PaymentMethodPage = lazy(() => import("../features/profile/PaymentMethodPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));
const ProductReviewsPage = lazy(() => import("../features/reviews/ProductReviewsPage"));
const TrackingPage = lazy(() => import("../features/orders/TrackingPage"));
const WithdrawalsPage = lazy(() => import("../features/finance/WithdrawalsPage"));
const SellerWithdrawalVerifyOTP = lazy(() => import("../features/finance/SellerWithdrawalVerifyOTP"));
const SellerAnalyticsDashboard = lazy(() => import("../features/analytics/SellerAnalyticsDashboard"));

// Redirect component for /dashboard/tracking/* to /tracking/*
const TrackingRedirect = () => {
  const { trackingNumber } = useParams();
  return <Navigate to={`/tracking/${trackingNumber}`} replace />;
};

export default function SellerRoutes() {
  return (
    <Routes>
      <Route path={PATHS.HOME} element={<HomePage />} />
      <Route path={PATHS.LOGIN} element={<AuthPage />} />
      {/* Redirect /auth/login to /login for backward compatibility */}
      <Route path="/auth/login" element={<Navigate to={PATHS.LOGIN} replace />} />
      {/* Redirect /dashboard/tracking/* to /tracking/* */}
      <Route 
        path="/dashboard/tracking/:trackingNumber" 
        element={<TrackingRedirect />} 
      />
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
        <Route
          path={PATHS.ADD_PRODUCT}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <AddProduct />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.EDIT_PRODUCT}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <EditProduct />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ORDER_DETAIL}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <OrderDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ORDERS}
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
          path={PATHS.PRODUCTS}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Products />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Payment Request route removed - using withdrawal system instead */}
        <Route
          path={PATHS.WITHDRAWALS}
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
          path={PATHS.WITHDRAWAL_VERIFY_OTP}
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
          path={PATHS.DISCOUNT_PRODUCTS}
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
        <Route
          path={PATHS.CHAT_SUPPORT}
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
          path={PATHS.SETUP}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SetupPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.STORE_SETTINGS}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <BusinessProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PAYMENT_METHODS}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <PaymentMethodPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.SETTINGS}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <SettingsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.REVIEWS}
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
          path={PATHS.TRACKING}
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
          path={PATHS.ANALYTICS}
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

        {/* Add other dashboard routes here */}
      </Route>
      {/* Catch-all route - redirect unknown paths to login */}
      <Route path="*" element={<Navigate to={PATHS.LOGIN} replace />} />
    </Routes>
  );
}
