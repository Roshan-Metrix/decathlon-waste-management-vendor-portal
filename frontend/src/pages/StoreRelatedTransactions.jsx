import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import NavBar from "../components/NavBar";

const PAGE_SIZES = [6, 10, 20];

/*  SKELETON CARD  */
const TransactionSkeleton = () => (
  <div className="bg-white rounded-xl p-5 shadow-md border animate-pulse">
    <div className="flex justify-between items-center border-b pb-3 mb-3">
      <div className="space-y-2">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-28 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-5 bg-gray-200 rounded-full" />
    </div>

    <div className="space-y-3">
      <div className="h-3 w-36 bg-gray-200 rounded" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

const StoreRelatedTransactions = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const { storeId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchStore, setSearchStore] = useState("");
  const [searchManager, setSearchManager] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [filterDate, setFilterDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  /*  FETCH DATA  */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/transactions-particular-store/${storeId}`
      );

      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /*  HELPERS  */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*  FILTER + SORT  */
  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    if (searchStore) {
      data = data.filter((t) =>
        t.storeName?.toLowerCase().includes(searchStore.toLowerCase())
      );
    }

    if (searchManager) {
      data = data.filter((t) =>
        t.managerName?.toLowerCase().includes(searchManager.toLowerCase())
      );
    }

    if (filterDate) {
      data = data.filter(
        (t) => new Date(t.createdAt).toISOString().split("T")[0] === filterDate
      );
    }

    switch (sortOption) {
      case "oldest":
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "itemsLow":
        data.sort((a, b) => a.totalItems - b.totalItems);
        break;
      case "itemsHigh":
        data.sort((a, b) => b.totalItems - a.totalItems);
        break;
      default:
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setCurrentPage(1);
    return data;
  }, [transactions, searchStore, searchManager, sortOption, filterDate]);

  /*  PAGINATION  */
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar />
      <div className="w-full rounded-lg shadow-md p-6 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primaryColor">
              {transactions.length > 0
                ? `${transactions[0]?.storeName}`
                : "Transactions"}
            </h1>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              placeholder="Manager Name"
              value={searchManager}
              onChange={(e) => setSearchManager(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="latest">Latest → Oldest</option>
              <option value="oldest">Oldest → Latest</option>
              <option value="itemsLow">Items Low → High</option>
              <option value="itemsHigh">Items High → Low</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: pageSize }).map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </div>
          ) : !paginatedData.length ? (
            <p className="text-center text-gray-500 mt-20">
              No transactions found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedData.map((txn) => (
                <div
                  key={txn.transactionId}
                  className="bg-white rounded-xl p-5 shadow-md border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center border-b pb-3 mb-3">
                    <div>
                      <p className="font-semibold text-sm text-primaryColor">
                        ID: {txn.transactionId}
                      </p>
                      <p className="text-xs text-gray-500">{txn.storeName}</p>
                    </div>

                    <FiChevronRight
                      size={22}
                      className="cursor-pointer text-primaryColor hover:translate-x-1 transition"
                      onClick={() =>
                        navigate(`/dashboard/transactions/${txn.transactionId}`)
                      }
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <b>Manager:</b> {txn.managerName}
                    </p>
                    <p>
                      <b>Total Wastes:</b> {txn.totalItems}
                    </p>
                    <p>
                      <b>Date:</b> {formatDate(txn.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && !loading && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreRelatedTransactions;
