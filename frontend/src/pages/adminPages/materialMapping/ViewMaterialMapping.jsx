import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdVisibility,
  MdSearch,
  MdClose,
  MdEdit,
  MdDelete,
  MdStorefront,
  MdCheckCircle,
  MdSyncAlt,
  MdAddCircle,
  MdAssignmentLate,
  MdAltRoute,
  MdErrorOutline,
  MdHelpOutline,
  MdRefresh,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const ViewMaterialMapping = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  // Mappings state
  const [mappingData, setMappingData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

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

  // Fetch Global Material Mapping
  const fetchMapping = useCallback(async () => {
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
      showAlert(
        err.response?.data?.message || "No material mappings found.",
        "info"
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchMapping();
  }, [fetchMapping]);

  // Client-side search filtering
  const filteredMaterials = useMemo(() => {
    if (!search.trim()) return materials;
    const q = search.toLowerCase();
    return materials.filter(
      (m) =>
        m.materialType?.toLowerCase().includes(q) ||
        m.officialMaterialType?.toLowerCase().includes(q)
    );
  }, [search, materials]);

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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MdVisibility size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Material Mappings
                </h1>
                <p className="text-sm text-gray-500">
                  Inspect configured store-to-official Decathlon waste category mappings
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchMapping}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                title="Refresh mappings"
              >
                <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/admin/add-material-mappings")
                }
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                <MdEdit size={16} />
                <span>Add / Edit Mapping</span>
              </button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-gray-700">
              Loading material mapping definitions...
            </p>
          </div>
        )}

        {/* NO MAPPING FOUND */}
        {!loading && hasQueried && materials.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <MdAssignmentLate size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              No Material Mappings Configured
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              There are no store-to-official material category mappings configured in the system yet.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/admin/add-material-mappings")
              }
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <MdAddCircle size={16} />
              <span>Create Mapping Now</span>
            </button>
          </div>
        )}

        {/* ACTIVE MAPPING LIST */}
        {!loading && materials.length > 0 && (
          <div className="space-y-4">
            {/* SUMMARY & ACTION CARD */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MdSyncAlt size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      Standard Decathlon Waste Mappings
                    </h3>
                    <p className="text-xs text-gray-500">
                      Global mapping active across all store waste transactions
                      {mappingData?.updatedAt && (
                        <span> • Last updated {new Date(mappingData.updatedAt).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl text-center">
                    <span className="text-sm block">{materials.length}</span>
                    <span className="text-[10px] uppercase font-semibold">
                      Pairs Mapped
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard/admin/add-material-mappings")
                    }
                    className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <MdEdit size={15} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard/admin/remove-material-mappings")
                    }
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <MdDelete size={15} />
                    <span>Remove All</span>
                  </button>
                </div>
              </div>

              {/* SEARCH INPUT */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="relative">
                  <MdSearch
                    size={20}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search store material or official category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <MdClose size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MAPPINGS LIST */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mapping Pairs ({filteredMaterials.length})
                </span>
              </div>

              {filteredMaterials.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow transition"
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      #{index + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MdCheckCircle size={13} /> Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                    {/* Left: Store Material */}
                    <div className="md:col-span-2 p-3 bg-blue-50/40 rounded-xl border border-blue-100/70">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 mb-1">
                        <MdStorefront size={16} />
                        <span>Store / Vendor Material</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {item.materialType}
                      </p>
                    </div>

                    {/* Middle Sync Icon */}
                    <div className="hidden md:flex justify-center text-blue-600">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <MdSyncAlt size={18} />
                      </div>
                    </div>

                    {/* Right: Official Category */}
                    <div className="md:col-span-2 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/70">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                        <MdCheckCircle size={16} />
                        <span>Decathlon Official Category</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {item.officialMaterialType}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredMaterials.length === 0 && (
                <div className="py-12 text-center bg-white rounded-2xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">
                    No materials matched "{search}"
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-2 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewMaterialMapping;
