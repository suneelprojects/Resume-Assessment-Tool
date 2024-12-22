import React from 'react';
import { Routes, Route,useLocation } from 'react-router-dom';
import AllPages from './allpages/AllPages';
import Hero from './pages/Hero';
import HomePage from './pages/HomePage';
import Navbar from './common/Navbar';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./auth/Login";
import Signup from "./auth/SignUp";
import ResumeTemplatePage from './resumetemplates/ResumeTemplatePage';
import ResumeEditor from './resumetemplates/ResumeEditor';
import Atsscore from './pages/Atsscore';
import ResumeRole from './pages/ResumeRole';
import JobDescription from './pages/JobDescription';
import Results from './pages/Results';
import Home from './pages/Home';


function App() {


  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];


  return (
    <>
       {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <ToastContainer />
      <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/hero" element={<Hero/>} />
        <Route path="/allpages/*" element={<AllPages />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/choosetemplate" element={<ResumeTemplatePage/>} />
        <Route path="/resume" element={<ResumeEditor />} />
        <Route path="/ats-score" element={<Atsscore />} />
        <Route path="/role-score" element={<ResumeRole />} />
        <Route path="/jd-score" element={<JobDescription />} />
        <Route path="/results" element={<Results/>} />
        <Route path="/home" element={<Home/>} />
      </Routes>
    </>
  );
}

export default App;
