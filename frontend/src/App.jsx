import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContent } from "./context/AppContext";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Common Pages
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";

// Vendor Pages
import VendorDashboard from "./pages/vendorPages/VendorDashboard";
import StoreTransactions from "./pages/vendorPages/StoreTransactions";

// Admin Pages
import AdminDashboard from "./pages/adminPages/AdminDashboard";
import AdminStoreTransactions from "./pages/adminPages/AdminStoreTransactions";
import AddStores from "./pages/adminPages/storesManage/AddStores";
import ViewStores from "./pages/adminPages/storesManage/ViewStores";
import AddManagers from "./pages/adminPages/managersManage/AddManagers";
import ViewManagers from "./pages/adminPages/managersManage/ViewManagers";
import AddVendors from "./pages/adminPages/vendorsManage/AddVendors";
import ViewVendors from "./pages/adminPages/vendorsManage/ViewVendors";
import RemoveStores from "./pages/adminPages/storesManage/RemoveStores";
import RemoveManagers from "./pages/adminPages/managersManage/RemoveManagers";
import RemoveVendors from "./pages/adminPages/vendorsManage/RemoveVendors";
import ViewAdmins from "./pages/adminPages/manageAdmins/ViewAdmins";
import AddAdmins from "./pages/adminPages/manageAdmins/AddAdmins";
import RestrictAccess from "./pages/adminPages/manageAdmins/RestrictAccess";

const App = () => {
  const { isLoggedin, userRole } = useContext(AppContent);

  return (
    <div>
      <ToastContainer />

      <Routes>
        {/* PUBLIC ROUTES */}

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* AUTHENTICATED ROUTES */}

        {isLoggedin && (
          <>
            <Route path="/profile" element={<Profile />} />

            <Route
              path="/dashboard/stores/:storeId/:id"
              element={<Transactions />}
            />
          </>
        )}

        {/* VENDOR ROUTES */}

        {isLoggedin && userRole === "vendor" && (
          <Route path="/dashboard/stores">
            <Route index element={<VendorDashboard />} />

            <Route
              path=":storeId"
              element={<StoreTransactions />}
            />
          </Route>
        )}

        {/* ADMIN ROUTES */}

        {isLoggedin && userRole === "admin" && (
          <>
          <Route path="/dashboard/stores">
            {/* /dashboard/stores */}
            <Route index element={<AdminDashboard />} />

            {/* /dashboard/stores/:storeId */}
            <Route
              path=":storeId"
              element={<AdminStoreTransactions />}
            />

            {/* /dashboard/stores/add-stores */}
            <Route
              path="add-stores"
              element={<AddStores />}
            />


            {/* /dashboard/stores/view-stores */}
            <Route
              path="view-stores"
              element={<ViewStores />}
            />
            {/* /dashboard/stores/remove-stores */}
            <Route
              path="remove-stores"
              element={<RemoveStores />}
            />
          </Route>
          <Route path="/dashboard/managers">
            {/* /dashboard/stores */}
            <Route index element={<AdminDashboard />} />

            {/* /dashboard/managers/add-managers */}
            <Route
              path="add-managers"
              element={<AddManagers />}
            />


            {/* /dashboard/managers/view-managers */}
            <Route
              path="view-managers"
              element={<ViewManagers />}
            />

            {/* /dashboard/managers/remove-managers */}
            <Route
              path="remove-managers"
              element={<RemoveManagers />}
            />
          </Route>
          <Route path="/dashboard/vendors">
            {/* /dashboard/stores */}
            <Route index element={<AdminDashboard />} />

            {/* /dashboard/vendors/add-vendors */}
            <Route
              path="add-vendors"
              element={<AddVendors />}
            />

            {/* /dashboard/vendors/remove-vendors */}
            <Route
              path="remove-vendors"
              element={<RemoveVendors />}
            />

            {/* /dashboard/vendors/view-vendors */}
            <Route
              path="view-vendors"
              element={<ViewVendors />}
            />
          </Route>
          <Route path="/dashboard/teams">
            {/* /dashboard/stores */}
            <Route index element={<AdminDashboard />} />

            {/* /dashboard/vendors/add-vendors */}
            <Route
              path="add-members"
              element={<AddAdmins />}
            />

            {/* /dashboard/vendors/remove-vendors */}
            <Route
              path="view-members"
              element={<ViewAdmins />}
            />

            {/* /dashboard/vendors/view-vendors */}
            <Route
              path="restrict-access"
              element={<RestrictAccess />}
            />
          </Route>
         </>
        )}

        {/* 404 */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;