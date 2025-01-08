import React, { useState, useEffect, useRef } from "react";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useStep } from "../hooks/StepContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { saveWorkExperience, fetchWorkExperience } from "../services/firebaseUtils";
import MonthYearPicker from "../common/MonthYearPicker";

const jobRolesData = {
  "Java Full Stack Developer": "<ul><li>Experience in developing full-stack applications using Java, Spring Boot, and modern frontend technologies</li><li>Proficient in designing and implementing scalable solutions with robust backend systems and responsive user interfaces</li></ul>",
  "Python Full Stack Developer": "<ul><li>Skilled in building end-to-end applications using Python frameworks like Django/Flask and modern JavaScript frameworks</li><li>Experience in developing RESTful APIs and implementing responsive frontend solutions</li></ul>",
  "Frontend Developer": "<ul><li>Specialized in creating responsive and intuitive user interfaces using modern frontend technologies like React, HTML5, and CSS3</li><li>Focused on delivering exceptional user experiences with clean and efficient code</li></ul>",
  "Backend Developer": "<ul><li>Expert in designing and implementing server-side logic, APIs, and database architectures</li><li>Proficient in optimizing application performance and ensuring data security</li></ul>",
  "ReactJS Developer": "<ul><li>Specialized in building dynamic user interfaces using React.js and related technologies</li><li>Experienced in state management, component lifecycle, and modern React patterns</li></ul>",
  "MERN Stack Developer": "<ul><li>Proficient in developing full-stack applications using MongoDB, Express.js, React, and Node.js</li><li>Experienced in building scalable web applications with modern JavaScript technologies</li></ul>",
  "Cloud Developer": "<ul><li>Skilled in developing cloud-native applications and implementing cloud infrastructure solutions</li><li>Experienced with major cloud platforms and modern cloud architecture patterns</li></ul>",
  "Java Developer": "<ul><li>Specialized in developing robust Java applications with strong object-oriented programming principles</li><li>Experienced in building enterprise-level software solutions</li></ul>",
  "Python Developer": "<ul><li>Proficient in developing Python applications with expertise in various Python frameworks and libraries</li><li>Experienced in building efficient and maintainable code</li></ul>",
  "JavaScript Developer": "<ul><li>Expert in modern JavaScript development including ES6+ features and popular frameworks</li><li>Skilled in building interactive and responsive web applications</li></ul>",
  "AWS Admin": "<ul><li>Experienced in managing and optimizing AWS infrastructure and implementing security best practices</li><li>Skilled in automation and monitoring of cloud services</li></ul>",
  "Junior DevOps Engineer": "<ul><li>Focused on implementing CI/CD pipelines and automating deployment processes</li><li>Learning to bridge the gap between development and operations</li></ul>",
  "Cloud Engineer": "<ul><li>Specialized in designing and implementing cloud infrastructure solutions</li><li>Experienced in cloud migration, optimization, and maintenance of cloud resources</li></ul>",
  "Junior AI Engineer": "<ul><li>Learning to develop and implement artificial intelligence solutions</li><li>Gaining experience in machine learning frameworks and AI application development</li></ul>",
  "Junior NLP Engineer": "<ul><li>Beginning to specialize in natural language processing applications</li><li>Learning to implement NLP models and solutions for text analysis and processing</li></ul>",
  "Computer Vision Engineer": "<ul><li>Focused on developing computer vision applications and implementing image processing solutions</li><li>Experienced with popular computer vision libraries and frameworks</li></ul>",
  "Junior Data Analyst": "<ul><li>Learning to analyze and interpret complex data sets</li><li>Gaining experience in data visualization and statistical analysis tools</li></ul>",
  "Junior Data Scientist": "<ul><li>Beginning to apply statistical analysis and machine learning to solve business problems</li><li>Learning to develop predictive models and data-driven solutions</li></ul>",
  "Junior Machine Learning Engineer": "<ul><li>Learning to develop and deploy machine learning models</li><li>Gaining experience in various ML frameworks and model optimization techniques</li></ul>",
  "Junior Python Data Scientist": "<ul><li>Beginning to use Python for data analysis and machine learning</li><li>Learning to implement data science solutions using Python libraries</li></ul>",
  "Junior Data Engineer": "<ul><li>Learning to design and maintain data pipelines and infrastructures</li><li>Gaining experience in data warehousing and ETL processes</li></ul>"
};

