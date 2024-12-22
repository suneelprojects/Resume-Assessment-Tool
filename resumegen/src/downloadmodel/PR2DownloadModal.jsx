import React from 'react';
import { PR2PDFDownload } from '../pdf/PR2pdf';
import { PR2DOCXDownload } from '../docx/PR2docx';

export const PR2DownloadModal = ({ isOpen, onClose, resumeData, template }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Download Resume</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <PR2PDFDownload 
            resumeData={resumeData} 
            template={template}
            onClose={onClose}
          />
          <PR2DOCXDownload 
            resumeData={resumeData} 
            template={template}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default PR2DownloadModal;