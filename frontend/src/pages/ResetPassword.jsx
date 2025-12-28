import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState("");
  const [otp, setOtp] = useState(0);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/auth/send-reset-otp",
        { email }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSent(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""));
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/auth/reset-password",
        { email, otp, newPassword }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-6 sm:px-0">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="cursor-pointer flex absolute top-3 sm:left-5 left-3"
      >
        <div className="flex items-center gap-2 sm:gap-1">
          <img src={assets.logo} alt="" className="w-30 sm:w-65" />
        </div>
      </div>

      {/* Enter email id */}
      {!isEmailSent && (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-700 text-sm text-center">
          <h2 className="text-3xl font-semibold text-[#003DA5] mb-3">
            Reset Password
          </h2>
          <p className="text-gray-500 mb-7">
            Enter the registered email address
          </p>

          <form onSubmit={onSubmitEmail} className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
              <img src={assets.mail_icon} alt="" className="w-4 h-4" />
              <input
                type="email"
                placeholder="Email id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none placeholder-gray-400 flex-1"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#003DA5] text-white font-medium cursor-pointer hover:bg-[#002D7A] transition"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      {/* For adding otp */}
      {!isOtpSubmitted && isEmailSent && (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-700 text-sm text-center">
          <h2 className="text-3xl font-semibold text-[#003DA5] mb-3">
            Reset Password OTP
          </h2>
          <p className="text-gray-500 mb-7">
            Enter the 6-digit OTP sent to your email
          </p>

          <form onSubmit={onSubmitOTP} className="flex flex-col items-center">
            <div
              className="flex gap-3 mb-6 justify-center"
              onPaste={handlePaste}
            >
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    type="text"
                    key={index}
                    maxLength={1}
                    pattern="[0-9]*"
                    required
                    ref={(e) => (inputRefs.current[index] = e)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-2xl text-center border-2 border-gray-300 rounded-lg outline-none bg-gray-100 focus:border-[#003DA5] focus:bg-white transition"
                  />
                ))}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#003DA5] text-white font-medium cursor-pointer hover:bg-[#002D7A] transition"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      {/* Enter new password */}
      {isOtpSubmitted && isEmailSent && (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-700 text-sm text-center">
          <h2 className="text-3xl font-semibold text-[#003DA5] mb-3">
            New Password
          </h2>
          <p className="text-gray-500 mb-7">Enter the new password below</p>

          <form
            onSubmit={onSubmitNewPassword}
            className="flex flex-col items-center"
          >
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
              <img src={assets.lock_icon} alt="" className="w-4 h-4" />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-transparent outline-none placeholder-gray-400 flex-1"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#003DA5] text-white font-medium cursor-pointer hover:bg-[#002D7A] transition"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
