import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AppContent } from "./context/AppContext";
import VendorDashboard from "./pages/vendorPages/VendorDashboard";
import StoreTransactions from "./pages/vendorPages/StoreTransactions";
import AdminDashboard from "./pages/adminPages/AdminDashboard";
import AdminStoreTransactions from "./pages/adminPages/AdminStoreTransactions";

const App = () => {
  
  const { isLoggedin, userRole } = useContext(AppContent);
  
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {isLoggedin && (
          <>
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/dashboard/stores/:storeId/:id"
            element={<Transactions />}
          />
          </>
        )}
        {isLoggedin && userRole === 'vendor' && (
          <>
            <Route path="/dashboard/stores" element={<VendorDashboard />} />
            <Route path="/dashboard/stores/:storeId" element={<StoreTransactions />} />
          </>
        )}
        {isLoggedin && userRole === 'admin' && (
          <>
           <Route path="/dashboard/stores" element={<AdminDashboard />} />
            <Route path="/dashboard/stores/:storeId" element={<AdminStoreTransactions />} />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
