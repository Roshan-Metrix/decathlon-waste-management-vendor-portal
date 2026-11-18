import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  MdMap,
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

const AddRegions = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  // State / Region Name
  const [stateName, setStateName] = useState("");

  // Vendor state
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedVendorName, setSelectedVendorName] = useState("");

  // Materials rows state
  const [materials, setMaterials] = useState([
    { materialType: "", rate: "" },
  ]);
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

  // Fetch Vendors on mount
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
    fetchVendors();
  }, [fetchVendors]);

  // Material rows handling
  const handleAddMaterialField = () => {
    setMaterials((prev) => [...prev, { materialType: "", rate: "" }]);
    setFocusedRowIndex(materials.length);
  };

  const handleRemoveMaterialField = (index) => {
    if (materials.length <= 1) {
      showAlert("At least one material row is required.", "error");
      return;
    }
    setMaterials((prev) => prev.filter((_, i) => i !== index));
    if (focusedRowIndex >= index && focusedRowIndex > 0) {
      setFocusedRowIndex(focusedRowIndex - 1);
    }
  };

  const handleMaterialChange = (index, field, value) => {
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

    handleMaterialChange(idx, "materialType", suggestion);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!stateName.trim()) {
      showAlert("Please enter a region (state) name.", "error");
      return;
    }

    if (!selectedVendorName) {
      showAlert("Please select a vendor for this region configuration.", "error");
      return;
    }

    // Validate every material row
    const hasInvalidMaterial = materials.some(
      (m) =>
        !m.materialType.trim() ||
        String(m.rate).trim() === "" ||
        !Number.isFinite(Number(m.rate)) ||
        Number(m.rate) < 0
    );

    if (hasInvalidMaterial) {
      showAlert(
        "Please enter a valid Material Type and non-negative Rate for every row.",
        "error"
      );
      return;
    }

    const formattedMaterials = materials.map((m) => ({
      materialType: m.materialType.trim(),
      rate: Number(m.rate),
    }));

    if (formattedMaterials.length === 0) {
      showAlert("Please add at least one valid material with rate.", "error");
      return;
    }

    // Check duplicate material types
    const types = formattedMaterials.map((m) => m.materialType.toLowerCase());
    const unique = new Set(types);
    if (unique.size !== types.length) {
      showAlert(
        "Duplicate material types detected. Please ensure each material name is unique.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        state: stateName.trim(),
        vendorName: selectedVendorName,
        materials: formattedMaterials,
      };

      const res = await axios.post(
        `${backendUrl}/auth/admin/add-materials`,
        payload,
        { withCredentials: true },
      );

      if (res.data?.success) {
        showAlert(
          res.data.message ||
            `Region "${stateName.trim()}" and materials saved successfully!`,
          "success",
        );
        // Reset form
        setStateName("");
        setSelectedVendorName("");
        setMaterials([{ materialType: "", rate: "" }]);
        setFocusedRowIndex(0);
      } else {
        showAlert(res.data?.message || "Failed to save region materials.", "error");
      }
    } catch (err) {
      console.error("Add Region Error:", err);
      showAlert(
        err.response?.data?.message || "Server error occurred while saving region.",
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
                <MdMap size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Add Region</h1>
                <p className="text-sm text-gray-500">
                  Configure state regions and define waste material rates per kilogram
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
                onClick={() => navigate("/dashboard/regions/remove-region")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                <MdDeleteForever size={16} />
                <span>Remove Region</span>
              </button>
            </div>
          </div>
        </div>

        {/* REGION & VENDOR DETAILS */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            1. Region & Vendor Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Region (State) Input */}
            <div>
              <label
                htmlFor="stateNameInput"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Region Name (State) *
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdLocationOn size={21} className="shrink-0 text-blue-600" />
                <input
                  id="stateNameInput"
                  type="text"
                  placeholder="e.g. Karnataka, Maharashtra, Delhi"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Vendor Selector Dropdown */}
            <div>
              <label
                htmlFor="vendorSelect"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Assigned Vendor *
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-indigo-50 px-4 transition focus-within:ring-2 focus-within:ring-blue-200">
                <MdBusiness size={21} className="shrink-0 text-blue-600" />
                <select
                  id="vendorSelect"
                  value={selectedVendorName}
                  onChange={(e) => setSelectedVendorName(e.target.value)}
                  disabled={vendorsLoading}
                  className="w-full bg-transparent py-3 text-sm text-gray-800 outline-none cursor-pointer"
                >
                  <option value="">
                    {vendorsLoading
                      ? "Loading vendors..."
                      : "-- Choose a Vendor --"}
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor.name}>
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
                2. Material Types & Regional Rates
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Specify materials collected in this region and their corresponding rate (INR per kg)
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

          {/* Dynamic Rows */}
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
                      Row #{index + 1}
                    </span>
                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialField(index)}
                        className="text-gray-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                        title="Remove row"
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
                            handleMaterialChange(index, "materialType", e.target.value)
                          }
                          className="w-full bg-transparent py-2 text-sm text-gray-800 outline-none"
                        />
                      </div>

                      {/* Matching suggestions dropdown/chips for active row */}
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

                    {/* Rate per kg Input */}
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
                            handleMaterialChange(index, "rate", e.target.value)
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

          {/* Add Row Button */}
          <button
            type="button"
            onClick={handleAddMaterialField}
            className="w-full border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MdAdd size={20} />
            <span>Add More Material</span>
          </button>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="flex items-center justify-end gap-3 mb-10">
          <button
            type="button"
            onClick={() => {
              setStateName("");
              setSelectedVendorName("");
              setMaterials([{ materialType: "", rate: "" }]);
              setFocusedRowIndex(0);
            }}
            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium text-sm transition cursor-pointer"
          >
            Clear Form
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <MdSave size={18} />
            <span>{submitting ? "Saving Region..." : "Save Region & Rates"}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AddRegions;
