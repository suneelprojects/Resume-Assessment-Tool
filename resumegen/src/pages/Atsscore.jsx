import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import DOMPurify from "dompurify";
import "react-circular-progressbar/dist/styles.css";

const Atsscore = () => {
  const location = useLocation();
  const [domain, setDomain] = useState("");
  const [role, setRole] = useState("");
  const [resumeText, setResumeText] = useState(""); // Raw text resume
  const [resumeData, setResumeData] = useState(null); // Structured resume data
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      "React.js Developer",
      "MERN Stack Developer",
      "Cloud Developer",
      "Java Developer",
      "Python Developer",
      "JavaScript Developer",
    ],
  };

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

  const handleAnalyzeClick = async () => {
    if (!role || (!resumeText && !resumeData)) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    const apiUrl = `${backendUrl}/api/calculate_ats`;

    const requestData = {
      resume_text: resumeData ? JSON.stringify(resumeData) : resumeText,
      input_role: role,
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

  const SECTION_ORDER = [
    "objective",
    "jobTitle",
    "personalDetails",
    "education",
    "skills",
    "projects",
    "workExperience",
    "achievements",
  ];

  const renderField = (field) => {
    if (Array.isArray(field)) {
      return (
        <ul className="list-disc pl-5">
          {field.map((item, index) => (
            <li key={index}>{renderField(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof field === "object" && field !== null) {
      return (
        <div className="pl-4 border-l-2 border-gray-200">
          {Object.entries(field).map(([key, value], index) => (
            <div key={index} className="mb-2">
              <strong className="capitalize">{key}:</strong> {renderField(value)}
            </div>
          ))}
        </div>
      );
    } else if (typeof field === "string" && field.startsWith("http")) {
      return (
        <a
          href={field}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 underline"
        >
          {field}
        </a>
      );
    } else if (typeof field === "string" && field.includes("<")) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(field) }}
          className="prose"
        />
      );
    }
    return field || "N/A";
  };
  const renderResumeDetails = () => {
    if (resumeData) {
      return (
        <div className="space-y-6">
          {SECTION_ORDER.map((section) => {
            const data = resumeData[section];
            if (data) {
              return (
                <div
                  key={section}
                  className="p-6 bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-800 capitalize border-b pb-2 mb-4">
                    {section.replace(/([A-Z])/g, " $1").trim()}:
                  </h3>
                  <div className="mt-2 text-gray-700">{renderField(data)}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    } else if (resumeText) {
      return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Raw Resume Text:
          </h3>
          <textarea
            value={resumeText}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg text-gray-700 shadow-sm focus:outline-none bg-gray-100 resize-none"
            readOnly
          />
        </div>
      );
    }
  
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <p className="text-gray-500">No resume data available.</p>
      </div>
    );
  };
  

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 min-h-screen flex justify-center items-center py-10">
      <div className="container max-w-6xl mx-auto px-6 py-8 bg-gray-100 rounded-3xl shadow-xl">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-gray-900 mb-8"
        >
          ATS Score Analysis
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-6 bg-gray-50 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Extracted Resume Data
          </h2>
          <div className="h-[60vh] overflow-y-auto custom-scrollbar">
            {renderResumeDetails()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-xl shadow-md"
        >
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
        </motion.div>

        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:bg-indigo-600 transition-all"
            onClick={handleAnalyzeClick}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze ATS Score"}
          </motion.button>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-6 bg-gray-50 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
              Analysis Results
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {["ats_score", "skill_score", "section_score", "formatting_score"].map((key, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center bg-white p-4 rounded-xl shadow-lg"
                >
                  <div className="w-40 h-40">
                    <CircularProgressbar
                      value={results[key]}
                      text={`${results[key].toFixed(1)}%`}
                      styles={buildStyles({
                        textSize: "24px",
                        pathColor: index % 2 === 0 ? "#4F46E5" : "#E11D48",
                        textColor: "#111827",
                        trailColor: "#D1D5DB",
                      })}
                    />
                  </div>
                  <p className="mt-4 text-gray-700 font-medium capitalize">
                    {key.replace("_", " ")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Resume Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.resume_skills.length > 0
                  ? results.resume_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 border border-green-300"
                      >
                        {skill}
                      </span>
                    ))
                  : "No skills found"}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.missing_skills.length > 0
                  ? results.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 border border-red-300"
                      >
                        {skill}
                      </span>
                    ))
                  : "You have all required skills!"}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Atsscore;
