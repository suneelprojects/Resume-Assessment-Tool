import React, { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { auth } from "../services/firebaseConfig";
import { saveCompleteResume } from "../services/firebaseUtils";

const ProfessionalResume2 = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({
    isSaving: false,
    isSuccess: false,
    error: null
  });

  // Get resumeId from the URL query string
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

      // Prepare the complete resume data
      const {
        personalDetails = {},
        objective = "",
        skills = {},
        workExperience = [],
        education = [],
        achievements = [],
        projects = [],
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
        template
      };

      // Save the complete resume
      await saveCompleteResume(
        user.uid,
        resumeId,
        completeResumeData,
        template || 'ProfessionalResume2'
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

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
    </div>
  );

  // Render individual page with dynamic content overflow
  const ResumePage = ({ children, className = "" }) => (
    <div className={`w-full lg:w-[210mm] min-h-[297mm] h-fit bg-white shadow-lg mx-auto transform origin-top scale-[0.7] sm:scale-[0.8] md:scale-[0.85] lg:scale-100 mb-4 ${className}`}>
      <div className="p-8 w-full h-full">
        {children}
      </div>
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

  const {
    personalDetails = {},
    objective = "",
    skills = {},
    workExperience = [],
    projects = [],
    achievements = [],
    education = [],
  } = resumeData;

  const parsedAchievements = parseAchievements(achievements);

  // Add this helper function near the top of your component, with other helper functions
  const sortSkillCategories = (skills) => {
    if (!skills) return [];

    const skillsArray = Object.entries(skills);
    const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];

    // Separate technical skills (default categories) and custom categories
    const technicalSkills = skillsArray.filter(([category]) =>
      defaultCategories.includes(category)
    );

    // Get remaining categories in their original order
    const customSkills = skillsArray.filter(([category]) =>
      !defaultCategories.includes(category)
    );

    // Return with technical skills first, followed by custom categories
    return [...technicalSkills, ...customSkills];
  };

  // Dynamically render pages
  const RenderResume = () => {
    // Array to hold pages of content
    const pages = [[]];
    let currentPageIndex = 0;

    // Helper function to add content to pages
    const addContent = (section) => {
      pages[currentPageIndex].push(section);
    };

    // Header (always on first page)
    addContent(
      <header key="header" className="text-center mb-4">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          {personalDetails.firstName && personalDetails.lastName &&
            `${personalDetails.firstName} ${personalDetails.lastName}`
          }
        </h1>
        <p>
          {personalDetails.address && (
            <>{personalDetails.address}</>
          )}
          {personalDetails.phone && (
            <>{personalDetails.address ? ' | ' : ''}{personalDetails.phone}</>
          )}
          {personalDetails.email && (
            <>{(personalDetails.address || personalDetails.phone) ? ' | ' : ''}
              <a href={`mailto:${personalDetails.email}`}>{personalDetails.email}</a>
            </>
          )}
          {personalDetails.linkedin && (
            <>{(personalDetails.address || personalDetails.phone || personalDetails.email) ? ' | ' : ''}
              <a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer">
                {personalDetails.linkedin}
              </a>
            </>
          )}
          {personalDetails.github && (
            <>{(personalDetails.address || personalDetails.phone || personalDetails.email || personalDetails.linkedin) ? ' | ' : ''}
              <a href={personalDetails.github} target="_blank" rel="noopener noreferrer">
                {personalDetails.github}
              </a>
            </>
          )}
          {personalDetails.otherLinks && personalDetails.otherLinks.map((link, index) => (
            <React.Fragment key={index}>
              {(personalDetails.address || personalDetails.phone || personalDetails.email ||
                personalDetails.linkedin || personalDetails.github || index > 0) ? ' | ' : ''}
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.url}
              </a>
            </React.Fragment>
          ))}
        </p>
      </header>
    );

    // Define sections to add to resume
    const sections = [
      {
        title: "OBJECTIVE",
        content: hasObjective() ? (
          <section key="objective" className="mb-4">
            <h2 className="text-xl font-semibold text-green-700 border-b border-green-700 mb-2">
              OBJECTIVE
            </h2>
            <p>{objective}</p>
          </section>
        ) : null
      },
      {
        title: "EXPERIENCE",
        content: hasWorkExperience() ? (
          <section key="experience" className="mb-4">
            <h2 className="text-xl font-semibold text-green-700 border-b border-green-700 mb-2">
              EXPERIENCE
            </h2>
            {workExperience.map((experience, index) => (
              <div key={index} className="mt-4">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-700">
                    {experience.company || "Company name not provided"}, {experience.city || "Location not provided"}
                  </h3>
                  <p className="text-gray-500 text-sm">
  {experience.startDate}
  {experience.startDate && experience.endDate ? " – " : ""}
  {experience.endDate}
</p>
                </div>
                <p className="text-gray-600 italic">
                  {experience.jobTitle || "Role not provided"}
                </p>
                <ul className="list-disc list-inside text-gray-600">
                  {Array.isArray(parseDescription(experience.description)) ? (
                    parseDescription(experience.description).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))
                  ) : (
                    <li>{experience.description || "No description provided."}</li>
                  )}
                </ul>
              </div>
            ))}
          </section>
        ) : null
      },
      {
        title: "EDUCATION",
        content: hasEducation() ? (
          <section key="education" className="mb-4">
            <h2 className="text-xl font-semibold text-green-700 border-b border-green-700 mb-2">
              EDUCATION
            </h2>
            {education.map((edu, index) => (
              <div key={index} className="mt-4">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-700">
                    {edu.degree || "Degree not provided"} in{" "}
                    {edu.major || "Field not provided"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                  {edu.startDate}
                  {edu.startDate && edu.endDate && " - "}
                  {edu.endDate}
                  </p>
                </div>
                <p className="text-gray-600 italic">
                  {edu.university || "University not provided"},{" "}
                  {edu.city || "Location not provided"}
                </p>
              </div>
            ))}
          </section>
        ) : null
      },
      {
        title: "SKILLS",
        content: hasSkills() ? (
          <section key="skills" className="mb-8">
            <h2 className="text-xl font-semibold text-green-700 border-b border-green-700 mb-2">
              SKILLS
            </h2>
            {sortSkillCategories(skills).map(([category, items], index) => {
              const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];
              const isDefaultCategory = defaultCategories.includes(category);

              return items && items.length > 0 && (
                <div key={index} className="mt-4">
                  <h3 className="font-bold text-gray-700">
                    {isDefaultCategory ? "Technical Skills" : category}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {Array.isArray(items) && items.length > 0
                      ? items.join(", ")
                      : "No skills provided under this category."}
                  </p>
                </div>
              );
            })}
          </section>
        ) : null
      },
      {
        title: "PROJECTS",
        content: hasProjects() ? (
          <section key="projects" className="mb-4">
            <h2 className="text-xl font-semibold text-green-700 border-b border-green-700 mb-2">
              PROJECTS
            </h2>
            {projects.map((project, index) => (
              <div key={index} className="mt-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-700">
                    {project.name || "Project name not provided"}
                  </h3>
                  {project.link && (
                    <div className="ml-4 text-sm text-gray-500">
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
            ))}
          </section>
        ) : null
      },
      {
        title: "ACHIEVEMENTS",
        content: hasAchievements() ? (
          <section key="achievements" className="mb-8">
            <h2 className="text-xl font-semibold text-green-700 border-b border-green-700 mb-2">
              ACHIEVEMENTS & CERTIFICATIONS
            </h2>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              {parseAchievements(achievements).map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </section>
        ) : null
      }
    ];

    // Dynamically add sections to pages
    sections.forEach(section => {
      if (section.content) {
        addContent(section.content);
      }
    });

    // Render pages dynamically
    return (
      <div className="w-full min-h-screen bg-gray-100 flex justify-center p-4">
        {pages.map((pageContent, pageIndex) => (
          <ResumePage key={pageIndex}>
            {pageContent}
          </ResumePage>
        ))}
      </div>
    );
  };

  return <RenderResume />;
};

export default ProfessionalResume2;