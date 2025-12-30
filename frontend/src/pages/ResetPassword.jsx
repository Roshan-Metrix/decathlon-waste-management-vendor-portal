import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    paste.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  // Send Email
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/auth/send-reset-otp`,
        { email }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  // Submit OTP
  const onSubmitOTP = (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((el) => el.value);
    setOtp(otpArray.join(""));
    setIsOtpSubmitted(true);
  };

  // Submit New Password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/auth/reset-password`,
        { email, otp, newPassword }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-6">
      <NavBar />

      {/* EMAIL */}
      {!isEmailSent && (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-center">
          <h2 className="text-3xl font-semibold text-[#003DA5] mb-3">
            Reset Password
          </h2>
          <p className="text-gray-500 mb-7">
            Enter the registered email address
          </p>

          <form onSubmit={onSubmitEmail}>
            <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-100">
              <img src={assets.mail_icon} className="w-4 h-4" />
              <input
                type="email"
                placeholder="Email id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none flex-1"
              />
            </div>

            <button
              disabled={emailLoading}
              className={`w-full py-2.5 rounded-full text-white font-medium transition cursor-pointer
                ${emailLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#003DA5] hover:bg-[#002D7A]"}`}
            >
              {emailLoading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      )}

      {/* OTP */}
      {!isOtpSubmitted && isEmailSent && (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-center">
          <h2 className="text-3xl font-semibold text-[#003DA5] mb-3">
            Reset Password OTP
          </h2>

          <form onSubmit={onSubmitOTP}>
            <div
              className="flex gap-3 mb-6 justify-center"
              onPaste={handlePaste}
            >
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    maxLength={1}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-xl text-center border rounded-lg bg-gray-100 focus:border-[#003DA5]"
                  />
                ))}
            </div>

            <button className="w-full py-2.5 rounded-full bg-[#003DA5] text-white hover:bg-[#002D7A] cursor-pointer">
              Verify OTP
            </button>
          </form>
        </div>
      )}

      {/* NEW PASSWORD */}
      {isOtpSubmitted && isEmailSent && (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-center">
          <h2 className="text-3xl font-semibold text-[#003DA5] mb-3">
            New Password
          </h2>

          <form onSubmit={onSubmitNewPassword}>
            <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-100">
              <img src={assets.lock_icon} className="w-4 h-4" />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-transparent outline-none flex-1"
              />
            </div>

            <button
              disabled={passwordLoading}
              className={`w-full py-2.5 rounded-full text-white font-medium transition cursor-pointer
                ${passwordLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#003DA5] hover:bg-[#002D7A]"}`}
            >
              {passwordLoading ? "Updating..." : "Submit"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
