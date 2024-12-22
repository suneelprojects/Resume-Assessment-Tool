import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser, getUserResumes, createResume, deleteResume, hasCompleteResume } from "../services/firebaseUtils";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Trash2, Loader2, Edit } from "lucide-react";
import { toast } from 'react-toastify';

const Hero = () => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [resumeToDelete, setResumeToDelete] = useState(null);
    const [newResumeName, setNewResumeName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            setIsLoading(true);
            if (userId) {
                try {
                    const userResumes = await getUserResumes(userId);
                    setResumes(userResumes);
                } catch (error) {
                    console.error("Error fetching resumes:", error);
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

    const handleCreateResume = async () => {
        const capitalizedResumeName = newResumeName.trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        if (!capitalizedResumeName) {
            toast.error("Resume name cannot be empty!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        // Check if a resume with the same name already exists
        const existingResume = resumes.find(
            resume => resume.name.toLowerCase() === capitalizedResumeName.toLowerCase()
        );

        if (existingResume) {
            toast.error("A resume with this name already exists!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        try {
            const resumeId = await createResume(userId, capitalizedResumeName);
            closeCreateModal();
            navigate(`/allpages/personaldetails?resumeId=${resumeId}`);
        } catch (error) {
            console.error("Error creating resume:", error);
        }
    };

    const handleDeleteResume = async () => {
        if (resumeToDelete) {
            try {
                await deleteResume(userId, resumeToDelete.id);
                setResumes(resumes.filter(resume => resume.id !== resumeToDelete.id));
                closeDeleteModal();
            } catch (error) {
                console.error("Error deleting resume:", error);
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
                {/* Heading Section */}
                <div className="text-center mb-12 text-white">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">My Resumes</h1>
                    <p className="text-base sm:text-xl text-white/80 max-w-xl mx-auto px-4">
                        Start creating your resume for your next job role! Craft a professional
                        and compelling resume that stands out.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 place-items-center">
                    {/* Create New Resume Card - Always in the center for first-time users */}
                    <div
                        onClick={openCreateModal}
                        className={`
                            flex flex-col items-center justify-center 
                            border-2 border-dashed border-white/30 
                            rounded-xl 
                            w-64 h-72 
                            cursor-pointer 
                            hover:border-white 
                            hover:bg-white/10 
                            transition duration-300 
                            ${resumes.length === 0 ? 'col-span-full' : ''}
                        `}
                    >
                        <span className="text-6xl text-white/60">+</span>
                        <p className="mt-[-2px] text-lg text-white">Create New Resume</p>
                    </div>

                    {/* Existing Resume Cards */}
                    {resumes.map((resume) => (
                        <div
                            key={resume.id}
                            className="
                                bg-white/10 
                                backdrop-blur-md 
                                p-5 
                                rounded-xl 
                                w-64 h-72 
                                flex flex-col 
                                justify-between 
                                relative 
                                group 
                                text-white 
                                border border-white/20
                            "
                        >
                            <div
                                className="cursor-pointer flex flex-col flex-grow"
                            >
                                <h2 className="text-xl font-bold truncate">{resume.name}</h2>
                                <p className="text-sm text-white/60 mt-2">
                                    {resume.createdAt
                                        ? new Date(resume.createdAt.seconds * 1000).toLocaleString()
                                        : "No date available"}
                                </p>
                            </div>

                            {/* Hover Icons Container */}
                            <div className="
                                absolute 
                                inset-0 
                                bg-black/30 
                                opacity-0 
                                group-hover:opacity-100 
                                transition 
                                duration-300 
                                flex 
                                items-center 
                                justify-center 
                                rounded-xl
                            ">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditResume(resume);
                                        }}
                                        className="
                                            bg-white 
                                            rounded-full 
                                            p-3 
                                           transform transition-transform duration-300 hover:scale-110
                                        "
                                    >
                                        <Edit size={24} className="text-blue-600" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDeleteModal(resume);
                                        }}
                                        className="
                                            bg-white
                                            rounded-full 
                                            p-3 
                                           transform transition-transform duration-300 hover:scale-110
                                        "
                                    >
                                        <Trash2 size={24} className="text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Resume Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2 text-gray-800">Create a Resume</h2>
                            <p className="text-gray-600 mb-4">Name your resume to get started</p>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="resumeName" className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2 text-gray-800">Delete Resume</h2>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete the resume "{resumeToDelete?.name}"?
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