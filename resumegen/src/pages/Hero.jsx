import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  logoutUser,
  getUserResumes,
  createResume,
  deleteResume,
  hasCompleteResume,
} from "../services/firebaseUtils";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Trash2, Loader2, Edit, Plus, FileText } from "lucide-react";
import { toast } from "react-toastify";

const Hero = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [newResumeName, setNewResumeName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isJobRoleModalOpen, setIsJobRoleModalOpen] = useState(false);
  const [jobRole, setJobRole] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true);
      if (userId) {
        try {
          const userResumes = await getUserResumes(userId);
          setResumes(userResumes);
        } catch (error) {
          console.error("Error fetching resumes:", error);
          toast.error("Failed to fetch resumes");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchResumes();
      } else {
        navigate("/login");
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userId, navigate]);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewResumeName("");
  };

  const openDeleteModal = (resume) => {
    setResumeToDelete(resume);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setResumeToDelete(null);
  };

  const openJobRoleModal = () => setIsJobRoleModalOpen(true);
  const closeJobRoleModal = () => {
    setIsJobRoleModalOpen(false);
    setJobRole("");
  };

  const handleQuickCreate = async () => {
    if (!jobRole.trim()) {
      toast.error("Job role cannot be empty!");
      return;
    }

    try {
      const resumeId = await createResume(userId, jobRole);
      closeJobRoleModal();
      navigate(`/jobrole?resumeId=${resumeId}`);
    } catch (error) {
      console.error("Error in job role create:", error);
      toast.error("Failed to create resume. Please try again.");
    }
  };

  const handleCreateResume = async () => {
    const capitalizedResumeName = newResumeName
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (!capitalizedResumeName) {
      toast.error("Resume name cannot be empty!");
      return;
    }

    const existingResume = resumes.find(
      (resume) =>
        resume.name?.toLowerCase() === capitalizedResumeName.toLowerCase()
    );

    if (existingResume) {
      toast.error("A resume with this name already exists!");
      return;
    }

    try {
      const resumeId = await createResume(userId, capitalizedResumeName);
      closeCreateModal();
      navigate(`/allpages/personaldetails?resumeId=${resumeId}`);
    } catch (error) {
      console.error("Error creating resume:", error);
      toast.error("Failed to create resume. Please try again.");
    }
  };

  const handleDeleteResume = async () => {
    if (resumeToDelete) {
      try {
        await deleteResume(userId, resumeToDelete.id);
        setResumes(resumes.filter((resume) => resume.id !== resumeToDelete.id));
        closeDeleteModal();
        toast.success("Resume deleted successfully!");
      } catch (error) {
        console.error("Error deleting resume:", error);
        toast.error("Failed to delete resume");
      }
    }
  };

  const handleEditResume = async (resume) => {
    try {
      const hasComplete = await hasCompleteResume(userId, resume.id);
      if (hasComplete) {
        navigate(`/resume?resumeId=${resume.id}&template=${resume.template}`);
      } else {
        navigate(`/allpages/personaldetails?resumeId=${resume.id}`);
      }
    } catch (error) {
      console.error("Error checking resume:", error);
      navigate(`/allpages/personaldetails?resumeId=${resume.id}`);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-900 text-white">
      <Loader2 className="animate-spin text-white" size={48} />
      <p className="mt-4 text-lg">Loading...</p>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col justify-center py-16 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center text-white mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">My Resumes</h1>
          <p className="text-base sm:text-xl text-white/80 max-w-xl mx-auto px-4 mb-8">
            Start creating your resume for your next job role! Craft a
            professional and compelling resume that stands out.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-900 rounded-lg hover:bg-white/90 transition duration-300 font-semibold shadow-lg w-full sm:w-auto"
            >
              <Plus className="mr-2" size={20} />
              Create New Resume
            </button>
            <button
              onClick={openJobRoleModal}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold shadow-lg border-2 border-white/20 w-full sm:w-auto"
            >
              <FileText className="mr-2" size={20} />
              Create Resume With Job Role
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white/10 backdrop-blur-md p-5 rounded-xl w-full max-w-[250px] mx-auto h-56 flex flex-col justify-between relative group text-white border border-white/20"
            >
              <div className="cursor-pointer flex flex-col flex-grow">
                <h2 className="text-xl font-bold truncate">{resume.name}</h2>
                <p className="text-sm text-white/60 mt-2">
                  {resume.createdAt
                    ? new Date(resume.createdAt.seconds * 1000).toLocaleString()
                    : "No date available"}
                </p>
              </div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center rounded-xl">
                <div className="flex space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditResume(resume);
                    }}
                    className="bg-white rounded-full p-3 transform transition-transform duration-300 hover:scale-110"
                  >
                    <Edit size={24} className="text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(resume);
                    }}
                    className="bg-white rounded-full p-3 transform transition-transform duration-300 hover:scale-110"
                  >
                    <Trash2 size={24} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Create a Resume
              </h2>
              <p className="text-gray-600 mb-4">
                Name your resume to get started
              </p>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="resumeName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Resume Name
                  </label>
                  <input
                    id="resumeName"
                    type="text"
                    placeholder="e.g., Software Developer Resume"
                    value={newResumeName}
                    onChange={(e) => setNewResumeName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeCreateModal}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateResume}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Create Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isJobRoleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Enter Job Role
              </h2>
              <p className="text-gray-600 mb-4">
                Please enter your desired job role
              </p>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="jobRole"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Job Role
                  </label>
                  <input
                    id="jobRole"
                    type="text"
                    placeholder="e.g., Software Developer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeJobRoleModal}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickCreate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Create Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Delete Resume
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the resume "
                {resumeToDelete?.name}"?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteResume}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
