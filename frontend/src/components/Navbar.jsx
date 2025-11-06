import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartPie, FaPlusCircle, FaLightbulb, FaUser } from "react-icons/fa";

function Navbar() {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
      isActive ? "bg-royalBlue text-white" : "text-white hover:text-lightBlue"
    }`;

  return (
    <nav className="w-full bg-darkNavy shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="text-white text-lg font-semibold flex items-center gap-2">
         Budget Bliss
      </div>

      <ul className="flex space-x-4">
        <li><NavLink to="/home" className={linkClasses}><FaHome /> Home</NavLink></li>
        <li><NavLink to="/analytics" className={linkClasses}><FaChartPie /> Analytics</NavLink></li>
        <li><NavLink to="/create-budget" className={linkClasses}><FaPlusCircle /> Create Budget</NavLink></li>
        <li><NavLink to="/tips" className={linkClasses}><FaLightbulb /> Tips</NavLink></li>
        <li><NavLink to="/profile" className={linkClasses}><FaUser /> Profile</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
