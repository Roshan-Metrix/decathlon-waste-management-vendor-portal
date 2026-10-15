import React, { useContext, useEffect, useState } from "react";
import {
  MdArrowBack,
  MdPersonAdd,
  MdStore,
  MdPerson,
  MdEmail,
  MdLock,
  MdRefresh,
  MdContentCopy,
  MdVerifiedUser,
  MdClose,
  MdAdd,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";
import { generatePassword } from "../../../lib/generatePassword";

const AddManagers = () => {
  const { backendUrl } = useContext(AppContent);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeId, setStoreId] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [copying, setCopying] = useState(false);

    useEffect(() => {
      setPassword(generatePassword());
    }, []);

  useEffect(() => {
    if (!alert.visible) return;
    const timer = setTimeout(
      () => setAlert((current) => ({ ...current, visible: false })),
      3500,
    );
    return () => clearTimeout(timer);
  }, [alert]);

  const showAlert = (message, type = "success") => {
    setAlert({ visible: true, message, type });
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopying(true);
      showAlert("Password copied to clipboard", "success");
      setTimeout(() => setCopying(false), 900);
    } catch {
      showAlert("Unable to copy password. Please copy it manually.", "error");
    }
  };

  const handleCreate = () => {
    if (!storeId.trim() || !name.trim() || !email.trim()) {
      showAlert("Please fill in Store ID, manager name, and email.", "error");
      return;
    }
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${backendUrl}/auth/registerManager`, {
        name: name.trim(),
        email: email.trim(),
        password,
        storeId: storeId.trim(),
      });

      if (!response.data?.success) {
        showAlert(response.data?.message || "Unable to create manager.", "error");
        return;
      }

      showAlert("Manager created successfully!", "success");
      setName("");
      setEmail("");
      setStoreId("");
      setPassword(generatePassword());
      setShowPopup(false);
    } catch (error) {
      showAlert(
        error?.response?.data?.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar />

      <main className="px-4 py-3 sm:px-6 lg:px-8 mt-19">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
         
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <MdPersonAdd size={24} className="text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">Create New Manager</h2>

                <p className="text-sm text-gray-500">
                  Enter the information for the new manager
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleCreate();
            }}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="storeId"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Store ID
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdStore size={21} className="shrink-0 text-blue-600" />
                <input
                  id="storeId"
                  type="text"
                  value={storeId}
                  onChange={(event) => setStoreId(event.target.value)}
                  placeholder="Enter store ID"
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="managerName"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Manager Name
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdPerson size={21} className="shrink-0 text-blue-600" />
                <input
                  id="managerName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter manager name"
                  autoComplete="name"
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="managerEmail"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Manager Email
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdEmail size={21} className="shrink-0 text-blue-600" />
                <input
                  id="managerEmail"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter manager email"
                  autoComplete="email"
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Generated Password
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4">
                <MdLock size={21} className="shrink-0 text-blue-600" />
                <span className="min-w-0 flex-1 break-all py-3 font-mono text-sm font-semibold tracking-wide text-gray-800">
                  {password}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  title="Copy password"
                  aria-label="Copy password"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-600 transition hover:bg-white"
                >
                  {copying ? (
                    <MdCheckCircle size={21} />
                  ) : (
                    <MdContentCopy size={20} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  title="Generate another password"
                  aria-label="Generate another password"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-600 transition hover:bg-white"
                >
                  <MdRefresh size={23} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              <MdAdd size={22} />
              Create Manager
            </button>
          </form>
        </div>
      </main>

      {showPopup && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-gray-900/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading)
              setShowPopup(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-create-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <MdPersonAdd size={36} className="text-blue-600" />
              </div>
            </div>
            <h2
              id="confirm-create-title"
              className="text-center text-xl font-bold text-gray-800"
            >
              Confirm Manager Creation
            </h2>
            <p className="mb-6 mt-2 text-center text-sm leading-6 text-gray-500">
              Are you sure you want to create this manager account?
            </p>

            <div className="mb-5 rounded-xl bg-indigo-50 p-4 text-sm text-gray-700">
              <p><span className="font-semibold">Name:</span> {name}</p>
              <p className="mt-1 break-all"><span className="font-semibold">Email:</span> {email}</p>
              <p className="mt-1"><span className="font-semibold">Store ID:</span> {storeId}</p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                "Yes, Create Manager"
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPopup(false)}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {alert.visible && (
        <div className="fixed right-4 top-4 z-[400] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            {alert.type === "error" ? (
              <MdErrorOutline
                size={22}
                className="mt-0.5 shrink-0 text-red-500"
              />
            ) : (
              <MdCheckCircle
                size={22}
                className="mt-0.5 shrink-0 text-green-600"
              />
            )}
            <p className="flex-1 text-sm font-medium text-gray-800">
              {alert.message}
            </p>
            <button
              type="button"
              onClick={() =>
                setAlert((current) => ({ ...current, visible: false }))
              }
              aria-label="Dismiss notification"
              className="text-gray-400 transition hover:text-gray-700"
            >
              <MdClose size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddManagers;
