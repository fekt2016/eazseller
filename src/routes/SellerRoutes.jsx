import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PATHS } from "./routePath";
import ProtectedRoute from "../routes/ProtectedRoute";
import { LoadingSpinner } from "../components/LoadingSpinner";

const AuthPage = lazy(() => import("../auth/AuthPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const DashboardLayout = lazy(() => import("../layout/DashboardLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AddProduct = lazy(() => import("../pages/AddProduct"));
const Orders = lazy(() => import("../pages/Orders"));
const Products = lazy(() => import("../pages/Products"));
const PaymentRequest = lazy(() => import("../pages/PaymentRequest"));
const DiscountProducts = lazy(() => import("../pages/DiscountProducts"));
const ChatSupport = lazy(() => import("../pages/ChatSupport"));
const EditProduct = lazy(() => import("../pages/EditProduct"));

export default function SellerRoutes() {
  return (
    <Routes>
      <Route path={PATHS.HOME} element={<HomePage />} />
      <Route path={PATHS.LOGIN} element={<AuthPage />} />
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
          path={PATHS.DASHBOARD}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ADDPRODUCT}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <AddProduct />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.EDITPRODUCT}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <EditProduct />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ORDER}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Orders />
              </Suspense>
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
        <Route
          path={PATHS.PAYMENTS}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <PaymentRequest />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.DISCOUNTPRODUCT}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <DiscountProducts />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.CHAT_SUPPORT}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <ChatSupport />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Add other dashboard routes here */}
      </Route>
    </Routes>
  );
}
