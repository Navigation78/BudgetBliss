import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartPie, FaPlusCircle, FaLightbulb, FaUser } from "react-icons/fa";
import { Wallet } from "lucide-react";

function Navbar() {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
      isActive ? "bg-[#3E68A3] text-white" : "text-white hover:text-[#A1C6EA]"
    }`;

  return (
    <nav className="fixed w-full bg-[#04080F] shadow-md px-6 py-3 flex justify-between items-center top-0 z-50">
      <div className="text-white text-xl font-bold flex items-center gap-2">
        <Wallet className="h-6 w-6 text-[#A1C6EA]" />
        BudgetBliss
      </div>

      <ul className="hidden md:flex space-x-4">
        <li>
          <NavLink to="/home" className={linkClasses}>
            <FaHome /> Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/create-budget" className={linkClasses}>
            <FaPlusCircle /> Create Budget
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={linkClasses}>
            <FaChartPie /> Analytics
          </NavLink>
        </li>
        <li>
          <NavLink to="/tips" className={linkClasses}>
            <FaLightbulb /> Tips & Streak
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={linkClasses}>
            <FaUser /> Profile
          </NavLink>
        </li>
      </ul>

      {/* Mobile menu button - you can add mobile menu later */}
      <div className="md:hidden">
        <button className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;