import { useState, useEffect } from "react";
import { IoIosLock, IoMdTrash } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HeroPng from "../assets/rb_42.png";

export const FadeUp = (delay) => ({
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, duration: 0.5, delay, ease: "easeInOut" } },
});

const Home = () => {
  const [fileName, setFileName] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Load saved resume data and file from localStorage on component mount
  useEffect(() => {
    const savedResumeData = localStorage.getItem('resumeData');
    const savedFileName = localStorage.getItem('fileName');
    const savedFileData = localStorage.getItem('fileData');
    const savedFileType = localStorage.getItem('fileType');

    setIsLoading(false);
    setIsUploading(false);

    if (savedResumeData && savedFileName && savedFileData && savedFileType) {
      setResumeData(JSON.parse(savedResumeData));
      setFileName(savedFileName);

      // Recreate the file and set it to the input
      const dataTransfer = new DataTransfer();
      const blob = base64ToBlob(savedFileData, savedFileType);
      const file = new File([blob], savedFileName, { type: savedFileType });
      dataTransfer.items.add(file);

      const fileInput = document.getElementById("resumeUpload");
      if (fileInput) {
        fileInput.files = dataTransfer.files;
      }
    }
  }, []);

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64Data, contentType) => {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result
          .replace('data:', '')
          .replace(/^.+,/, '');
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 2) {
        alert("Please upload a file 2MB or less.");
        setIsUploading(false);
        return;
      } else if (
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileName(file.name);

        // Save file content to localStorage
        try {
          const base64Data = await fileToBase64(file);
          localStorage.setItem('fileData', base64Data);
          localStorage.setItem('fileType', file.type);
          localStorage.setItem('fileName', file.name);
        } catch (error) {
          console.error('Error saving file:', error);
        }

        await uploadResumeAndProcess(file);
        setIsUploading(false);
      } else {
        alert("Please upload only PDF or DOCX files.");
        setIsUploading(false);
      }
    }
  };

  const handleDeleteResume = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setFileName("");
    setResumeData(null);
    localStorage.removeItem('resumeData');
    localStorage.removeItem('fileName');
    localStorage.removeItem('fileData');
    localStorage.removeItem('fileType');
    setShowDeleteConfirm(false);
    // Reset file input
    const fileInput = document.getElementById("resumeUpload");
    if (fileInput) fileInput.value = "";
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

  const uploadResumeAndProcess = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const apiUrl = backendUrl.includes(":5000")
        ? `${backendUrl}/api/extract_resume`
        : `${backendUrl}:5000/api/extract_resume`;

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResumeData(data);
        localStorage.setItem('resumeData', JSON.stringify(data));
      } else {
        alert("Error uploading resume.");
      }
    } catch (error) {
      alert("Error uploading resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path) => {
    if (resumeData) {
      navigate(path, { state: { resumeText: resumeData.extractedText, parsedData: resumeData.parsedData } });
    }
  };

  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-500 overflow-hidden relative flex flex-col justify-center min-h-screen py-10 md:py-0">
      <div className="container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-20 px-8">
        <div className="flex flex-col justify-center space-y-6 text-center md:text-left text-white order-2 md:order-1 md:pr-12">
          <motion.div variants={FadeUp(0.4)} initial="initial" animate="animate">
            <h4 className="text-blue-100 font-bold text-xl font-poppins">Resume Checker</h4>
          </motion.div>
          <motion.h1 variants={FadeUp(0.6)} initial="initial" animate="animate" className="text-2xl lg:text-5xl font-bold !leading-snug font-poppins">
            Is your resume good <span className="block">enough?</span>
          </motion.h1>
          <motion.p variants={FadeUp(0.8)} initial="initial" animate="animate" className="text-gray-200 max-w-[550px] mx-auto md:mx-0 font-roboto text-[18px]">
            Find out instantly. Upload your resume and our free resume scanner will evaluate it against key criteria hiring managers and applicant tracking systems (ATS) look for. Get actionable feedback on how to improve your resume's success rate.
          </motion.p>
          <motion.div variants={FadeUp(1)} initial="initial" animate="animate" className="flex justify-center md:justify-start">
            <div className="border-dashed border-white border-2 rounded-lg p-4 md:p-6 w-full max-w-md text-center space-y-3">
              {(isLoading || isUploading) ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-white font-poppins">
                    {isUploading ? "Uploading..." : "Processing..."}
                  </p>
                </div>
              ) : (
                <>
                  {fileName ? (
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-gray-200 font-roboto">{fileName}</span>
                      <button
                        onClick={handleDeleteResume}
                        className="p-2 hover:bg-white hover:text-purple-600 rounded-md border border-white text-white"
                      >
                        <IoMdTrash size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-200 font-roboto text-[14px] md:text-[12.5px] lg:text-[18px]">
                        Drop your resume here or click the button below.
                        <br />
                        PDF & DOCX only. Max 2MB file size.
                      </p>
                      <button
                        type="button"
                        className="relative bg-transparent border border-white hover:bg-white hover:text-purple-600 text-white font-poppins px-6 py-3 rounded-md"
                        onClick={() => document.getElementById("resumeUpload").click()}
                      >
                        Upload Your Resume
                      </button>
                    </>
                  )}

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
                </>
              )}
            </div>
          </motion.div>

          {resumeData && (
            <motion.div
              initial={{ opacity: 0, y: 50 }} // Start hidden and below
              animate={{ opacity: 1, y: 0 }}  // Fade in and move up
              transition={{ duration: 0.5, delay: 1, ease: "easeInOut" }} // Delay to sync after the box animation
              className="flex flex-wrap justify-center md:justify-start gap-3 mt-4"
            >
              <motion.button
                variants={FadeUp(1)} // Add slight delays to buttons
                initial="initial"
                animate="animate"
                className="bg-white text-purple-600 hover:bg-purple-600 hover:text-white font-poppins px-4 py-2 rounded-md transition-colors"
                onClick={() => handleNavigate("/role-score")}
              >
                Check Role Score
              </motion.button>
              <motion.button
                variants={FadeUp(1.2)}
                initial="initial"
                animate="animate"
                className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white font-poppins px-4 py-2 rounded-md transition-colors"
                onClick={() => handleNavigate("/ats-score")}
              >
                Check ATS
              </motion.button>
              <motion.button
                variants={FadeUp(1.4)}
                initial="initial"
                animate="animate"
                className="bg-white text-purple-600 hover:bg-purple-600 hover:text-white font-poppins px-4 py-2 rounded-md transition-colors"
                onClick={() => handleNavigate("/jd-score")}
              >
                Check Job Description Score
              </motion.button>
            </motion.div>
          )}

        </div>

        <div className="flex justify-center items-center order-1 md:order-2 md:pl-12">
          <motion.img
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
            src={HeroPng}
            alt="Hero Graphic"
            className="w-[350px] md:w-[450px] xl:w-[549px] relative z-20 drop-shadow-lg brightness-110"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Resume</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete the uploaded resume? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Home;