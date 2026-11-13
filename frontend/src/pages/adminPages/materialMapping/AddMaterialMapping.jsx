import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAltRoute,
  MdAdd,
  MdDelete,
  MdCheckCircle,
  MdErrorOutline,
  MdEdit,
  MdVisibility,
  MdClose,
  MdSave,
  MdHelpOutline,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

// Standard Decathlon material categories for quick suggestions
const OFFICIAL_MATERIAL_SUGGESTIONS = [
  "Defective Products",
  "Hazardous Waste",
  "Recycling Batteries",
  "Recycling E Waste",
  "Recycling Glass",
  "Recycling Hard Plastic",
  "Recycling Lighting Products",
  "Recycling Metal",
  "Recycling Mixed Packaging",
  "Recycling Organic",
  "Recycling Paper/cardboard",
  "Recycling Rubber",
  "Recycling Soft Plastics",
  "Recycling Textile",
  "Recycling Wood",
  "Waste incineration",
  "Waste incineration energy recovery",
  "Waste landfill",
];

const AddMaterialMapping = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  // Mapping rows state
  const [mappings, setMappings] = useState([
    { materialType: "", officialMaterialType: "" },
  ]);
  const [isExistingMapping, setIsExistingMapping] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // Form submitting & alert state
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

  // Fetch existing material mapping from backend
  const fetchExistingMapping = useCallback(async () => {
    setCheckingExisting(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/get-material-mapping`,
        { withCredentials: true },
      );

      if (
        data?.success &&
        Array.isArray(data.data?.materials) &&
        data.data.materials.length > 0
      ) {
        setMappings(
          data.data.materials.map((m) => ({
            materialType: m.materialType || "",
            officialMaterialType: m.officialMaterialType || "",
          })),
        );
        setIsExistingMapping(true);
      } else {
        setIsExistingMapping(false);
        setMappings([{ materialType: "", officialMaterialType: "" }]);
      }
    } catch (err) {
      console.error("Fetch Existing Mapping Error:", err);
      setIsExistingMapping(false);
      setMappings([{ materialType: "", officialMaterialType: "" }]);
    } finally {
      setCheckingExisting(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchExistingMapping();
  }, [fetchExistingMapping]);

  // Row operations
  const handleAddRow = () => {
    setMappings((prev) => [
      ...prev,
      { materialType: "", officialMaterialType: "" },
    ]);
    setFocusedRowIndex(mappings.length);
  };

  const handleRemoveRow = (index) => {
    if (mappings.length <= 1) {
      showAlert("At least one material mapping row is required.", "error");
      return;
    }
    setMappings((prev) => prev.filter((_, i) => i !== index));
    if (focusedRowIndex >= index && focusedRowIndex > 0) {
      setFocusedRowIndex(focusedRowIndex - 1);
    }
  };

  const handleUpdateRow = (index, field, value) => {
    setMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplySuggestion = (suggestion) => {
    const targetIndex =
      focusedRowIndex < mappings.length
        ? focusedRowIndex
        : mappings.findIndex((m) => !m.officialMaterialType);

    const indexToUse = targetIndex !== -1 ? targetIndex : mappings.length - 1;

    handleUpdateRow(indexToUse, "officialMaterialType", suggestion);
    showAlert(`Applied "${suggestion}" to Row #${indexToUse + 1}`, "info");
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const filteredMaterials = mappings
      .map((m) => ({
        materialType: m.materialType.trim(),
        officialMaterialType: m.officialMaterialType.trim(),
      }))
      .filter((m) => m.materialType || m.officialMaterialType);

    if (filteredMaterials.length === 0) {
      showAlert("Please enter at least one material mapping pair.", "error");
      return;
    }

    // Verify all rows are complete
    for (let i = 0; i < filteredMaterials.length; i++) {
      const item = filteredMaterials[i];
      if (!item.materialType || !item.officialMaterialType) {
        showAlert(
          `Row #${i + 1} is incomplete. Both Store Material and Official Material names are required.`,
          "error",
        );
        return;
      }
    }

    // Check for duplicate store materials
    const types = filteredMaterials.map((m) => m.materialType.toLowerCase());
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size !== types.length) {
      showAlert(
        "Duplicate Store Material names found. Each store material must be unique.",
        "error",
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        materials: filteredMaterials,
      };

      const res = await axios.post(
        `${backendUrl}/auth/add-material-mapping`,
        payload,
        { withCredentials: true },
      );

      if (res.data?.success) {
        showAlert(
          res.data.message || "Material mappings saved successfully!",
          "success",
        );
        setIsExistingMapping(true);
      } else {
        showAlert(
          res.data?.message || "Failed to save material mappings.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Mapping Error:", err);
      showAlert(
        err.response?.data?.message ||
          "Failed to save material mappings.",
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
                <MdAltRoute size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {isExistingMapping
                    ? "Edit Material Mapping"
                    : "Add Material Mapping"}
                </h1>
                <p className="text-sm text-gray-500">
                  Map store and vendor material types to standard Decathlon
                  official waste categories
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

        {/* MATERIAL MAPPING ROWS */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Configure Material Mapping Pairs
              </h2>
              <p className="text-xs text-gray-500">
                Specify each store material type and assign its Decathlon
                official waste category
              </p>
            </div>

            {isExistingMapping && (
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200">
                <MdEdit size={14} /> Editing Existing Mapping
              </span>
            )}
          </div>

          {/* Quick Suggestions Pills */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
            <span className="text-xs font-semibold text-blue-900 block">
              Quick Official Suggestions (Click to insert into focused row):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {OFFICIAL_MATERIAL_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleApplySuggestion(item)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-blue-600 hover:text-white text-blue-800 border border-blue-200 rounded-lg transition shadow-2xs cursor-pointer"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Existing Mappings */}
          {checkingExisting ? (
            <div className="py-12 text-center text-sm text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
              <p>Loading existing mapping configuration...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mappings.map((row, index) => (
                <div
                  key={index}
                  onFocus={() => setFocusedRowIndex(index)}
                  className={`p-4 rounded-xl border transition-all ${
                    focusedRowIndex === index
                      ? "border-blue-400 bg-blue-50/20 shadow-xs"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700">
                      Row #{index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={mappings.length <= 1}
                      className="p-1 text-gray-400 hover:text-rose-600 disabled:opacity-30 transition cursor-pointer"
                      title="Remove Row"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Store Material Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                        Store / Vendor Material Name
                      </label>
                      <input
                        type="text"
                        value={row.materialType}
                        onChange={(e) =>
                          handleUpdateRow(index, "materialType", e.target.value)
                        }
                        placeholder="e.g. Defective Products, Recycling Rubber"
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      />
                    </div>

                    {/* Official Material Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                        Decathlon Official Standard Category
                      </label>
                      <input
                        type="text"
                        value={row.officialMaterialType}
                        onChange={(e) =>
                          handleUpdateRow(
                            index,
                            "officialMaterialType",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Recycling Rubber, Recycling Paper/cardboard"
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Row Button */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <MdAdd size={18} />
              <span>Add Mapping Row</span>
            </button>

            <span className="text-xs text-gray-400">
              Total {mappings.length} {mappings.length === 1 ? "pair" : "pairs"}
            </span>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || checkingExisting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <MdSave size={18} />
              <span>
                {submitting
                  ? "Saving Mappings..."
                  : isExistingMapping
                    ? "Update Material Mappings"
                    : "Save Material Mappings"}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddMaterialMapping;
