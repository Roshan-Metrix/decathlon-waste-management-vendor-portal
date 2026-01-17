import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import NavBar from "../components/NavBar";
import { FileDown } from "lucide-react";
import { StoreTransactionSkeleton } from "../../utils/Skeleton";
import { formatDate } from "../../lib/Helper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { Hourglass } from "react-loader-spinner";

const PAGE_SIZES = [6, 10, 20];

const StoreRelatedTransactions = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const { storeId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchManager, setSearchManager] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [exportLoader, setExportLoader] = useState(false);

  /*  FETCH DATA  */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/transactions-particular-store/${storeId}`,
      );
      if (data.success) setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /*  DATE PRESETS  */
  const applyPreset = (preset) => {
    const today = new Date();
    const start = new Date();

    switch (preset) {
      case "today":
        setFromDate(today.toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        break;

      case "last7":
        start.setDate(today.getDate() - 6);
        setFromDate(start.toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        break;

      case "last30":
        start.setDate(today.getDate() - 29);
        setFromDate(start.toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        break;

      case "thisMonth":
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(firstDay.toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        break;

      case "clear":
        setFromDate("");
        setToDate("");
        break;

      default:
        break;
    }
  };

  /*  FILTER + SORT  */
  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    if (searchManager) {
      data = data.filter((t) =>
        t.managerName?.toLowerCase().includes(searchManager.toLowerCase()),
      );
    }

    if (fromDate || toDate) {
      data = data.filter((t) => {
        const txnDate = new Date(t.createdAt);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);

        if (from && to) return txnDate >= from && txnDate <= to;
        if (from) return txnDate >= from;
        if (to) return txnDate <= to;
        return true;
      });
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
  }, [transactions, searchManager, sortOption, fromDate, toDate]);

  /*  PAGINATION  */
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const exportPDF = async () => {
    try {
      setExportLoader(true);
      if (!fromDate || !toDate) {
        toast.error("Please select From and To date");
        setExportLoader(false);
        return;
      }

      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/transactions-particular-store/${storeId}/${fromDate}/${toDate}`,
      );

      if (data.success) {
        setExportLoader(false);
      }

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      let cursorY = 15;

      // ---- GRAND TOTAL ----
      const grandTotalWeight = data.items.reduce(
        (sum, item) => sum + item.weight,
        0,
      );

      // ---- HEADER (VENDOR NAME) ----
      doc.setFontSize(20);
      doc.setTextColor(30, 64, 175); // dark blue
      doc.setFont("helvetica", "bold");
      doc.text(data.vendorName.toUpperCase(), pageWidth / 2, cursorY, {
        align: "center",
      });

      cursorY += 8;

      // ---- STORE DETAILS ----
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Store: ${data.storeName}, ${data.storeLocation}`,
        pageWidth / 2,
        cursorY,
        { align: "center" },
      );

      cursorY += 6;

      // ---- DATE RANGE ----
      doc.setFontSize(10);
      doc.text(`Date: ${fromDate} to ${toDate}`, pageWidth / 2, cursorY, {
        align: "center",
      });

      cursorY += 6;
      doc.line(10, cursorY, pageWidth - 10, cursorY);
      cursorY += 8;

      // ---- TABLE ----
      autoTable(doc, {
        startY: cursorY,
        head: [["SN", "Material", "Items", "Total Weight (kg)"]],
        body: data.items.map((item, index) => [
          index + 1,
          item.materialType,
          item.totalItems,
          item.weight,
        ]),
        foot: [
          [
            {
              content: "Grand Total",
              colSpan: 3,
              styles: { halign: "right", fontStyle: "bold" },
            },
            `${grandTotalWeight.toFixed(2)} kg`,
          ],
        ],
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [238, 242, 255],
          textColor: [30, 64, 175],
          fontStyle: "bold",
        },
      });

      doc.save(
        `${data.storeName.replace(/\s/g, "_")}_${fromDate}_${toDate}.pdf`,
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar />

      <div className="w-full rounded-lg p-6 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-primaryColor mb-4">
            {loading
              ? "Store Transactions"
              : transactions[0]?.storeName || "Store Transactions"}
          </h1>
          {/*  FILTER BAR  */}
          <div className="bg-white rounded-xl p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                placeholder="Manager Name"
                value={searchManager}
                onChange={(e) => setSearchManager(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
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

            <div className="flex flex-wrap justify-between">
              <div className="flex gap-2">
                {[
                  ["Today", "today"],
                  ["Last 7 Days", "last7"],
                  ["Last 30 Days", "last30"],
                  ["This Month", "thisMonth"],
                  ["Clear", "clear"],
                ].map(([label, value]) => (
                  <button
                    key={value}
                    onClick={() => applyPreset(value)}
                    className="px-3 py-1 text-sm border rounded-full hover:bg-primaryColor hover:text-white transition cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={exportPDF}
              >
                {exportLoader ? (
                  <span className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 cursor-pointer">
                  <Hourglass
                    visible={true}
                    height="20"
                    width="20"
                    ariaLabel="hourglass-loading"
                    colors={["#fff", "#fff"]}
                  /></span>
                ) : (
                   <span className="flex items-center gap-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 px-4 py-2 cursor-pointer"><FileDown size={16} /> Export PDF</span>
                )}
              </button>
            </div>
          </div>

          {/*  CONTENT  */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: pageSize }).map((_, i) => (
                <StoreTransactionSkeleton key={i} />
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

          {/*  PAGINATION  */}
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
