import React, { useContext, useEffect, useState } from "react";
import {
  MdPeople,
  MdPerson,
  MdEmail,
  MdCall,
  MdLocationOn,
  MdSearch,
  MdDelete,
  MdPublic,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const RemoveVendors = () => {
  const { backendUrl } = useContext(AppContent);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const fetchVendors = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(
        `${backendUrl}/vendor/get-all-vendors`,
      );

      if (data.success) {
        setVendors(Array.isArray(data.vendors) ? data.vendors : []);
      } else {
        showAlert(data.message || "Unable to fetch vendors.", "error");
      }
    } catch (error) {
      console.error("Fetch Vendors Error:", error);
      showAlert(
        error.response?.data?.message || "Error fetching vendors!",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // Fetch vendors once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const term = search.toLowerCase().trim();
  const filteredVendors = vendors.filter((vendor) => {
    const name = vendor.name?.toLowerCase() || "";
    const email = vendor.email?.toLowerCase() || "";
    const location = vendor.vendorLocation?.toLowerCase() || "";
    const region = vendor.state?.toLowerCase() || "";
    const contact = String(vendor.contactNumber ?? "").toLowerCase();

    return (
      name.includes(term) ||
      email.includes(term) ||
      location.includes(term) ||
      region.includes(term) ||
      contact.includes(term)
    );
  });

  const confirmRemoval = async () => {
    if (!selectedVendor?._id || deleting) return;

    try {
      setDeleting(true);

      // No admin credentials are requested or sent.
      const { data } = await axios.delete(
        `${backendUrl}/vendor/delete-vendor/${selectedVendor._id}`,
      );

      if (!data.success) {
        showAlert(data.message || "Unable to remove vendor.", "error");
        return;
      }

      setVendors((current) =>
        current.filter((vendor) => vendor._id !== selectedVendor._id),
      );
      setSelectedVendor(null);
      showAlert("Vendor removed successfully!", "success");
    } catch (error) {
      console.error("Remove Vendor Error:", error);
      showAlert(
        error.response?.data?.message || "Error deleting vendor!",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mx-12 mt-19 px-4 py-3 sm:px-6 lg:px-8">
        {/* PAGE TITLE */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <MdDelete size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Remove Vendor</h1>
              <p className="text-sm text-gray-500">
                Find registered vendors and remove them when necessary
              </p>
            </div>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MdPeople size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Total Vendors
              </p>
              <p className="text-2xl font-black text-blue-600">
                {filteredVendors.length}
              </p>
            </div>
          </div>

          <div className="flex min-h-[80px] items-center rounded-2xl bg-indigo-50 px-4">
            <MdSearch size={23} className="shrink-0 text-blue-600" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by vendor name, email, contact, region, or location"
              aria-label="Search vendors"
              className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="cursor-pointer px-2 text-xl text-gray-400 transition hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <MdPeople size={60} className="text-gray-500" />
            </div>
            <p className="text-center text-xl font-medium text-gray-500">
              No Vendors Found
            </p>
            {search && (
              <p className="mt-1 text-center text-sm text-gray-400">
                Try another name, email, contact number, region, or location.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVendors.map((vendor, index) => (
              <VendorCard
                key={
                  vendor._id ||
                  vendor.id ||
                  `${vendor.email || "vendor"}-${index}`
                }
                vendor={vendor}
                onRemove={() => setSelectedVendor(vendor)}
              />
            ))}
          </div>
        )}
      </main>

      {/* CONFIRMATION MODAL — no credential fields */}
      {selectedVendor && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setSelectedVendor(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-vendor-title"
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <MdDelete size={28} className="text-red-600" />
            </div>

            <h2
              id="remove-vendor-title"
              className="text-center text-lg font-bold text-gray-800"
            >
              Remove Vendor?
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-800">
                {selectedVendor.name || "this vendor"}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setSelectedVendor(null)}
                className="w-full cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmRemoval}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MdDelete size={19} />
                {deleting ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT */}
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

const VendorCard = ({ vendor, onRemove }) => (
  <div className="group w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-[2px] hover:border-blue-200 hover:shadow-md">
    <div className="mb-3 flex items-center gap-3 border-b border-gray-100 pb-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
        <MdPerson size={23} className="text-blue-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="break-words text-base font-semibold text-gray-800">
          {vendor.name || "Unnamed Vendor"}
        </p>
        <p className="mt-1 break-all text-sm text-gray-500">
          {vendor.email || "No email provided"}
        </p>
      </div>
    </div>

    <div className="space-y-3">
      <VendorDetail
        icon={<MdEmail size={20} />}
        label="Email"
        value={vendor.email}
      />
      <VendorDetail
        icon={<MdCall size={20} />}
        label="Contact Number"
        value={vendor.contactNumber}
      />
      <VendorDetail
        icon={<MdLocationOn size={20} />}
        label="Vendor Location"
        value={vendor.vendorLocation}
      />
      <VendorDetail
        icon={<MdPublic size={20} />}
        label="Region / State"
        value={vendor.state}
      />
    </div>

    <button
      type="button"
      onClick={onRemove}
      className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-white transition bg-red-600 hover:bg-red-700 hover:text-white"
    >
      <MdDelete size={19} />
      Remove Vendor
    </button>
  </div>
);

const VendorDetail = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3">
    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-0.5 break-words text-sm text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

export default RemoveVendors;
