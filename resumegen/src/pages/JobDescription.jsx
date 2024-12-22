import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

const JobDescription = () => {
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [domain, setDomain] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const rolesByDomain = {
    "Data Science": [
      "Junior Data Analyst",
      "Junior Data Scientist",
      "Junior Machine Learning Engineer",
      "Junior Python Data Scientist",
      "Junior Data Engineer",
    ],
    "Artificial Intelligence": [
      "Junior AI Engineer",
      "Junior NLP Engineer",
      "Computer Vision Engineer",
    ],
    "Cloud Computing": [
      "AWS Admin",
      "Junior DevOps Engineer",
      "Cloud Engineer",
      "Cloud Developer",
    ],
    "Full Stack": [
      "Java Full Stack Developer",
      "Python Full Stack Developer",
      "Frontend Developer",
      "Backend Developer",
      "Reactjs Developer",
      "Mern Stack Developer",
      "Cloud Developer",
      "Java Developer",
      "Python Developer",
      "JavaScript Developer",
    ],
  };

  // Backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    if (location.state) {
      if (location.state.resumeText) {
        setResumeText(location.state.resumeText);
      }
      if (location.state.resumeData) {
        setResumeData(location.state.resumeData);
      }
    }
  }, [location.state]);

  const handleDomainChange = (e) => {
    setDomain(e.target.value);
    setRole("");
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleAnalyzeClick = async () => {
    if (!role || !jobDescription || (!resumeText && !resumeData)) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    const apiUrl = `${backendUrl}/api/analyze`;

    const requestData = {
      resumeText: resumeData ? JSON.stringify(resumeData) : resumeText,
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
        navigate("/results", {
          state: { results: data },
        });
      } else {
        setError(data.error || "An error occurred");
        alert("Error: " + data.error);
      }
    } catch (err) {
      setError("Failed to connect to the backend");
      alert("Error occurred while analyzing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResumeDetails = () => {
    if (resumeData) {
      const {
        personalDetails,
        objective,
        skills,
        workExperience,
        education,
        projects,
      } = resumeData;

      return (
        <div className="space-y-4">
          {personalDetails && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Personal Details:</h3>
              <ul className="list-disc pl-5">
                {Object.entries(personalDetails).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value || "N/A"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {objective && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Objective:</h3>
              <p>{objective}</p>
            </div>
          )}

          {skills && Object.keys(skills).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Skills:</h3>
              <ul className="list-disc pl-5">
                {Object.entries(skills).map(([category, items], index) => (
                  <li key={index}>
                    {category}: {items.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {workExperience && workExperience.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Work Experience:</h3>
              <ul className="list-disc pl-5">
                {workExperience.map((exp, index) => (
                  <li key={index}>
                    {Object.entries(exp).map(([key, value]) => (
                      <p key={key}>
                        {key}: {value || "N/A"}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Education:</h3>
              <ul className="list-disc pl-5">
                {education.map((edu, index) => (
                  <li key={index}>
                    {Object.entries(edu).map(([key, value]) => (
                      <p key={key}>
                        {key}: {value || "N/A"}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Projects:</h3>
              <ul className="list-disc pl-5">
                {projects.map((project, index) => (
                  <li key={index}>
                    {Object.entries(project).map(([key, value]) => (
                      <p key={key}>
                        {key}: {value || "N/A"}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (resumeText) {
      return (
        <textarea
          value={resumeText}
          className="w-full h-60 p-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-100 resize-none"
          readOnly
        />
      );
    }

    return "No resume data available.";
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
            Analyze Job Fit
          </motion.h1>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-dark">Extracted Resume:</h2>
            <div className="w-full h-60 p-3 border border-gray-300 rounded-lg bg-gray-100 overflow-y-auto">
              {renderResumeDetails()}
            </div>

            <div className="w-full">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                Select Domain
              </h2>
              <select
                value={domain}
                onChange={handleDomainChange}
                className="w-full p-4 border border-gray-300 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
              >
                <option value="">Select a domain</option>
                {Object.keys(rolesByDomain).map((domainOption) => (
                  <option key={domainOption} value={domainOption}>
                    {domainOption}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                Select Role
              </h2>
              <select
                value={role}
                onChange={handleRoleChange}
                className="w-full p-4 border border-gray-300 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
              >
                <option value="">Select a role</option>
                {rolesByDomain[domain]?.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-lg font-semibold text-dark">Job Description:</h2>
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
                className="primary-btn px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                onClick={handleAnalyzeClick}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Check Your Fit"}
              </motion.button>
            </div>

            {error && <p className="text-red-600 text-center mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
