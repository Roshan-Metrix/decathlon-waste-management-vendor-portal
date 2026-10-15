import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  MdPeople,
  MdSearch,
  MdAdminPanelSettings,
  MdBlock,
  MdCheckCircle,
  MdClose,
  MdRefresh,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const RestrictAdminAccess = () => {
  const { backendUrl } = useContext(AppContent);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyAdminId, setBusyAdminId] = useState(null);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "info") => setAlert({ message, type });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/admin/get-all-admins`,
      );

      if (data.success) {
        setAdmins(Array.isArray(data.admins) ? data.admins : []);
      } else {
        showAlert(data.message || "Unable to fetch admins.", "error");
      }
    } catch (error) {
      console.error("Fetch Admins Error:", error);
      showAlert(
        error.response?.data?.message || "Error fetching admins. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAdmins = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return admins;
    return admins.filter((admin) => {
      const name = admin.name?.toLowerCase() || "";
      const email = admin.email?.toLowerCase() || "";
      return name.includes(term) || email.includes(term);
    });
  }, [admins, search]);

  const activeCount = admins.filter((admin) => admin.isApproved).length;
  const restrictedCount = admins.filter((admin) => !admin.isApproved).length;

  const requestToggle = (admin) => setConfirmAdmin(admin);

  const closeConfirm = () => {
    if (busyAdminId) return;
    setConfirmAdmin(null);
  };

  const confirmToggle = async () => {
    if (!confirmAdmin?._id || busyAdminId) return;

    const admin = confirmAdmin;
    setBusyAdminId(admin._id);

    try {
      const { data } = await axios.patch(
        `${backendUrl}/auth/admin/restrict-admin/${admin._id}`,
      );

      if (data.success) {
        setConfirmAdmin(null);
        showAlert(
          data.message ||
            (admin.isApproved
              ? "Admin access has been restricted."
              : "Admin access has been activated."),
          "success",
        );
        await fetchAdmins();
      } else {
        showAlert(data.message || "Unable to update admin access.", "error");
      }
    } catch (error) {
      console.error("Toggle Admin Error:", error);
      showAlert(
        error.response?.data?.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setBusyAdminId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mx-12 mt-19 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <MdAdminPanelSettings size={29} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Restrict Admin Access
              </h1>
              <p className="text-sm text-gray-500">
                Manage administrator access and account status
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAdmins}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto cursor-pointer"
          >
            <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {alert && (
          <div
            role="status"
            className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
              alert.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : alert.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            <span>{alert.message}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setAlert(null)}
              className="shrink-0 rounded p-1 hover:bg-black/5"
            >
              <MdClose size={18} />
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[280px_280px_1fr]">
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MdPeople size={27} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Active Admins</p>
              <p className="text-2xl font-black text-blue-600">{activeCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MdBlock size={25} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Restricted Admins</p>
              <p className="text-2xl font-black text-red-600">{restrictedCount}</p>
            </div>
          </div>

          <div className="flex min-h-[80px] items-center rounded-2xl bg-indigo-50 px-4">
            <MdSearch size={23} className="shrink-0 text-blue-600" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by admin name or email"
              aria-label="Search admins by name or email"
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
        ) : filteredAdmins.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <MdPeople size={48} className="text-gray-400" />
            </div>
            <p className="text-center text-xl font-medium text-gray-500">
              No Admins Found
            </p>
            <p className="mt-1 text-center text-sm text-gray-400">
              {search
                ? "Try searching with another name or email."
                : "There are no admin accounts to display."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAdmins.map((admin, index) => {
                const approved = Boolean(admin.isApproved);
                const isBusy = busyAdminId === admin._id;

                return (
                  <article
                    key={admin._id || admin.email || `admin-${index}`}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            approved ? "bg-blue-50" : "bg-red-50"
                          }`}
                        >
                          <MdAdminPanelSettings
                            size={26}
                            className={approved ? "text-blue-600" : "text-red-600"}
                          />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-bold text-gray-800">
                            {admin.name || "Unnamed Admin"}
                          </h2>
                          <p className="mt-1 break-all text-sm text-gray-500">
                            {admin.email || "No email available"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          approved
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {approved ? "Active" : "Restricted"}
                      </span>
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => requestToggle(admin)}
                        disabled={Boolean(busyAdminId)}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          approved
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {approved ? <MdBlock size={18} /> : <MdCheckCircle size={18} />}
                        {approved ? "Restrict Access" : "Activate Access"}
                      </button>
                    </div>
                    {isBusy && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        Updating access…
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Showing {filteredAdmins.length} of {admins.length} admins
            </p>
          </>
        )}
      </main>

      {confirmAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyAdminId) {
              closeConfirm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-admin-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                confirmAdmin.isApproved ? "bg-red-50" : "bg-blue-50"
              }`}
            >
              {confirmAdmin.isApproved ? (
                <MdBlock size={28} className="text-red-600" />
              ) : (
                <MdCheckCircle size={28} className="text-blue-600" />
              )}
            </div>
            <h2
              id="confirm-admin-title"
              className="text-center text-lg font-bold text-gray-800"
            >
              {confirmAdmin.isApproved ? "Restrict Admin?" : "Activate Admin?"}
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              {confirmAdmin.isApproved
                ? `Are you sure you want to restrict access for ${confirmAdmin.name || "this admin"}?`
                : `Do you want to activate access for ${confirmAdmin.name || "this admin"} again?`}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={Boolean(busyAdminId)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggle}
                disabled={Boolean(busyAdminId)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  confirmAdmin.isApproved
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {busyAdminId ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : null}
                {confirmAdmin.isApproved ? "Restrict Admin" : "Activate Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestrictAdminAccess;
