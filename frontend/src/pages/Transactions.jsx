import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import { useParams } from "react-router-dom";
import { ImageOff, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NavBar from "../components/NavBar";
import { TransactionsSkeleton } from "../../utils/Skeleton";
import useImagePreview from "../../lib/previewImage";

const PRIMARY_COLOR = "#1e40af";
const ACCENT_COLOR = "#00bcd4";

const Transactions = () => {
  const { backendUrl } = useContext(AppContent);
  const { id: transactionId } = useParams();
  const { openImage, ImagePreviewModal } = useImagePreview();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  /*  FETCH DATA  */
  const getTransactionData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/vendor/particular-transactions/${transactionId}`
      );

      if (data.success && data.transactions.length > 0) {
        setTransaction(data.transactions[0]);
      } else {
        toast.error("Transaction not found");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransactionData();
  }, [transactionId]);

  /*  HELPERS  */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith("http") || image.startsWith("data:image")) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  const getMaterialSummary = (items) => {
    const map = {};
    items.forEach((item) => {
      if (!map[item.materialType]) {
        map[item.materialType] = { count: 0, weight: 0 };
      }
      map[item.materialType].count += 1;
      map[item.materialType].weight += item.weight;
    });

    return Object.entries(map).map(([materialType, data], i) => ({
      sn: i + 1,
      materialType,
      itemCount: data.count,
      totalWeight: data.weight.toFixed(2),
    }));
  };

  /*  PDF EXPORT  */

  const exportPDF = () => {
  try {
    if (!transaction) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 15;

    const totalWeight = transaction.items.reduce(
      (sum, i) => sum + i.weight,
      0
    );

    const materialSummary = getMaterialSummary(transaction.items);

    //  HEADER 
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text(
      transaction.store?.storeName || "N/A",
      pageWidth / 2,
      cursorY,
      { align: "center" }
    );

    cursorY += 8;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(
      transaction.store?.storeLocation || "",
      pageWidth / 2,
      cursorY,
      { align: "center" }
    );

    cursorY += 6;

    doc.text(
      `Transaction ID: ${transaction.transactionId} | Vendor: ${
        transaction.vendorName || "N/A"
      }`,
      pageWidth / 2,
      cursorY,
      { align: "center" }
    );

    cursorY += 5;

    doc.setDrawColor(200);
    doc.line(10, cursorY, pageWidth - 10, cursorY);

    //  ITEMS TITLE 
    cursorY += 10;
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("Detailed Transaction Items", 14, cursorY);

    //  ITEMS TABLE 
    autoTable(doc, {
      startY: cursorY + 5,
      head: [["SN", "Material", "Weight (kg)", "Time & Source"]],
      body: transaction.items.map((item, index) => [
        index + 1,
        item.materialType,
        item.weight,
        ` ${formatTimestamp(item.createdAt)} (${item.weightSource === "system" ? "System" : "Manually"})`,
      ]),
      foot: [
        [
          {
            content: "Grand Total Weight :",
            colSpan: 2,
            styles: { halign: "right", fontStyle: "bold" },
          },
          totalWeight.toFixed(2),
          "",
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [238, 242, 255],
        textColor: [30, 64, 175],
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [224, 242, 254],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    //  MATERIAL SUMMARY 
    if (materialSummary.length > 0) {
      cursorY = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(13);
      doc.setTextColor(30, 64, 175);
      doc.text("Material Type Summary", 14, cursorY);

      autoTable(doc, {
        startY: cursorY + 5,
        head: [["#", "Material", "Items", "Total Weight (kg)"]],
        body: materialSummary.map((s) => [
          s.sn,
          s.materialType,
          `${s.itemCount} item${s.itemCount !== 1 ? "s" : ""}`,
          s.totalWeight,
        ]),
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [249, 249, 249],
          textColor: [30, 64, 175],
          fontStyle: "bold",
        },
      });
    }

    //  SIGNATURE AREA 
    // cursorY = doc.lastAutoTable
    //   ? doc.lastAutoTable.finalY + 20
    //   : cursorY + 20;

    // doc.setFontSize(11);
    // doc.setTextColor(0, 0, 0);

    // doc.line(pageWidth - 70, cursorY, pageWidth - 20, cursorY);
    // doc.text("Manager Signature", pageWidth - 45, cursorY + 6, {
    //   align: "left",
    // });

    doc.save(`${transaction.transactionId}_Bill.pdf`);
  } catch (err) {
    toast.error("Failed to generate PDF");
  }
};

  /*  LOADING  */
  if (loading) {
    return (
      <div className="flex flex-col items-center m-20 px-4">
        <NavBar />
        <TransactionsSkeleton />
      </div>
    );
  }

  if (!transaction) return null;

  const totalWeight = transaction.items.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  return (
    <div className="flex flex-col items-center m-20 px-4 text-gray-800">
      <NavBar />

      <div className="min-h-screen w-full bg-gray-100 pb-13">
        <div className="bg-white shadow-md px-6 py-4 flex justify-between">
          <h1 className="font-bold" style={{ color: PRIMARY_COLOR }}>
            Id: {transaction.transactionId}
          </h1>

          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 cursor-pointer"
          >
            <FileDown size={16} />
            Export PDF
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* SUMMARY */}
          <div
            className="bg-white rounded-xl border-2 p-6 mb-8 shadow-sm"
            style={{ borderColor: `${PRIMARY_COLOR}30` }}
          >
            <h2 className="text-lg font-extrabold mb-4 border-b pb-2" style={{ color: PRIMARY_COLOR }}>
              Transaction Summary
            </h2>

            <div className="space-y-2 text-sm">
              <p><b>Manager:</b> {transaction.managerName}</p>
              <p><b>Vendor:</b> {transaction.vendorName}</p>
              <p><b>Store:</b> {transaction.store?.storeName}</p>

              <div className="flex justify-between items-center border-t pt-3 mt-3">
                <span className="font-bold">TOTAL WEIGHT</span>
                <span className="text-xl font-black" style={{ color: ACCENT_COLOR }}>
                  {totalWeight.toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>


          {/*  CALIBRATION  */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border">
          <h3 className="font-bold mb-3 text-gray-700">
            Calibration Details
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {getImageSrc(transaction.calibration?.image) ? (
              <img
                src={getImageSrc(transaction.calibration.image)}
                alt="Calibration"
                className="w-full h-56 object-cover rounded-lg border cursor-pointer"
                onClick={() => openImage(getImageSrc(transaction.calibration.image))}
              />
            ) : (
              <div className="h-56 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
                <ImageOff size={40} />
                <p className="text-xs mt-2">No Calibration Image</p>
              </div>
            )}

            <p className="text-lg font-semibold flex items-center">
              Calibration Error:
              <span className="ml-2 text-red-600">
                 {transaction.calibration?.error ? `±${transaction.calibration?.error} kg` : "No Error"}
              </span>
            </p>
          </div>
        </div>

          {/* ITEMS */}
          <h3 className="text-lg font-bold mb-4 text-gray-700">
            Items ({transaction.items.length})
          </h3>

          <div className="space-y-4">
            {transaction.items.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border">
                <div
                  className="flex justify-between px-4 py-2 text-white"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <span className="font-bold">Item #{item.itemNo}</span>
                  <span>{item.materialType}</span>
                </div>

                {getImageSrc(item.image) ? (
                  <img src={getImageSrc(item.image)} alt="Item"  className="w-full h-56 object-cover cursor-pointer" onClick={() => openImage(getImageSrc(item.image))} />
                ) : (
                  <div className="h-56 bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImageOff />
                  </div>
                )}

                <div className="p-4 text-sm flex justify-between text-center">
                  <div>
                  <p><b>Weight:</b> {item.weight} kg</p>
                  </div>
                  <div>
                  <p className="text-xs text-gray-400 text-right">
                    Added: {formatTimestamp(item.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400 text-right">
                   Source: <span className="text-gray-800">{item.weightSource}</span>
                  </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ImagePreviewModal />
    </div>
  );
};

export default Transactions;

/* SIGNATURE SECTION */
// doc.setFontSize(11);
// doc.text("Manager Signature", 40, cursorY);
// doc.text("Vendor Signature", pageWidth - 70, cursorY);

// cursorY += 20;
// doc.line(20, cursorY, 80, cursorY);
// doc.line(pageWidth - 80, cursorY, pageWidth - 20, cursorY);
