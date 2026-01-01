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
import Dashboard from "./pages/Dashboard";
import DashboardStores from "./pages/DashboardStores";
import StoreRelatedTransactions from "./pages/StoreRelatedTransactions";
import axios from "axios";

const App = () => {
  
  axios.defaults.withCredentials = true;

  const { isLoggedin } = useContext(AppContent);
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {isLoggedin && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/stores" element={<DashboardStores />} />
            <Route path="/dashboard/stores/:storeId" element={<StoreRelatedTransactions />} />
            <Route
              path="/dashboard/transactions/:id"
              element={<Transactions />}
            />
            <Route path="/profile" element={<Profile />} />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
