import React, { useContext, useEffect, useState } from "react";
import {
  MdPersonAdd,
  MdPerson,
  MdEmail,
  MdLock,
  MdRefresh,
  MdContentCopy,
  MdLocationOn,
  MdLocationCity,
  MdPhone,
  MdAdd,
  MdCheckCircle,
  MdErrorOutline,
  MdClose,
  MdStorefront,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";
import { generatePassword } from "../../../lib/generatePassword";

const AddVendors = () => {
  const { backendUrl } = useContext(AppContent);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vendorLocation, setVendorLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [region, setRegion] = useState("");
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [copying, setCopying] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "success" });

  useEffect(() => {
    setPassword(generatePassword());
    fetchRegions();
    // Initial data load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchRegions = async () => {
    try {
      setRegionsLoading(true);
      const { data } = await axios.get(`${backendUrl}/auth/get-regions`);
      if (data?.success) setRegions(Array.isArray(data.regions) ? data.regions : []);
      else showAlert(data?.message || "Unable to load regions.", "error");
    } catch (error) {
      showAlert(error?.response?.data?.message || "Unable to load regions.", "error");
    } finally {
      setRegionsLoading(false);
    }
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
    if (!name.trim() || !email.trim() || !region || !vendorLocation.trim() || !contactNumber.trim()) {
      showAlert("Please fill in all fields.", "error");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }
    if (!/^\d{10}$/.test(contactNumber.trim())) {
      showAlert("Please enter a valid 10-digit contact number.", "error");
      return;
    }
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/vendor/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        state: region,
        vendorLocation: vendorLocation.trim(),
        contactNumber: contactNumber.trim(),
      });

      if (!response.data?.success) {
        showAlert(response.data?.message || "Unable to create vendor.", "error");
        return;
      }

      showAlert("Vendor created successfully!", "success");
      setName("");
      setEmail("");
      setVendorLocation("");
      setContactNumber("");
      setRegion("");
      setPassword(generatePassword());
      setShowPopup(false);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-500";
  const wrapperClass = "flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar />
      <main className="mt-19 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <MdPersonAdd size={26} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Create New Vendor</h2>
              <p className="text-sm text-gray-500">Enter the information for the new vendor</p>
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
              <label htmlFor="vendorName" className="mb-1.5 block text-sm font-medium text-gray-700">Vendor Name</label>
              <div className={wrapperClass}>
                <MdPerson size={21} className="shrink-0 text-blue-600" />
                <input id="vendorName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter vendor name" autoComplete="name" className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="vendorEmail" className="mb-1.5 block text-sm font-medium text-gray-700">Vendor Email</label>
              <div className={wrapperClass}>
                <MdEmail size={21} className="shrink-0 text-blue-600" />
                <input id="vendorEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter vendor email" autoComplete="email" className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="vendorLocation" className="mb-1.5 block text-sm font-medium text-gray-700">Vendor Location</label>
              <div className={wrapperClass}>
                <MdLocationOn size={21} className="shrink-0 text-blue-600" />
                <input id="vendorLocation" value={vendorLocation} onChange={(e) => setVendorLocation(e.target.value)} placeholder="Enter vendor location" className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="vendorRegion" className="mb-1.5 block text-sm font-medium text-gray-700">Region / State</label>
              <div className={wrapperClass}>
                <MdLocationCity size={22} className="shrink-0 text-blue-600" />
                <select id="vendorRegion" value={region} onChange={(e) => setRegion(e.target.value)} disabled={regionsLoading} className={`${inputClass} cursor-pointer disabled:cursor-wait disabled:opacity-60`}>
                  <option value="">{regionsLoading ? "Loading regions..." : "Select region"}</option>
                  {regions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              {!regionsLoading && regions.length === 0 && (
                <button type="button" onClick={fetchRegions} className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer">Retry loading regions</button>
              )}
            </div>

            <div>
              <label htmlFor="contactNumber" className="mb-1.5 block text-sm font-medium text-gray-700">Contact Number</label>
              <div className={wrapperClass}>
                <MdPhone size={21} className="shrink-0 text-blue-600" />
                <input id="contactNumber" type="tel" inputMode="numeric" maxLength={10} value={contactNumber} onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit contact number" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Generated Password</label>
              <div className={wrapperClass}>
                <MdLock size={21} className="shrink-0 text-blue-600" />
                <span className="min-w-0 flex-1 break-all py-3 font-mono text-sm font-semibold tracking-wide text-gray-800">{password}</span>
                <button type="button" onClick={handleCopyPassword} title="Copy password" aria-label="Copy password" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-600 transition hover:bg-white cursor-pointer">
                  {copying ? <MdCheckCircle size={21} /> : <MdContentCopy size={20} />}
                </button>
                <button type="button" onClick={() => setPassword(generatePassword())} title="Generate another password" aria-label="Generate another password" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-600 transition hover:bg-white cursor-pointer">
                  <MdRefresh size={23} />
                </button>
              </div>
            </div>

            <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 md:col-span-2 cursor-pointer">
              <MdAdd size={22} /> Create Vendor
            </button>
          </form>
        </div>
      </main>

      {showPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gray-900/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setShowPopup(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-vendor-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50"><MdStorefront size={34} className="text-blue-600" /></div>
            </div>
            <h2 id="confirm-vendor-title" className="text-center text-xl font-bold text-gray-800">Confirm Vendor Creation</h2>
            <p className="mb-6 mt-2 text-center text-sm leading-6 text-gray-500">Are you sure you want to create this vendor account?</p>
            <div className="mb-5 space-y-1 rounded-xl bg-indigo-50 p-4 text-sm text-gray-700">
              <p><span className="font-semibold">Name:</span> {name}</p>
              <p className="break-all"><span className="font-semibold">Email:</span> {email}</p>
              <p><span className="font-semibold">Location:</span> {vendorLocation}</p>
              <p><span className="font-semibold">Region / State:</span> {region}</p>
              <p><span className="font-semibold">Contact:</span> {contactNumber}</p>
            </div>
            <button type="button" disabled={loading} onClick={handleConfirm} className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : "Yes, Create Vendor"}
            </button>
            <button type="button" disabled={loading} onClick={() => setShowPopup(false)} className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60">Cancel</button>
          </div>
        </div>
      )}

      {alert.visible && (
        <div className="fixed right-4 top-4 z-[400] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            {alert.type === "error" ? <MdErrorOutline size={22} className="mt-0.5 shrink-0 text-red-500" /> : <MdCheckCircle size={22} className="mt-0.5 shrink-0 text-green-600" />}
            <p className="flex-1 text-sm font-medium text-gray-800">{alert.message}</p>
            <button type="button" onClick={() => setAlert((current) => ({ ...current, visible: false }))} aria-label="Dismiss notification" className="text-gray-400 transition hover:text-gray-700"><MdClose size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddVendors;
