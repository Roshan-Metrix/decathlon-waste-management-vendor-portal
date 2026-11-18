import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdVisibility,
  MdLocationOn,
  MdSearch,
  MdClose,
  MdEdit,
  MdDeleteForever,
  MdAdd,
  MdCheckCircle,
  MdErrorOutline,
  MdHelpOutline,
  MdMap,
  MdBusiness,
  MdCategory,
  MdRefresh,
  MdChevronRight,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const ViewRegions = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  // State
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Inspecting specific region details
  const [selectedRegionKey, setSelectedRegionKey] = useState(null);
  const [materialsData, setMaterialsData] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  // Alert State
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

  // Fetch all regions
  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
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
      } else {
        showAlert(data?.message || "Failed to load regions.", "error");
      }
    } catch (err) {
      console.error("Fetch Regions Error:", err);
      showAlert(
        err.response?.data?.message || "Failed to load operational regions.",
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
    return regions.filter(
      (r) =>
        r.state.toLowerCase().includes(query) ||
        r.vendor.toLowerCase().includes(query),
    );
  }, [regions, search]);

  // Fetch materials when a region card is inspected
  const fetchRegionalMaterials = async (stateName, vendorId) => {
    if (!stateName || !vendorId) {
      setMaterialsData([]);
      return;
    }
    try {
      setMaterialsLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/auth/get-regional-materials/${encodeURIComponent(stateName)}/${encodeURIComponent(vendorId)}`,
        { withCredentials: true },
      );

      if (data?.success && Array.isArray(data.materials)) {
        const parsed = data.materials.map((item) => {
          if (typeof item === "string" && item.includes(":")) {
            const [name, rate] = item.split(":");
            return { materialType: name.trim(), rate: rate.trim() };
          }
          return {
            materialType: item.materialType || item,
            rate: item.rate !== undefined ? String(item.rate) : "-",
          };
        });
        setMaterialsData(parsed);
      } else {
        setMaterialsData([]);
      }
    } catch (err) {
      console.log("Fetch Regional Materials Error:", err);
      setMaterialsData([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleSelectRegion = (region) => {
    const cardKey = `${region.state}-${region.vendorId}`;
    if (selectedRegionKey === cardKey) {
      setSelectedRegionKey(null);
      setMaterialsData([]);
    } else {
      setSelectedRegionKey(cardKey);
      setMaterialsData([]);
      fetchRegionalMaterials(region.state, region.vendorId);
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MdMap size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">All Regions</h1>
                <p className="text-sm text-gray-500">
                  Manage geographical operating regions and view configured waste rates
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/dashboard/regions/add-region")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-xs"
              >
                <MdAdd size={16} />
                <span>Add Region</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/regions/edit-rates")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                <MdEdit size={16} />
                <span>Edit Rates</span>
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

        {/* METRICS & SEARCH CONTROLS */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-4">
          {/* Total Regions Count Box */}
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-xs">
              <MdLocationOn size={26} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Regions
              </p>
              <p className="text-2xl font-black text-blue-700">
                {loading ? "..." : regions.length}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 px-4 py-2 shadow-xs">
            <MdSearch size={22} className="text-blue-600 shrink-0" />
            <input
              type="text"
              placeholder="Search by vendor or state (e.g. Karnataka, GreenWaste)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
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

        {/* REGIONS LIST */}
        <div className="mb-10 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
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
                  ? `No region matches "${search}". Try another search term.`
                  : "No operational regions have been registered yet."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/dashboard/regions/add-region")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                <MdAdd size={16} />
                <span>Add Your First Region</span>
              </button>
            </div>
          ) : (
            filteredRegions.map((region, idx) => {
              const cardKey = `${region.state}-${region.vendorId}`;
              const isSelected = selectedRegionKey === cardKey;

              return (
                <div
                  key={`${cardKey}-${idx}`}
                  className={`rounded-2xl border bg-white transition shadow-xs ${
                    isSelected
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div
                      className="flex items-center gap-3.5 cursor-pointer flex-1"
                      onClick={() => handleSelectRegion(region)}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <MdBusiness size={22} />
                      </div>
                      <div>
                        {/* Vendor Name */}
                        <h3 className="text-base font-bold text-gray-900">
                          {region.vendor || "Unknown Vendor"}
                        </h3>
                        {/* State Name */}
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                          <MdLocationOn size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{region.state}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-blue-600 hover:underline">
                            {isSelected ? "Hide Rates" : "Preview Rates"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/dashboard/regions/edit-rates", {
                            state: {
                              stateName: region.state,
                              vendorId: region.vendorId,
                              vendorName: region.vendor,
                            },
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                      >
                        <MdEdit size={14} />
                        <span>Edit Rates</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/dashboard/mappings/view-mapping", {
                            state: { region: region.state },
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      >
                        <MdVisibility size={14} />
                        <span>Mappings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/dashboard/regions/remove-region", {
                            state: { targetRegion: region },
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                      >
                        <MdDeleteForever size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Regional Material Details */}
                  {isSelected && (
                    <div className="border-t border-gray-100 bg-slate-50/70 p-4 sm:p-5 rounded-b-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <MdCategory size={18} className="text-blue-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            Rates for {region.vendor} in {region.state}
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate("/dashboard/regions/edit-rates", {
                              state: {
                                stateName: region.state,
                                vendorId: region.vendorId,
                                vendorName: region.vendor,
                              },
                            })
                          }
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <MdEdit size={13} />
                          <span>Configure Rates</span>
                        </button>
                      </div>

                      {materialsLoading ? (
                        <div className="py-6 text-center text-xs text-gray-400">
                          <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mb-1" />
                          <p>Fetching rates...</p>
                        </div>
                      ) : materialsData.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                          <p className="text-xs text-gray-500">
                            No configured materials found for this vendor in this region.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/dashboard/regions/edit-rates", {
                                state: {
                                  stateName: region.state,
                                  vendorId: region.vendorId,
                                  vendorName: region.vendor,
                                },
                              })
                            }
                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            + Configure Material Rates Now
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {materialsData.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="flex items-center justify-between rounded-xl bg-white border border-gray-200 p-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                <span className="text-xs font-semibold text-gray-800 truncate">
                                  {m.materialType}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                                ₹ {m.rate} / kg
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewRegions;
