import { useState, createContext, useEffect } from "react";
import axios from "axios";

export const AppContent = createContext(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.withCredentials = true;

export const AppContentProvider = ({ children }) => {
  // Auth state
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Store data
  const [storeData, setStoreData] = useState();
  const [storeLoading, setStoreLoading] = useState(false);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/vendor/profile`,
      );

      if (data.success) {
        setUserData(data.vendor);
        setIsLoggedin(true);
        return true;
      } else {
        setUserData(null);
        setIsLoggedin(false);
        return false;
      }
    } catch {
      setUserData(null);
      setIsLoggedin(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoreLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/vendor/get-related-stores`
      );

      if (data.success) {
        setStoreData(data);
      }
    } catch (error) {
      console.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setStoreLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const loggedIn = await getUserData();
      if (loggedIn) {
        fetchStores();
      }
    };

    init();
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
    storeLoading,
    loading,
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};

