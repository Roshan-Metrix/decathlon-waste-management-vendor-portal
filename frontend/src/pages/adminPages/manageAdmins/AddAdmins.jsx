import React, { useContext, useState } from "react";
import {
  MdPersonAdd,
  MdPerson,
  MdEmail,
  MdLock,
  MdRefresh,
  MdContentCopy,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

const AddAdmins = () => {
  const { backendUrl } = useContext(AppContent);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => generatePassword());
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [alertVisible, setAlertVisible] = useState(false);
  const [copying, setCopying] = useState(false);

  const showAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopying(true);
      showAlert("Password copied to clipboard.", "success");
      window.setTimeout(() => setCopying(false), 1000);
    } catch {
      showAlert("Unable to copy password. Please copy it manually.", "error");
    }
  };

  const handleCreate = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      showAlert("Please enter the admin name and email.", "error");
      return;
    }
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/auth/admin/registerAdmin`,
        {
          name: name.trim(),
          email: email.trim(),
          password,
          role: "admin",
        },
      );

      if (!data?.success) {
        showAlert(data?.message || "Unable to create admin.", "error");
        return;
      }

      setShowPopup(false);
      setName("");
      setEmail("");
      setPassword(generatePassword());
      showAlert("Admin created successfully!", "success");
    } catch (error) {
      showAlert(
        error.response?.data?.message ||
          error.message ||
          "Error creating admin. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    if (loading) return;
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mt-19 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <MdPersonAdd size={27} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Create New Admin
                </h1>
                <p className="text-sm text-gray-500">
                  Enter the details below to create an administrator account
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4">
            <InputField
              id="adminName"
              icon={<MdPerson size={21} />}
              label="Admin Name"
              placeholder="Enter admin name"
              value={name}
              onChange={setName}
              autoComplete="name"
            />

            <InputField
              id="adminEmail"
              icon={<MdEmail size={21} />}
              label="Admin Email"
              placeholder="Enter admin email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <div>
              <label
                htmlFor="generatedPassword"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Generated Password
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdLock size={21} className="shrink-0 text-blue-600" />
                <input
                  id="generatedPassword"
                  type="text"
                  readOnly
                  value={password}
                  className="w-full min-w-0 bg-transparent py-3 font-mono text-sm text-gray-800 outline-none"
                  aria-label="Generated admin password"
                />
                <button
                  type="button"
                  onClick={copyPassword}
                  title="Copy password"
                  aria-label="Copy password"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-blue-600 transition hover:bg-white"
                >
                  {copying ? <MdCheckCircle size={20} /> : <MdContentCopy size={19} />}
                </button>
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  title="Generate a new password"
                  aria-label="Generate a new password"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-blue-600 transition hover:bg-white"
                >
                  <MdRefresh size={22} />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Copy the generated password and share it securely with the new admin.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdPersonAdd size={21} />
              Create Admin
            </button>
          </form>
        </div>
      </main>

      {showPopup && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePopup();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-admin-title"
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                  <MdPersonAdd size={23} className="text-blue-600" />
                </div>
                <h2
                  id="confirm-admin-title"
                  className="text-lg font-bold text-gray-800"
                >
                  Confirm Admin Creation
                </h2>
              </div>
              <button
                type="button"
                onClick={closePopup}
                disabled={loading}
                aria-label="Close dialog"
                className="cursor-pointer rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <MdClose size={22} />
              </button>
            </div>

            <p className="mb-3 text-sm text-gray-600">
              Are you sure you want to create this administrator account?
            </p>
            <div className="mb-5 rounded-xl bg-indigo-50 p-4 text-sm">
              <p className="text-gray-500">Admin name</p>
              <p className="mb-3 font-semibold text-gray-800">{name}</p>
              <p className="text-gray-500">Admin email</p>
              <p className="break-all font-semibold text-gray-800">{email}</p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={closePopup}
                className="w-full cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Confirm & Create Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertVisible && (
        <div className="fixed right-4 top-4 z-[200] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div
              className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                alertType === "success"
                  ? "bg-green-500"
                  : alertType === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
              }`}
            />
            <p className="flex-1 text-sm font-medium text-gray-800">
              {alertMessage}
            </p>
            <button
              type="button"
              onClick={() => setAlertVisible(false)}
              aria-label="Close alert"
              className="cursor-pointer text-lg leading-none text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({
  id,
  icon,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
      <span className="shrink-0 text-blue-600">{icon}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full min-w-0 bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-500"
      />
    </div>
  </div>
);

export default AddAdmins;
