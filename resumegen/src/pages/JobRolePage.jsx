import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    savePersonalDetails,
    saveObjective,
    saveWorkExperience,
    saveProjects,
    saveSkills,
    saveAchievements,
} from '../services/firebaseUtils';
import { auth } from '../services/firebaseConfig';
import { toast } from 'react-toastify';

const JobRolePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jobRole, setJobRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get resumeId from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const resumeId = searchParams.get('resumeId');

    // If no resumeId is present, redirect back to the dashboard
    if (!resumeId) {
        navigate('/');
        toast.error('Invalid resume ID');
        return null;
    }

    const fetchProfileData = async (jobRole) => {
        try {
            const response = await fetch('http://localhost:5000/api/generate_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input_text: `${jobRole}`,
                }),
            });

            if (!response.ok) {
                throw new Error('API response was not ok');
            }

            const profileData = await response.json();

            // Ensure skills are an object
            if (typeof profileData.Skills === 'string') {
                profileData.Skills = {
                    technicalSkills: profileData.Skills.split(',').map((skill) => skill.trim()),
                    softSkills: [],
                };
            }

            return profileData;
        } catch (error) {
            console.error('Error fetching profile data from backend:', error);
            throw error;
        }
    };

    const saveProfileToFirestore = async (userId, resumeId, profileData) => {
        try {
            // Save personal details, including jobTitle
            const personalDetails = {
                firstName: profileData.FirstName,
                lastName: profileData.LastName,
                email: profileData.Email,
                phone: profileData.PhoneNo,
                linkedin: profileData.LinkedIn,
                github: profileData.Github,
                jobTitle: profileData.jobTitle, // Include jobTitle here
            };
            await savePersonalDetails(userId, resumeId, personalDetails);
    
            // Save objective
            await saveObjective(userId, resumeId, profileData.Objective);
    
            // Save work experience
            await saveWorkExperience(userId, resumeId, profileData.WorkExperience);
    
            // Save projects
            await saveProjects(userId, resumeId, profileData.Projects);
    
            // Validate and save skills
            if (
                profileData.Skills &&
                typeof profileData.Skills === 'object' &&
                profileData.Skills.technicalSkills
                        ) {
                await saveSkills(userId, resumeId, profileData.Skills);
            } else {
                console.warn('Invalid Skills format. Skills not saved.');
            }
    
            // Save achievements
            await saveAchievements(userId, resumeId, profileData.Achievements);
        } catch (error) {
            console.error('Error saving profile to Firestore:', error);
            throw error;
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jobRole.trim()) {
            toast.error('Please enter a job role');
            return;
        }

        setIsLoading(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                toast.error('Please login first');
                navigate('/login');
                return;
            }

            // Fetch profile data from backend
            const profileData = await fetchProfileData(jobRole);

            // Save profile data to Firestore
            await saveProfileToFirestore(userId, resumeId, profileData);

            toast.success('Resume created successfully!');
            navigate(`/choosetemplate?resumeId=${resumeId}`);
        } catch (error) {
            console.error('Error during resume creation process:', error);
            toast.error('Failed to create resume');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-900 flex flex-col justify-center items-center p-4">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl w-full max-w-md border border-white/20">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Enter Job Role</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            placeholder="e.g., Software Developer"
                            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-white/90 transition duration-300 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating...' : 'Create Resume'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JobRolePage; 