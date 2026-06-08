import { useState, createContext, useEffect } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// eslint-disable-next-line react-refresh/only-export-components
export const AppContent = createContext(null);

export const AppContentProvider = ({ children }) => {
  // Auth state
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null)

  // Store data
  const [storeData, setStoreData] = useState();
  const [storeLoading, setStoreLoading] = useState(false);


const getUserData = async (passedRole) => {
 
  const authRole = passedRole || localStorage.getItem('authRole');

  if (!authRole) {
    setUserData(null);
    setIsLoggedin(false);
    setLoading(false);
    return false;
  }

  try {
    setUserRole(authRole);
    const endpoint = authRole === 'vendor' ? '/vendor/profile' : '/auth/profile';
    
    // Axios automatically sends the "vendorToken" cookie
    const { data } = await axios.get(`${backendUrl}${endpoint}`);

    if (data.success) {
      const profileData = authRole === 'vendor' ? data.vendor : data.user;
      
      setUserData(profileData);
      setIsLoggedin(true);
      return true;
    } else {
      handleLogout();
      return false;
    }
  } catch (error) {
    handleLogout();
    return false;
  } finally {
    setLoading(false);
  }
};

const handleLogout = () => {
  setUserData(null);
  setIsLoggedin(false);
  setUserRole(null); // add this
  localStorage.removeItem('authRole'); // Clear on logout
};

  const fetchStores = async () => {
    setStoreLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/vendor/get-related-stores`,
      );

      if (data.success) {
        setStoreData(data);
      }
    } catch (error) {
      console.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setStoreLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (isLoggedin) {
      fetchStores();
    } else {
      setStoreData(null);
    }
  }, [isLoggedin]);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserRole,
    userRole,
    setUserData,
    getUserData,
    storeData,
    setStoreData,
    storeLoading,
    loading,
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};
