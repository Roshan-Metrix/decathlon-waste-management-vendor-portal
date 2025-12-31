import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { userData } = useContext(AppContent);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center m-20 px-4 text-center text-grey-800">
      <div className="w-70 h-66 rounded-full flex justify-center items-center overflow-hidden">
        <img src={assets.header_img} alt="" className="w-50 h-40" />
      </div>
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey {userData ? userData.name : "Vendor"}!
        {/* <img className='w-8 aspect-square' src={assets.hand_wave} alt='' /> */}
      </h1>

      <h2 className="text-3xl sm:text-5xl  font-semibold mb-4">
        Welcome {userData ? "Back To" : "To"} Decathlon
      </h2>

      <p className="mb-8 max-w-md">SPORT FOR ALL - ALL FOR SPORTS</p>

      {userData && (
        <button
          onClick={() => navigate("/dashboard")}
          className="border border-grey-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all cursor-pointer hover:shadow-md"
        >
          Continue to Dashboard
        </button>
      )}
    </div>
  );
};

export default Header;
