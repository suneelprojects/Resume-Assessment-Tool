import React, { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { auth } from "../services/firebaseConfig";
import { saveCompleteResume } from "../services/firebaseUtils";

const ProfessionalResume1 = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({
    isSaving: false,
    isSuccess: false,
    error: null
  });

  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get("resumeId");
  const template = urlParams.get("template");

  const saveResumeToFirestore = useCallback(async () => {
    try {
      const user = auth.currentUser;

      if (!user || !resumeId || !resumeData) {
        console.error("User, Resume ID, or Resume Data not found");
        return;
      }

      setSaveStatus(prev => ({ ...prev, isSaving: true }));

      const {
        personalDetails = {},
        objective = "",
        skills = {},
        workExperience = [],
        education = [],
        achievements = [],
        projects = [],
      } = resumeData;

      const completeResumeData = {
        personalDetails,
        objective,
        skills,
        workExperience,
        education,
        achievements,
        projects,
        template
      };

      await saveCompleteResume(
        user.uid,
        resumeId,
        completeResumeData,
        template || 'ProfessionalResume1'
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

  useEffect(() => {
    if (resumeData) {
      saveResumeToFirestore();
    }
  }, [resumeData, saveResumeToFirestore]);

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

  const isEmptyDescription = (description) => {
    const parsed = parseDescription(description);
    return !parsed || parsed.length === 0 || parsed.every(item => !item || item.trim() === '');
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">
          No resume data found
        </div>
      </div>
    );
  }

  const {
    personalDetails = {},
    objective = "",
    skills = {},
    workExperience = [],
    projects = [],
    achievements = [],
    education = [],
  } = resumeData;

  const ResumePage = ({ children, className = "" }) => (
    <div className={`w-[210mm] min-h-[297mm] h-fit bg-white shadow-lg mb-4 break-inside-avoid print:shadow-none ${className}`}>
      <div className="p-8 w-full h-full">
        {children}
      </div>
    </div>
  );

  // Helper functions to check if sections are empty
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

  const RenderResume = () => {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 print:p-0">
        <div className="resume-container">
          <ResumePage>
            <div className="border-b-2 pb-4">
              <h1 className="text-3xl font-bold text-center mb-2">
                {personalDetails.firstName} {personalDetails.lastName}
              </h1>
              <p className="text-center text-gray-600">
                {personalDetails.address && `${personalDetails.address} • `}
                {personalDetails.phone && `${personalDetails.phone} • `}
                {personalDetails.email && (
                  <a href={`mailto:${personalDetails.email}`} className="text-gray-600">
                    {personalDetails.email}
                  </a>
                )}
                {personalDetails.linkedin && (
                  <>
                    {" • "}
                    <a
                      href={personalDetails.linkedin.startsWith('http') ? personalDetails.linkedin : `https://${personalDetails.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600"
                    >
                      LinkedIn
                    </a>
                  </>
                )}
                {personalDetails.github && (
                  <>
                    {" • "}
                    <a
                      href={personalDetails.github.startsWith('http') ? personalDetails.github : `https://${personalDetails.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600"
                    >
                      GitHub
                    </a>
                  </>
                )}
                {personalDetails.otherLinks?.length > 0 && personalDetails.otherLinks.map((link, index) => (
                  <React.Fragment key={index}>
                    {" • "}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600"
                    >
                      {link.title}
                    </a>
                  </React.Fragment>
                ))}
              </p>
            </div>

            {hasObjective() && (
              <section className="mt-4">
                <h2 className="text-xl font-semibold text-gray-800">SUMMARY</h2>
                <p className="text-gray-600 mt-2">{objective}</p>
              </section>
            )}

            {hasWorkExperience() && (
              <section className="mt-4">
                <h2 className="text-xl font-semibold text-gray-800">PROFESSIONAL EXPERIENCE</h2>
                {workExperience.filter(exp => {
                  const hasContent = (
                    (exp.company && exp.company.trim() !== '') ||
                    (exp.jobTitle && exp.jobTitle.trim() !== '') ||
                    !isEmptyDescription(exp.description) ||
                    (exp.city && exp.city.trim() !== '') ||
                    (exp.startDate && exp.startDate.trim() !== '') ||
                    (exp.endDate && exp.endDate.trim() !== '')
                  );
                  return hasContent;
                }).map((experience, index) => (
                  <div key={index} className="mt-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-gray-700">
                        {experience.company && experience.company.trim() && experience.company}
                        {experience.city && experience.city.trim() && `, ${experience.city}`}
                      </h3>
                      {(experience.startDate?.trim() || experience.endDate?.trim()) && (
                        <p className="text-gray-500 text-sm">
                          {experience.startDate?.trim()} – {experience.endDate?.trim()}
                        </p>
                      )}
                    </div>
                    {experience.jobTitle && experience.jobTitle.trim() && (
                      <p className="text-gray-600 italic">{experience.jobTitle}</p>
                    )}
                    {!isEmptyDescription(experience.description) && (
                      <ul className="list-disc list-inside text-gray-600">
                        {parseDescription(experience.description).map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {hasProjects() && (
              <section className="mt-2">
                <h2 className="text-xl font-semibold text-gray-800">PROJECTS</h2>
                {projects.filter(project => {
                  const hasContent = (
                    (project.name && project.name.trim() !== '') ||
                    (project.description && parseHTML(project.description).length > 0) ||
                    (project.link && project.link.trim() !== '')
                  );
                  return hasContent;
                }).map((project, index) => (
                  <div key={index} className="mt-1">
                    <div className="flex justify-between items-center">
                      {project.name && project.name.trim() && (
                        <h3 className="font-bold text-gray-700">{project.name}</h3>
                      )}
                      {project.link && project.link.trim() && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 text-sm"
                        >
                          Link
                        </a>
                      )}
                    </div>
                    {parseHTML(project.description).length > 0 && (
                      <ul className="list-disc list-inside text-gray-600">
                        {parseHTML(project.description).map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {hasEducation() && (
              <section className="mt-2">
                <h2 className="text-xl font-semibold text-gray-800">EDUCATION</h2>
                {education.filter(edu => {
                  const hasContent = (
                    (edu.degree && edu.degree.trim() !== '') ||
                    (edu.university && edu.university.trim() !== '') ||
                    (edu.major && edu.major.trim() !== '') ||
                    (edu.city && edu.city.trim() !== '') ||
                    (edu.startDate && edu.startDate.trim() !== '') ||
                    (edu.endDate && edu.endDate.trim() !== '')
                  );
                  return hasContent;
                }).map((edu, index) => (
                  <div key={index} className="mt-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-gray-700">
                        {edu.degree && edu.degree.trim() && edu.degree}
                        {edu.major && edu.major.trim() && ` in ${edu.major}`}
                      </h3>
                      {(edu.startDate?.trim() || edu.endDate?.trim()) && (
                        <p className="text-gray-500 text-sm">
                          {edu.startDate} - {edu.endDate}
                        </p>
                      )}
                    </div>
                    {(edu.university || edu.city) && (
                      <p className="text-gray-600 italic">
                        {edu.university && edu.university.trim()}
                        {edu.city && edu.city.trim() && `, ${edu.city}`}
                      </p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {hasSkills() && (
              <section className="mt-2">
                <h2 className="text-xl font-semibold text-gray-800">SKILLS</h2>
                {Object.entries(skills)
                  .filter(([_, items]) => Array.isArray(items) && items.some(item => item && item.trim() !== ''))
                  .map(([category, items], index) => (
                    <div key={index} className="mt-1">
                      <h3 className="font-bold text-gray-700">
                        {category.trim().toLocaleLowerCase() === "full stack" ? "Technical Skills" : category}
                      </h3>
                      <p className="mt-0 text-gray-600">
                        {items.filter(item => item && item.trim() !== '').join(", ")}
                      </p>
                    </div>
                  ))}
              </section>
            )}

            {hasAchievements() && (
              <section className="mt-2">
                <h2 className="text-xl font-semibold text-gray-800">ACHIEVEMENTS & CERTIFICATIONS</h2>
                <ul className="list-disc list-inside text-gray-600 mt-2">
                  {parseAchievements(achievements).map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </section>
            )}
          </ResumePage>
        </div>
      </div>
    );
  };

  return <RenderResume />;
};

export default ProfessionalResume1;