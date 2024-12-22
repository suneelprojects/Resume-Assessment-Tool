import React, { useState, useEffect } from "react";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useStep } from "../hooks/StepContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { saveProjects, fetchProjects } from "../services/firebaseUtils";

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStep } = useStep();
  
  // State for user authentication and loading
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Extract resumeId from URL
  const resumeId = new URLSearchParams(location.search).get('resumeId');

  const [projects, setProjects] = useState([
    {
      name: "",
      link: "",
      description: "",
    },
  ]);

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

  // Fetch existing projects when component loads
  useEffect(() => {
    const fetchDetails = async () => {
      if (userId && resumeId) {
        try {
          const existingProjects = await fetchProjects(userId, resumeId);
          if (existingProjects.length > 0) {
            setProjects(existingProjects);
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
  }, [userId, resumeId]);

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { name: "", link: "", description: "" },
    ]);
  };

  const handleDeleteProject = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
  };

  const handleInputChange = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;

    if (form.checkValidity()) {
      try {
        setIsSaving(true);
        // Ensure we have both userId and resumeId
        if (!userId || !resumeId) {
          toast.error("User or Resume ID is missing!");
          return;
        }

        // Save projects to Firestore
        await saveProjects(userId, resumeId, projects);

        // Show success toast
        toast.success("Projects saved successfully!", {
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

        // Navigate to next page
        handleNavigation("next");
      } catch (error) {
        // Show error toast
        toast.error(`Failed to save projects: ${error.message}`, {
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
      setCurrentStep(3); // Set to "Work Experience"
      navigate(`/allpages/workexperience?resumeId=${resumeId}`);
    } else if (direction === "next") {
      setCurrentStep(5); // Set to "Education"
      navigate(`/allpages/education?resumeId=${resumeId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ml-0 md:ml-64">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-200"></div>
          <div className="h-4 w-36 bg-purple-200 rounded"></div>
          <div className="text-purple-500">Loading your projects...</div>
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
              Projects
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

          {projects.map((project, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <div className="col-span-1 sm:col-span-2 border-t border-gray-300 my-6 relative">
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(index)}
                    className="absolute top-[-12px] right-0 text-gray-500 hover:text-red-500 focus:outline-none transition-all duration-300 transform hover:scale-110 hover:rotate-6 group"
                    title="Delete Project"
                  >
                    <TrashIcon className="h-5 w-5 relative top-[13px] group-hover:text-red-600" />
                  </button>
                </div>
              )}

              {/* Project Name and Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                  value={project.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Link
                </label>
                <input
                  type="url"
                  placeholder="Enter project link"
                  className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                  value={project.link}
                  onChange={(e) =>
                    handleInputChange(index, "link", e.target.value)
                  }
                />
              </div>

              {/* Description */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <ReactQuill
                    theme="snow"
                    placeholder="Describe your project"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      borderRadius: "0.5rem",
                      border: "1px solid #D1D5DB",
                    }}
                    className="custom-quill-editor"
                    value={project.description}
                    onChange={(value) =>
                      handleInputChange(index, "description", value)
                    }
                  />
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Add Project Button and Save Button */}
          <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-between items-center mt-[-5px] space-y-4 sm:space-y-0">
            <button
              type="button"
              onClick={handleAddProject}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 focus:outline-none transition-all duration-300 transform hover:scale-105 bg-purple-50 px-4 py-2 rounded-lg group"
            >
              <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add More Project</span>
            </button>

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

export default Projects;