import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

const NavBar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContent);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/auth/vendor/logout`
      );
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  };

  return (
    <nav className="w-full flex justify-between items-center px-6 sm:px-20 py-4 bg-white shadow-sm fixed top-0 z-50 mb-4">
      {/* Logo */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src={assets.logo}
          alt="Logo"
          className="w-32 sm:w-54"
        />
      </div>

      {/* Right Section */}
      {userData ? (
        <div className="relative group">
          {/* Avatar Button */}
          <button className="flex items-center gap-2 bg-blue-900 text-white px-3 py-2 rounded-full shadow-md hover:bg-blue-800 transition">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-900 font-bold">
              {userData.name?.[0]?.toUpperCase()}
            </span>
            <ChevronDown size={16} />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold text-gray-800">
                {userData.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userData.email}
              </p>
            </div>

            <ul className="py-2 text-sm">
              <li
                onClick={() => navigate("/vendor/profile")}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <User size={16} className="text-blue-700" />
                Profile
              </li>

              <li
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600 font-medium"
              >
                <LogOut size={16} />
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-400 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition cursor-pointer"
        >
          Login
        </button>
      )}
    </nav>
  );
};

export default NavBar;
