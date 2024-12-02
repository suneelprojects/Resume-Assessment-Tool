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
            "Network Engineer",
            "Cyber Security",
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
            "Mobile App Developer",
            "Software Engineer",
            "Quality Assurance",
            "Business Analyst",
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
        const backendUrl = import.meta.env.MODE === 'production' 
        ? import.meta.env.VITE_BACKEND_URL 
        : 'http://127.0.0.1:80';
      
        try {
            const response = await fetch(`${backendUrl}/predict`, {
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

    const filteredSuggestedRoles = predictionResult
        ? predictionResult.suggested_roles.filter(suggestedRole =>
            rolesByDomain[domain]?.includes(suggestedRole.role)
        )
        : [];

    // Format the phone number correctly (with "+" and proper spacing)
    const formatPhoneNumber = (phone) => {
        if (!phone) return phone;
        return phone.replace(/(\d{2})(\d{5})(\d{5})/, "+$1 $2 $3");
    };

    const renderDynamicSection = (sectionTitle, sectionData) => {
        if (!sectionData) return null;
        if (Array.isArray(sectionData)) {
            // Format arrays nicely, with commas and spaces
            return (
                <div className="border p-4 rounded-xl shadow-md">
                    <strong>{sectionTitle}:</strong>
                    {sectionData.map((item, index) => (
                        <div key={index} className="text-gray-800">{item}</div>
                    ))}
                </div>
            );
        } else {
            // Ensure no trailing spaces or extra characters
            return (
                <div className="border p-4 rounded-xl shadow-md">
                    <strong>{sectionTitle}:</strong> {sectionData.trim()}
                </div>
            );
        }
    };

    const renderProjects = (projects) => {
        if (!projects) return null;
        return (
            <div className="border p-4 rounded-xl shadow-md">
                <strong>Projects:</strong>
                <ul className="list-disc pl-6 mt-2">
                    {projects.split(/[\n•]+/).map((project, index) => (
                        project.trim() && <li key={index} className="text-gray-800">{project.trim()}</li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderCertifications = (certifications) => {
        if (!certifications) return null;
        return (
            <div className="border p-4 rounded-xl shadow-md">
                <strong>Certifications:</strong>
                <ul className="list-disc pl-6 mt-2">
                    {certifications.split(/[\n•]+/).map((certification, index) => (
                        certification.trim() && <li key={index} className="text-gray-800">{certification.trim()}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center pt-16 relative overflow-hidden bg-gradient-to-r from-teal-400 to-indigo-500">
            <div className="container max-w-7xl mx-auto p-8 flex flex-col md:flex-row gap-12 items-start justify-center relative mt-8 space-y-12 md:space-y-0">
                {/* Left Card for Domain and Role Selection */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-2xl shadow-xl p-8 w-full md:w-[50%] h-[550px] flex flex-col space-y-4 overflow-hidden overflow-y-auto custom-scrollbar"
                >
                    <div className="space-y-2">
                        {parsedData ? (
                            <>
                                {renderDynamicSection("Name", parsedData.name)}
                                {renderDynamicSection("Email", parsedData.email)}
                                {renderDynamicSection("Phone", formatPhoneNumber(parsedData.mobile_number))}
                                {renderDynamicSection("Skills", parsedData.skills)}
                                {renderDynamicSection("Education", parsedData.education)}
                                {renderDynamicSection("Experience", parsedData.experience)}
                                {renderProjects(parsedData.projects)}
                                {renderCertifications(parsedData.certifications)}
                                {renderDynamicSection("Links", parsedData.links)}
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
                disabled={loading}
                className={`mt-8 bg-indigo-500 text-white py-3 px-6 rounded-2xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <CircleLoader color="#ffffff" loading={loading} size={24} /> : "Generate Prediction"}
            </button>

            {predictionResult && !loading && (
                <div
                    ref={predictionResultRef}
                    className="mt-12 flex flex-col md:flex-row p-6 gap-8 w-full center"
                >
                    <div className="flex flex-col md:w-1/3 w-full mb-6 md:mb-0 gap-6 justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold">Top Suggested Roles</h3>
                            <ul className="space-y-2">
                                {filteredSuggestedRoles.map((suggestedRole, index) => (
                                    <li key={index} className="bg-white p-4 rounded-lg shadow-md">
                                        <span className="font-bold">{suggestedRole.role}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    <div className="flex flex-col gap-6 justify-center md:w-2/3 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold">Prediction Confidence</h3>
                            <CircularProgressbar
                                value={predictionResult.confidence}
                                text={`${Math.round(predictionResult.confidence)}%`}
                            />
                        </motion.div>
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
                <div className="text-red-500 mt-6 text-center">{error}</div>
            )}
        </div>
    );
};

export default ResumeRole;
