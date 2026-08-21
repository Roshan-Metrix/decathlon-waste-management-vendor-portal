import React, { useContext, useEffect, useState } from "react";
import {
  MdArrowBack,
  MdBadge,
  MdStorefront,
  MdLocationOn,
  MdLocationCity,
  MdCall,
  MdEmail,
  MdLock,
  MdRefresh,
  MdAddBusiness,
  MdAdminPanelSettings,
  MdContentCopy,
} from "react-icons/md";

import axios from "axios";
import NavBar from "../../../components/NavBar";
import { generatePassword } from "../../../lib/generatePassword";
import { AppContent } from "../../../context/AppContext";

const AddStores = () => {
  // STORE FORM
  const { backendUrl } = useContext(AppContent);
  const [storeId, setStoreId] = useState("");
  const [name, setName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // REGION
  const [state, setState] = useState("");
  const [regionItems, setRegionItems] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  // ADMIN VERIFICATION
  const [modalVisible, setModalVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // LOADING / ALERT
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // PASSWORD COPY STATE
  const [copied, setCopied] = useState(false);

  // GENERATE PASSWORD
  useEffect(() => {
    setPassword(generatePassword());
  }, []);

  // FETCH REGIONS
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setRegionsLoading(true);

      const { data } = await axios.get(`${backendUrl}/auth/get-regions`);

      if (data.success) {
        setRegionItems(data.regions || []);
      }
    } catch (error) {
      console.error("Fetch Regions Error:", error);
    } finally {
      setRegionsLoading(false);
    }
  };

  // COPY PASSWORD
  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);

      setCopied(true);

      setAlertMessage("Password copied to clipboard");
      setAlertVisible(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy password error:", error);

      setAlertMessage("Unable to copy password");
      setAlertVisible(true);
    }
  };

  // VALIDATE STORE FORM
  const handleAddStore = () => {
    if (
      !storeId ||
      !name ||
      !storeLocation ||
      !state ||
      !contactNumber ||
      !email ||
      !password
    ) {
      setAlertMessage("Please fill all fields");
      setAlertVisible(true);
      return;
    }

    setModalVisible(true);
  };

  // CREATE STORE
  const handleVendorSubmit = async () => {
    if (!adminEmail || !adminPassword) {
      setAlertMessage("Please enter admin email and password");
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        storeId,
        name,
        storeLocation,
        state,
        contactNumber,
        email,
        password,
        adminEmail,
        adminPassword,
      };

      const { data } = await axios.post(`${backendUrl}/auth/admin/registerStore`, payload);

      if (data.success) {
        setAlertMessage("Store created successfully.");
        setAlertVisible(true);

        setModalVisible(false);

        // Reset form
        setStoreId("");
        setName("");
        setStoreLocation("");
        setState("");
        setContactNumber("");
        setEmail("");
        setPassword(generatePassword());
        setAdminEmail("");
        setAdminPassword("");
      } else {
        setAlertMessage(data.message || "Something went wrong");
        setAlertVisible(true);
      }
    } catch (err) {
      console.error("Create Store Error:", err);

      setAlertMessage(
        err?.response?.data?.message || "Something went wrong"
      );

      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar />

      {/* MAIN CONTENT */}
      <main className="px-4 py-3 sm:px-6 lg:px-8 mt-19">
        <div className="mx-auto w-full max-w-4xl">
          {/* CARD */}
          <div className="rounded-2xl border border-gray-200 bg-white p-1 shadow-sm sm:p-2">
            {/* TITLE */}
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                  <MdStorefront
                    size={24}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Store Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    Enter the information for the new store
                  </p>
                </div>
              </div>
            </div>

            {/*
                FORM
           */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* STORE ID */}
              <InputField
                icon={<MdBadge />}
                label="Store ID"
                placeholder="Enter store ID"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              />

              {/* STORE NAME */}
              <InputField
                icon={<MdStorefront />}
                label="Store Name"
                placeholder="Enter store name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* LOCATION */}
              <InputField
                icon={<MdLocationOn />}
                label="Location"
                placeholder="Enter store location"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
              />

              {/* REGION */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Region
                </label>

                <div className="relative">
                  <MdLocationCity
                    size={21}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-blue-600"
                  />

                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={regionsLoading}
                    className="h-[48px] w-full appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >
                    <option value="">
                      {regionsLoading
                        ? "Loading regions..."
                        : "Select Region"}
                    </option>

                    {regionItems.map((region, index) => (
                      <option
                        key={`${region}-${index}`}
                        value={region}
                      >
                        {region}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* CONTACT */}
              <InputField
                icon={<MdCall />}
                label="Contact Number"
                placeholder="Enter contact number"
                type="tel"
                value={contactNumber}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setContactNumber(value);
                }}
              />

              {/* EMAIL */}
              <InputField
                icon={<MdEmail />}
                label="Store Email"
                placeholder="Enter store email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* PASSWORD */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Store Password
                </label>

                <div className="flex min-h-[48px] items-center rounded-xl border border-blue-500 bg-blue-50/40 px-3">
                  <MdLock
                    size={22}
                    className="shrink-0 text-blue-600"
                  />

                  <button
                    type="button"
                    onClick={copyPassword}
                    className="ml-3 flex-1 cursor-pointer truncate text-left font-semibold text-blue-600 outline-none"
                    title="Click to copy password"
                  >
                    {password}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPassword(generatePassword());
                      setCopied(false);
                    }}
                    className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-blue-100 cursor-pointer"
                    title="Generate new password"
                  >
                    <MdRefresh
                      size={24}
                      className="text-blue-600"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={copyPassword}
                    className="ml-1 hidden h-9 w-9 items-center justify-center rounded-lg transition hover:bg-blue-100 sm:flex cursor-pointer"
                    title="Copy password"
                  >
                    {copied ? (
                      <span className="text-xs font-semibold text-green-600">
                        ✓
                      </span>
                    ) : (
                      <MdContentCopy
                        size={19}
                        className="text-blue-600"
                      />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Click the password to copy it or use the refresh icon
                  to generate a new one.
                </p>
              </div>
            </div>

            {/* ADD STORE BUTTON */}
            <button
              type="button"
              onClick={handleAddStore}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] cursor-pointer"
            >
              <MdAddBusiness size={21} />
              Add Store
            </button>
          </div>
        </div>
      </main>

      {/* ADMIN VERIFICATION MODAL */}
      {modalVisible && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) {
              setModalVisible(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* MODAL TITLE */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <MdAdminPanelSettings
                  size={27}
                  className="text-blue-600"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                Admin Verification
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter admin credentials to create this store
              </p>
            </div>

            {/* ADMIN EMAIL */}
            <InputField
              icon={<MdAdminPanelSettings />}
              label="Email"
              placeholder="Enter email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />

            {/* ADMIN PASSWORD */}
            <div className="mt-4">
              <InputField
                icon={<MdLock />}
                label="Password"
                placeholder="Enter password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            {/* VERIFY */}
            <button
              type="button"
              disabled={loading}
              onClick={handleVendorSubmit}
              className={`mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm cursor-pointer font-semibold text-white transition ${
                loading
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Verify & Create"
              )}
            </button>

            {/* CANCEL */}
            <button
              type="button"
              disabled={loading}
              onClick={() => setModalVisible(false)}
              className="mt-2 h-10 w-full cursor-pointer text-sm font-medium text-gray-500 transition hover:text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ALERT */}
      {alertVisible && (
        <div className="fixed right-4 top-4 z-[200] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {alertMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAlertVisible(false)}
              className="text-lg leading-none text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* REUSABLE INPUT COMPONENT */

const InputField = ({
  icon,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  maxLength,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex h-12 items-center rounded-xl border border-gray-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <span className="shrink-0 text-blue-600">
          {React.cloneElement(icon, {
            size: 21,
          })}
        </span>

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

export default AddStores;