import React, { useContext, useEffect, useState } from "react";
import {
  MdStore,
  MdSearch,
  MdDelete,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdClose,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const RemoveStores = () => {
  const { backendUrl } = useContext(AppContent);

  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [removing, setRemoving] = useState(false);

  const LIMIT = 6;

  const showAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const fetchStores = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/admin/get-all-stores?page=${page}&limit=${LIMIT}`,
      );

      if (data.success) {
        const incoming = Array.isArray(data.stores) ? data.stores.flat() : [];
        setStores((previous) => {
          const merged = [...previous, ...incoming];
          return merged.filter(
            (store, index, all) =>
              index === all.findIndex((item) => item.storeId === store.storeId),
          );
        });
        setHasMore(Boolean(data.hasMore));
        setCount(data.count || 0);
        setPage((previous) => previous + 1);
      } else {
        showAlert(data.message || "Unable to fetch stores.", "error");
      }
    } catch (error) {
      console.error("Fetch Stores Error:", error);
      showAlert("Error fetching stores. Please try again.", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    // Fetch the first page on mount.
  }, []);

  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      setFilteredStores(stores);
      return;
    }
    setFilteredStores(
      stores.filter((store) => {
        const id = store.storeId?.toLowerCase() || "";
        const name = store.name?.toLowerCase() || "";
        return id.includes(term) || name.includes(term);
      }),
    );
  }, [search, stores]);

  const openRemovalModal = (store) => {
    setSelectedStore(store);
    setModalVisible(true);
  };

  const closeRemovalModal = () => {
    if (removing) return;
    setModalVisible(false);
    setSelectedStore(null);
  };

  const confirmRemoval = async () => {
    if (!selectedStore || removing) return;

    setRemoving(true);
    try {
      const response = await axios.delete(
        `${backendUrl}/auth/admin/delete-store/${selectedStore.storeId}`,
      );

      if (!response.data.success) {
        showAlert(response.data.message || "Unable to remove this store.", "error");
        return;
      }

      setStores((previous) =>
        previous.filter((store) => store.storeId !== selectedStore.storeId),
      );
      setCount((previous) => Math.max(0, previous - 1));
      setModalVisible(false);
      setSelectedStore(null);
      showAlert("Store removed successfully.", "success");
    } catch (error) {
      console.error("Remove Store Error:", error);
      showAlert(
        error.response?.data?.message || "Error removing store. Please try again.",
        "error",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mt-19 px-4 py-3 sm:px-6 lg:px-8 mx-12">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <MdDelete size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Remove Stores</h1>
              <p className="text-sm text-gray-500">
                Review registered stores and remove a store when necessary
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MdStore size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Stores</p>
              <p className="text-2xl font-black text-blue-600">{count}</p>
            </div>
          </div>

          <div className="flex min-h-[80px] items-center rounded-2xl bg-indigo-50 px-4">
            <MdSearch size={23} className="shrink-0 text-blue-600" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Store ID or Name"
              aria-label="Search stores by ID or name"
              className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
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
              <MdStore size={60} className="text-gray-500" />
            </div>
            <p className="text-center text-xl font-medium text-gray-500">
              {search ? "No Stores Found" : "No stores available to remove"}
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
                <article
                  key={store.storeId ? `${store.storeId}-${index}` : index}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <MdStore size={23} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-gray-800">
                          {store.name || "N/A"}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
                          ID: {store.storeId || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span className="ml-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      Removable
                    </span>
                  </div>

                  <div className="mb-4 space-y-2.5">
                    <StoreInfoRow icon={<MdLocationOn />} value={store.storeLocation || "N/A"} />
                    <StoreInfoRow icon={<MdPhone />} value={store.contactNumber || "N/A"} />
                    <StoreInfoRow icon={<MdEmail />} value={store.email || "N/A"} />
                  </div>

                  <button
                    type="button"
                    onClick={() => openRemovalModal(store)}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                  >
                    <MdDelete size={19} />
                    Remove Store
                  </button>
                </article>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={fetchStores}
                  disabled={loading}
                  className={`flex h-10 min-w-32 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}

            {!hasMore && stores.length > 0 && (
              <p className="py-6 text-center text-xs text-gray-400">
                No more stores to load
              </p>
            )}
            {search && (
              <p className="mt-3 text-center text-xs text-gray-400">
                Showing {filteredStores.length} matching {filteredStores.length === 1 ? "store" : "stores"}
              </p>
            )}
          </>
        )}
      </main>

      {modalVisible && selectedStore && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRemovalModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-store-title"
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                  <MdDelete size={24} className="text-red-600" />
                </div>
                <h2 id="remove-store-title" className="text-xl font-bold text-gray-800">
                  Confirm Store Deletion
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to remove {selectedStore.name || "this store"}?
                </p>
              </div>
              <button
                type="button"
                onClick={closeRemovalModal}
                disabled={removing}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <MdClose size={21} />
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-700">Store to be removed</p>
              <p className="mt-1 text-sm text-red-700">
                {selectedStore.name || "N/A"} <span className="text-red-500">({selectedStore.storeId || "N/A"})</span>
              </p>
              <p className="mt-1 text-xs text-red-600">This action cannot be undone.</p>
            </div>

            <button
              type="button"
              onClick={confirmRemoval}
              disabled={removing}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Removing Store...
                </>
              ) : (
                <><MdDelete size={19} /> Yes, Remove Store</>
              )}
            </button>
            <button
              type="button"
              onClick={closeRemovalModal}
              disabled={removing}
              className="mt-2 h-10 w-full cursor-pointer rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {alertVisible && (
        <div className="fixed right-4 top-4 z-[400] w-[calc(100%-2rem)] max-w-sm" role="status" aria-live="polite">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${alertType === "success" ? "bg-green-500" : alertType === "error" ? "bg-red-500" : "bg-blue-500"}`} />
            <p className="flex-1 text-sm font-medium text-gray-800">{alertMessage}</p>
            <button
              type="button"
              onClick={() => setAlertVisible(false)}
              aria-label="Dismiss alert"
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

const StoreInfoRow = ({ icon, value }) => (
  <div className="flex min-w-0 items-center gap-2">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      {React.cloneElement(icon, { size: 18 })}
    </span>
    <p className="min-w-0 truncate text-sm font-medium text-gray-700" title={value}>
      {value}
    </p>
  </div>
);

export default RemoveStores;