const WorkExperience = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStep } = useStep();

  // State for user authentication and loading
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [dropdownStates, setDropdownStates] = useState([]);
  const dropdownRefs = useRef([]);

  // Extract resumeId from URL
  const resumeId = new URLSearchParams(location.search).get('resumeId');

  const [experiences, setExperiences] = useState([
    {
      company: "",
      city: "",
      jobTitle: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  // Listen to authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch existing work experience when component loads
  useEffect(() => {
    const fetchDetails = async () => {
      if (userId && resumeId) {
        try {
          const existingExperiences = await fetchWorkExperience(userId, resumeId);
          if (existingExperiences.length > 0) {
            setExperiences(existingExperiences);
          }
        } catch (error) {
          console.error("Error fetching work experience:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
  }, [userId, resumeId]);

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: "",
        city: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  useEffect(() => {
    setDropdownStates(experiences.map(() => false));
    dropdownRefs.current = experiences.map(() => React.createRef());
  }, [experiences.length]);

  const handleJobSelect = (index, jobTitle) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index].jobTitle = jobTitle;
    updatedExperiences[index].description = jobRolesData[jobTitle];
    setExperiences(updatedExperiences);
    toggleDropdown(index);
  };

  const toggleDropdown = (index) => {
    const newDropdownStates = dropdownStates.map((state, i) => i === index ? !state : false);
    setDropdownStates(newDropdownStates);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      dropdownRefs.current.forEach((ref, index) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setDropdownStates(prev => prev.map((state, i) => i === index ? false : state));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
  };

  const handleInputChange = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index][field] = value;
    setExperiences(updatedExperiences);
  };

  const handleSubmit = async (event, isNavigating = false) => {
    event.preventDefault();
    const form = event.target;

    // Custom validation to check end date is not before start date
    // Custom validation to check end date is not before start date
const isDateValid = experiences.every(exp => {
  if (!exp.startDate || !exp.endDate || exp.endDate === "Present") {
    return true;
  }

  const [startMonth, startYear] = exp.startDate.split(", ");
  const [endMonth, endYear] = exp.endDate.split(", ");
  
  const startDate = new Date(`${startMonth} 1, ${startYear}`);
  const endDate = new Date(`${endMonth} 1, ${endYear}`);
  
  return endDate >= startDate;
});

    if (!isDateValid) {
      toast.error("End date cannot be before start date!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (form.checkValidity()) {
      try {
        setIsSaving(true);
        // Ensure we have both userId and resumeId
        if (!userId || !resumeId) {
          toast.error("User or Resume ID is missing!");
          return;
        }

        // Save work experience to Firestore
        await saveWorkExperience(userId, resumeId, experiences);

        if (!isNavigating) {
          // Show success toast
          toast.success("Work Experience saved successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            zIndex: 60,
          });
        }

        // Navigate to next page if needed
        handleNavigation("next");
      } catch (error) {
        // Show error toast
        toast.error(`Failed to save work experience: ${error.message}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      form.reportValidity();
    }
  };

  const handleNavigation = (direction) => {
    if (direction === "previous") {
      setCurrentStep(2); // Set to "Objective"
      navigate(`/allpages/objective?resumeId=${resumeId}`);
    } else if (direction === "next") {
      setCurrentStep(4); // Set to "Projects"
      navigate(`/allpages/projects?resumeId=${resumeId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ml-0 md:ml-64">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-200"></div>
          <div className="h-4 w-36 bg-purple-200 rounded"></div>
          <div className="text-purple-500">Loading your experiences...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 ml-0 md:ml-64">
      <div className="my-8 w-full max-w-4xl bg-white/30 border border-white/20 rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 w-full"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Heading with navigation arrows */}
          <div className="col-span-1 sm:col-span-2 mb-1 flex justify-between items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Work Experience
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleNavigation("previous")}
                className="p-2 rounded-md bg-white/40 hover:bg-purple-200 focus:outline-none transition-all duration-300 transform hover:scale-105 group"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigation("next")}
                className="p-2 rounded-md bg-white/40 hover:bg-purple-200 focus:outline-none transition-all duration-300 transform hover:scale-105 group"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>

          {experiences.map((experience, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <div className="col-span-1 sm:col-span-2 border-t border-gray-300 my-6 relative">
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(index)}
                    className="absolute top-[-12px] right-0 text-gray-500 hover:text-red-500 focus:outline-none transition-all duration-300 transform hover:scale-110 hover:rotate-6 group"
                    title="Delete Experience"
                  >
                    <TrashIcon className="h-5 w-5 relative top-[13px] group-hover:text-red-600" />
                  </button>
                </div>
              )}

              {/* Company and City */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                  value={experience.company}
                  onChange={(e) =>
                    handleInputChange(index, "company", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                  value={experience.city}
                  onChange={(e) =>
                    handleInputChange(index, "city", e.target.value)
                  }
                />
              </div>

              {/* Job Title, Start Date, End Date in one line */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-1 sm:col-span-2">
                <div ref={dropdownRefs.current[index]} className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter job title"
                      className="mt-1 p-3 pr-10 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                      value={experience.jobTitle}
                      onChange={(e) => handleInputChange(index, "jobTitle", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => toggleDropdown(index)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {dropdownStates[index] && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {Object.keys(jobRolesData).map((title) => (
                        <button
                          key={title}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-purple-50 focus:outline-none focus:bg-purple-50 transition-colors"
                          onClick={() => handleJobSelect(index, title)}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
  <label className="block text-sm font-medium text-gray-700">
    Start Date
  </label>
  <MonthYearPicker
    value={experience.startDate}
    onChange={(value) => handleInputChange(index, "startDate", value)}
    yearsBack={50}  // Show 50 years back
    isEndDate={false}  // This is a start date
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700">
    End Date
  </label>
  <MonthYearPicker
    value={experience.endDate}
    onChange={(value) => handleInputChange(index, "endDate", value)}
    min={experience.startDate}
    yearsBack={50}  // Show 50 years back
    isEndDate={true}  // This is an end date, show "Present" option
    allowPresent={true}
  />
</div>
              </div>

              {/* Description */}
              <div div className="col-span-1 sm:col-span-2" >
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <ReactQuill
                    theme="snow"
                    placeholder={`Describe your responsibilities and achievements.\nMust use dots for pointing; otherwise, you may not get data.`}

                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }], // Headers
                        ["bold", "italic", "underline", "strike", { list: "bullet" }], // Basic formatting
                      ],
                    }}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      borderRadius: "0.5rem",
                      border: "1px solid #D1D5DB",
                    }}
                    className="custom-quill-editor"
                    value={experience.description}
                    onChange={(value) =>
                      handleInputChange(index, "description", value)
                    }
                  />
                </div>
              </div>
            </React.Fragment>
          ))
          }

          {/* Add Experience Button and Save Button */}
          <div className="col-span-1 sm:col-span-2 flex justify-between items-center mt-[-5px]">
            <button
              type="button"
              onClick={handleAddExperience}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 focus:outline-none transition-all duration-300 transform hover:scale-105 bg-purple-50 px-4 py-2 rounded-lg group"
            >
              <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add More Experience</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className={`bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-10 rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Info</span>
              )}
            </button>
          </div>
        </form >
      </div >
    </div >
  );
};

export default WorkExperience;