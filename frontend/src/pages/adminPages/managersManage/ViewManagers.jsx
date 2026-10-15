import React, { useContext, useEffect, useState } from "react";
import {
  MdPeople,
  MdPerson,
  MdEmail,
  MdStore,
  MdConfirmationNumber,
  MdLocationOn,
  MdSearch,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const ViewManagers = () => {
  const { backendUrl } = useContext(AppContent);

  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchManagers = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`${backendUrl}/auth/get-all-managers`);

      if (data.success) {
        const managerList = Array.isArray(data.managers) ? data.managers : [];
        setManagers(managerList);
      } else {
        setAlertMessage(data.message || "Unable to fetch managers.");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Fetch Managers Error:", error);
      setAlertMessage(
        error.response?.data?.message || "Error fetching managers!",
      );
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
    // Fetch managers when the screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      setFilteredManagers(managers);
      return;
    }

    setFilteredManagers(
      managers.filter((manager) => {
        const name = manager.name?.toLowerCase() || "";
        const email = manager.email?.toLowerCase() || "";
        const storeId = String(manager.storeId ?? "").toLowerCase();
        const storeName = manager.storeName?.toLowerCase() || "";
        const storeLocation = manager.storeLocation?.toLowerCase() || "";

        return (
          name.includes(term) ||
          email.includes(term) ||
          storeId.includes(term) ||
          storeName.includes(term) ||
          storeLocation.includes(term)
        );
      }),
    );
  }, [search, managers]);

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mx-12 mt-19 px-4 py-3 sm:px-6 lg:px-8">
        {/* PAGE TITLE */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <MdPeople size={28} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Managers List
              </h1>
              <p className="text-sm text-gray-500">
                View all registered managers and their assigned store details
              </p>
            </div>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
          {/* TOTAL COUNT */}
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MdPeople size={28} className="text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                Total Managers
              </p>
              <p className="text-2xl font-black text-blue-600">
                {filteredManagers.length}
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="flex h-full min-h-[80px] items-center rounded-2xl bg-indigo-50 px-4">
            <MdSearch size={23} className="shrink-0 text-blue-600" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by manager name, store, email, or location"
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

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <MdPeople size={60} className="text-gray-500" />
            </div>

            <p className="text-center text-xl font-medium text-gray-500">
              No Managers Found
            </p>

            {search && (
              <p className="mt-1 text-center text-sm text-gray-400">
                Try searching with another name, email, store ID, or location.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* MANAGER CARDS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredManagers.map((manager, index) => (
                <ManagerCard
                  key={
                    manager._id ||
                    manager.id ||
                    `${manager.email || "manager"}-${index}`
                  }
                  manager={manager}
                />
              ))}
            </div>

            {search && (
              <p className="mt-3 text-center text-xs text-gray-400">
                Showing {filteredManagers.length} matching
                {filteredManagers.length === 1 ? " manager" : " managers"}
              </p>
            )}
          </>
        )}
      </main>

      {/* ALERT */}
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
              aria-label="Close alert"
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

const ManagerCard = ({ manager }) => {
  return (
    <div className="group w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-[2px] hover:border-blue-200 hover:shadow-md">
      {/* MANAGER HEADER */}
      <div className="mb-3 flex items-center gap-3 border-b border-gray-100 pb-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
          <MdPerson size={23} className="text-blue-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-semibold text-gray-800">
            {manager.name || "Unnamed Manager"}
          </p>
          <p className="mt-1 break-all text-sm text-gray-500">
            {manager.email || "No email provided"}
          </p>
        </div>
      </div>

      {/* MANAGER DETAILS */}
      <div className="space-y-3">
        <ManagerDetail
          icon={MdStore}
          label="Store ID"
          value={manager.storeId}
        />
        <ManagerDetail
          icon={MdConfirmationNumber}
          label="Store Name"
          value={manager.storeName}
        />
        <ManagerDetail
          icon={MdLocationOn}
          label="Store Location"
          value={manager.storeLocation}
        />
      </div>
    </div>
  );
};

const ManagerDetail = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50">
      <Icon size={19} className="text-blue-600" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-gray-800">
        {value || "Not available"}
      </p>
    </div>
  </div>
);

export default ViewManagers;
