import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import {
  ChevronRight,
  Search,
  Download,
  Calendar,
  Filter,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Receipt,
  Trash2,
  FileText,
  FileDown,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  Sparkles,
  MapPin,
  Store,
  User,
  ArrowLeft,
} from "lucide-react";
import { AppContent } from "../../context/AppContext";
import NavBar from "../../components/NavBar";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/Helper";
import { StoreTransactionSkeleton } from "../../utils/Skeleton";

const PAGE_SIZES = [6, 10, 20];

const AdminStoreTransactions = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const { storeId } = useParams();

  // Financial summary state (Net, Total / Revenue, Payable, Receivable, Count)
  const [summary, setSummary] = useState({
    transactionCount: 0,
    total: 0,
    revenue: 0,
    receivable: 0,
    payable: 0,
    net: 0,
  });
  const [summaryDateRange, setSummaryDateRange] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Store information
  const [storeName, setStoreName] = useState("");
  const [storeInfo, setStoreInfo] = useState({});

  // Transactions list state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & sorting
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePreset, setActivePreset] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [hasMore, setHasMore] = useState(false);

  // Export states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalStatus, setExportModalStatus] = useState("ready");
  const [detailedExporting, setDetailedExporting] = useState(false);
  const [csvExporting, setCsvExporting] = useState(false);
  const [summaryExporting, setSummaryExporting] = useState(false);

  // Helper to format Date to YYYY-MM-DD
  const formatDateToISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /* 
     FETCH STORE FINANCIAL SUMMARY (Total, Revenue, Net, Payable, Receivable)
  */
  const fetchStoreSummary = useCallback(
    async (from = "", to = "") => {
      try {
        setSummaryLoading(true);

        let url = `${backendUrl}/transaction/transaction-store-summary?storeId=${storeId}`;
        if (from && to) {
          url += `&from=${from}&to=${to}`;
        }

        const { data } = await axios.get(url, { withCredentials: true });

        if (data?.success || data?.summary || data?.total !== undefined) {
          const s = data.summary || data;
          setSummary({
            transactionCount: s.transactionCount ?? s.totalTransactions ?? 0,
            total: s.total ?? s.revenue ?? 0,
            revenue: s.revenue ?? s.total ?? 0,
            receivable: s.receivable ?? 0,
            payable: s.payable ?? 0,
            net: s.net ?? 0,
          });
          setSummaryDateRange(data.dateRange || (from && to ? { from, to } : null));

          if (data.storeName) setStoreName(data.storeName);
          if (data.store?.storeName) setStoreName(data.store.storeName);
          if (data.store) setStoreInfo((prev) => ({ ...prev, ...data.store }));
        }
      } catch (err) {
        console.error("Fetch store summary error:", err);
        const msg =
          err.response?.data?.message || "Failed to fetch store financial summary.";
        toast.error(msg);
      } finally {
        setSummaryLoading(false);
      }
    },
    [backendUrl, storeId]
  );

  /* 
     FETCH STORE TRANSACTIONS LIST
     /transaction/store-total-transactions/:storeId?page=...&limit=...
  */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/transaction/store-total-transactions/${storeId}?page=${currentPage}&limit=${pageSize}`,
        { withCredentials: true }
      );
      if (data?.success) {
        setTransactions(data.transactions || []);
        if (data.store) {
          setStoreInfo((prev) => ({ ...prev, ...data.store }));
          if (data.store.storeName) setStoreName(data.store.storeName);
        }
        setHasMore(data.hasMore ?? false);
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, storeId, currentPage, pageSize]);

  // Initial load
  useEffect(() => {
    fetchStoreSummary();
  }, [fetchStoreSummary]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /* 
     DATE PRESETS HANDLER
  */
  const handleApplyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const start = new Date();

    if (preset === "all") {
      setFromDate("");
      setToDate("");
      fetchStoreSummary();
      return;
    }

    if (preset === "today") {
      const todayStr = formatDateToISO(today);
      setFromDate(todayStr);
      setToDate(todayStr);
      fetchStoreSummary(todayStr, todayStr);
      return;
    }

    if (preset === "last7") {
      start.setDate(today.getDate() - 6);
      const fromStr = formatDateToISO(start);
      const toStr = formatDateToISO(today);
      setFromDate(fromStr);
      setToDate(toStr);
      fetchStoreSummary(fromStr, toStr);
      return;
    }

    if (preset === "last30") {
      start.setDate(today.getDate() - 29);
      const fromStr = formatDateToISO(start);
      const toStr = formatDateToISO(today);
      setFromDate(fromStr);
      setToDate(toStr);
      fetchStoreSummary(fromStr, toStr);
      return;
    }

    if (preset === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const fromStr = formatDateToISO(firstDay);
      const toStr = formatDateToISO(today);
      setFromDate(fromStr);
      setToDate(toStr);
      fetchStoreSummary(fromStr, toStr);
      return;
    }
  };

  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();

    if (!fromDate || !toDate) {
      toast.error("Please select both 'From' and 'To' dates.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("'From' date cannot be later than 'To' date.");
      return;
    }

    setActivePreset("custom");
    fetchStoreSummary(fromDate, toDate);
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setActivePreset("all");
    fetchStoreSummary();
  };

  /* 
     FILTER & SORT TRANSACTIONS
  */
  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    if (search) {
      const q = search.toLowerCase().trim();
      data = data.filter(
        (t) =>
          (t.transactionId && String(t.transactionId).toLowerCase().includes(q)) ||
          (t.managerName && t.managerName.toLowerCase().includes(q))
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
        data.sort(
          (a, b) =>
            Number(a.item ?? a.totalItems ?? 0) -
            Number(b.item ?? b.totalItems ?? 0)
        );
        break;
      case "itemsHigh":
        data.sort(
          (a, b) =>
            Number(b.item ?? b.totalItems ?? 0) -
            Number(a.item ?? a.totalItems ?? 0)
        );
        break;
      default:
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return data;
  }, [transactions, search, sortOption, fromDate, toDate]);

  /* 
     EXPORT 1: DETAILED STORE REPORT PDF (Preserved from original AdminStoreTransactions)
     Hits: /transaction/get-store-filter-transactions/:storeId/:fromDate/:toDate
  */
  const exportPDF = async () => {
    try {
      if (!fromDate || !toDate) {
        toast.error("Please select 'From' and 'To' dates for detailed waste report.");
        return;
      }

      setDetailedExporting(true);

      const { data } = await axios.get(
        `${backendUrl}/transaction/get-store-filter-transactions/${storeId}/${fromDate}/${toDate}`,
        { withCredentials: true }
      );

      if (!data?.success || !Array.isArray(data?.items)) {
        toast.error("No detailed transaction records found for the selected dates.");
        return;
      }

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      let cursorY = 15;

      // ---- GRAND TOTAL ----
      const grandTotalWeight = data.items.reduce(
        (sum, item) => sum + Number(item.weight || 0),
        0
      );

      const grandTotalAmount = data.items.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0
      );

      // ---- HEADER (STORE NAME) ----
      doc.setFontSize(20);
      doc.setTextColor(30, 64, 175);
      doc.setFont("helvetica", "bold");
      doc.text(
        data.storeName?.toUpperCase() ||
        storeName?.toUpperCase() ||
        "STORE REPORT",
        pageWidth / 2,
        cursorY,
        {
          align: "center",
        }
      );

      cursorY += 6;

      // ---- STORE DETAILS ----
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.setFont("helvetica", "normal");
      doc.text(
        data.storeLocation ||
        storeInfo.storeLocation ||
        "",
        pageWidth / 2,
        cursorY,
        {
          align: "center",
        }
      );

      cursorY += 8;

      // ---- DATE RANGE ----
      doc.text(`Date: ${fromDate} to ${toDate}`, pageWidth / 2, cursorY, {
        align: "center",
      });

      cursorY += 6;

      doc.text(`Vendor: ${data.vendorName || "-"}`, pageWidth / 2, cursorY, {
        align: "center",
      });

      cursorY += 6;
      doc.line(10, cursorY, pageWidth - 10, cursorY);
      cursorY += 8;

      // ---- TABLE ----
      autoTable(doc, {
        startY: cursorY,
        head: [
          [
            "SN",
            "Material",
            "Items",
            "Weight (kg)",
            "Rate (Rs.)",
            "Amount (Rs.)",
          ],
        ],
        body: data.items.map((item, index) => [
          index + 1,
          item.materialType || "-",
          item.totalItems || 0,
          Number(item.weight || 0).toFixed(2),
          Number(item.rate || 0).toFixed(2),
          Number(item.totalAmount || 0).toFixed(2),
        ]),
        foot: [
          [
            {
              content: "Grand Total: ",
              colSpan: 3,
              styles: { halign: "right", fontStyle: "bold" },
            },
            `${grandTotalWeight.toFixed(2)} kg`,
            "",
            `Rs. ${grandTotalAmount.toFixed(2)}`,
          ],
        ],
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [238, 242, 255],
          textColor: [30, 64, 175],
          fontStyle: "bold",
        },
        footStyles: {
          fontStyle: "bold",
        },
      });

      doc.save(
        `${(data.storeName || storeName || "Store").replace(
          /\s/g,
          "_"
        )}_${fromDate}_${toDate}.pdf`
      );
      toast.success("Detailed store waste report PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export detailed store report PDF.");
    } finally {
      setDetailedExporting(false);
    }
  };

  /* 
     EXPORT: DETAILED STORE REPORT CSV
     Hits: /transaction/get-store-filter-transactions/:storeId/:fromDate/:toDate
  */
  const exportCSV = async () => {
    try {
      if (!fromDate || !toDate) {
        toast.error("Please select 'From' and 'To' dates for detailed waste report.");
        return;
      }

      setCsvExporting(true);

      const { data } = await axios.get(
        `${backendUrl}/transaction/get-store-filter-transactions/${storeId}/${fromDate}/${toDate}`,
        { withCredentials: true }
      );

      if (!data?.success || !Array.isArray(data?.items)) {
        toast.error("No detailed transaction records found for the selected dates.");
        return;
      }

      // Safe CSV escaper
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      // Table columns: SN, Material, Decathlon Type, Items, Weight (kg), Rate (Rs.), Amount (Rs.)
      const headers = [
        "SN",
        "Material",
        "Decathlon Type",
        "Items",
        "Weight (kg)",
        "Rate (Rs.)",
        "Amount (Rs.)",
      ];

      const grandTotalWeight = data.items.reduce(
        (sum, item) => sum + Number(item.weight || 0),
        0
      );

      const grandTotalAmount = data.items.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0
      );

      const grandTotalItems = data.items.reduce(
        (sum, item) => sum + Number(item.totalItems || 0),
        0
      );

      const rows = data.items.map((item, index) => [
        index + 1,
        item.materialType || "-",
        item.decathlonType || "-",
        item.totalItems || 0,
        Number(item.weight || 0).toFixed(2),
        Number(item.rate || 0).toFixed(2),
        Number(item.totalAmount || 0).toFixed(2),
      ]);

      const footerRow = [
        "Grand Total",
        "",
        "",
        grandTotalItems,
        grandTotalWeight.toFixed(2),
        "",
        grandTotalAmount.toFixed(2),
      ];

      const csvHeader = headers.map(escapeCsv).join(",");
      const csvLines = [
        ...rows.map((row) => row.map(escapeCsv).join(",")),
        footerRow.map(escapeCsv).join(","),
      ];

      // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
      const csvContent = "\uFEFF" + [csvHeader, ...csvLines].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const filename = `${(data.storeName || storeName || "Store").replace(
        /\s/g,
        "_"
      )}_${fromDate}_${toDate}.csv`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success("Detailed store waste report CSV downloaded successfully!");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error(
        error.response?.data?.message || "Failed to export detailed store report CSV."
      );
    } finally {
      setCsvExporting(false);
    }
  };

  /* 
     EXPORT 2: STORE FINANCIAL SUMMARY PDF (Total, Revenue, Net, Payable, Receivable)
  */
  const exportSummaryPDF = () => {
    try {
      setSummaryExporting(true);
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      let cursorY = 16;

      // Header Banner
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("DECATHLON WASTE MANAGEMENT", 14, 13);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(220, 230, 255);
      doc.text(
        `Store Financial & Transaction Summary Report — ${storeName || "Store"} (ID: ${storeId})`,
        14,
        20
      );

      cursorY = 38;

      // Metadata details
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const periodLabel =
        summaryDateRange?.from && summaryDateRange?.to
          ? `${summaryDateRange.from} to ${summaryDateRange.to}`
          : fromDate && toDate
            ? `${fromDate} to ${toDate}`
            : "All Time (Complete History)";

      doc.setFont("helvetica", "bold");
      doc.text("Store Name:", 14, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(`${storeName || "Store"} (Store ID: ${storeId})`, 48, cursorY);

      cursorY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Location:", 14, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${storeInfo.storeLocation || "N/A"}${storeInfo.storeState ? `, ${storeInfo.storeState}` : ""
        }`,
        48,
        cursorY
      );

      cursorY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Report Scope:", 14, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(periodLabel, 48, cursorY);

      cursorY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Generated On:", 14, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleString("en-US"), 48, cursorY);

      cursorY += 10;

      // Summary Table
      autoTable(doc, {
        startY: cursorY,
        theme: "striped",
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
        },
        head: [["Financial Metric", "Value", "Operational Context"]],
        body: [
          [
            "Net Balance",
            formatCurrency(summary.net),
            summary.net >= 0
              ? "Surplus (Receivable − Payable)"
              : "Deficit (Receivable − Payable)",
          ],
          [
            "Total Revenue / Volume",
            formatCurrency(summary.total),
            "Gross store transaction volume in scope",
          ],
          [
            "Total Payable",
            formatCurrency(summary.payable),
            "Outgoing store waste liabilities",
          ],
          [
            "Total Receivable",
            formatCurrency(summary.receivable),
            "Incoming receipts from store waste collections",
          ],
          [
            "Transaction Count",
            String(summary.transactionCount || 0),
            "Total store transactions processed",
          ],
        ],
        styles: { fontSize: 10, cellPadding: 6 },
      });

      const fileDateLabel =
        summaryDateRange?.from && summaryDateRange?.to
          ? `${summaryDateRange.from}_to_${summaryDateRange.to}`
          : fromDate && toDate
            ? `${fromDate}_to_${toDate}`
            : "all_time";

      const filename = `${(storeName || "Store").replace(
        /\s/g,
        "_"
      )}_Financial_Summary_${fileDateLabel}.pdf`;

      doc.save(filename);
      toast.success("Financial summary PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF summary export error:", err);
      toast.error("Failed to generate financial summary PDF.");
    } finally {
      setSummaryExporting(false);
    }
  };

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
    setExportModalStatus("processing");
    const timer = setTimeout(() => {
      setExportModalStatus("ready");
    }, 400);
    return () => clearTimeout(timer);
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
    setExportModalStatus("ready");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <NavBar />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8 flex-1">
        {/* Navigation Breadcrumb / Back link */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard/stores")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900 transition cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Back to All Stores</span>
          </button>
        </div>

        {/* 
            TOP HEADER & FILTER BAR (AdminDashboard Style)
        */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Left Section: Store Title, Store ID & Export Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-sm">
                  <Store size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {storeName || "Store Transactions"}
                    </h1>
                    <span className="inline-block text-[11px] font-mono font-semibold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      ID: {storeId}
                    </span>
                  </div>
                  {(storeInfo.storeLocation || storeInfo.storeState) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin size={12} className="text-slate-400" />
                      <span>
                        {storeInfo.storeLocation}
                        {storeInfo.storeState ? `, ${storeInfo.storeState}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons in Left Section */}
              <div className="flex items-center gap-2 pt-1 sm:pt-0 sm:ml-4">
                <button
                  id="store-export-btn"
                  onClick={handleOpenExportModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
                  title="Export store summary & waste reports"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>

                {/* Scope Indicator Badge */}
                {summaryDateRange?.from && summaryDateRange?.to ? (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200">
                    <Calendar size={13} />
                    <span>
                      {summaryDateRange.from} → {summaryDateRange.to}
                    </span>
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                    <Clock size={13} />
                    <span>All-Time Summary</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right Section: From - To Date Range Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form
                onSubmit={handleFilterSubmit}
                className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-1.5 px-2">
                  <Calendar size={15} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-500">From</span>
                </div>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />

                <span className="text-xs font-medium text-slate-400 px-1">To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />

                <button
                  type="submit"
                  disabled={summaryLoading}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                >
                  <Filter size={13} />
                  <span>Apply</span>
                </button>

                {(fromDate || toDate || summaryDateRange) && (
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    title="Clear date filter"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Quick Date Presets Row */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">
              Quick Filter:
            </span>
            {[
              { label: "All Time", value: "all" },
              { label: "Today", value: "today" },
              { label: "Last 7 Days", value: "last7" },
              { label: "Last 30 Days", value: "last30" },
              { label: "This Month", value: "thisMonth" },
            ].map((preset) => {
              const isActive = activePreset === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleApplyPreset(preset.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${isActive
                      ? "bg-blue-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 
            PRIMARY FINANCIAL SUMMARY CARDS: NET, TOTAL, PAYABLE, RECEIVABLE
        */}
        <section aria-label="Store Financial Summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. NET BALANCE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${summary.net >= 0
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-rose-500 to-amber-500"
                  }`}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Net Balance
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${summary.net >= 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                    }`}
                >
                  {summary.net >= 0 ? (
                    <TrendingUp size={20} />
                  ) : (
                    <TrendingDown size={20} />
                  )}
                </div>
              </div>

              <div className="mt-4">
                {summaryLoading ? (
                  <div className="h-8 w-36 bg-slate-200 animate-pulse rounded-lg" />
                ) : (
                  <p
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${summary.net >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                  >
                    {formatCurrency(summary.net)}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Receivable − Payable</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md ${summary.net >= 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-rose-50 text-rose-700 border border-rose-200/60"
                      }`}
                  >
                    {summary.net >= 0 ? "Surplus" : "Deficit"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. TOTAL VOLUME / REVENUE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Turnover / Revenue
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="mt-4">
                {summaryLoading ? (
                  <div className="h-8 w-36 bg-slate-200 animate-pulse rounded-lg" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {formatCurrency(summary.total)}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Gross Transaction Volume</span>
                  <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">
                    {summary.transactionCount || 0} Txns
                  </span>
                </div>
              </div>
            </div>

            {/* 3. TOTAL PAYABLE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Payable
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ArrowUpRight size={20} />
                </div>
              </div>

              <div className="mt-4">
                {summaryLoading ? (
                  <div className="h-8 w-36 bg-slate-200 animate-pulse rounded-lg" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-700">
                    {formatCurrency(summary.payable)}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Outgoing Liabilities</span>
                  <span className="font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/60">
                    Payable
                  </span>
                </div>
              </div>
            </div>

            {/* 4. TOTAL RECEIVABLE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Receivable
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ArrowDownLeft size={20} />
                </div>
              </div>

              <div className="mt-4">
                {summaryLoading ? (
                  <div className="h-8 w-36 bg-slate-200 animate-pulse rounded-lg" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-700">
                    {formatCurrency(summary.receivable)}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Incoming Receipts</span>
                  <span className="font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
                    Receivable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 
            SECONDARY OPERATIONAL METRICS (Store Info, Transactions Logged, Total Waste Items)
        */}
        <section aria-label="Operational Metrics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-blue-900 flex items-center justify-center shrink-0">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Store Information
                </p>
                <p className="text-base font-bold text-slate-900 truncate max-w-[200px]">
                  {storeName || `Store #${storeId}`}
                </p>
                <p className="text-xs text-slate-500">
                  Store Code: {storeId}
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                <Receipt size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Store Transactions Recorded
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {summary.transactionCount || transactions.length || 0}
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Filtered Transactions in View
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 
            TRANSACTION DIRECTORY & SEARCH SECTION
        */}
        <section aria-label="Transactions List" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt size={20} className="text-blue-900" />
                <span>Store Transactions Log</span>
              </h2>
              <p className="text-xs text-slate-500">
                Browse store waste entries, search by manager name or ID, or click to view full details
              </p>
            </div>

            {/* Search, Sort and Page Size Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="w-full sm:w-64 relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search manager or txn ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              >
                <option value="latest">Latest → Oldest</option>
                <option value="oldest">Oldest → Latest</option>
                <option value="itemsLow">Items Low → High</option>
                <option value="itemsHigh">Items High → Low</option>
              </select>

              {/* Page Size Selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>

              {/* Direct Quick PDF Export Button for convenience */}
              <button
                onClick={exportPDF}
                disabled={detailedExporting}
                title="Download detailed store waste PDF"
                className="px-3 py-2 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {detailedExporting ? (
                  <Loader2 size={14} className="animate-spin text-blue-900" />
                ) : (
                  <FileDown size={14} />
                )}
                <span>Waste PDF</span>
              </button>
            </div>
          </div>

          {/* Transactions Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: pageSize }).map((_, i) => (
                <StoreTransactionSkeleton key={i} />
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTransactions.map((txn) => (
                  <div
                    key={txn.transactionId}
                    onClick={() =>
                      navigate(`/dashboard/stores/${storeId}/${txn.transactionId}`)
                    }
                    className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Transaction ID & Date */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block text-[11px] font-mono font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                              ID: {txn.transactionId}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-900 transition mt-2 flex items-center gap-1.5">
                            <User size={15} className="text-slate-400" />
                            <span>{txn.managerName || "Store Manager"}</span>
                          </h3>
                        </div>

                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition duration-300 shrink-0">
                          <ChevronRight size={18} />
                        </div>
                      </div>

                      {/* Card Footer Info */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Trash2 size={14} className="text-slate-400" />
                          <span>
                            {txn.item ?? txn.totalItems ?? 0} Waste Entries
                          </span>
                        </span>

                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(txn.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                >
                  Previous
                </button>

                <span className="text-xs font-medium text-slate-500 px-2">
                  Page <span className="font-bold text-slate-900">{currentPage}</span>
                </span>

                <button
                  disabled={!hasMore}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Receipt size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-base font-semibold text-slate-700">
                No store transactions found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search criteria, dates, or clear the filter.
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 text-xs font-semibold text-blue-900 hover:underline cursor-pointer"
                >
                  Clear search query
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 
          EXPORT MODAL (Featuring Both Exports: Original Detailed Waste Report + New Financial Summary)
      */}
      {isExportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Export Store Reports</h3>
                  <p className="text-xs text-blue-100">
                    {storeName || "Store"} • ID: {storeId}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseExportModal}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {exportModalStatus === "processing" ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <Loader2 size={36} className="text-blue-900 animate-spin" />
                  <p className="text-sm font-semibold text-slate-700">
                    Preparing report data...
                  </p>
                  <p className="text-xs text-slate-400">
                    Compiling store financial metrics and records
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 text-xs">
                    <CheckCircle2 size={16} className="text-blue-900 shrink-0" />
                    <span>
                      Select the report type you wish to download below.
                    </span>
                  </div>

                  {/* Summary Details Preview Box */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between pb-2 border-b border-slate-200 text-slate-600">
                      <span className="font-medium">Active Date Scope:</span>
                      <span className="font-semibold text-slate-900">
                        {summaryDateRange?.from && summaryDateRange?.to
                          ? `${summaryDateRange.from} to ${summaryDateRange.to}`
                          : fromDate && toDate
                            ? `${fromDate} to ${toDate}`
                            : "All Time (Complete History)"}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Total Store Transactions:</span>
                      <span className="font-semibold text-slate-900">
                        {summary.transactionCount || 0}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Total Revenue / Volume:</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(summary.total)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Net Balance:</span>
                      <span
                        className={`font-semibold ${summary.net >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                      >
                        {formatCurrency(summary.net)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Total Payable:</span>
                      <span className="font-semibold text-amber-700">
                        {formatCurrency(summary.payable)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Total Receivable:</span>
                      <span className="font-semibold text-indigo-700">
                        {formatCurrency(summary.receivable)}
                      </span>
                    </div>
                  </div>

                  {/* Two Export Options: Detailed Waste Report CSV & Financial Summary PDF */}
                  <div className="space-y-3 pt-1">
                    {/* Export 1: Detailed Store Waste Report CSV */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <FileDown size={15} className="text-blue-900" />
                          <span>Detailed Waste Report (CSV)</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Itemized materials, decathlon type, weights, rates, and amounts
                        </p>
                        {!fromDate || !toDate ? (
                          <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                            *Requires From & To dates
                          </span>
                        ) : null}
                      </div>

                      <button
                        onClick={exportCSV}
                        disabled={csvExporting}
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                      >
                        {csvExporting ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Exporting...</span>
                          </>
                        ) : (
                          <>
                            <FileDown size={13} />
                            <span>Export CSV</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Export 2: Financial Summary PDF (Total, Revenue, Net, Payable, Receivable) */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText size={15} className="text-emerald-700" />
                          <span>Financial Summary (PDF)</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Total turnover, revenue, net balance, payable & receivable
                        </p>
                      </div>

                      <button
                        onClick={exportSummaryPDF}
                        disabled={summaryExporting}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                      >
                        {summaryExporting ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Exporting...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={13} />
                            <span>Summary PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleCloseExportModal}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoreTransactions;
