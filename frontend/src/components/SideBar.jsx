import React, { useState } from "react";
import {
  Menu,
  LayoutDashboard,
  Store,
  Users,
  User,
  ChevronDown,
  Warehouse,
  Cable,
  MapPin,
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
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${isOpen ? "translate-x-0" : "-translate-x-full"
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${openSubmenu === "stores"
                  ? "bg-slate-100 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-slate-400" />
                  Store Management
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === "stores"
                    ? "rotate-180 text-blue-600"
                    : "text-slate-400"
                    }`}
                />
              </button>

              {/* Submenu Links */}
              {openSubmenu === "stores" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/stores/add-stores")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Stores
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/stores/view-stores")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View Stores
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/stores/remove-stores")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove Stores
                  </button>
                </div>
              )}
            </div>

            {/* Manager Management Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("managers")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${openSubmenu === "managers"
                  ? "bg-slate-100 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  Manager Management
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === "managers"
                    ? "rotate-180 text-blue-600"
                    : "text-slate-400"
                    }`}
                />
              </button>

              {/* Submenu Links */}
              {openSubmenu === "managers" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/managers/add-managers")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Managers
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/managers/view-managers")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View Managers
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/managers/remove-managers")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove Managers
                  </button>
                </div>
              )}
            </div>

            {/* Vendor Management Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("vendors")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${openSubmenu === "vendors"
                  ? "bg-slate-100 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Warehouse className="w-5 h-5 text-slate-400" />
                  Vendor Management
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === "vendors"
                    ? "rotate-180 text-blue-600"
                    : "text-slate-400"
                    }`}
                />
              </button>

              {/* Submenu Links */}
              {openSubmenu === "vendors" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/vendors/add-vendors")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Vendors
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/vendors/view-vendors")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View Vendors
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/vendors/remove-vendors")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove Vendors
                  </button>
                </div>
              )}
            </div>

            {/* Region Management Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("regions")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${openSubmenu === "regions"
                  ? "bg-slate-100 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  Region Management
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === "regions"
                    ? "rotate-180 text-blue-600"
                    : "text-slate-400"
                    }`}
                />
              </button>

              {/* Submenu Links */}
              {openSubmenu === "regions" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/regions/add-region")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Region
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/regions/view-regions")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View Regions
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/regions/edit-rates")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit Material Rates
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/regions/remove-region")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove Region
                  </button>
                </div>
              )}
            </div>

            {/* Material Mapping Management */}
            <div>
              <button
                onClick={() => toggleSubmenu("materials")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${openSubmenu === "materials"
                  ? "bg-slate-100 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Cable className="w-5 h-5 text-slate-400" />
                  Material Mappings
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === "materials"
                    ? "rotate-180 text-blue-600"
                    : "text-slate-400"
                    }`}
                />
              </button>

              {/* Submenu Links */}
              {openSubmenu === "materials" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/admin/add-material-mappings")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Material Mapping
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/admin/view-material-mappings")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View Material Mappings
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation("/dashboard/admin/remove-material-mappings")
                    }
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove Material Mappings
                  </button>
                </div>
              )}
            </div>

            {/* Team Accordion */}
            <div>
              <button
                onClick={() => toggleSubmenu("team")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${openSubmenu === "team"
                  ? "bg-slate-100 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  Team
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === "team"
                    ? "rotate-180 text-blue-600"
                    : "text-slate-400"
                    }`}
                />
              </button>

              {openSubmenu === "team" && (
                <div className="mt-1 ml-9 pl-3 border-l-2 border-slate-100 space-y-1">
                  <button
                    onClick={() => handleNavigation("/dashboard/teams/add-members")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Members
                  </button>
                  <button
                    onClick={() => handleNavigation("/dashboard/teams/view-members")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    View Members
                  </button>
                  <button
                    onClick={() => handleNavigation("/dashboard/teams/restrict-access")}
                    className="block w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Restrict Access
                  </button>
                </div>
              )}
            </div>

            {/* Settings Link */}
            {/* <button
              onClick={() => handleNavigation("/settings")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <Settings className="w-5 h-5 text-slate-400" />
              Settings
            </button> */}

            {/* Help Link */}
            {/* <button
              onClick={() => handleNavigation("/help")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              Help & Support
            </button> */}
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
