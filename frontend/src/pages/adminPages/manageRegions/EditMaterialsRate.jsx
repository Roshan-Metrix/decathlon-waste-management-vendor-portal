import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdEdit,
  MdLocationOn,
  MdBusiness,
  MdAdd,
  MdDelete,
  MdCheckCircle,
  MdErrorOutline,
  MdHelpOutline,
  MdClose,
  MdSave,
  MdVisibility,
  MdCategory,
  MdCurrencyRupee,
  MdDeleteForever,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

// Decathlon standard 26 material suggestions matching mobile screen
const MATERIAL_SUGGESTIONS = [
  "Defective Products",
  "Hazardous Waste",
  "Recycling Cardboard",
  "Recycling E Waste",
  "Recycling Glass",
  "Recycling Hangers",
  "Return Hangers",
  "Recycling Metal",
  "Recycling Mixed Packaging",
  "Recycling Organic",
  "Recycling Paper",
  "Recycling Rubber",
  "Recycling Soft Plastic",
  "Recycling Textile",
  "Recycling Wood",
  "Unsegregated Waste",
  "Recycling Hard Plastic",
  "Food Waste - Expired Products",
  "Recycling Metal Mixed",
  "Recycling Wood Pallet Wood",
  "Nonrecycling Wood(Furniture)",
  "Recycling Metal Fixtures Truck Load",
  "Aluminium < 1000 kgs /> 1000 kgs",
  "LED Strips",
  "Energy Recovery",
  "Incineration",
];

