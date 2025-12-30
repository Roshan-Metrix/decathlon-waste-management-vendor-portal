import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import NavBar from "../components/NavBar.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import TotalBox from "../components/TotalBox.jsx";
import TransactionList from "../components/TransactionList.jsx";

const primaryColor = "#FF4500";

const Dashboard = () => {
  const navigate = useNavigate();
  const { transactionData } = useContext(AppContent);


  return (
    <div className="flex flex-col items-center m-20 px-4 text-gray-800">
        <NavBar />
        <div className="w-full mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                <TotalBox name="Total Stores" value={transactionData.totalStores} />
                <TotalBox name="Total Transactions" value={transactionData.totalTransactions} />
                <TotalBox name="Total Waste" value={transactionData.totalItems} />
            </div>
        </div>
        <TransactionList />
    </div>
  );
};

export default Dashboard;
