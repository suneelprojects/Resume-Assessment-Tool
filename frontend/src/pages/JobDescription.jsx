import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate instead of useHistory

const JobDescription = () => {
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState(""); // To hold the extracted resume text
  const [results, setResults] = useState(null); // To hold the analysis results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const navigate = useNavigate(); // For navigation
  const location = useLocation(); // Get the location from the router to access the state

  // Backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

  // Set the resume text from location state (passed from Hero component)
  useEffect(() => {
    if (location.state && location.state.resumeText) {
      setResumeText(location.state.resumeText);
    }
  }, [location.state]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleAnalyzeClick = async () => {
    if (!role || !jobDescription || !resumeText) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true); // Set loading to true

    const apiUrl = backendUrl.includes(":5000")
      ? `${backendUrl}/api/analyze`
      : `${backendUrl}:5000/api/analyze`;

    const requestData = {
      resumeText,
      jobDescription,
      role,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        setError(null);
        // Navigate to results page
        navigate("/results", {
          state: { results: data }, // Passing results to the next page
        });
      } else {
        setError(data.error || "An error occurred");
        alert("Error: " + data.error);
      }
    } catch (error) {
      setError("Failed to connect to the backend");
      alert("Error occurred while analyzing: " + error.message);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="bg-light min-h-screen flex justify-center items-center pt-20">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-semibold text-dark text-center mb-6"
          >
            Select Role
          </motion.h1>

          <div className="space-y-6">
            {/* Displaying the extracted resume text */}
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-semibold text-dark text-center"
            >
              Extracted Resume Text
            </motion.h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-60 p-3 border border-gray-300 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Extracted resume text will appear here..."
              readOnly
            />

            {/* Role selection */}
            <motion.select
              value={role}
              onChange={handleRoleChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              <option value="Junior Data Analyst">Junior Data Analyst</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Product Manager">Product Manager</option>
              <option value="UX Designer">UX Designer</option>
            </motion.select>

            {/* Job description input */}
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-semibold text-dark text-center"
            >
              Job Description
            </motion.h2>
            <textarea
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter job description here..."
            />

            <div className="flex justify-center">
              <motion.button
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="primary-btn px-6 py-2"
                onClick={handleAnalyzeClick}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Check Your Score"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
