import React, { useState } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-white shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto py-3 px-13 flex justify-between items-center"
      >
        {/* Logo section */}
        <div>
          <h1
            className="font-bold text-2xl cursor-pointer"
            onClick={() => navigate("/")}
          >
            Resume Checker
          </h1>
        </div>
        {/* Menu section */}
        <div className="hidden lg:block">
          <ul className="flex items-center gap-3">
            <li>
              <a
                href="/"
                className="inline-block py-2 px-3 hover:text-secondary relative group  text-[18px]"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group text-[18px]"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group text-[18px]"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                Features
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group text-[18px]"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                FAQ's
              </a>
            </li>
            <li>
              {/* <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                Contact Us
              </a> */}
            </li>
            <button className="primary-btn">Sign In</button>
          </ul>
        </div>
        {/* Mobile Hamburger menu section */}
        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <IoMdClose className="text-4xl" />
            ) : (
              <IoMdMenu className="text-4xl" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden bg-white shadow-md fixed top-16 left-0 w-full p-5 flex flex-col items-center border-t border-gray-300"
        >
          <ul className="w-full space-y-2">
            <li>
              <a
                href="/"
                className={`block py-3 px-4 text-center ${isActive("/") ? "text-secondary" : ""
                  }`}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className={`block py-3 px-4 text-center ${isActive("/about") ? "text-secondary" : ""
                  }`}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/services"
                className={`block py-3 px-4 text-center ${isActive("/services") ? "text-secondary" : ""
                  }`}
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="/faq"
                className={`block py-3 px-4 text-center ${isActive("/faq") ? "text-secondary" : ""
                  }`}
              >
                FAQ's
              </a>
            </li>
            <li>
              {/* <a
                href="/contact"
                className={`block py-3 px-4 text-center ${isActive("/contact") ? "text-secondary" : ""
                  }`}
              >
                Contact Us
              </a> */}
            </li>
            <div className="flex justify-center">
              <button className="primary-btn w-32 mt-3">Sign In</button>
            </div>
          </ul>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;