import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { useStep } from "../hooks/StepContext";
import { savePersonalDetails } from "../services/firebaseUtils";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { fetchPersonalDetails } from "../services/firebaseUtils";

const PersonalDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStep } = useStep();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    address: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    otherLinks: []  // Start with an empty array
  });

  // State for user authentication
  const [userId, setUserId] = useState(null);

  // Extract resumeId from URL
  const resumeId = new URLSearchParams(location.search).get('resumeId');

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle other links changes
  const handleOtherLinkChange = (index, field, value) => {
    const newOtherLinks = [...formData.otherLinks];
    newOtherLinks[index][field] = value;
    setFormData(prevState => ({
      ...prevState,
      otherLinks: newOtherLinks
    }));
  };

  // Add new other link
  const addOtherLink = () => {
    setFormData(prevState => ({
      ...prevState,
      otherLinks: [...prevState.otherLinks, { title: "", url: "" }]
    }));
  };

  const handleNavigation = async (direction) => {
    if (direction === "previous") {
      setCurrentStep(1);
      navigate("/");
    } else if (direction === "next") {
      await handleSubmit(null, true);
      setCurrentStep(2);
      navigate(`/allpages/objective?resumeId=${resumeId}`);
    }
  };

  const handleSubmit = async (event, isNavigating = false) => {
    if (event) event.preventDefault();
    const form = event?.target;

    // Remove any empty other links before saving
    const cleanedOtherLinks = formData.otherLinks.filter(link => link.url.trim() !== "");

    const submissionData = {
      ...formData,
      otherLinks: cleanedOtherLinks
    };

    if (!form || form?.checkValidity()) {
      try {
        setIsSaving(true);
        if (!userId || !resumeId) {
          toast.error("User or Resume ID is missing!");
          return;
        }

        await savePersonalDetails(userId, resumeId, submissionData);

        if (!isNavigating) {
          toast.success("Personal details saved successfully!", {
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
        toast.error(`Failed to save details: ${error.message}`, {
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

  // Fetch existing personal details
  useEffect(() => {
    const fetchDetails = async () => {
      if (userId && resumeId) {
        try {
          const existingDetails = await fetchPersonalDetails(userId, resumeId);
          if (existingDetails && existingDetails.personalDetails) {
            const personalDetails = existingDetails.personalDetails;
            
            // Ensure otherLinks is an array of objects
            const otherLinks = personalDetails.otherLinks 
              ? personalDetails.otherLinks.map(link => 
                  typeof link === 'string' 
                    ? { title: "", url: link } 
                    : link
                )
              : [];

            setFormData({
              ...personalDetails,
              otherLinks: otherLinks
            });
          }
        } catch (error) {
          console.error("Error fetching personal details:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
  }, [userId, resumeId]);

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
              Personal Details
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

          {/* Input Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Enter your job title"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="Enter your LinkedIn profile URL"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub</label>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="Enter your GitHub profile URL"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
            />
          </div>

         {/* Other Links */}
         {formData.otherLinks.map((link, index) => (
            <React.Fragment key={index}>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Link Title {index + 1}
                </label>
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => handleOtherLinkChange(index, "title", e.target.value)}
                  placeholder="Enter link title (e.g., Portfolio)"
                  className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Link URL {index + 1}
                </label>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleOtherLinkChange(index, "url", e.target.value)}
                  placeholder="Enter URL"
                  className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                />
              </div>
            </React.Fragment>
          ))}

          {/* Save Button and Add Other Links */}
          <div className="col-span-1 sm:col-span-2 flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={addOtherLink}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 focus:outline-none transition-all duration-300 transform hover:scale-105 bg-purple-50 px-4 py-2 rounded-lg group"
            >
              <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add Another Links</span>
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

export default PersonalDetails;