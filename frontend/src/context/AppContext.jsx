import { useState, createContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContent = createContext(null);

export const AppContentProvider = ({ children }) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // For Vendor Authentication
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data (Store, Transaction , Waste etc.)
  const [storeData, setStoreData] = useState([]);
  const [storeLoading, setStoreLoading] = useState(false);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/profile`
      );

      if (data.success) {
        setUserData(data.vendor);
        setIsLoggedin(true);
      } else {
        setUserData(null);
        setIsLoggedin(false);
      }
    } catch (error) {
      // If token expired / not logged in
      setUserData(null);
      setIsLoggedin(false);

      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoreLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/get-related-stores`
      );

      if (data.success) {
        setStoreData(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setStoreLoading(false);
    }
  };

 useEffect(() => {
    getUserData();
    fetchStores();
  }, []);
  
  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    storeData,
    setStoreData,
    setStoreLoading,
    storeLoading,
    loading,
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};
