import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDeleteForever,
  MdLocationOn,
  MdSearch,
  MdClose,
  MdWarning,
  MdCheckCircle,
  MdErrorOutline,
  MdHelpOutline,
  MdVisibility,
  MdAdd,
  MdEdit,
  MdLock,
  MdVisibilityOff,
  MdMap,
  MdRefresh,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const RemoveRegions = () => {
  const { backendUrl, userData } = useContext(AppContent);
  const navigate = useNavigate();
  const location = useLocation();

  // Regions state
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal & Selection state
  const [selectedRegion, setSelectedRegion] = useState(
    location.state?.targetRegion || null,
  );
  const [modalVisible, setModalVisible] = useState(
    Boolean(location.state?.targetRegion),
  );

  // Security Verification state (from APK RemoveRegionScreen)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showAlert = (message, type = "info") => {
    setAlert({ visible: true, message, type });
  };

  useEffect(() => {
    if (!alert.visible) return;
    const timer = setTimeout(
      () => setAlert((current) => ({ ...current, visible: false })),
      4000,
    );
    return () => clearTimeout(timer);
  }, [alert]);

  // Autofill current logged-in admin's email if available
  useEffect(() => {
    if (userData?.email && !adminEmail) {
      setAdminEmail(userData.email);
    }
  }, [userData, adminEmail]);

  // Fetch Regions
  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/auth/get-regions`, {
        withCredentials: true,
      });

      if (data?.success && Array.isArray(data.regions)) {
        setRegions(data.regions);
      } else {
        showAlert(data?.message || "Failed to load regions.", "error");
      }
    } catch (err) {
      console.error("Fetch Regions Error:", err);
      showAlert(
        err.response?.data?.message || "Failed to load regions.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Filtered regions
  const filteredRegions = useMemo(() => {
    if (!search.trim()) return regions;
    const query = search.toLowerCase().trim();
    return regions.filter((r) => r.toLowerCase().includes(query));
  }, [regions, search]);

  // Open delete modal
  const handleOpenDeleteModal = (region) => {
    setSelectedRegion(region);
    setAdminPassword("");
    setShowPassword(false);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    if (deleting) return;
    setModalVisible(false);
    setSelectedRegion(null);
    setAdminPassword("");
  };

  // Confirm and Execute Deletion
  const confirmDeleteRegion = async () => {
    if (!selectedRegion) return;

    if (!adminEmail.trim()) {
      showAlert("Please enter your admin email for confirmation.", "error");
      return;
    }

    if (!adminPassword.trim()) {
      showAlert("Please enter your admin password for verification.", "error");
      return;
    }

    try {
      setDeleting(true);

      // 1. Verify Admin Credentials (matching APK RemoveRegionScreen)
      try {
        const verify = await axios.post(
          `${backendUrl}/auth/login`,
          {
            email: adminEmail.trim(),
            password: adminPassword,
          },
          { withCredentials: true },
        );

        if (!verify.data?.success) {
          showAlert("Admin verification failed. Please check your credentials.", "error");
          setDeleting(false);
          return;
        }
      } catch (authErr) {
        console.error("Admin verification error:", authErr);
        showAlert(
          authErr.response?.data?.message || "Admin verification failed. Invalid password.",
          "error",
        );
        setDeleting(false);
        return;
      }

      // 2. Delete the Region
      const res = await axios.delete(
        `${backendUrl}/auth/admin/delete-region/${encodeURIComponent(selectedRegion)}`,
        { withCredentials: true },
      );

      if (res.data?.success) {
        setRegions((prev) => prev.filter((r) => r !== selectedRegion));
        showAlert(
          res.data.message || `Region "${selectedRegion}" and associated rates deleted successfully!`,
          "success",
        );
        handleCloseModal();
      } else {
        showAlert(res.data?.message || "Failed to delete region.", "error");
      }
    } catch (err) {
      console.error("Delete Region Error:", err);
      showAlert(
        err.response?.data?.message || "Server error while deleting region.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 mt-19">
        {/* ALERT NOTIFICATION */}
        {alert.visible && (
          <div
            className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              alert.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : alert.type === "error"
                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {alert.type === "success" ? (
                <MdCheckCircle size={20} className="text-emerald-600" />
              ) : alert.type === "error" ? (
                <MdErrorOutline size={20} className="text-rose-600" />
              ) : (
                <MdHelpOutline size={20} className="text-blue-600" />
              )}
              <span>{alert.message}</span>
            </div>
            <button
              onClick={() => setAlert((prev) => ({ ...prev, visible: false }))}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <MdClose size={18} />
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <MdDeleteForever size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Remove Region</h1>
                <p className="text-sm text-gray-500">
                  Decommission operational regions and remove associated material rates
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/dashboard/regions/view-regions")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                <MdVisibility size={16} />
                <span>View Regions</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/regions/add-region")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                <MdAdd size={16} />
                <span>Add Region</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/regions/edit-rates")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <MdEdit size={16} />
                <span>Edit Rates</span>
              </button>
            </div>
          </div>
        </div>

        {/* WARNING BANNER */}
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <MdWarning size={22} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-bold mb-0.5">High Impact Action</p>
            <p>
              Deleting an operational region will permanently remove all material rate configurations and related mapping references tied to that state. This operation requires admin identity verification.
            </p>
          </div>
        </div>

        {/* METRICS & SEARCH */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-4">
          <div className="flex items-center gap-4 rounded-2xl bg-rose-50 border border-rose-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 shadow-xs">
              <MdLocationOn size={26} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Regions
              </p>
              <p className="text-2xl font-black text-rose-700">
                {loading ? "..." : regions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 px-4 py-2 shadow-xs">
            <MdSearch size={22} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter regions to remove..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <MdClose size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={fetchRegions}
              title="Refresh"
              className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg transition cursor-pointer"
            >
              <MdRefresh size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* REGIONS TO REMOVE LIST */}
        <div className="mb-10 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-600 border-t-transparent mb-3" />
              <p className="text-sm font-medium text-gray-500">
                Loading regions...
              </p>
            </div>
          ) : filteredRegions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-3">
                <MdMap size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-700">No Regions Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `No region matches "${search}".`
                  : "No operational regions are registered."}
              </p>
            </div>
          ) : (
            filteredRegions.map((regionName, idx) => (
              <div
                key={`${regionName}-${idx}`}
                className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 flex items-center justify-between gap-4 transition hover:border-rose-200 shadow-xs"
              >
                <div className="flex items-center gap-3.5 truncate">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <MdLocationOn size={22} />
                  </div>
                  <div className="truncate">
                    <h3 className="text-base font-bold text-gray-800 truncate">
                      {regionName}
                    </h3>
                    <p className="text-xs text-gray-400">
                      State Region Configuration
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDeleteModal(regionName)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer shadow-xs shrink-0"
                >
                  <MdDeleteForever size={16} />
                  <span>Remove Region</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* SECURITY & DELETION CONFIRMATION MODAL */}
        {modalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <MdWarning size={22} />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">
                    Confirm Region Deletion
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={deleting}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <MdClose size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="my-4 space-y-4">
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5">
                  <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-0.5">
                    Target Region to Remove:
                  </p>
                  <p className="text-lg font-black text-rose-700">
                    {selectedRegion}
                  </p>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Please verify your admin credentials to authorize this action. This will permanently delete the region and its associated material rate settings.
                </p>

                {/* Admin Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@decathlon.com"
                    disabled={deleting}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition"
                  />
                </div>

                {/* Admin Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Admin Password *
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition focus-within:border-blue-400 focus-within:bg-white">
                    <MdLock size={18} className="text-gray-400 shrink-0 mr-2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your admin password"
                      disabled={deleting}
                      className="w-full bg-transparent text-xs text-gray-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? (
                        <MdVisibilityOff size={16} />
                      ) : (
                        <MdVisibility size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={deleting}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRegion}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <MdDeleteForever size={16} />
                  <span>{deleting ? "Verifying & Deleting..." : "Confirm & Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RemoveRegions;
