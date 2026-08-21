import React, { useContext, useEffect, useState } from "react";
import {
  MdStore,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdSearch,
  MdConfirmationNumber,
  MdChevronRight,
} from "react-icons/md";

import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const ViewAllStores = () => {
  const { backendUrl } = useContext(AppContent);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");

  const LIMIT = 6;

  const fetchStores = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/admin/get-all-stores?page=${page}&limit=${LIMIT}`
      );

      if (data.success) {
        const newStores = Array.isArray(data.stores)
          ? data.stores
          : [];

        setStores((prev) => [...prev, ...newStores]);

        setHasMore(Boolean(data.hasMore));

        setCount(data.count || 0);

        setPage((prev) => prev + 1);
      } else {
        setAlertMessage(data.message || "Unable to fetch stores");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Fetch Stores Error:", error);

      setAlertMessage("Error fetching stores!");
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const s = search.toLowerCase().trim();

    if (!s) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter((store) => {
      const storeId = store.storeId?.toLowerCase() || "";
      const name = store.name?.toLowerCase() || "";

      return storeId.includes(s) || name.includes(s);
    });

    setFilteredStores(filtered);
  }, [search, stores]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchStores();
    }
  };

  const handleStoreClick = (store) => {
    console.log("Selected Store:", store.storeId);

    // Connect your React Router navigation here.
    //
    // Example:
    //
    // navigate("/all-transactions", {
    //   state: {
    //     storeId: store.storeId,
    //   },
    // });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mt-19 px-4 py-3 sm:px-6 lg:px-8 mx-12">
        {/* PAGE TITLE */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <MdStore
                size={28}
                className="text-blue-600"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-800">
                All Stores
              </h1>

              <p className="text-sm text-gray-500">
                View and manage all registered stores
              </p>
            </div>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
          {/* TOTAL COUNT */}
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MdStore
                size={28}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                Total Stores
              </p>

              <p className="text-2xl font-black text-blue-600">
                {count}
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="flex h-full min-h-[80px] items-center rounded-2xl bg-indigo-50 px-4">
            <MdSearch
              size={23}
              className="shrink-0 text-blue-600"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Store ID or Name"
              className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="cursor-pointer px-2 text-xl text-gray-400 transition hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {initialLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <MdStore
                size={60}
                className="text-gray-500"
              />
            </div>

            <p className="text-center text-xl font-medium text-gray-500">
              No Stores Found
            </p>

            {search && (
              <p className="mt-1 text-center text-sm text-gray-400">
                Try searching with another Store ID or Name.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredStores.map((store, index) => (
                <StoreCard
                  key={
                    store.storeId
                      ? `${store.storeId}-${index}`
                      : index
                  }
                  store={store}
                  onClick={() => handleStoreClick(store)}
                />
              ))}
            </div>

            {/* LOAD MORE */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={`flex h-10 min-w-32 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 ${
                    loading
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}

            {/* END MESSAGE */}
            {!hasMore && stores.length > 0 && (
              <p className="py-6 text-center text-xs text-gray-400">
                No more stores to load
              </p>
            )}

            {/*  SEARCH RESULT */}
            {search && (
              <p className="mt-3 text-center text-xs text-gray-400">
                Showing {filteredStores.length} matching
                {filteredStores.length === 1
                  ? " store"
                  : " stores"}
              </p>
            )}
          </>
        )}
      </main>

      {/*  ALERT */}
      {alertVisible && (
        <div className="fixed right-4 top-4 z-[200] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {alertMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAlertVisible(false)}
              className="cursor-pointer text-lg leading-none text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* STORE CARD */

const StoreCard = ({ store, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-[2px] hover:border-blue-200 hover:shadow-md active:scale-[0.99]"
    >
      {/* 
          STORE HEADER
       */}
      <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* STORE ICON */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <MdStore
              size={23}
              className="text-blue-600"
            />
          </div>

          {/* STORE NAME + ID */}
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-gray-800">
              {store.name || "N/A"}
            </p>

            <div className="mt-0.5 flex items-center gap-1">
              <MdConfirmationNumber
                size={15}
                className="text-blue-600"
              />

              <p className="truncate text-xs font-medium text-gray-500">
                {store.storeId || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* ARROW */}
        <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 transition group-hover:bg-blue-50">
          <MdChevronRight
            size={22}
            className="text-gray-400 transition group-hover:text-blue-600"
          />
        </div>
      </div>

      {/* 
          STORE DETAILS
       */}
      <div className="space-y-2.5">
        {/* LOCATION */}
        <StoreInfoRow
          icon={<MdLocationOn />}
          value={store.storeLocation || "N/A"}
        />

        {/* PHONE */}
        <StoreInfoRow
          icon={<MdPhone />}
          value={store.contactNumber || "N/A"}
        />

        {/* EMAIL */}
        <StoreInfoRow
          icon={<MdEmail />}
          value={store.email || "N/A"}
        />
      </div>
    </button>
  );
};

/* STORE INFO ROW */

const StoreInfoRow = ({ icon, value }) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {React.cloneElement(icon, {
          size: 18,
        })}
      </span>

      <p className="min-w-0 truncate text-sm font-medium text-gray-700">
        {value}
      </p>
    </div>
  );
};

export default ViewAllStores;