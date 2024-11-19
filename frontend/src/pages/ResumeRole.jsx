import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { CircleLoader } from "react-spinners";
import { CircularProgressbar } from "react-circular-progressbar";
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
            "Data Science",
            "Machine Learning Engineer",
            "Junior Python Data Scientist",
            "Data Engineer",
            "Data Science",         // Additional role
        ],
        "Artificial Intelligence": [
            "Junior AI Engineer",
            "Junior NLP Engineer",
            "Computer Vision Engineer",
        ],
        "Cloud Computing": [
            "AWS Admin",
            "DevOps",
            "Cloud Engineer",
            "Cloud Developer",
            "Network Engineer",     // Added role
            "Cyber Security",       // Added role
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
            "Mobile App Developer", // Added role
            "Software Engineer",    // Added role
            "Quality Assurance",    // Added role
            "Business Analyst",     // Added role
        ],
    };
    

    const handleDomainChange = (e) => {
        setDomain(e.target.value);
        setRole("");
    };

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

        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
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
            setPredictionResult(null);
        } finally {
            setLoading(false);
        }
    };

    // Filter the suggested roles based on the selected domain
    const filteredSuggestedRoles = predictionResult
        ? predictionResult.suggested_roles.filter(suggestedRole =>
            rolesByDomain[domain]?.includes(suggestedRole.role)
        )
        : [];

    return (
        <div className="min-h-screen flex flex-col justify-center items-center pt-16 relative overflow-hidden bg-gradient-to-r from-teal-400 to-indigo-500">
         <div className="container max-w-7xl mx-auto p-8 flex flex-col md:flex-row gap-12 items-start justify-center relative mt-8 space-y-12 md:space-y-0">
                {/* Left Card for Domain and Role Selection */}
            

                {/* Right Card for Parsed Data */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-2xl shadow-xl p-8 w-full md:w-[50%] h-[550px] flex flex-col space-y-4 overflow-hidden overflow-y-auto custom-scrollbar"
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
                                        <strong>Phone:</strong> {parsedData.mobile_number || "N/A"}
                                    </div>
                                )}

                                {/* Skills */}
                                {parsedData.skills && parsedData.skills.length > 0 ? (
                                    <div className="border p-4 rounded-xl shadow-md">
                                        <strong>Skills:</strong> {parsedData.skills.join(', ') || "N/A"}
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
                                        <strong>Projects:</strong> {parsedData.projects || "N/A"}
                                    </div>
                                )}

                                {/* Soft Skills */}
                                {parsedData.soft_skills && parsedData.soft_skills.length > 0 ? (
                                    <div className="border p-4 rounded-xl shadow-md">
                                        <strong>Soft Skills:</strong> {parsedData.soft_skills.join(', ') || "N/A"}
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
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-2xl shadow-xl p-8 w-full md:w-[50%] h-[550px] flex flex-col space-y-4 overflow-hidden overflow-y-auto custom-scrollbar"
                >
                    <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Select Domain and Role</h2>
                    <select
                        value={domain}
                        onChange={handleDomainChange}
                        className="w-full p-4 border border-gray-300 rounded-2xl mb-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                            className="w-full p-4 border border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                className="mt-8 px-10 py-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg"
            >
                Check Your Score
            </button>

            {loading && (
                <div className="mt-8 flex justify-center">
                    <CircleLoader color="#f97316" size={150} />
                </div>
            )}

            {predictionResult && !loading && (
                <div
                    ref={predictionResultRef}
                    className="mt-12 flex flex-col md:flex-row p-6 gap-8 w-full center"
                >
                    <div className="flex flex-col md:w-1/3 w-full mb-6 md:mb-0 gap-6 justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="w-full bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center"
                        >
                            <div className="w-full mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Input Role: {predictionResult.given_role}</h3>
                            </div>

                            <div className="w-full mb-4">
                                <CircularProgressbar
                                    value={predictionResult.confidence}
                                    text={`${predictionResult.confidence.toFixed(2)}%`}
                                    strokeWidth={6}
                                    styles={{
                                        path: {
                                            stroke: "#f97316",
                                        },
                                        text: {
                                            fill: "#f97316",
                                            fontSize: "18px",
                                        },
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-2/3 bg-white p-6 rounded-2xl shadow-xl"
                    >
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                            Suggested Roles Based on Your Profile
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredSuggestedRoles.map((suggestedRole, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white p-6 rounded-2xl shadow-2xl hover:shadow-2xl transform transition-all duration-300 flex flex-col justify-between items-center"
                                >
                                    <h4 className="text-lg font-semibold text-gray-800">{suggestedRole.role}</h4>

                                    <div className="w-full mt-4">
                                        <CircularProgressbar
                                            value={suggestedRole.confidence}
                                            text={`${suggestedRole.confidence.toFixed(2)}%`}
                                            strokeWidth={8}
                                            styles={{
                                                path: {
                                                    stroke: "#34D399",
                                                },
                                                text: {
                                                    fill: "#34D399",
                                                    fontSize: "16px",
                                                },
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
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
                    border: 2px solid #f97316; /* Optional: adds a border for more defined look */
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f0f0f0; /* Light background for the track */
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #ff6e40; /* Slightly darker thumb color on hover */
                }
            `}</style>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mt-8 bg-red-100 text-red-700 p-6 rounded-2xl shadow-md"
                >
                    <p>{error}</p>
                </motion.div>
            )}
        </div>
    );
};

export default ResumeRole;
