import React, { useState } from "react";
import { IoIosLock } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HeroPng from "../assets/rb_42.png";

export const FadeUp = (delay) => ({
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, duration: 0.5, delay, ease: "easeInOut" } },
});

const Hero = () => {
  const [fileName, setFileName] = useState("");
  const [buttonText, setButtonText] = useState("Upload Your Resume");
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 2) {
        alert("Please upload a file 2MB or less.");
      } else if (
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileName(file.name);
        setButtonText("Continue");
      } else {
        alert("Please upload only PDF or DOCX files.");
      }
    }
  };

  const handleButtonClick = () => {
    if (buttonText === "Continue") {
      uploadResumeAndNavigate();
    } else {
      document.getElementById("resumeUpload").click();
    }
  };

  const uploadResumeAndNavigate = async () => {
    const file = document.getElementById("resumeUpload").files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);
    const backendURL = `${window.location.protocol}//${window.location.hostname}:80`;

    try {

      const response = await fetch(`${backendURL}/api/extract_resume`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred.");
      }

      const data = await response.json();
      const { extractedText, parsedData } = data;

      navigate("/role", { state: { resumeText: extractedText, parsedData } });
    } catch (error) {
      console.error("Upload error:", error.message);
      alert(`Error uploading resume: ${error.message}`);
    }
  };

  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-500 overflow-hidden relative flex flex-col justify-center pt-20 min-h-[calc(100vh-80px)]">
      <div className="container grid grid-cols-1 md:grid-cols-2 items-center">
        <div className="flex flex-col justify-center px-6 py-6 md:px-10 space-y-6 text-center md:text-left text-white">
          <motion.div variants={FadeUp(0.4)} initial="initial" animate="animate">
            <h4 className="text-blue-100 font-bold text-xl font-poppins">Resume Checker</h4>
          </motion.div>
          <motion.h1 variants={FadeUp(0.6)} initial="initial" animate="animate" className="text-2xl lg:text-5xl font-bold !leading-snug font-poppins">
            Is your resume good <span className="block">enough?</span>
          </motion.h1>
          <motion.p variants={FadeUp(0.8)} initial="initial" animate="animate" className="text-gray-200 max-w-[550px] font-roboto text-[18px]">
            Find out instantly. Upload your resume and our free resume scanner will evaluate it against key criteria hiring managers and applicant tracking systems (ATS) look for. Get actionable feedback on how to improve your resume's success rate.
          </motion.p>
          <motion.div variants={FadeUp(1)} initial="initial" animate="animate" className="flex justify-center md:justify-start">
            <label
              htmlFor="resumeUpload"
              className="border-dashed border-white border-2 rounded-lg p-4 md:p-6 w-full max-w-md text-center space-y-3 cursor-pointer"
            >
              <p className="text-gray-200 font-roboto text-[14px] md:text-[12.5px] lg:text-[18px]">
                {fileName || "Drop your resume here or choose a file. PDF & DOCX only. Max 2MB file size."}
              </p>
              <button
                type="button"
                className="bg-transparent border border-white hover:bg-white hover:text-purple-600 text-white font-poppins px-6 py-3 rounded-md"
                onClick={handleButtonClick}
              >
                {buttonText}
              </button>
              <div className="flex items-center justify-center text-gray-300 text-[16px] mt-2 italic">
                <IoIosLock className="mr-1" />
                Privacy guaranteed
              </div>
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf, .docx"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </motion.div>
        </div>

        <div className="flex justify-center items-center mt-8 md:mt-0 relative z-10">
          <motion.img
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
            src={HeroPng}
            alt="Hero Graphic"
            className="w-[450px] xl:w-[649px] relative z-20 drop-shadow-lg brightness-110"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
