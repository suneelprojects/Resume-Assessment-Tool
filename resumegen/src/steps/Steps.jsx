import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  X, 
  User, 
  Target, 
  Briefcase, 
  Code, 
  GraduationCap, 
  Trophy, 
  List 
} from "lucide-react";
import { useStep } from "../hooks/StepContext";

const Steps = () => {
  const { currentStep, setCurrentStep } = useStep();
  const navigate = useNavigate();
  const location = useLocation();
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract resumeId from current URL
  const resumeId = new URLSearchParams(location.search).get('resumeId');

  const steps = [
    { 
      name: "Personal Details", 
      route: `/allpages/personaldetails?resumeId=${resumeId}`,
      icon: User,
      path: '/allpages/personaldetails'
    },
    { 
      name: "Objective", 
      route: `/allpages/objective?resumeId=${resumeId}`,
      icon: Target,
      path: '/allpages/objective'
    },
    { 
      name: "Work Experience", 
      route: `/allpages/workexperience?resumeId=${resumeId}`,
      icon: Briefcase,
      path: '/allpages/workexperience'
    },
    { 
      name: "Projects", 
      route: `/allpages/projects?resumeId=${resumeId}`,
      icon: Code,
      path: '/allpages/projects'
    },
    { 
      name: "Education", 
      route: `/allpages/education?resumeId=${resumeId}`,
      icon: GraduationCap,
      path: '/allpages/education'
    },
    { 
      name: "Achievements", 
      route: `/allpages/achievements?resumeId=${resumeId}`,
      icon: Trophy,
      path: '/allpages/achievements'
    },
    { 
      name: "Skills", 
      route: `/allpages/skills?resumeId=${resumeId}`,
      icon: List,
      path: '/allpages/skills'
    },
  ];

  // Sync current step with current route
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingStepIndex = steps.findIndex(step => currentPath.includes(step.path));
    if (matchingStepIndex !== -1) {
      setCurrentStep(matchingStepIndex + 1);
    } else {
      // If no matching route found, default to Personal Details
      setCurrentStep(1);
      navigate(`/allpages/personaldetails?resumeId=${resumeId}`);
    }
  }, [location.pathname, resumeId, navigate, setCurrentStep]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStepClick = (stepNumber, route) => {
    setCurrentStep(stepNumber);
    navigate(route);
    if (window.innerWidth <= 768) setIsStepsOpen(false);
  };

  // Skeleton loading component
  const SkeletonStep = () => (
    <div className="flex items-center p-3 mb-4 w-full animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      {!isStepsOpen && (
        <button
          className="md:hidden fixed top-[58px] left-0 z-30 bg-black text-white p-2 rounded-r-full shadow-md"
          onClick={() => setIsStepsOpen(true)}
        >
          <ChevronRight className="text-xl" />
        </button>
      )}

      {/* Side Navigation */}
      <div
        className={`fixed top-16 bottom-4 left-0 bg-white/30 backdrop-blur-lg border border-white/20 text-gray-800 shadow-2xl transition-transform transform ${
          isStepsOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64 w-3/4 z-40 rounded-r-xl overflow-hidden`}
      >
        <div className="flex flex-col h-full pt-4 md:pt-4">
          {/* Close Button for Mobile */}
          <div className="md:hidden p-4 flex justify-end">
            <button onClick={() => setIsStepsOpen(false)}>
              <X className="text-2xl text-gray-800" />
            </button>
          </div>

          {/* Steps Content */}
          <div className="p-4 flex-grow 
            md:overflow-visible md:max-h-full 
            max-h-[calc(100vh-150px)] 
            overflow-y-auto 
            scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700"
          >
            {isLoading ? (
              // Show skeleton loading
              [...Array(7)].map((_, index) => (
                <SkeletonStep key={index} />
              ))
            ) : (
              // Show actual steps
              steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const StepIcon = step.icon;

                return (
                  <div
                    key={stepNumber}
                    className={`flex items-center p-3 mb-4 cursor-pointer w-full rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-white/80 text-blue-700 shadow-lg" 
                        : "hover:bg-white/20 hover:shadow-md"
                    }`}
                    onClick={() => handleStepClick(stepNumber, step.route)}
                  >
                    {/* Step Icon */}
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${
                        isActive
                          ? "bg-blue-500 text-white" 
                          : "bg-white/20 text-gray-700"
                      }`}
                    >
                      <StepIcon className="text-2xl" />
                    </div>
                    {/* Step Name */}
                    <div className={`text-base ${isActive ? "font-bold" : ""}`}>
                      {step.name}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Steps;