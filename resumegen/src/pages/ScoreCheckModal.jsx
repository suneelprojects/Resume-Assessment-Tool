import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScoreCheckModal = ({ isOpen, onClose, resumeData, resumeId }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleButtonClick = (path) => {
    // Pass resumeId and resumeData as state to the new page
    navigate(path, { state: { resumeId, resumeData } });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal panel */}
      <div className="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg w-full mx-4 sm:mx-0">
        <div className="px-6 py-5 sm:py-6">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 text-center mb-4">
            Check Your Resume Score
          </h3>
          <div className="flex flex-col space-y-4 mt-4">
            <button
              onClick={() => {
                console.log("Navigating with data:", { resumeData, resumeId }); // Log the data before navigating
                handleButtonClick(`/ats-score?resumeId=${resumeId}`); // Navigate to /check-score
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              ATS Score
            </button>
            <button
              onClick={() => {
                console.log("Navigating with data:", { resumeData, resumeId }); // Log the data before navigating
                handleButtonClick(`/role-score?resumeId=${resumeId}`); // Navigate to /checker
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              Job Role Score
            </button>
            <button
              onClick={() => {
                console.log("Navigating with data:", { resumeData, resumeId }); // Log the data before navigating
                handleButtonClick(`/jd-score?resumeId=${resumeId}`); // Navigate to /score
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-300"
            >
              Job Description Score
            </button>
          </div>

        </div>
        <div className="px-6 py-4 mt-[-30px] sm:py-5 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreCheckModal;
