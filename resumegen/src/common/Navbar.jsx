import React, { useState, useEffect } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth, signOut } from "../services/firebaseConfig";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Update the user state based on the Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-indigo-800 border-b border-white/20 shadow-md">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto py-2 px-4 flex justify-between items-center"
      >
        {/* Logo section */}
        <div>
          <h1
            className="font-bold text-xl text-white/90 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Resume Builder
          </h1>
        </div>
        {/* Menu section */}
        <div className="hidden lg:block">
          <ul className="flex items-center gap-3">
            <div>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 text-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </ul>
        </div>
        {/* Mobile Hamburger menu section */}
        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <IoMdClose className="text-3xl text-white/90" />
            ) : (
              <IoMdMenu className="text-3xl text-white/90" />
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
          className="lg:hidden bg-indigo-800 fixed top-14 left-0 w-full p-3 flex flex-col items-center border-b border-white/20 shadow-2xl"
        >
          <ul className="w-full space-y-2">
            <div className="flex justify-center">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-32 mt-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition duration-300 shadow-md text-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-32 mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300 text-center text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </ul>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;