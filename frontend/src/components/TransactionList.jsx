import React, { useContext, useMemo, useState } from "react";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiDownload } from "react-icons/fi";
import { saveAs } from "file-saver";


const PAGE_SIZES = [6, 10, 20];

const TransactionList = () => {
  const { transactionData } = useContext(AppContent);
  const navigate = useNavigate();

  /* -------------------- FILTER STATES -------------------- */
  const [searchStore, setSearchStore] = useState("");
  const [searchManager, setSearchManager] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [filterDate, setFilterDate] = useState("");

  /* -------------------- PAGINATION -------------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  /* -------------------- DATE FORMAT -------------------- */
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

  /* -------------------- FILTER + SORT -------------------- */
  const filteredTransactions = useMemo(() => {
    if (!transactionData?.transactions) return [];

    let data = [...transactionData.transactions];

    if (searchStore) {
      data = data.filter((t) =>
        t.store?.storeName?.toLowerCase().includes(searchStore.toLowerCase())
      );
    }

    if (searchManager) {
      data = data.filter((t) =>
        t.managerName?.toLowerCase().includes(searchManager.toLowerCase())
      );
    }

    if (filterDate) {
      data = data.filter(
        (t) =>
          new Date(t.createdAt).toISOString().split("T")[0] === filterDate
      );
    }

    switch (sortOption) {
      case "oldest":
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "itemsLow":
        data.sort((a, b) => a.items.length - b.items.length);
        break;
      case "itemsHigh":
        data.sort((a, b) => b.items.length - a.items.length);
        break;
      default:
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setCurrentPage(1);
    return data;
  }, [transactionData, searchStore, searchManager, sortOption, filterDate]);

  /* -------------------- PAGINATION LOGIC -------------------- */
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* -------------------- EXPORT CSV -------------------- */
  const exportCSV = (data, filename) => {
    const header = [
      "Transaction ID",
      "Store Name",
      "Manager Name",
      "Total Items",
      "Date",
    ];

    const rows = data.map((t) => [
      t.transactionId,
      t.store?.storeName,
      t.managerName,
      t.items.length,
      formatDate(t.createdAt),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  return (
    <div className="w-full bg-gray-100 mt-5 rounded-lg shadow-md p-6">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primaryColor">
            Store Transactions
          </h1>

          <button
            onClick={() =>
              exportCSV(filteredTransactions, "transactions_export.csv")
            }
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600"
          >
            <FiDownload /> Export All
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            placeholder="Store Name"
            value={searchStore}
            onChange={(e) => setSearchStore(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
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

        {/* CARDS */}
        {!paginatedData.length ? (
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
                    <p className="text-xs text-gray-500">
                      {txn.store?.storeName}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <FiDownload
                      className="cursor-pointer text-green-600"
                      onClick={() =>
                        exportCSV([txn], `transaction_${txn.transactionId}.csv`)
                      }
                    />
                    <FiChevronRight
                      className="cursor-pointer text-primaryColor"
                      size={22}
                      onClick={() =>
                        navigate(`/transactions/${txn.transactionId}`, {
                          state: txn,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p><b>Manager:</b> {txn.managerName}</p>
                  <p><b>Total Waste:</b> {txn.items.length}</p>
                  <p><b>Date:</b> {formatDate(txn.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
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
  );
};

export default TransactionList;
