import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdVisibility,
  MdLocationOn,
  MdBusiness,
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
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const ViewMaterialMapping = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const location = useLocation();

  // Region and Vendor selector states
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(
    location.state?.region || ""
  );

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(
    location.state?.vendorId || ""
  );

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

  // Fetch Regions
  const fetchRegions = useCallback(async () => {
    try {
      setRegionsLoading(true);
      const { data } = await axios.get(`${backendUrl}/auth/get-regions`, {
        withCredentials: true,
      });
      if (data?.success && Array.isArray(data.regions)) {
        setRegions(data.regions);
      }
    } catch (err) {
      console.error("Fetch Regions Error:", err);
      showAlert("Failed to load regions.", "error");
    } finally {
      setRegionsLoading(false);
    }
  }, [backendUrl]);

  // Fetch Vendors
  const fetchVendors = useCallback(async () => {
    try {
      setVendorsLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/vendor/get-all-vendors?limit=100`,
        { withCredentials: true }
      );
      if (data?.success && Array.isArray(data.vendors)) {
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error("Fetch Vendors Error:", err);
      showAlert("Failed to load vendors.", "error");
    } finally {
      setVendorsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchRegions();
    fetchVendors();
  }, [fetchRegions, fetchVendors]);

  // Fetch Material Mapping when Region and Vendor are selected
  const fetchMapping = useCallback(
    async (region, vendorId) => {
      if (!region || !vendorId) {
        setMappingData(null);
        setMaterials([]);
        setHasQueried(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/auth/get-material-mapping/${region.trim()}/${vendorId}`,
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
        console.log("Fetch Mapping Error:", err);
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
    },
    [backendUrl]
  );

  useEffect(() => {
    if (selectedRegion && selectedVendor) {
      fetchMapping(selectedRegion, selectedVendor);
    } else {
      setMappingData(null);
      setMaterials([]);
      setHasQueried(false);
    }
  }, [fetchMapping, selectedRegion, selectedVendor]);

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

  const activeVendorName = useMemo(() => {
    const found = vendors.find((v) => v._id === selectedVendor);
    return found ? `${found.name}${found.state ? ` (${found.state})` : ""}` : "";
  }, [vendors, selectedVendor]);

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
                  View Material Mappings
                </h1>
                <p className="text-sm text-gray-500">
                  Inspect configured store-to-official waste category mappings
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/mappings/add-mapping", {
                    state: {
                      region: selectedRegion,
                      vendorId: selectedVendor,
                    },
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                <MdEdit size={16} />
                <span>Add / Edit Mapping</span>
              </button>
            </div>
          </div>
        </div>

        {/* REGION & VENDOR SELECTORS */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Select Region & Vendor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Region Dropdown */}
            <div>
              <label
                htmlFor="regionSelect"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Region (State)
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdLocationOn size={21} className="shrink-0 text-blue-600" />
                <select
                  id="regionSelect"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  disabled={regionsLoading}
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none cursor-pointer"
                >
                  <option value="">
                    {regionsLoading
                      ? "Loading regions..."
                      : "-- Choose a Region --"}
                  </option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vendor Dropdown */}
            <div>
              <label
                htmlFor="vendorSelect"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Vendor
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdBusiness size={21} className="shrink-0 text-blue-600" />
                <select
                  id="vendorSelect"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  disabled={vendorsLoading}
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none cursor-pointer"
                >
                  <option value="">
                    {vendorsLoading
                      ? "Loading vendors..."
                      : "-- Choose a Vendor --"}
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name} {vendor.state ? `(${vendor.state})` : ""}
                    </option>
                  ))}
                </select>
              </div>
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

        {/* NOT SELECTED PROMPT */}
        {!loading && (!selectedRegion || !selectedVendor) && (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <MdAltRoute size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              Select Region & Vendor
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Choose both a region and vendor above to inspect their configured
              material mapping definitions.
            </p>
          </div>
        )}

        {/* NO MAPPING FOUND */}
        {!loading &&
          selectedRegion &&
          selectedVendor &&
          hasQueried &&
          materials.length === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <MdAssignmentLate size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                No Mapping Configured
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                There are no material mappings saved for{" "}
                <span className="font-semibold text-gray-800">
                  {selectedRegion}
                </span>{" "}
                with this vendor yet.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/mappings/add-mapping", {
                    state: {
                      region: selectedRegion,
                      vendorId: selectedVendor,
                    },
                  })
                }
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <MdAddCircle size={16} />
                <span>Create Mapping Now</span>
              </button>
            </div>
          )}

        {/* ACTIVE MAPPING LIST */}
        {!loading &&
          selectedRegion &&
          selectedVendor &&
          materials.length > 0 && (
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
                        {mappingData?.region || selectedRegion}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Vendor: {mappingData?.vendor || activeVendorName || "Selected Vendor"}
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
                        navigate("/dashboard/mappings/add-mapping", {
                          state: {
                            region: selectedRegion,
                            vendorId: selectedVendor,
                          },
                        })
                      }
                      className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <MdEdit size={15} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/dashboard/mappings/remove-mapping", {
                          state: {
                            region: selectedRegion,
                            vendorId: selectedVendor,
                          },
                        })
                      }
                      className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <MdDelete size={15} />
                      <span>Remove</span>
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
                      placeholder="Search store or official material category..."
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
