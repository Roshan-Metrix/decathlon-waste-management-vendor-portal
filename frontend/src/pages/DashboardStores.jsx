import React, { useContext, useEffect, useState, useMemo } from "react";
import { AppContent } from "../context/AppContext.jsx";
import NavBar from "../components/NavBar.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Search } from "lucide-react";
import { toast } from "react-toastify";

const DashboardStores = () => {
  const { backendUrl } = useContext(AppContent);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/get-related-stores`
      );

      if (data.success) {
        setStoreData(data.stores);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  /* Search & Filter */
  const filteredStores = useMemo(() => {
    return storeData.filter((store) =>
      `${store.storeName} ${store.storeLocation} ${store.storeId}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [storeData, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-10 mt-17">
        {/* Search */}
        <div className="max-w-md mx-auto mb-10 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by store name, location or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af] outline-none"
          />
        </div>

        {/* Content */}
        {loading ? (
          /*  Loader Skeleton */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white border border-slate-200 rounded-xl p-6"
              >
                <div className="h-4 w-2/3 bg-slate-200 rounded mb-3" />
                <div className="h-3 w-1/2 bg-slate-200 rounded mb-6" />
                <div className="h-8 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          /*  Stores */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <div
                key={store.storeId}
                onClick={() => navigate(`/dashboard/stores/${store.storeId}`)}
                className="group cursor-pointer bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-[#1e40af] transition">
                      {store.storeName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 font-medium">
                      {store.storeLocation}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {store.transactionCount} Transactions
                    </p>
                    <span className="mt-2 inline-block text-xs font-medium text-[#1e40af] bg-blue-50 px-2 py-1 rounded">
                      {store.storeId}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 group-hover:bg-[#1e40af] transition">
                    <ChevronRight
                      className="text-[#1e40af] group-hover:text-white transition"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <p className="text-slate-500">
              No stores match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStores;
