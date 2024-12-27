import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useStep } from "../hooks/StepContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { saveAchievements, fetchAchievements } from "../services/firebaseUtils";

const Achievements = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStep } = useStep();
  
  // State for user authentication and loading
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Extract resumeId from URL
  const resumeId = new URLSearchParams(location.search).get('resumeId');

  const [achievements, setAchievements] = useState("");

  // Listen to authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch existing achievements when component loads
  useEffect(() => {
    const fetchExistingAchievements = async () => {
      if (userId && resumeId) {
        try {
          const existingAchievements = await fetchAchievements(userId, resumeId);
          if (existingAchievements) {
            setAchievements(existingAchievements);
          }
        } catch (error) {
          console.error("Error fetching achievements:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExistingAchievements();
  }, [userId, resumeId]);

  // Handle submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!userId || !resumeId) {
      toast.error("User or Resume ID is missing!");
      return;
    }
  
    try {
      setIsSaving(true);
      // Save achievements to Firestore
      await saveAchievements(userId, resumeId, achievements);
  
      // Show success toast
      toast.success("Achievements saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        zIndex: 60,
      });
  
      // Navigate to skills page
      handleNavigation("next");
    } catch (error) {
      toast.error(`Failed to save achievements: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigation = (direction) => {
    if (direction === "previous") {
      setCurrentStep(5);
      navigate(`/allpages/education?resumeId=${resumeId}`);
    } else if (direction === "next") {
      setCurrentStep(7);
      navigate(`/allpages/skills?resumeId=${resumeId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ml-0 md:ml-64">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-200"></div>
          <div className="h-4 w-36 bg-purple-200 rounded"></div>
          <div className="text-purple-500">Loading your achievements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 ml-0 md:ml-64">
      <div className="my-8 w-full max-w-4xl bg-white/30 border border-white/20 rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
        <form
          className="grid grid-cols-1 gap-y-6 w-full"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Heading with navigation arrows */}
          <div className="col-span-1 mb-1 flex justify-between items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Achievements & Certificates
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleNavigation("previous")}
                className="p-2 rounded-md bg-white/40 hover:bg-purple-200 focus:outline-none transition-all duration-300 transform hover:scale-105 group"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigation("next")}
                className="p-2 rounded-md bg-white/40 hover:bg-purple-200 focus:outline-none transition-all duration-300 transform hover:scale-105 group"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div
              className="mt-1 border border-gray-300 rounded-lg overflow-hidden"
              style={{ backgroundColor: "white" }}
            >
              <ReactQuill
                theme="snow"
                placeholder="Describe your achievements, awards, and certificates"
                className="custom-quill-editor"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }], // Headers
                    ["bold", "italic", "underline", "strike", { list: "bullet" }], // Basic formatting
                  ],
                }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  borderRadius: "0.5rem",
                  border: "1px solid #D1D5DB",
                }}
                value={achievements}
                onChange={(value) => setAchievements(value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-1 flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-10 rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Info</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Achievements;