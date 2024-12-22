import React, { createContext, useContext, useState, useEffect } from "react";

const StepContext = createContext();

export const StepProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(() => {
    // Initialize current step from localStorage or default to 1
    const savedStep = localStorage.getItem('currentStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  // Update localStorage whenever currentStep changes
  useEffect(() => {
    localStorage.setItem('currentStep', currentStep.toString());
  }, [currentStep]);

  return (
    <StepContext.Provider value={{ currentStep, setCurrentStep }}>
      {children}
    </StepContext.Provider>
  );
};

export const useStep = () => useContext(StepContext);

export default StepContext;