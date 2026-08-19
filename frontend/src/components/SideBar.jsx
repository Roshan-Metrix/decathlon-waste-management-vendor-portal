import React, { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  Trash2,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  User,
  ChevronDown,
} from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSubmenu = (menu) => {
    setOpenSubmenu((prev) => (prev === menu ? null : menu));
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* HAMBURGER BUTTON */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        aria-label="Toggle Navigation"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* OVERLAY BACKDROP */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* SLIDING SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Header area with Close button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <img
              src={assets.logo}
              alt="Logo"
              className="w-32 sm:w-54 cursor-pointer"
              onClick={() => handleNavigation("/dashboard/stores")}
            />
            {/* <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => handleNavigation("/dashboard/stores")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm transition-colors text-left cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
              Dashboard
            </button>

            {/* Store Management Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("stores")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                  openSubmenu === "stores"
                    ? "bg-slate-100 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-slate-400" />
                  Store Management
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSubmenu === "stores" ? "rotate-180 text-blue-600" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Submenu Links */}
              {openSubmenu === "stores" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() => handleNavigation("/stores/add")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Stores
                  </button>
                  <button
                    onClick={() => handleNavigation("/stores/edit")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit Stores
                  </button>
                  <button
                    onClick={() => handleNavigation("/stores/view")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View Stores
                  </button>
                </div>
              )}
            </div>

            {/* Waste Tracking Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("waste")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                  openSubmenu === "waste"
                    ? "bg-slate-100 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-slate-400" />
                  Waste Tracking
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSubmenu === "waste" ? "rotate-180 text-blue-600" : "text-slate-400"
                  }`}
                />
              </button>

              {openSubmenu === "waste" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() => handleNavigation("/waste/log")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Log Waste
                  </button>
                  <button
                    onClick={() => handleNavigation("/waste/reports")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Waste Reports
                  </button>
                </div>
              )}
            </div>

            {/* Analytics Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("analytics")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                  openSubmenu === "analytics"
                    ? "bg-slate-100 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                  Analytics
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSubmenu === "analytics" ? "rotate-180 text-blue-600" : "text-slate-400"
                  }`}
                />
              </button>

              {openSubmenu === "analytics" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() => handleNavigation("/analytics/overview")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => handleNavigation("/analytics/reports")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Transaction Insights
                  </button>
                </div>
              )}
            </div>

            {/* Team Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("team")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                  openSubmenu === "team"
                    ? "bg-slate-100 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  Team
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openSubmenu === "team" ? "rotate-180 text-blue-600" : "text-slate-400"
                  }`}
                />
              </button>

              {openSubmenu === "team" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() => handleNavigation("/team/members")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    All Members
                  </button>
                  <button
                    onClick={() => handleNavigation("/team/roles")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Roles & Permissions
                  </button>
                </div>
              )}
            </div>

            {/* Settings Link */}
            <button
              onClick={() => handleNavigation("/settings")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <Settings className="w-5 h-5 text-slate-400" />
              Settings
            </button>

            {/* Help Link */}
            <button
              onClick={() => handleNavigation("/help")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              Help & Support
            </button>
          </nav>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer"
            onClick={() => handleNavigation("/profile")}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
        </div>
      </aside>
    </>
  );
}