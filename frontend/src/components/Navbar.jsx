import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartPie, FaPlusCircle, FaLightbulb, FaUser } from "react-icons/fa";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">💸 Budget Bliss</div>

      <ul className="navbar-links">
        <li>
          <NavLink to="/Analytics" activeclassname="active">
            <FaHome className="icon" /> Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/overview" activeclassname="active">
            <FaChartPie className="icon" /> Analytics
          </NavLink>
        </li>
        <li>
          <NavLink to="/create-budget" activeclassname="active">
            <FaPlusCircle className="icon" /> Create Budget
          </NavLink>
        </li>
        <li>
          <NavLink to="/tips" activeclassname="active">
            <FaLightbulb className="icon" /> Tips
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" activeclassname="active">
            <FaUser className="icon" /> Profile
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
