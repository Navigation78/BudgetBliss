import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartPie, FaPlusCircle, FaLightbulb, FaUser } from "react-icons/fa";
import { Wallet, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/home", label: "Home", Icon: FaHome },
  { to: "/create-budget", label: "Create Budget", Icon: FaPlusCircle },
  { to: "/analytics", label: "Analytics", Icon: FaChartPie },
  { to: "/tips", label: "Tips & Streak", Icon: FaLightbulb },
  { to: "/profile", label: "Profile", Icon: FaUser },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
      isActive ? "bg-primary text-white" : "text-white hover:text-accent"
    }`;

  return (
    <nav className="fixed w-full bg-ink shadow-md px-6 py-3 top-0 z-50">
      <div className="flex justify-between items-center">
        <div className="text-white text-xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-accent" />
          BudgetBliss
        </div>

        <ul className="hidden md:flex space-x-4">
          {NAV_LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink to={to} className={linkClasses}>
                <Icon /> {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="text-white"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <ul className="md:hidden flex flex-col gap-1 mt-3 pb-2">
          {NAV_LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink to={to} className={linkClasses} onClick={() => setIsMenuOpen(false)}>
                <Icon /> {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
