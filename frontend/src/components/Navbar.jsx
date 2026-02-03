import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const Navbar = () => {
  const { isLoggedIn, role, logout } = useUser();
  const [profilePanel, setProfilePanel] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  const adminIdToken = localStorage.getItem("idToken");

  const navLinkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
     ${
       isActive
         ? "text-gray-500 bg-gray-100"
         : "text-black hover:text-gray-600 hover:bg-gray-50"
     }`;

  const handleLogoutClick = () => {
    logout();
    setProfilePanel(false);
    setMobileMenu(false);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <h3 className="text-xl font-semibold tracking-wide">VM Fitness</h3>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-x-4 relative">
          <NavLink to="/" className={navLinkClasses}>Home</NavLink>
          <NavLink to="/supplements" className={navLinkClasses}>Supplements</NavLink>
          <NavLink to="/notification" className={navLinkClasses}>Notifications</NavLink>

          {isLoggedIn && role === "admin" && (
            <NavLink to="/admin" className={navLinkClasses}>Admin Panel</NavLink>
          )}

          {isLoggedIn && (
            <div className="relative flex items-center gap-2">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `${navLinkClasses({ isActive })} flex gap-2 items-center`
                }
              >
                <img src="/cart.svg" alt="Cart" className="w-5" />
                Cart
              </NavLink>

              <img
                src="/profile.png"
                alt="Profile"
                onClick={() => setProfilePanel(!profilePanel)}
                className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer"
              />

              {profilePanel && (
                <div className="absolute right-0 top-12 z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-48 py-3 text-sm">
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setProfilePanel(false)}
                  >
                    View Profile
                  </NavLink>

                  <p
                    onClick={handleLogoutClick}
                    className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              )}
            </div>
          )}

          {!isLoggedIn && (
            <NavLink
              to="/login"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-black"
            >
              Login
            </NavLink>
          )}
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <span
            className={`w-6 h-0.5 bg-black transition-all duration-300 ${
              mobileMenu ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-black my-1 transition-all duration-300 ${
              mobileMenu ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-black transition-all duration-300 ${
              mobileMenu ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-2">
          <NavLink to="/" className={navLinkClasses} onClick={() => setMobileMenu(false)}>Home</NavLink>
          <NavLink to="/supplements" className={navLinkClasses} onClick={() => setMobileMenu(false)}>Supplements</NavLink>
          <NavLink to="/notification" className={navLinkClasses} onClick={() => setMobileMenu(false)}>Notifications</NavLink>

          {isLoggedIn && role === "admin" && (
            <>
              <NavLink to="/admin" className={navLinkClasses} onClick={() => setMobileMenu(false)}>Admin Panel</NavLink>
              <button
                onClick={() => {
                  setShowDietModal(true);
                  setMobileMenu(false);
                }}
                className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-black hover:bg-gray-50 transition-all duration-200"
              >
                🥗 Diet
              </button>
            </>
          )}

          {isLoggedIn && (
            <>
              <NavLink to="/cart" className={navLinkClasses} onClick={() => setMobileMenu(false)}>Cart</NavLink>
              <NavLink to="/profile" className={navLinkClasses} onClick={() => setMobileMenu(false)}>Profile</NavLink>
              <p
                onClick={handleLogoutClick}
                className="px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-gray-100 rounded-md"
              >
                Logout
              </p>
            </>
          )}

          {!isLoggedIn && (
            <NavLink
              to="/login"
              className="block px-4 py-2 rounded-md text-sm font-medium text-white bg-black text-center"
              onClick={() => setMobileMenu(false)}
            >
              Login
            </NavLink>
          )}
        </div>
      )}

    </nav>
  );
};

export default Navbar;
