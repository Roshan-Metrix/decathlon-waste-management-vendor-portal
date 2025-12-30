import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Lock,
} from "lucide-react";
import NavBar from "../components/NavBar";

const Profile = () => {
  const { userData } = useContext(AppContent);
  const navigate = useNavigate();

  const {
    name,
    email,
    vendorLocation,
    contactNumber,
  } = userData || {};

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
        <NavBar />
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 mt-20">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b pb-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {name || "Vendor Name"}
            </h2>
            <p className="text-sm text-gray-500">Vendor Profile</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Name */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
            <User className="text-blue-900" />
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold text-gray-800">
                {name || "N/A"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
            <Mail className="text-blue-900" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold text-gray-800">
                {email || "N/A"}
              </p>
            </div>
          </div>

          {/* Contact Number */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
            <Phone className="text-blue-900" />
            <div>
              <p className="text-xs text-gray-500">Contact Number</p>
              <p className="font-semibold text-gray-800">
                {contactNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Vendor Location */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
            <MapPin className="text-blue-900" />
            <div>
              <p className="text-xs text-gray-500">Vendor Location</p>
              <p className="font-semibold text-gray-800">
                {vendorLocation || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={() => navigate("/reset-password")}
            className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition font-medium cursor-pointer"
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
