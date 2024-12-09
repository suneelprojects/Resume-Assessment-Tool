import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { CircleLoader } from "react-spinners";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ResumeRole = () => {
  const [domain, setDomain] = useState("");
  const [role, setRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [parsedData, setParsedData] = useState(null);

  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  const predictionResultRef = useRef(null);

  useEffect(() => {
    if (location.state) {
      setResumeText(location.state.resumeText);
      setParsedData(location.state.parsedData);
    }
  }, [location.state]);

  useEffect(() => {
    if (predictionResult) {
      predictionResultRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [predictionResult]);

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

  const handleDomainChange = (e) => {
    setDomain(e.target.value);
    setRole("");
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!domain || !role || !resumeText) {
      alert("Please select a domain, role, and provide your resume text before proceeding.");
      return;
    }

    setLoading(true);
    const apiUrl = backendUrl.includes(":5000")
      ? `${backendUrl}/predict`
      : `${backendUrl}:5000/predict`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeText,
          input_role: role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPredictionResult(data);
        setError(null);
      } else {
        setError(data.error || "An error occurred");
        setPredictionResult(null);
      }
    } catch (err) {
      setError("Failed to connect to the backend");
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestedRoles = predictionResult
    ? predictionResult.suggested_roles.filter(
        (suggestedRole) => rolesByDomain[domain]?.includes(suggestedRole.role)
      )
    : [];

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    return phone.replace(/(\d{2})(\d{5})(\d{5})/, "+$1 $2 $3");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center pt-16 relative overflow-hidden bg-gradient-to-r from-teal-400 to-indigo-500">
      <div className="container max-w-7xl mx-auto p-8 flex flex-col md:flex-row gap-12 items-start justify-center relative mt-8 space-y-12 md:space-y-0">
        {/* Left Card for Domain and Role Selection */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-xl p-8 w-full md:w-[50%] h-[550px] flex flex-col space-y-4 overflow-hidden overflow-y-auto custom-scrollbar"
        >
          <div className="space-y-2">
            {parsedData ? (
              <>
                {/* Name */}
                {parsedData.name && (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Name:</strong> {parsedData.name || "N/A"}
                  </div>
                )}

                {/* Email */}
                {parsedData.email && (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Email:</strong> {parsedData.email || "N/A"}
                  </div>
                )}

                {/* Phone */}
                {parsedData.mobile_number && (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Phone:</strong> {formatPhoneNumber(parsedData.mobile_number) || "N/A"}
                  </div>
                )}

                {/* Skills */}
                {parsedData.skills && parsedData.skills.length > 0 ? (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Skills:</strong> {parsedData.skills.join(", ") || "N/A"}
                  </div>
                ) : (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Skills:</strong> N/A
                  </div>
                )}

                {/* Education */}
                {parsedData.education && (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Education:</strong> {parsedData.education || "N/A"}
                  </div>
                )}

                {/* Experience */}
                {parsedData.experience && (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Experience:</strong> {parsedData.experience || "N/A"}
                  </div>
                )}

                {/* Projects */}
                {parsedData.projects && parsedData.projects !== null && (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Projects:</strong>
                    <ul className="list-disc pl-6 mt-2">
                      {parsedData.projects
                        .split(/[\n•]+/) // Split by bullet points (•), dashes (-), or newlines (\n)
                        .map((project, index) => project.trim() && (  // Filter out empty strings after trimming
                          <li key={index} className="text-gray-800">{project.trim()}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Certifications */}
                {parsedData.certifications && parsedData.certifications !== null && (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Certifications:</strong>
                    <ul className="list-disc pl-6 mt-2">
                      {parsedData.certifications
                        .split(/[\n•]+/) // Split by bullet points (•), dashes (-), or newlines (\n)
                        .map((certification, index) => certification.trim() && (  // Filter out empty strings after trimming
                          <li key={index} className="text-gray-800">{certification.trim()}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Soft Skills */}
                {parsedData.soft_skills && parsedData.soft_skills.length > 0 ? (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Soft Skills:</strong> {parsedData.soft_skills.join(", ") || "N/A"}
                  </div>
                ) : (
                  <div className="border p-4 rounded-xl shadow-md">
                    <strong>Soft Skills:</strong> N/A
                  </div>
                )}
              </>
            ) : (
              <p>Parsed data will be shown here.</p>
            )}
          </div>
        </motion.div>
        {/* Right Card for Domain and Role Selection */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-xl p-8 w-full md:w-[50%] h-[550px] flex flex-col space-y-4 overflow-hidden overflow-y-auto custom-scrollbar"
        >
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Select Domain and Role</h2>
          <select
            value={domain}
            onChange={handleDomainChange}
            className="w-full p-4 border border-gray-300 rounded-3xl mb-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Select a domain</option>
            {Object.keys(rolesByDomain).map((domainOption) => (
              <option key={domainOption} value={domainOption}>
                {domainOption}
              </option>
            ))}
          </select>

          {domain && (
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full p-4 border border-gray-300 rounded-3xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select a role</option>
              {rolesByDomain[domain].map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          )}
        </motion.div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-8 bg-indigo-500 text-white py-3 px-6 rounded-3xl transition-all duration-300 ease-in-out transform ${loading ? 'opacity-50 cursor-not-allowed shadow-lg' : 'hover:shadow-xl hover:scale-105'}`}
      >
        {loading ? (
          <div className="flex justify-center items-center">
            <CircleLoader color="#ffffff" loading={loading} size={24} />
          </div>
        ) : (
          "Generate Prediction"
        )}
      </button>
      
      {predictionResult && !loading && (
  <div ref={predictionResultRef} className="mt-12 flex flex-col md:flex-row p-6 gap-8 w-full center">
    {/* Input Role Card */}
    <div className="flex flex-col md:w-1/3 w-full mb-6 md:mb-0 gap-6 justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full bg-white p-6 rounded-3xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200"
      >
        <div className="w-full mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Input Role: {predictionResult.given_role}</h3>
        </div>

        <div className="w-full mb-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <CircularProgressbar
              value={predictionResult.confidence}
              text={`${predictionResult.confidence.toFixed(2)}%`}
              strokeWidth={6}
              styles={{
                path: {
                  stroke: "#f97316",
                  transition: 'stroke-dashoffset 1s ease 0s',
                  strokeLinecap: 'round',
                  strokeDasharray: `${2 * Math.PI * 50}`,
                  strokeDashoffset: `${(1 - predictionResult.confidence / 100) * 2 * Math.PI * 50}`,
                },
                text: {
                  fill: "#f97316",
                  fontSize: "18px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "500",
                },
              }}
            />
          </motion.div>
          <div className="mt-2 text-center text-lg font-semibold text-gray-800">
            Confidence Level
          </div>
        </div>
      </motion.div>
    </div>

    {/* Suggested Roles Section */}
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full md:w-2/3 bg-white p-6 rounded-3xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200"
    >
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Suggested Roles Based on Your Profile</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredSuggestedRoles.map((suggestedRole, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 flex flex-col justify-between items-center border border-gray-200"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {suggestedRole.role}
            </h4>

            <div className="w-full flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <CircularProgressbar
                  value={suggestedRole.confidence}
                  text={`${suggestedRole.confidence.toFixed(2)}%`}
                  strokeWidth={8}
                  styles={{
                    path: {
                      stroke: "#34D399",
                      transition: 'stroke-dashoffset 1s ease 0s',
                      strokeLinecap: 'round',
                      strokeDasharray: `${2 * Math.PI * 50}`,
                      strokeDashoffset: `${(1 - suggestedRole.confidence / 100) * 2 * Math.PI * 50}`,
                    },
                    text: {
                      fill: "#34D399",
                      fontSize: "16px",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: "500",
                    },
                  }}
                />
              </motion.div>
              <div className="mt-2 text-center text-lg font-semibold text-gray-800">
                {suggestedRole.confidence.toFixed(2)}% Confidence
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
)}
  {predictionResult && !loading && (
  <div
    ref={predictionResultRef}
    className="mt-12 flex flex-col md:flex-row p-6 gap-8 w-full justify-center"
  >
    {/* Confidence Level Card */}
    <div className="flex flex-col items-center md:w-1/3 w-full p-6 bg-white rounded-3xl shadow-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Confidence Level
      </h3>
      <CircularProgressbar
        value={predictionResult.confidence}
        text={`${predictionResult.confidence.toFixed(2)}%`}
        styles={buildStyles({
          pathColor: "#4F46E5",
          textColor: "#1F2937",
          trailColor: "#D1D5DB",
          textSize: "18px",
          text: {
            fill: "#f97316",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "500",
          },
        })}
      />
      <p className="text-center mt-4 text-sm text-gray-600">
        How closely your profile matches the role
      </p>
    </div>

    {/* Missing Skills Section */}
    <div className="flex flex-col md:w-2/3 w-full p-6 bg-white rounded-3xl shadow-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Missing Skills</h3>
      {predictionResult.missing_skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {predictionResult.missing_skills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-red-300"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          You have all the required skills for the role!
        </p>
      )}
    </div>
  </div>
)}


{/* Recommendations Section */}
{predictionResult && !loading && (
  <div ref={predictionResultRef} className="mt-12 p-6 w-full space-y-6">
    <h2 className="text-2xl font-bold text-center text-gray-900">Recommendations</h2>

    {/* Skills Found in Resume */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills You Already Have</h3>
      <div className="text-gray-700">
        {predictionResult.resume_skills.length > 0 ? (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
            {predictionResult.resume_skills.map((skill, index) => (
              <li
                key={index}
                className="bg-green-100 text-green-700 font-semibold text-sm py-1 px-1 rounded-lg text-center shadow-sm border border-green-300"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No skills found in your resume.</p>
        )}
      </div>
    </div>

    {/* Missing Skills */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Skills You Need for the Role "{predictionResult.given_role}"
      </h3>
      <div className="text-gray-700">
        {predictionResult.missing_skills.length > 0 ? (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
            {predictionResult.missing_skills.map((skill, index) => (
              <li
                key={index}
                className="bg-red-100 text-red-700 font-semibold text-sm py-2 px-4 rounded-lg text-center shadow-sm border border-red-300"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You have all the required skills for the role!</p>
        )}
      </div>
    </div>
  </div>
)}


      <style jsx>{`
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;  /* For horizontal scrollbar */
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #f97316; /* Thumb color */
          border-radius: 10px;
          border: 2px solid #f97316; /* Optional: adds a border for contrast */
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;  /* Track color */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316; /* Hover effect */
        }
      `}</style>
    </div>
  );
};

export default ResumeRole;
