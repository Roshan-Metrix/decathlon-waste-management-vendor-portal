import React, { useContext, useEffect, useState } from "react";
import {
  MdPeople,
  MdPerson,
  MdEmail,
  MdStore,
  MdConfirmationNumber,
  MdLocationOn,
  MdSearch,
  MdDelete,
  MdClose,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const RemoveManagers = () => {
  const { backendUrl } = useContext(AppContent);

  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [removing, setRemoving] = useState(false);

  const showAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const fetchManagers = async () => {
    setInitialLoading(true);

    try {
      const { data } = await axios.get(`${backendUrl}/auth/get-all-managers`);

      if (data.success) {
        const managerList = Array.isArray(data.managers) ? data.managers : [];
        setManagers(managerList);
      } else {
        showAlert(data.message || "Unable to fetch managers.", "error");
      }
    } catch (error) {
      console.error("Fetch Managers Error:", error);
      showAlert(
        error.response?.data?.message ||
          "Error fetching managers. Please try again.",
        "error",
      );
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
    // Fetch managers when the screen mounts.
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

  const openRemovalModal = (manager) => {
    setSelectedManager(manager);
    setModalVisible(true);
  };

  const closeRemovalModal = () => {
    if (removing) return;
    setModalVisible(false);
    setSelectedManager(null);
  };

  const confirmRemoval = async () => {
    if (!selectedManager?._id || removing) return;

    setRemoving(true);

    try {
      const response = await axios.delete(
        `${backendUrl}/auth/admin/delete-manager/${selectedManager._id}`,
      );

      if (!response.data.success) {
        showAlert(
          response.data.message || "Unable to remove this manager.",
          "error",
        );
        return;
      }

      setManagers((previous) =>
        previous.filter((manager) => manager._id !== selectedManager._id),
      );
      setModalVisible(false);
      setSelectedManager(null);
      showAlert("Manager removed successfully.", "success");
    } catch (error) {
      console.error("Remove Manager Error:", error);
      showAlert(
        error.response?.data?.message ||
          "Error removing manager. Please try again.",
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
        {/* PAGE TITLE */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <MdDelete size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Remove Managers
              </h1>
              <p className="text-sm text-gray-500">
                Review registered managers and remove a manager when necessary
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
          <div className="flex min-h-[80px] items-center rounded-2xl bg-indigo-50 px-4">
            <MdSearch size={23} className="shrink-0 text-blue-600" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by manager name, email, store, or location"
              aria-label="Search managers"
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
        ) : filteredManagers.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <MdPeople size={60} className="text-gray-500" />
            </div>
            <p className="text-center text-xl font-medium text-gray-500">
              {search ? "No Managers Found" : "No managers available to remove"}
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
                <article
                  key={
                    manager._id ||
                    manager.id ||
                    `${manager.email || "manager"}-${index}`
                  }
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <MdPerson size={23} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="break-words text-base font-bold text-gray-800">
                          {manager.name || "Unnamed Manager"}
                        </p>
                        <p className="mt-0.5 break-all text-xs font-medium text-gray-500">
                          {manager.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                    <span className="ml-2 shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      Removable
                    </span>
                  </div>

                  <div className="mb-4 space-y-2.5">
                    <ManagerInfoRow
                      icon={<MdEmail />}
                      label="Email"
                      value={manager.email || "N/A"}
                    />
                    <ManagerInfoRow
                      icon={<MdStore />}
                      label="Store ID"
                      value={manager.storeId || "N/A"}
                    />
                    <ManagerInfoRow
                      icon={<MdConfirmationNumber />}
                      label="Store Name"
                      value={manager.storeName || "N/A"}
                    />
                    <ManagerInfoRow
                      icon={<MdLocationOn />}
                      label="Store Location"
                      value={manager.storeLocation || "N/A"}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => openRemovalModal(manager)}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                  >
                    <MdDelete size={19} />
                    Remove Manager
                  </button>
                </article>
              ))}
            </div>

            {search && (
              <p className="mt-3 text-center text-xs text-gray-400">
                Showing {filteredManagers.length} matching{" "}
                {filteredManagers.length === 1 ? "manager" : "managers"}
              </p>
            )}
          </>
        )}
      </main>

      {/* CONFIRMATION MODAL — no admin credential prompt */}
      {modalVisible && selectedManager && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRemovalModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-manager-title"
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                  <MdDelete size={24} className="text-red-600" />
                </div>
                <h2
                  id="remove-manager-title"
                  className="text-xl font-bold text-gray-800"
                >
                  Confirm Manager Removal
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to remove{" "}
                  {selectedManager.name || "this manager"}?
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
              <p className="text-sm font-semibold text-red-700">
                Manager to be removed
              </p>
              <p className="mt-1 break-words text-sm text-red-700">
                {selectedManager.name || "N/A"}
              </p>
              <p className="mt-1 break-all text-xs text-red-600">
                {selectedManager.email || "No email provided"}
              </p>
              <p className="mt-1 text-xs text-red-600">
                This action cannot be undone.
              </p>
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
                  Removing Manager...
                </>
              ) : (
                <>
                  <MdDelete size={19} />
                  Yes, Remove Manager
                </>
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

      {/* ALERT */}
      {alertVisible && (
        <div
          className="fixed right-4 top-4 z-[400] w-[calc(100%-2rem)] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div
              className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                alertType === "success"
                  ? "bg-green-500"
                  : alertType === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
              }`}
            />
            <p className="flex-1 text-sm font-medium text-gray-800">
              {alertMessage}
            </p>
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

const ManagerInfoRow = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-2">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      {React.cloneElement(icon, { size: 18 })}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium text-gray-400">{label}</p>
      <p className="break-words text-sm font-medium text-gray-700" title={value}>
        {value}
      </p>
    </div>
  </div>
);

export default RemoveManagers;