const EditMaterialsRate = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const location = useLocation();

  // Region and Vendor selectors
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(
    location.state?.stateName || location.state?.regionName || "",
  );

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(
    location.state?.vendorId || "",
  );

  // Materials rows
  const [materials, setMaterials] = useState([
    { materialType: "", rate: "" },
  ]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // Submitting & Alert states
  const [submitting, setSubmitting] = useState(false);
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

  // Fetch Regions
  const fetchRegions = useCallback(async () => {
    try {
      setRegionsLoading(true);
      const { data } = await axios.get(`${backendUrl}/auth/get-regions`, {
        withCredentials: true,
      });
      if (data?.success && Array.isArray(data.regions)) {
        const normalized = data.regions.map((item, index) => {
          if (typeof item === "string") {
            return {
              _id: `reg-${index}`,
              state: item,
              vendor: "Unknown Vendor",
              vendorId: "",
            };
          }
          return {
            _id: item._id || `${item.state}-${item.vendorId || index}`,
            state: item.state || "",
            vendor: item.vendor || "Unknown Vendor",
            vendorId: item.vendorId || "",
          };
        });
        setRegions(normalized);
      }
    } catch (err) {
      console.error("Fetch Regions Error:", err);
      showAlert("Failed to load regions list.", "error");
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
        { withCredentials: true },
      );
      if (data?.success && Array.isArray(data.vendors)) {
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error("Fetch Vendors Error:", err);
      showAlert("Failed to load vendors list.", "error");
    } finally {
      setVendorsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchRegions();
    fetchVendors();
  }, [fetchRegions, fetchVendors]);

  // Unique list of state names
  const uniqueStates = useMemo(() => {
    const set = new Set();
    regions.forEach((r) => {
      if (r.state) set.add(r.state);
    });
    return Array.from(set).sort();
  }, [regions]);

  // Vendors applicable for currently selected region
  const availableVendors = useMemo(() => {
    if (!selectedRegion) return vendors;
    const matchingVendorIds = new Set(
      regions
        .filter((r) => r.state === selectedRegion)
        .map((r) => r.vendorId)
        .filter(Boolean)
    );
    if (matchingVendorIds.size === 0) return vendors;
    const filtered = vendors.filter((v) => matchingVendorIds.has(v._id));
    return filtered.length > 0 ? filtered : vendors;
  }, [selectedRegion, regions, vendors]);

  // Auto-select vendor if only 1 applicable vendor
  useEffect(() => {
    if (selectedRegion && !selectedVendorId && availableVendors.length === 1) {
      setSelectedVendorId(availableVendors[0]._id);
    }
  }, [selectedRegion, selectedVendorId, availableVendors]);

  // Fetch existing material rates when region and vendor are both selected
  const fetchExistingRates = useCallback(
    async (region, vendorId) => {
      if (!region || !vendorId) {
        setMaterials([{ materialType: "", rate: "" }]);
        setHasFetched(false);
        return;
      }

      try {
        setMaterialsLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/auth/get-regional-materials/${encodeURIComponent(region.trim())}/${encodeURIComponent(vendorId)}`,
          { withCredentials: true },
        );

        setHasFetched(true);

        if (data?.success && Array.isArray(data.materials) && data.materials.length > 0) {
          const parsed = data.materials.map((item) => {
            if (typeof item === "string" && item.includes(":")) {
              const [name, rate] = item.split(":");
              return { materialType: name.trim(), rate: rate.trim() };
            }
            return {
              materialType: item.materialType || "",
              rate: item.rate !== undefined ? String(item.rate) : "",
            };
          });
          setMaterials(parsed);
          showAlert(`Loaded ${parsed.length} configured material rates.`, "info");
        } else {
          setMaterials([{ materialType: "", rate: "" }]);
          showAlert("No material rates currently configured for this region and vendor.", "info");
        }
      } catch (err) {
        console.log("Fetch Existing Rates Error:", err);
        setHasFetched(true);
        setMaterials([{ materialType: "", rate: "" }]);
      } finally {
        setMaterialsLoading(false);
      }
    },
    [backendUrl],
  );

  useEffect(() => {
    if (selectedRegion && selectedVendorId) {
      fetchExistingRates(selectedRegion, selectedVendorId);
    }
  }, [fetchExistingRates, selectedRegion, selectedVendorId]);

  // Row operations
  const handleAddRow = () => {
    setMaterials((prev) => [...prev, { materialType: "", rate: "" }]);
    setFocusedRowIndex(materials.length);
  };

  const handleRemoveRow = (index) => {
    if (materials.length <= 1) {
      showAlert("At least one material row is required.", "error");
      return;
    }
    setMaterials((prev) => prev.filter((_, i) => i !== index));
    if (focusedRowIndex >= index && focusedRowIndex > 0) {
      setFocusedRowIndex(focusedRowIndex - 1);
    }
  };

  const handleUpdateRow = (index, field, value) => {
    setMaterials((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplySuggestion = (suggestion, targetIndex = null) => {
    const idx =
      targetIndex !== null
        ? targetIndex
        : focusedRowIndex < materials.length
          ? focusedRowIndex
          : materials.length - 1;

    handleUpdateRow(idx, "materialType", suggestion);
  };

  // Submit Changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!selectedRegion) {
      showAlert("Please choose a Region.", "error");
      return;
    }

    if (!selectedVendorId) {
      showAlert("Please choose a Vendor.", "error");
      return;
    }

    const currentVendor = vendors.find((v) => v._id === selectedVendorId);
    if (!currentVendor) {
      showAlert("Selected vendor not found in list.", "error");
      return;
    }

    const validMaterials = materials
      .filter((m) => m.materialType.trim() && String(m.rate).trim() !== "")
      .map((m) => ({
        materialType: m.materialType.trim(),
        rate: Number(m.rate),
      }));

    if (validMaterials.length === 0) {
      showAlert("Please specify at least one valid material with rate.", "error");
      return;
    }

    for (const mat of validMaterials) {
      if (!Number.isFinite(mat.rate) || mat.rate < 0) {
        showAlert(`Rate for "${mat.materialType}" must be a valid non-negative number.`, "error");
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        state: selectedRegion.trim(),
        vendorName: currentVendor.name,
        materials: validMaterials,
      };

      const res = await axios.post(
        `${backendUrl}/auth/admin/add-materials`,
        payload,
        { withCredentials: true },
      );

      if (res.data?.success) {
        showAlert(
          res.data.message || `Material rates updated successfully for ${selectedRegion}!`,
          "success",
        );
      } else {
        showAlert(res.data?.message || "Failed to update material rates.", "error");
      }
    } catch (err) {
      console.error("Save Material Rates Error:", err);
      showAlert(
        err.response?.data?.message || "Failed to update material rates.",
        "error",
      );
    } finally {
      setSubmitting(false);
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MdEdit size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Edit Material Rates
                </h1>
                <p className="text-sm text-gray-500">
                  Update unit rate prices (INR / kg) for each region and assigned vendor
                </p>
              </div>
            </div>

            {/* Quick Navigation Links */}
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
                onClick={() => navigate("/dashboard/regions/remove-region")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                <MdDeleteForever size={16} />
                <span>Remove Region</span>
              </button>
            </div>
          </div>
        </div>

        {/* REGION & VENDOR SELECTORS */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            1. Select Target Region & Vendor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Region Dropdown */}
            <div>
              <label
                htmlFor="regionSelect"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Region (State) *
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdLocationOn size={21} className="shrink-0 text-blue-600" />
                <select
                  id="regionSelect"
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedVendorId("");
                  }}
                  disabled={regionsLoading}
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none cursor-pointer"
                >
                  <option value="">
                    {regionsLoading
                      ? "Loading regions..."
                      : "-- Choose a Region --"}
                  </option>
                  {uniqueStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
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
                Vendor *
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdBusiness size={21} className="shrink-0 text-blue-600" />
                <select
                  id="vendorSelect"
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  disabled={vendorsLoading}
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none cursor-pointer"
                >
                  <option value="">
                    {vendorsLoading
                      ? "Loading vendors..."
                      : "-- Choose a Vendor --"}
                  </option>
                  {availableVendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name} ({vendor.state || "National"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* MATERIAL RATES CONFIGURATION */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                2. Configure Materials & Rates (per kg)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedRegion && selectedVendorId
                  ? `Configuring rates for ${selectedRegion}`
                  : "Please choose both a Region and Vendor above to load and edit rates"}
              </p>
            </div>
            <span className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {materials.length} {materials.length === 1 ? "Material" : "Materials"}
            </span>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Common Decathlon Material Suggestions (click to populate):
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {MATERIAL_SUGGESTIONS.map((cat, i) => (
                <button
                  key={`${cat}-${i}`}
                  type="button"
                  onClick={() => handleApplySuggestion(cat)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                >
                  + {cat}
                </button>
              ))}
            </div>
          </div>

          {materialsLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
              <p className="text-sm font-medium text-gray-500">
                Fetching material rates...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((row, index) => {
                const rowSuggestions =
                  row.materialType.trim().length > 0
                    ? MATERIAL_SUGGESTIONS.filter((s) =>
                        s
                          .toLowerCase()
                          .includes(row.materialType.trim().toLowerCase()) &&
                        s.toLowerCase() !== row.materialType.trim().toLowerCase()
                      )
                    : [];

                return (
                  <div
                    key={index}
                    onClick={() => setFocusedRowIndex(index)}
                    className={`relative rounded-xl border p-4 transition ${
                      focusedRowIndex === index
                        ? "border-blue-300 bg-blue-50/20 shadow-xs"
                        : "border-gray-100 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                        Item #{index + 1}
                      </span>
                      {materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                          title="Remove material"
                        >
                          <MdDelete size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Material Type Input */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Material Type *
                        </label>
                        <div className="flex min-h-11 items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 transition focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
                          <MdCategory size={18} className="text-blue-600 shrink-0" />
                          <input
                            type="text"
                            placeholder="e.g. Cardboard, Food Waste, Plastic"
                            value={row.materialType}
                            onFocus={() => setFocusedRowIndex(index)}
                            onChange={(e) =>
                              handleUpdateRow(index, "materialType", e.target.value)
                            }
                            className="w-full bg-transparent py-2 text-sm text-gray-800 outline-none"
                          />
                        </div>

                        {/* Matching suggestions dropdown/chips */}
                        {rowSuggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-lg border border-blue-100">
                            <span className="text-[11px] font-semibold text-slate-400 mr-1">
                              Matching:
                            </span>
                            {rowSuggestions.slice(0, 4).map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => handleApplySuggestion(sug, index)}
                                className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition cursor-pointer"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Rate Input */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Rate (per kg) *
                        </label>
                        <div className="flex min-h-11 items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 transition focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
                          <MdCurrencyRupee size={18} className="text-blue-600 shrink-0" />
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0.00"
                            value={row.rate}
                            onFocus={() => setFocusedRowIndex(index)}
                            onChange={(e) =>
                              handleUpdateRow(index, "rate", e.target.value)
                            }
                            className="w-full bg-transparent py-2 text-sm text-gray-800 outline-none"
                          />
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0">
                            / kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Material Button */}
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MdAdd size={20} />
            <span>Add Another Material</span>
          </button>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex items-center justify-end gap-3 mb-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || materialsLoading}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <MdSave size={18} />
            <span>{submitting ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditMaterialsRate;
