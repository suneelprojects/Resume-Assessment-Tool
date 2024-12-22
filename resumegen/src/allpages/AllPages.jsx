import React from "react";
import { Routes, Route } from "react-router-dom";
import PersonalDetails from "../resumeforms/PersonalDetails";
import Objective from "../resumeforms/Objective";
import WorkExperience from "../resumeforms/WorkExperience";
import Projects from "../resumeforms/Projects";
import Education from "../resumeforms/Education";
import Achievements from "../resumeforms/Achievements";
import Skills from "../resumeforms/Skills";
import Steps from "../steps/Steps";

const AllPages = () => {
    return (
        <div className="min-h-screen bg-white-100 overflow-hidden">
            <Steps/>
            {/* Page Content */}
            <Routes>
                <Route path="/personaldetails" element={<PersonalDetails />} />
                <Route path="/objective" element={<Objective />} />
                <Route path="/workexperience" element={<WorkExperience />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/education" element={<Education/>} />
                <Route path="/achievements" element={<Achievements/>} />
                <Route path="/skills" element={<Skills/>} />
            </Routes>
        </div>
    );
};

export default AllPages;
