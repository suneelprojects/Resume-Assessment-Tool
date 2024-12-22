import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { auth } from "../services/firebaseConfig";
import { saveCompleteResume } from "../services/firebaseUtils";

const DigitalResume2 = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({
    isSaving: false,
    isSuccess: false,
    error: null
  });

  // Get resumeId and template from the URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get("resumeId");
  const template = urlParams.get("template");

  // Memoized function to save resume to Firestore
  const saveResumeToFirestore = useCallback(async () => {
    try {
      const user = auth.currentUser;

      if (!user || !resumeId || !resumeData) {
        console.error("User, Resume ID, or Resume Data not found");
        return;
      }

      setSaveStatus(prev => ({ ...prev, isSaving: true }));

      // Destructure and prepare resume data
      const {
        personalDetails = {},
        objective = "",
        skills = [],
        workExperience = [],
        education = [],
        achievements = [],
        projects = [],
        technicalSkills = {},
      } = resumeData;

      // Prepare the complete resume data
      const completeResumeData = {
        personalDetails,
        objective,
        skills,
        workExperience,
        education,
        achievements,
        projects,
        technicalSkills,
        template // Include the selected template name
      };

      // Save the complete resume
      await saveCompleteResume(
        user.uid,
        resumeId,
        completeResumeData,
        template || 'DigitalResume2'
      );

      setSaveStatus({
        isSaving: false,
        isSuccess: true,
        error: null
      });
    } catch (error) {
      console.error("Error saving resume:", error);
      setSaveStatus({
        isSaving: false,
        isSuccess: false,
        error: error.message
      });
    }
  }, [resumeData, resumeId, template]);

  // Fetch resume data
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const user = auth.currentUser;

        if (!user || !resumeId) {
          console.error("userId or resumeId is missing");
          setLoading(false);
          return;
        }

        const docRef = doc(db, "users", user.uid, "resumes", resumeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setResumeData(docSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching resume data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeId]);

  // Trigger save when resume data is loaded
  useEffect(() => {
    if (resumeData) {
      saveResumeToFirestore();
    }
  }, [resumeData, saveResumeToFirestore]);

  // Parsing helper functions
  const parseHTML = (htmlString) => {
    if (!htmlString || htmlString.trim() === '' || htmlString === '<br>') {
      return [];
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const items = Array.from(doc.querySelectorAll("li")).map((li) => li.textContent);
      return items.filter(item => item && item.trim() !== '');
    } catch {
      return htmlString.trim() !== '' ? [htmlString] : [];
    }
  };

  const parseAchievements = (htmlString) => {
    if (!htmlString || htmlString.trim() === '' || htmlString === '<br>') {
      return [];
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const items = Array.from(doc.querySelectorAll("li")).map((li) => li.textContent);
      return items.filter(item => item && item.trim() !== '');
    } catch {
      return htmlString.trim() !== '' ? [htmlString] : [];
    }
  };

  const parseDescription = (htmlString) => {
    if (!htmlString || htmlString.trim() === '' || htmlString === '<br>') {
      return [];
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const items = Array.from(doc.querySelectorAll("li")).map((li) => li.textContent);
      return items.filter(item => item && item.trim() !== '');
    } catch {
      return htmlString.trim() !== '' ? [htmlString] : [];
    }
  };

  // Validation helper functions remain the same as added before
  const isEmptyDescription = (description) => {
    const parsed = parseDescription(description);
    return !parsed || parsed.length === 0 || parsed.every(item => !item || item.trim() === '');
  };
  
    const hasObjective = () => {
      return objective && objective.trim() !== '' && objective !== '<br>';
    };
  
    const hasSkills = () => {
      if (!skills || typeof skills !== 'object') return false;
  
      return Object.entries(skills).some(([category, items]) => {
        if (!Array.isArray(items)) return false;
        return items.some(item => item && item.trim() !== '');
      });
    };
  
    const hasWorkExperience = () => {
      if (!Array.isArray(workExperience) || workExperience.length === 0) {
        return false;
      }
  
      return workExperience.some(exp => {
        const hasCompany = exp.company && exp.company.trim() !== '';
        const hasJobTitle = exp.jobTitle && exp.jobTitle.trim() !== '';
        const hasDescription = !isEmptyDescription(exp.description);
        const hasCity = exp.city && exp.city.trim() !== '';
        const hasDates = (exp.startDate && exp.startDate.trim() !== '') ||
          (exp.endDate && exp.endDate.trim() !== '');
  
        return hasCompany || hasJobTitle || hasDescription || hasCity || hasDates;
      });
    };
  
    const hasProjects = () => {
      if (!Array.isArray(projects) || projects.length === 0) return false;
  
      return projects.some(project => {
        const hasName = project.name && project.name.trim() !== '';
        const hasDescription = project.description && parseHTML(project.description).length > 0;
        const hasLink = project.link && project.link.trim() !== '';
  
        return hasName || hasDescription || hasLink;
      });
    };
  
    const hasEducation = () => {
      if (!Array.isArray(education) || education.length === 0) return false;
  
      return education.some(edu => {
        const hasDegree = edu.degree && edu.degree.trim() !== '';
        const hasUniversity = edu.university && edu.university.trim() !== '';
        const hasMajor = edu.major && edu.major.trim() !== '';
        const hasCity = edu.city && edu.city.trim() !== '';
        const hasDates = (edu.startDate && edu.startDate.trim() !== '') ||
          (edu.endDate && edu.endDate.trim() !== '');
  
        return hasDegree || hasUniversity || hasMajor || hasCity || hasDates;
      });
    };
  
    const hasAchievements = () => {
      if (!achievements) return false;
      const parsedAchievements = parseAchievements(achievements);
      return parsedAchievements.length > 0;
    };

  // Loading spinner component (same as in ResumeEditor)
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
    </div>
  );

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // No resume data state
  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">
          No resume data found
        </div>
      </div>
    );
  }

  // Destructure resume data with fallbacks
  const {
    personalDetails = {},
    objective = "",
    skills = [],
    workExperience = [],
    education = [],
    achievements = [],
    projects = [],
  } = resumeData;

  return (
    <div className="min-h-screen max-w-[794px] mx-auto flex justify-center py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            {personalDetails.firstName} {personalDetails.lastName}
          </h1>
          <p className="text-lg text-purple-600">{personalDetails.jobTitle}</p>
          <p className="mt-4 text-gray-600">{personalDetails.summary}</p>
        </header>

        {/* Contact Section */}
        <section className="flex justify-around bg-gray-600 py-3 rounded-lg mb-4 mt-[-10px]">
          <div className="flex items-center space-x-2 text-white">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>{personalDetails.email || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <FontAwesomeIcon icon={faPhone} />
            <span>{personalDetails.phone || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{personalDetails.address || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <FontAwesomeIcon icon={faLinkedin} />
            <a
              href={personalDetails.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
          <div className="flex items-center space-x-2 text-white">
            {/* Additional Links */}
            <ul className="list-none">
              {personalDetails.otherLinks && personalDetails.otherLinks.map((link, index) => (
                <li key={index}>
                  <FontAwesomeIcon
                    icon={faLink}
                    className="space-x-2 text-white mr-2"
                  />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Objective Section */}
        {hasObjective() && (
          <section className="mb-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Objective</h2>
            <p className="text-gray-600">{resumeData.objective}</p>
          </section>
        )}

{/* Skills Section */}
{hasSkills() && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mt-6">Skills</h2>
            {Object.entries(resumeData.skills).map(([category, skillList], index) => (
              skillList && skillList.length > 0 && (
                <div key={index} className="mt-4">
                  <h3 className="font-bold mb-2">
                    {category.trim().toLocaleLowerCase() === "full stack" ? "Technical Skills" : category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-teal-100 text-teal-600 rounded-full px-4 py-2 text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}
          </section>
        )}

        {/* Work Experience Section */}
        {hasWorkExperience() && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Work Experience</h2>
            {resumeData.workExperience.map((experience, index) => (
              <div key={index} className="mb-6">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-700">
                      {experience.company} - {experience.city}
                    </h3>
                    <p className="text-right text-sm text-gray-900">
                      ({experience.startDate} - {experience.endDate || "Present"})
                    </p>
                  </div>
                  <ul className="list-disc list-inside text-gray-600">
                    {parseDescription(experience.description).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Projects Section */}
        {hasProjects() && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Projects</h2>
            {resumeData.projects.map((project, index) => (
              <div key={index} className="mb-6">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-700">{project.name}</h3>
                    {project.link && (
                      <div className="text-right text-sm text-gray-900">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </a>
                      </div>
                    )}
                  </div>
                  <ul className="list-disc list-inside text-gray-600">
                    {parseHTML(project.description).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {hasEducation() && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Education</h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">
                    {edu.degree} in {edu.major}
                  </h3>
                  <p className="text-sm text-gray-500">{edu.university}, {edu.city}</p>
                </div>
                <p className="text-right text-sm text-gray-900">
                  ({edu.startDate} - {edu.endDate})
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Achievements Section */}
        {hasAchievements() && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">Achievements & Certifications</h2>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              {parseAchievements(resumeData.achievements).map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </section>
        )}
      </div >
    </div >
  );
};

export default DigitalResume2;