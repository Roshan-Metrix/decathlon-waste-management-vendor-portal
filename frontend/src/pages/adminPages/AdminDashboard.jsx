import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../../context/AppContext.jsx";
import NavBar from "../../components/NavBar.jsx";
import TotalBox from "../../components/TotalBox.jsx";
import { ChevronRight, Search } from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);

  const [stats, setStats] = useState({
    totalStores: 0,
    totalTransactions: 0,
    totalItems: 0,
  });

  const [page, setPage] = useState(1);
  const LIMIT = 6;

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchStores = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${backendUrl}/transaction/get-stores-total-transactions?page=${pageNumber}&limit=${LIMIT}`
      );

      if (data.success) {
        if (pageNumber === 1) {
          setStores(data.stores || []);
        } else {
          setStores((prev) => [...prev, ...(data.stores || [])]);
        }

        setStats({
          totalStores: data.totalStores || 0,
          totalTransactions: data.totalTransactions || 0,
          totalItems: data.totalItems || 0,
        });

        setHasMore(data.hasMore ?? false);
      }
    } catch (err) {
      console.error("Fetch stores error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(page);
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      `${store.storeName || ""} ${store.storeLocation || ""} ${
        store.storeId || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [stores, search]);

  return (
    <div className="flex flex-col items-center m-20 px-4 text-gray-800">
      <NavBar />

      {/* Stats */}
      <div className="w-full mt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <TotalBox name="Total Stores" value={stats.totalStores} />
          <TotalBox
            name="Total Transactions"
            value={stats.totalTransactions}
          />
          <TotalBox name="Total Wastes" value={stats.totalItems} />
        </div>
      </div>

      {/* Store List */}
      <div className="w-full mx-auto px-4 py-7">
        {/* Search */}
        <div className="max-w-md mx-auto mb-6 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by state, location or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e40af]/30 focus:border-[#1e40af] outline-none"
          />
        </div>

        {/* Initial Loading Skeleton */}
        {loading && stores.length === 0 ? (
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
          <>
            {/* Store Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map((store) => (
                <div
                  key={store.storeId}
                  onClick={() =>
                    navigate(`/dashboard/stores/${store.storeId}`)
                  }
                  className="group cursor-pointer bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-[#1e40af] transition">
                        {store.storeName}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 font-medium">
                        {store.storeLocation}, {store.storeState}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {store.transactionCount || 0} Transactions
                      </p>

                      <span className="mt-2 inline-block text-xs font-medium text-[#1e40af] bg-blue-50 px-2 py-1 rounded">
                        {store.storeId}
                      </span>
                    </div>

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

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-[#1e40af] text-white rounded-lg hover:bg-[#1d4ed8] transition disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center mt-20">
            <p className="text-slate-500">No stores match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;