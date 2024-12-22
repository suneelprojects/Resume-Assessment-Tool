import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getResumeById, hasCompleteResume } from "../services/firebaseUtils";
import { PR1DownloadModal } from "../downloadmodel/PR1DownloadModal";
import { PR2DownloadModal } from "../downloadmodel/PR2DownloadModal";
import { DR1DownloadModal } from "../downloadmodel/DR1DownloadModal";
import { DR2DownloadModal } from "../downloadmodel/DR2downloadModal";

// Import all your resume templates
import DigitalResume1 from "./DigitalResume1";
import DigitalResume2 from "./DigitalResume2";
import ProfessionalResume1 from "./ProfessionalResume1";
import ProfessionalResume2 from "./ProfessionalResume2";
import ScoreCheckModal from "../pages/ScoreCheckModal"

const ResumeEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
    </div>
  );

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setIsLoading(false);
        setError("User not authenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!userId) return;

      try {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('resumeId');
        const template = searchParams.get('template');

        if (!id || !template) {
          throw new Error("Missing resumeId or template");
        }

        // Get the resume data
        const data = await getResumeById(userId, id);
        
        // Check completion status but don't block functionality
        const hasComplete = await hasCompleteResume(userId, id);
        setIsComplete(hasComplete);

        // Set the data if it exists
        if (data) {
          setResumeId(id);
          setSelectedTemplate(template);
          setResumeData(data);
        } else {
          throw new Error("No resume data found");
        }

      } catch (err) {
        console.error("Error fetching resume:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [userId, location]);

  const handleEditResume = () => {
    if (resumeId) {
      navigate(`/allpages/personaldetails?resumeId=${resumeId}`);
    }
  };

  // Mapping of template names to components
  const templateComponents = {
    "DigitalResume1": <DigitalResume1 resumeId={resumeId} />,
    "DigitalResume2": <DigitalResume2 resumeId={resumeId} />,
    "ProfessionalResume1": <ProfessionalResume1 resumeId={resumeId} />,
    "ProfessionalResume2": <ProfessionalResume2 resumeId={resumeId} />,
  };

  const renderDownloadModal = () => {
    const props = {
      isOpen: isDownloadOpen,
      onClose: () => setIsDownloadOpen(false),
      resumeData: resumeData,
      template: selectedTemplate,
      isComplete: isComplete // Still pass completion status for informational purposes
    };

    switch (selectedTemplate) {
      case "ProfessionalResume1":
        return <PR1DownloadModal {...props} />;
      case "ProfessionalResume2":
        return <PR2DownloadModal {...props} />;
      case "DigitalResume1":
        return <DR1DownloadModal {...props} />
      case "DigitalResume2":
        return <DR2DownloadModal {...props} />
      default:
        return <PR1DownloadModal {...props} />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      {renderDownloadModal()}

      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4 sm:gap-4">
          <button
            onClick={handleEditResume}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
            <span>Edit Resume</span>
          </button>

          <button
            onClick={() => setIsDownloadOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download Resume</span>
          </button>

          <button
            onClick={() => setIsScoreModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span>Check Your Score</span>
          </button>
        </div>
     

        <div className="w-full max-w-4xl mx-auto">
          <div className="border border-gray-300 rounded-lg shadow-sm p-8">
            {templateComponents[selectedTemplate] || (
              <div className="text-center text-red-500 text-xl">
                Template not found
              </div>
            )}
          </div>
        </div>

        <ScoreCheckModal
  isOpen={isScoreModalOpen}
  onClose={() => setIsScoreModalOpen(false)}
  isComplete={isComplete}
  resumeData={resumeData} // Pass the resume data
  resumeId={resumeId} // Pass the resume id
/>

      </div>
    </div>
  );
};

export default ResumeEditor;