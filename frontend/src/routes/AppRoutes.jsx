import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Loader from "../components/Loader";

// Route-level code splitting - each page ships as its own chunk, fetched
// only when that route is actually visited, instead of one large bundle.
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart"));
const SellerDashboard = lazy(() => import("../pages/SellerDashboard"));
const ProductForm = lazy(() => import("../pages/ProductForm"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader />
        </div>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products/new" element={<ProductForm />} />
            <Route path="/seller/products/:id/edit" element={<ProductForm />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
