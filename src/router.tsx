import { createHashRouter, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { UserLayout } from "./layouts/UserLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { useAuth } from "./context/AuthContext";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import Inventory from "./pages/admin/Inventory";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import Products from "./pages/admin/Products";
import AdminSalesPage from "./pages/admin/AdminSalesPage";
import Invoice from "./pages/admin/SaleReports";
import ProductReports from "./pages/admin/ProductReports";
// User Pages 
import PosPage from "./pages/PosPage";
import InventoryPage from "./pages/InventoryPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import UserDashboard from "./pages/UserDashboard";
// Route Guards
import UserRoute from "./components/UserRoute";
import AdminRoute from "./components/admin/AdminRoute";
import { SystemSettings } from "./pages/admin/SystemSettings";
import { UserSettings } from "./pages/UserSetting";

// Root redirect based on authentication status
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const router = createHashRouter([
  // Public Routes
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <RootRedirect />
  },


  // USER-PROTECTED ROUTES (Cashier / Regular User)
  {
    path: "/dashboard",
    element: (
      <UserRoute>
        <UserLayout />
      </UserRoute>
    ),
    children: [
      { path: "", element: <UserDashboard /> },
      { path: "pos", element: <PosPage /> },
      { path: "my-orders", element: <SalesHistoryPage /> },
      { path: "profile", element: <div>Profile</div> },
      { path: "settings", element: <UserSettings /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "search", element: <div>Search Products</div> }
    ]
  },

  // ADMIN LOGIN (Public)
  {
    path: "/admin/login",
    element: <div>Admin Login</div>
  },

  // ADMIN-PROTECTED ROUTES
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: "", element: <AdminDashboard /> }, // Admin overview dashboard
      { path: "pos", element: <PosPage /> },
      { path: "products", element: <Products /> }, // CRUD products
      { path: "categories", element: <Categories /> }, // Manage product categories
      { path: "brands", element: <Brands /> }, // Manage brands
      { path: "users", element: <UserManagement /> }, // Manage system users
      { path: "inventory", element: <Inventory /> }, // Manage inventory
      { path: "sales", element: <AdminSalesPage /> }, // Sales management
      { path: "sales-reports", element: <Invoice /> }, // Sales reports
      { path: "product-reports", element: <ProductReports /> }, // Product sales reports
      { path: "settings", element: <SystemSettings /> } // System configurations
    ]
  }
]);

export default router;
