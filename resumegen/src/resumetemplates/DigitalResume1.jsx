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

const DigitalResume1 = () => {
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
        template || 'DigitalResume1'
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

  // Helper functions to check if sections are empty
  const isEmptyDescription = (description) => {
    const parsed = parseDescription(description);
    return !parsed || parsed.length === 0 || parsed.every(item => !item || item.trim() === '');
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

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="border-b-[5px] border-teal-600 pb-2 mb-4">
          <h1 className="text-3xl font-bold text-teal-600">
            {personalDetails.firstName} {personalDetails.lastName}
          </h1>
          <p className="text-lg text-gray-600">
            {personalDetails.jobTitle}
          </p>
        </div>

        {/* Contact */}
        <div className="border-b-[5px] border-teal-600 pb-4 mb-4">
          <div className="grid grid-cols-3 gap-6 mb-1">
            <div>
              <h2 className="text-lg font-semibold text-teal-600">CONTACT</h2>
              <ul className="text-gray-600 space-y-2">
                <li>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-teal-500 mr-2"
                  />
                  {personalDetails.phone || "N/A"}
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-teal-500 mr-2"
                  />
                  {personalDetails.email || "N/A"}
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-teal-500 mr-2"
                  />
                  {personalDetails.address || "N/A"}
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faLinkedin}
                    className=" text-teal-500 mr-2"
                  />
                  <a
                    href={personalDetails.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                {/* Additional Links */}
                {personalDetails.otherLinks && personalDetails.otherLinks.map((link, index) => (
                    <li key={index}>
                      <FontAwesomeIcon
                        icon={faLink}
                        className="text-teal-500 mr-2"
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
          </div>
        </div>

        {/* Summary/Objective Section */}
        {hasObjective() && (
          <div className="border-b-[5px] border-teal-600 pb-2 mb-4">
            <div className="mb-2 mt-[-10px]">
              <h2 className="text-lg font-semibold text-teal-600">SUMMARY</h2>
              <p className="text-gray-600">{objective}</p>
            </div>
          </div>
        )}
        
        {/* Skills Section */}
        {hasSkills() && (
          <div className="border-b-[5px] border-teal-600 pb-4 mb-4">
            <div className="mb-2 mt-[-15px]">
              <h2 className="text-xl font-semibold text-teal-600 mt-6">Skills</h2>
              {Object.entries(skills).map(([category, skillList], index) => (
                skillList && skillList.length > 0 && (
                  <div key={index} className="mt-2">
                    <h3 className="font-bold mb-2">
                      {category.trim().toLocaleLowerCase() === "full stack" ? "Technical Skills" : category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillList.map((skill, idx) => (
                        skill && skill.trim() !== "" && (
                          <span
                            key={idx}
                            className="bg-teal-100 text-teal-600 rounded-full px-4 py-2 text-sm font-medium"
                          >
                            {skill}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Work Experience Section */}
        {hasWorkExperience() && (
          <div className="border-b-[5px] border-teal-600 pb-4 mb-4">
            <div className="mb-1 mt-[-5px]">
              <h2 className="text-lg font-semibold text-teal-600">
                PROFESSIONAL EXPERIENCE
              </h2>
              {workExperience.map((experience, index) => (
                !isEmptyDescription(experience.description) && (
                  <div key={index} className="mb-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold">
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
                )
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {hasProjects() && (
          <div className="border-b-[5px] border-teal-600 pb-4 mb-4">
            <div className="mb-1 mt-[-15px]">
              <h2 className="text-xl font-semibold text-teal-600 mt-6">Projects</h2>
              {projects.map((project, index) => (
                project.name && (
                  <div key={index} className="mb-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold">{project.name}</h3>
                        {project.link && (
                          <div className="text-right text-sm text-gray-900">
                            <a href={project.link} target="_blank" rel="noopener noreferrer">
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
                )
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {hasEducation() && (
          <div className="border-b-[5px] border-teal-600 pb-4 mb-4">
            <div className="mb-1 mt-[-10px]">
              <h2 className="text-xl font-semibold text-teal-600 mt-6">Education</h2>
              {education.map((edu, index) => (
                <div key={index} className="mt-2 flex justify-between">
                  <div className="w-3/4">
                    <h3 className="font-bold">
                      {edu.degree} in {edu.major}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {edu.university}, {edu.city}
                    </p>
                  </div>
                  <div className="w-1/4 text-right text-gray-600 text-sm">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {hasAchievements() && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-teal-600">
              ACHIEVEMENTS & CERTIFICATIONS
            </h2>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              {parseAchievements(achievements).map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalResume1;
