import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData, setUserRole } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const allowedRoles = ["vendor", "admin"];
    if (!allowedRoles.includes(role)) {
      toast.error("Please select a valid role.");
      return;
    }

    setIsLoading(true);

    const endpoint = role === "vendor" ? "/vendor/login" : "/auth/login";

    try {
      const { data } = await axios.post(`${backendUrl}${endpoint}`, {
        email,
        password,
        role,
      });

      if (data.success) {
        const authRole = role; // 'vendor' or 'admin'
        localStorage.setItem("authRole", authRole);
        setIsLoggedin(true);
        setUserRole(authRole)
        await getUserData(role);
        navigate("/");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-6 sm:px-0">
      <NavBar />

      {/* Card */}
      <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-700 text-sm">
        <h2 className="text-3xl font-semibold text-[#003DA5] text-center mb-3">
          Login
        </h2>
        <p className="text-sm mb-6 text-center text-gray-500">
          Login to your account
        </p>

        <form onSubmit={onSubmitHandler}>
          {/* Email */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
            <img src={assets.mail_icon} alt="Email" />
            <input
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email ID"
              required
              className="bg-transparent outline-none placeholder-gray-400 flex-1 disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
            <img src={assets.lock_icon} alt="Password" />
            <input
              type="password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="bg-transparent outline-none placeholder-gray-400 flex-1 disabled:opacity-60"
            />
          </div>

          {/* Role */}
          <div className="mb-4 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="vendor"
                checked={role === "vendor"}
                disabled={isLoading}
                onChange={(e) => setRole(e.target.value)}
                className="w-4 h-4 disabled:opacity-60"
              />
              <span className="text-gray-700">Vendor</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                disabled={isLoading}
                onChange={(e) => setRole(e.target.value)}
                className="w-4 h-4 disabled:opacity-60"
              />
              <span className="text-gray-700">Admin</span>
            </label>
          </div>

          {/* Forgot Password */}
          <p
            onClick={() => !isLoading && navigate("/reset-password")}
            className={`mb-4 text-right ${
              isLoading
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#003DA5] cursor-pointer"
            }`}
          >
            Forgot Password?
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-full font-medium flex justify-center items-center gap-2 transition cursor-pointer
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#003DA5] hover:bg-[#002D7A] text-white"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
