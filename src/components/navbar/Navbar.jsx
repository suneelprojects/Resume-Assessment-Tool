import React from "react";
import { IoMdMenu } from "react-icons/io";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

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
                className="inline-block py-2 px-3 hover:text-secondary relative group"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                Services
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                FAQ's
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-block py-2 px-3 hover:text-secondary relative group"
              >
                <div className="w-2 h-2 bg-secondary absolute mt-4 rounded-full left-1/2 -translate-x-1/2 top-1/2 bottom-0 group-hover:block hidden"></div>
                Contact Us
              </a>
            </li>
            <button className="primary-btn">Sign In</button>
          </ul>
        </div>
        {/* Mobile Hamburger menu section */}
        <div className="lg:hidden">
          <IoMdMenu className="text-4xl" />
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
