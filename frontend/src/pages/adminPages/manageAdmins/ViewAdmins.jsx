import React, { useContext, useEffect, useState } from "react";
import {
  MdPeople,
  MdPerson,
  MdEmail,
  MdAdminPanelSettings,
  MdSearch,
} from "react-icons/md";
import axios from "axios";
import NavBar from "../../../components/NavBar";
import { AppContent } from "../../../context/AppContext";

const ViewOtherAdmins = () => {
  const { backendUrl } = useContext(AppContent);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/auth/admin/get-all-admins`,
        );

        if (data.success) {
          setAdmins(Array.isArray(data.admins) ? data.admins : []);
          setAlertMessage("");
        } else {
          setAlertType("error");
          setAlertMessage(data.message || "Unable to fetch admins.");
        }
      } catch (error) {
        console.error("Fetch Admins Error:", error);
        setAlertType("error");
        setAlertMessage(
          error.response?.data?.message || "Error fetching admins. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [backendUrl]);

  const term = search.toLowerCase().trim();
  const filteredAdmins = admins.filter((admin) => {
    const name = admin.name?.toLowerCase() || "";
    const email = admin.email?.toLowerCase() || "";
    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800">
      <NavBar />

      <main className="mx-12 mt-19 px-4 py-3 sm:px-6 lg:px-8">
        {/* PAGE TITLE */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <MdAdminPanelSettings size={29} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Other Admins</h1>
              <p className="text-sm text-gray-500">
                View all registered administrators and their contact details
              </p>
            </div>
          </div>
        </div>

        {/* TOTAL COUNT AND SEARCH */}
        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-100 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MdPeople size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Admins</p>
              <p className="text-2xl font-black text-blue-600">{admins.length}</p>
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

        {alertMessage && !loading && (
          <div
            role="alert"
            className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              alertType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            <span>{alertMessage}</span>
            <button
              type="button"
              onClick={() => setAlertMessage("")}
              aria-label="Dismiss alert"
              className="ml-3 text-lg font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <MdPeople size={60} className="text-gray-500" />
            </div>
            <p className="text-center text-xl font-medium text-gray-500">
              {search ? "No Matching Admins Found" : "No Admins Found"}
            </p>
            {search && (
              <p className="mt-1 text-center text-sm text-gray-400">
                Try searching with another name or email address.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAdmins.map((admin, index) => (
                <div
                  key={admin._id || admin.id || `${admin.email || "admin"}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <MdPerson size={26} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-gray-800">
                          {admin.name || "Unnamed Admin"}
                        </h2>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          <MdAdminPanelSettings size={14} /> Administrator
                        </span>
                      </div>
                    </div>
                    <MdPeople size={23} className="shrink-0 text-blue-600" />
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MdEmail size={19} className="mt-0.5 shrink-0 text-blue-500" />
                      <span className="break-all">{admin.email || "No email available"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {search && (
              <p className="mt-3 text-center text-xs text-gray-400">
                Showing {filteredAdmins.length} matching {filteredAdmins.length === 1 ? "admin" : "admins"}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ViewOtherAdmins;
