import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDeleteForever,
  MdClose,
  MdWarning,
  MdCheckCircle,
  MdErrorOutline,
  MdHelpOutline,
  MdStorefront,
  MdCheck,
  MdVisibility,
  MdAddCircle,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const RemoveMaterialMapping = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  // Mapping state
  const [mappingData, setMappingData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  // Modal and removal states
  const [modalVisible, setModalVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

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
      4000
    );
    return () => clearTimeout(timer);
  }, [alert]);

  // Fetch Active Global Mapping
  const fetchActiveMapping = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/auth/get-material-mapping`,
        { withCredentials: true }
      );

      setHasQueried(true);

      if (data?.success && data?.data) {
        setMappingData(data.data);
        setMaterials(
          Array.isArray(data.data.materials) ? data.data.materials : []
        );
      } else {
        setMappingData(null);
        setMaterials([]);
      }
    } catch (err) {
      console.error("Fetch Mapping Error:", err);
      setHasQueried(true);
      setMappingData(null);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchActiveMapping();
  }, [fetchActiveMapping]);

  // Handle Deletion
  const handleConfirmDelete = async () => {
    try {
      setRemoving(true);

      const res = await axios.delete(
        `${backendUrl}/auth/delete-material-mapping`,
        { withCredentials: true }
      );

      if (res.data?.success) {
        showAlert(
          res.data.message || "Material mappings removed successfully!",
          "success"
        );
        setMappingData(null);
        setMaterials([]);
        setModalVisible(false);
      } else {
        showAlert(res.data?.message || "Failed to remove mapping.", "error");
      }
    } catch (err) {
      console.error("Delete Mapping Error:", err);
      showAlert(
        err.response?.data?.message || "Failed to delete material mapping.",
        "error"
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 mt-19">
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
                <h1 className="text-xl font-bold text-gray-800">
                  Remove Material Mapping
                </h1>
                <p className="text-sm text-gray-500">
                  Delete configured standard Decathlon material mapping definitions
                </p>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/admin/view-material-mappings")
                }
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                <MdVisibility size={16} />
                <span>View Mappings</span>
              </button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-600 border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-gray-700">
              Querying active material mappings...
            </p>
          </div>
        )}

        {/* NO MAPPING FOUND */}
        {!loading && hasQueried && materials.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
              <MdCheck size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              No Material Mappings Configured
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              There are no material mappings saved in the system. Nothing to remove.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/admin/add-material-mappings")
              }
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <MdAddCircle size={16} />
              <span>Add Material Mapping</span>
            </button>
          </div>
        )}

        {/* ACTIVE MAPPING PREVIEW & REMOVAL ACTION */}
        {!loading && materials.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                    Active Mapping Found
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    Standard Decathlon Waste Mappings
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Contains {materials.length} material mapping pairs active globally
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalVisible(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <MdDeleteForever size={18} />
                  <span>Delete All Mappings</span>
                </button>
              </div>
            </div>

            {/* LIST OF PAIRS THAT WILL BE DELETED */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Mapping Pairs to be Removed ({materials.length})
              </h4>

              <div className="space-y-2">
                {materials.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <MdStorefront size={16} className="text-blue-600 shrink-0" />
                      <span className="font-semibold text-gray-900">
                        {item.materialType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">maps to</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.officialMaterialType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION MODAL */}
        {modalVisible && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <MdWarning size={28} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Confirm Removal
                  </h3>
                  <p className="text-xs text-gray-500">
                    Are you sure you want to delete all material mappings?
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                <p>
                  <strong>Total Pairs:</strong> {materials.length} configured mappings
                </p>
                <p className="pt-1 text-[11px] text-rose-700">
                  ⚠️ This action is irreversible. All store-to-official material mapping definitions will be permanently deleted from the database.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  disabled={removing}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={removing}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {removing ? "Deleting..." : "Yes, Delete All Mappings"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RemoveMaterialMapping;
