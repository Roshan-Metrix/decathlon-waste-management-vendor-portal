import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../../context/AppContext.jsx";
import NavBar from "../../components/NavBar.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  Sparkles,
  MapPin,
  Store,
} from "lucide-react";
import axios from "axios";

// 55 standard heading columns for Invoice CSV export matching database template
const INVOICE_CSV_COLUMNS = [
  "Cost Center",
  "Store Code",
  "gstin_of_consignee",
  "legal_name_of_consignee",
  "address1_of_consignee",
  "address2_of_consignee",
  "place_of_consignee",
  "pincode_of_consignee",
  "state_of_supply",
  "document_number",
  "document_date",
  "ref_document_number",
  "note_type",
  "reason",
  "original_document_number",
  "original_document_date",
  "po_number",
  "order_dt",
  "p_due_date",
  "s_dt",
  "item_code",
  "payment_type",
  "hsn_code",
  "product_name_item",
  "product_description_item",
  "unit_of_product_item",
  "quantity_item",
  "taxable_amount_item",
  "discount",
  "gst_rate_item",
  "cess_amount_item",
  "freight_amount",
  "ins_amount",
  "pack_for_amount",
  "supply_type",
  "sub_supply_type",
  "document_type",
  "transporter_id",
  "transporter_name",
  "approximate_distance",
  "transportation_mode",
  "vehicle_number",
  "vehicle_type",
  "transporter_doc_no",
  "transporter_doc_date",
  "order_id",
  "ref_order_id",
  "original_order_id",
  "is_amended",
  "return_period",
  "delivery_challan",
  "dispatch_date",
  "actual_to_state",
  "tcs_rate",
  "Including Tax",
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  // Financial summary state (Net, Total, Payable, Receivable)
  const [summary, setSummary] = useState({
    transactionCount: 0,
    total: 0,
    receivable: 0,
    payable: 0,
    net: 0,
  });
  const [summaryDateRange, setSummaryDateRange] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Date filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePreset, setActivePreset] = useState("all");

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("ready"); // "processing" | "ready" | "completed"
  const [csvExporting, setCsvExporting] = useState(false);

  // Store list and operational stats state
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState({
    totalStores: 0,
    totalTransactions: 0,
    totalItems: 0,
  });

  const [page, setPage] = useState(1);
  const LIMIT = 6;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Helper to format Date to YYYY-MM-DD
  const formatDateToISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /* 
     FETCH FINANCIAL SUMMARY 
      */
  const fetchSummary = useCallback(
    async (from = "", to = "") => {
      try {
        setSummaryLoading(true);

        let url = `${backendUrl}/transaction/transaction-summary`;
        if (from && to) {
          url += `?from=${from}&to=${to}`;
        }

        const { data } = await axios.get(url, { withCredentials: true });

        if (data.success) {
          setSummary(
            data.summary || {
              transactionCount: 0,
              total: 0,
              receivable: 0,
              payable: 0,
              net: 0,
            }
          );
          setSummaryDateRange(data.dateRange || null);
        }
      } catch (err) {
        console.error("Fetch summary error:", err);
        const msg =
          err.response?.data?.message || "Failed to fetch financial summary.";
        toast.error(msg);
      } finally {
        setSummaryLoading(false);
      }
    },
    [backendUrl]
  );

  // Initial load on page mount/reload
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /* 
     FETCH STORES LIST & OPERATIONAL STATS
      */
  const fetchStores = useCallback(
    async (pageNumber = 1) => {
      try {
        setLoading(true);

        const { data } = await axios.get(
          `${backendUrl}/transaction/get-stores-total-transactions?page=${pageNumber}&limit=${LIMIT}`,
          { withCredentials: true }
        );

        if (data.success) {
          if (pageNumber === 1) {
            setStores(data.stores || []);
          } else {
            setStores((prev) => [...prev, ...(data.stores || [])]);
          }

          setStats({
            totalStores: data.totalStores || 0,
            totalTransactions: data.totalTransactions || 0,
            totalItems: data.totalItems || 0,
          });

          setHasMore(data.hasMore ?? false);
        }
      } catch (err) {
        console.error("Fetch stores error:", err);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl]
  );

  useEffect(() => {
    fetchStores(page);
  }, [fetchStores, page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  /* 
     DATE FILTER HANDLERS & PRESETS
      */
  const handleApplyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const start = new Date();

    if (preset === "all") {
      setFromDate("");
      setToDate("");
      fetchSummary();
      return;
    }

    if (preset === "today") {
      const todayStr = formatDateToISO(today);
      setFromDate(todayStr);
      setToDate(todayStr);
      fetchSummary(todayStr, todayStr);
      return;
    }

    if (preset === "last7") {
      start.setDate(today.getDate() - 6);
      const fromStr = formatDateToISO(start);
      const toStr = formatDateToISO(today);
      setFromDate(fromStr);
      setToDate(toStr);
      fetchSummary(fromStr, toStr);
      return;
    }

    if (preset === "last30") {
      start.setDate(today.getDate() - 29);
      const fromStr = formatDateToISO(start);
      const toStr = formatDateToISO(today);
      setFromDate(fromStr);
      setToDate(toStr);
      fetchSummary(fromStr, toStr);
      return;
    }

    if (preset === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const fromStr = formatDateToISO(firstDay);
      const toStr = formatDateToISO(today);
      setFromDate(fromStr);
      setToDate(toStr);
      fetchSummary(fromStr, toStr);
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
    fetchSummary(fromDate, toDate);
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setActivePreset("all");
    fetchSummary();
  };

  /* 
     EXPORT POPUP ACTIONS
      */
  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
    setExportStatus("processing");
    // Simulate brief preparing progress
    const timer = setTimeout(() => {
      setExportStatus("ready");
    }, 600);
    return () => clearTimeout(timer);
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
    setExportStatus("ready");
  };

  const handleExportPDF = () => {
    try {
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
      doc.text("Admin Dashboard Financial & Transaction Report", 14, 20);

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
      doc.text("Report Scope:", 14, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(periodLabel, 48, cursorY);

      cursorY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Generated On:", 14, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleString("en-US"), 48, cursorY);

      cursorY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Active Stores:", 14, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(String(stats.totalStores || 0), 48, cursorY);

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
              ? "Positive Flow (Receivable - Payable)"
              : "Deficit (Receivable - Payable)",
          ],
          [
            "Total Volume",
            formatCurrency(summary.total),
            "Cumulative turnover recorded in scope",
          ],
          [
            "Total Payable",
            formatCurrency(summary.payable),
            "Vendor & operational liabilities",
          ],
          [
            "Total Receivable",
            formatCurrency(summary.receivable),
            "Incoming receipts from store waste collections",
          ],
          [
            "Transaction Count",
            String(summary.transactionCount || 0),
            "Total transactions processed",
          ],
        ],
        styles: { fontSize: 10, cellPadding: 6 },
      });

      const filename = `Decathlon_Summary_${summaryDateRange?.from || "all"}_to_${summaryDateRange?.to || "all"
        }.pdf`;

      doc.save(filename);
      setExportStatus("completed");
      toast.success("PDF summary downloaded successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF summary.");
    }
  };

  const handleExportCSV = async () => {
    try {
      setCsvExporting(true);

      const from = summaryDateRange?.from || fromDate || "";
      const to = summaryDateRange?.to || toDate || "";

      let url = `${backendUrl}/transaction/transaction-invoice`;
      if (from && to) {
        url += `?from=${from}&to=${to}`;
      } else if ((from && !to) || (!from && to)) {
        toast.error("Please provide both 'From' and 'To' dates for invoice export.");
        setCsvExporting(false);
        return;
      }

      const { data } = await axios.get(url, { withCredentials: true });

      if (!data?.success) {
        toast.error(data?.message || "Failed to fetch transaction invoice data.");
        return;
      }

      const rowsData = Array.isArray(data.data) ? data.data : [];

      if (rowsData.length === 0) {
        toast.info("No transaction invoice records found for the selected period.");
      }

      // Safe CSV cell escaper (preserves leading zeros in Excel for Store Code and numeric codes)
      const escapeCsv = (val, col) => {
        if (val === null || val === undefined) return '""';
        const str = String(val);
        if (col === "Store Code" || (typeof val === "string" && /^0\d+$/.test(str))) {
          return `="""${str}"""`;
        }
        return `"${str.replace(/"/g, '""')}"`;
      };

      // Header row using the 55 exact columns
      const csvHeader = INVOICE_CSV_COLUMNS.map((col) => `"${col}"`).join(",");

      // Data rows mapped to the exact 55 columns
      const csvLines = rowsData.map((row) =>
        INVOICE_CSV_COLUMNS.map((col) => escapeCsv(row[col], col)).join(",")
      );

      // Prepend UTF-8 BOM (\uFEFF) for perfect Excel encoding
      const csvContent = "\uFEFF" + [csvHeader, ...csvLines].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const fileDateLabel = from && to ? `${from}_to_${to}` : "all_time";
      link.setAttribute(
        "download",
        `Transaction_Invoice_${fileDateLabel}.csv`
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setExportStatus("completed");
      toast.success(
        `Invoice CSV downloaded successfully (${rowsData.length} records)!`
      );
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error(
        err.response?.data?.message || "Failed to export invoice CSV."
      );
    } finally {
      setCsvExporting(false);
    }
  };

  // Filter stores by name, location or storeId
  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      `${store.storeName || ""} ${store.storeLocation || ""} ${store.storeId || ""
        }`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [stores, search]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <NavBar />

      {/* Main Dashboard Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8 flex-1">
        {/* 
            TOP DASHBOARD HEADER & FILTER BAR
             */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Left Section: Title & Export Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Admin Dashboard
                  </h1>
                </div>
              </div>

              {/* Export Button in the Left Section */}
              <div className="flex items-center gap-2 pt-1 sm:pt-0 sm:ml-4">
                <button
                  id="dashboard-export-btn"
                  onClick={handleOpenExportModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
                  title="Export dashboard transaction summary"
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
        <section aria-label="Transaction Financial Summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. NET CARD */}
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

            {/* 2. TOTAL CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Turnover
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

            {/* 3. PAYABLE CARD */}
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

            {/* 4. RECEIVABLE CARD */}
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
            SECONDARY OPERATIONAL METRICS (Stores, Transactions, Wastes)
             */}
        <section aria-label="Operational Metrics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-blue-900 flex items-center justify-center shrink-0">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Transaction Stores
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {stats.totalStores || 0}
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                <Receipt size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Store Transactions Logged
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {stats.totalTransactions || 0}
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Waste Entries
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {stats.totalItems || 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 
            STORE DIRECTORY & SEARCH SECTION
             */}
        <section aria-label="Stores List" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Store size={20} className="text-blue-900" />
                <span>Store Operations Network</span>
              </h2>
              <p className="text-xs text-slate-500">
                Browse stores, search by location, or click to view detailed store
                transactions
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-80 relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                placeholder="Search store name, state or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Initial Loading Skeleton */}
          {loading && stores.length === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-3/4">
                      <div className="h-5 bg-slate-200 rounded w-4/5" />
                      <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                    </div>
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredStores.length > 0 ? (
            <>
              {/* Store Cards Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStores.map((store) => (
                  <div
                    key={store.storeId}
                    onClick={() =>
                      navigate(`/dashboard/stores/${store.storeId}`)
                    }
                    className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-900 transition">
                            {store.storeName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                            <MapPin size={13} className="text-slate-400" />
                            <span>
                              {store.storeLocation}, {store.storeState}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition duration-300 shrink-0">
                          <ChevronRight size={18} />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Receipt size={14} className="text-slate-400" />
                          <span>{store.transactionCount || 0} Transactions</span>
                        </span>

                        <span className="inline-block text-[11px] font-mono font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          ID: {store.storeId}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Loading Stores...</span>
                      </>
                    ) : (
                      <span>Load More Stores</span>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-base font-semibold text-slate-700">
                No stores found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search criteria or clear the query.
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
          EXPORTING POPUP MODAL
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
                  <h3 className="text-base font-bold">Export Summary Report</h3>
                  <p className="text-xs text-blue-100">
                    Financial & Operational Summary
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
              {/* Export Status Indicator */}
              {exportStatus === "processing" ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <Loader2 size={36} className="text-blue-900 animate-spin" />
                  <p className="text-sm font-semibold text-slate-700">
                    Preparing summary export...
                  </p>
                  <p className="text-xs text-slate-400">
                    Compiling current period metrics and store data
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 text-xs">
                    <CheckCircle2 size={16} className="text-blue-900 shrink-0" />
                    <span>
                      Summary data is ready for export. Select your preferred file
                      format below.
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
                            : "All Time"}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Total Transactions:</span>
                      <span className="font-semibold text-slate-900">
                        {summary.transactionCount || 0}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Total Volume:</span>
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

                  {/* Export Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer"
                    >
                      <FileText size={16} />
                      <span>Summary PDF</span>
                    </button>

                    <button
                      onClick={handleExportCSV}
                      disabled={csvExporting}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer disabled:opacity-50"
                    >
                      {csvExporting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Exporting CSV...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet size={16} />
                          <span>Invoice CSV</span>
                        </>
                      )}
                    </button>
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

export default AdminDashboard;