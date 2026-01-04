import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import NavBar from "../components/NavBar.jsx";
import TotalBox from "../components/TotalBox.jsx";
import DashboardStores from "../components/DashboardStores.jsx";

const Dashboard = () => {
  const { storeData } = useContext(AppContent);

  return (
    <div className="flex flex-col items-center m-20 px-4 text-gray-800">
        <NavBar />
        <div className="w-full mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                <TotalBox name="Total Stores" value={storeData?.totalStores} />
                <TotalBox name="Total Transactions" value={storeData?.totalTransactions} />
                <TotalBox name="Total Wastes" value={storeData?.totalItems} />
            </div>
        </div>
        {/* <TransactionList /> */}
        <DashboardStores />
    </div>
  );
};

export default Dashboard;
