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
import EditStores from "./pages/adminPages/storesManage/EditStores";
import ViewStores from "./pages/adminPages/storesManage/ViewStores";
import AddManagers from "./pages/adminPages/managersManage/AddManagers";
import ViewManagers from "./pages/adminPages/managersManage/ViewManagers";
import EditManagers from "./pages/adminPages/managersManage/EditManagers";
import AddVendors from "./pages/adminPages/vendorsManage/AddVendors";
import EditVendors from "./pages/adminPages/vendorsManage/EditVendors";
import ViewVendors from "./pages/adminPages/vendorsManage/ViewVendors";

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

            {/* /dashboard/stores/edit-stores */}
            <Route
              path="edit-stores"
              element={<EditStores />}
            />

            {/* /dashboard/stores/view-stores */}
            <Route
              path="view-stores"
              element={<ViewStores />}
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

            {/* /dashboard/managers/edit-managers */}
            <Route
              path="edit-managers"
              element={<EditManagers />}
            />

            {/* /dashboard/managers/view-managers */}
            <Route
              path="view-managers"
              element={<ViewManagers />}
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

            {/* /dashboard/vendors/edit-vendors */}
            <Route
              path="edit-vendors"
              element={<EditVendors />}
            />

            {/* /dashboard/vendors/view-vendors */}
            <Route
              path="view-vendors"
              element={<ViewVendors />}
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




// import React, { useContext } from "react";
// import { Routes, Route } from "react-router-dom";
// import ResetPassword from "./pages/ResetPassword";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Pages
// import Login from "./pages/Login";
// import Home from "./pages/Home";
// import Transactions from "./pages/Transactions";
// import Profile from "./pages/Profile";
// import NotFound from "./pages/NotFound";
// import { AppContent } from "./context/AppContext";
// import VendorDashboard from "./pages/vendorPages/VendorDashboard";
// import StoreTransactions from "./pages/vendorPages/StoreTransactions";
// import AdminDashboard from "./pages/adminPages/AdminDashboard";
// import AdminStoreTransactions from "./pages/adminPages/AdminStoreTransactions";

// const App = () => {
  
//   const { isLoggedin, userRole } = useContext(AppContent);
  
//   return (
//     <div>
//       <ToastContainer />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//         {isLoggedin && (
//           <>
//           <Route path="/profile" element={<Profile />} />
//           <Route
//             path="/dashboard/stores/:storeId/:id"
//             element={<Transactions />}
//           />
//           </>
//         )}
//         {isLoggedin && userRole === 'vendor' && (
//           <>
//             <Route path="/dashboard/stores" element={<VendorDashboard />} />
//             <Route path="/dashboard/stores/:storeId" element={<StoreTransactions />} />
//           </>
//         )}
//         {isLoggedin && userRole === 'admin' && (
//           <>
//            <Route path="/dashboard/stores" element={<AdminDashboard />} />
//            <Route path="/dashboard/stores/:storeId" element={<AdminStoreTransactions />} />
//           </>
//         )}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </div>
//   );
// };

// export default App;
