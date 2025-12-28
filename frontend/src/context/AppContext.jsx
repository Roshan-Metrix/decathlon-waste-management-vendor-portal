import { useState, createContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContent = createContext(null);

export const AppContentProvider = ({ children }) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/profile`
      );

      if (data.success) {
        setUserData(data.user);
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
          error.response?.data?.message || "Failed to fetch user data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    loading,
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};
