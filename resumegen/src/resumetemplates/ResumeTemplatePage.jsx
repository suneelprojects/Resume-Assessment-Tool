import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DigitalResume1image from "../assets/DigitalResume1image.png";
import DigitalResume2image from "../assets/DigitalResume2image.png";
import ProfessionalResume1image from "../assets/ProfessionalResume1image.png";
import Resumeimage from "../assets/Resumeimage.png";

const ResumeTemplatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract resumeId from URL
  const resumeId = new URLSearchParams(location.search).get('resumeId');

  const templates = [
    {
      image: DigitalResume1image,
      title: "Digital Resume 1",
      component: "DigitalResume1",
    },
    {
      image: DigitalResume2image,
      title: "Digital Resume 2",
      component: "DigitalResume2",
    },
    {
      image: ProfessionalResume1image,  
      title: "Professional Resume 1",
      component: "ProfessionalResume1",
    },
    { 
      image: Resumeimage, 
      title: "Professional Resume 2",
      component: "ProfessionalResume2",
    },
  ];

  const handleTemplateClick = (template) => {
    // Navigate to the resume editor with resumeId and selected template
    navigate(`/resume?resumeId=${resumeId}&template=${template}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-600">
          Choose Your Resume Template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {templates.map((template, index) => (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer group w-full max-w-xs"
              onClick={() => handleTemplateClick(template.component)}
            >
              <div className="w-full aspect-[3/4] border border-gray-300 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                <img
                  src={template.image}
                  alt={template.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="mt-3 text-center text-gray-700 group-hover:text-purple-600 font-medium">
                {template.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplatePage;