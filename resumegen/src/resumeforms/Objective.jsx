import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { useStep } from "../hooks/StepContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { saveObjective, fetchObjective } from "../services/firebaseUtils";

const Objective = () => {
  const [selectedObjective, setSelectedObjective] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStep } = useStep();
  const [isLoading, setIsLoading] = useState(true);

  // State for user authentication
  const [userId, setUserId] = useState(null);

  // Extract resumeId from URL
  const resumeId = new URLSearchParams(location.search).get('resumeId');

  const objectives = [
    "To secure a challenging position in a reputable organization where I can learn and grow while contributing to the success of the team.",
    "A motivated graduate eager to apply my knowledge and skills to real-world projects while gaining hands-on experience in a dynamic work environment.",
    "Seeking an entry-level role where I can utilize my academic background and passion for [specific field] to kickstart my professional journey.",
    "To leverage my [X years] of experience in [industry/field] to drive results and contribute to organizational growth, while enhancing my professional expertise.",
    "A dynamic professional with a proven track record of success in [specific area]. Looking for a role that allows me to apply my skills and take on greater responsibilities.",
    "To obtain a challenging position in a forward-thinking company where I can utilize my expertise in [field] and continue to grow professionally.",
    "To bring my extensive experience in [specific field/industry] to a leadership role, driving strategic initiatives and fostering innovation for organizational success.",
    "A seasoned professional seeking to utilize my [X years] of expertise to mentor teams, optimize processes, and contribute to long-term company goals.",
    "Looking for an opportunity to apply my deep knowledge in [specific domain] to tackle complex challenges and make a meaningful impact at a senior level.",
  ];

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

  // Fetch existing objective when component loads
  useEffect(() => {
    const fetchExistingObjective = async () => {
      if (userId && resumeId) {
        try {
          const existingObjective = await fetchObjective(userId, resumeId);
          if (existingObjective) {
            setSelectedObjective(existingObjective);
          }
        } catch (error) {
          console.error("Error fetching objective:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExistingObjective();
  }, [userId, resumeId]);

  const handleSubmit = async (event, isNavigating = false) => {
    if (event) event.preventDefault();
    const form = event?.target;

    if (!form || form?.checkValidity()) {
      try {
        setIsSaving(true);
        // Ensure we have both userId and resumeId
        if (!userId || !resumeId) {
          toast.error("User or Resume ID is missing!");
          return;
        }

        // Save objective to Firestore
        await saveObjective(userId, resumeId, selectedObjective);

        if (!isNavigating) {
          toast.success("Objective saved successfully!", {
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

          handleNavigation("next");
        }
      } catch (error) {
        toast.error(`Failed to save objective: ${error.message}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      form.reportValidity();
    }
  };

  const handleNavigation = (direction) => {
    if (direction === "previous") {
      setCurrentStep(1);
      navigate(`/allpages/personaldetails?resumeId=${resumeId}`);
    } else if (direction === "next") {
      setCurrentStep(3);
      handleSubmit(null, true);
      navigate(`/allpages/workexperience?resumeId=${resumeId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ml-0 md:ml-64">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-200"></div>
          <div className="h-4 w-36 bg-purple-200 rounded"></div>
          <div className="text-purple-500">Loading your details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 ml-0 md:ml-64">
      <div className="my-8 w-full max-w-4xl bg-white/30 border border-white/20 rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 w-full"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Heading with navigation arrows */}
          <div className="col-span-1 sm:col-span-2 mb-1 flex justify-between items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Professional Objective
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

          {/* Select Objective */}
          <div className="col-span-1 sm:col-span-2">
            <label 
              htmlFor="objectives" 
              className="block text-sm font-medium text-gray-700"
            >
              Select Objective
            </label>
            <select
              id="objectives"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
              value={selectedObjective}
              onChange={(e) => setSelectedObjective(e.target.value)}
            >
              <option value="" disabled>
                Choose an objective
              </option>
              {objectives.map((objective, index) => (
                <option key={index} value={objective}>
                  {objective.length > 140 ? objective.substring(0, 140) + "..." : objective}
                </option>
              ))}
            </select>
          </div>

          {/* Edit Objective */}
          <div className="col-span-1 sm:col-span-2">
            <label 
              htmlFor="selectedObjective" 
              className="block text-sm font-medium text-gray-700"
            >
              Edit Objective
            </label>
            <textarea
              id="selectedObjective"
              rows={4}
              value={selectedObjective}
              onChange={(e) => setSelectedObjective(e.target.value)}
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
              placeholder="Edit or customize your objective here"
            />
          </div>

          {/* Save Button */}
          <div className="col-span-1 sm:col-span-2 flex justify-end mt-4">
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

export default Objective;