import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { savePersonalDetails, saveObjective, saveWorkExperience, saveProjects, saveSkills, saveAchievements } from '../services/firebaseUtils';
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

    // Sample data structure that matches your components
    const generateSampleProfile = (role) => ({
        Role: role,
        Category: "Full Stack",
        FirstName: "John",
        LastName: "Doe",
        Email: "johndoe@example.com",
        PhoneNo: "1234567890",
        LinkedIn: "https://linkedin.com/in/johndoe",
        Github: "https://github.com/johndoe",
        Objective: `Dedicated and efficient ${role} with 3+ years of experience in application layers, presentation layers, and databases. Seeking to leverage broad development experience and hands-on technical expertise in a challenging role as a ${role}.`,
        
        // Structured work experience data
        WorkExperience: [
            {
                company: "Tech Solutions Inc.",
                city: "San Francisco",
                jobTitle: role,
                startDate: "January, 2021",
                endDate: "Present",
                description: `<ul>
                    <li>Led development of microservices architecture resulting in 40% improvement in system scalability</li>
                    <li>Implemented CI/CD pipeline reducing deployment time by 60%</li>
                    <li>Mentored junior developers and conducted code reviews</li>
                </ul>`
            },
        ],
        
        // Structured projects data
        Projects: [
            {
                name: "E-commerce Platform",
                link: "https://github.com/johndoe/ecommerce",
                description: `<ul>
                    <li>Built a full-stack e-commerce platform using React and Node.js</li>
                    <li>Implemented secure payment processing and user authentication</li>
                    <li>Integrated with multiple third-party APIs for shipping and inventory management</li>
                </ul>`
            },
        ],
        
        // Structured achievements data
        Achievements: `<ul>
            <li>AWS Certified Developer Associate (2023)</li>
            <li>React Certification from Meta (2022)</li>
            <li>First Place in Regional Hackathon (2022)</li>
            <li>Published technical article on Medium with 10k+ views</li>
            <li>Speaker at local tech meetups on modern web development practices</li>
        </ul>`,

        Skills: {
            technicalSkills: [
                "JavaScript",
                "React",
                "Node.js",
                "Python",
                "SQL",
                "Git",
                "AWS",
                "Docker"
            ],
            softSkills: [
                "Communication",
                "Team Leadership",
                "Problem Solving",
                "Agile Methodologies"
            ]
        }
    });

    const fetchProfileData = async (jobRole) => {
        try {
            try {
                const response = await fetch('http://localhost:5000/api/generate_profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        input_text: `${jobRole} with 3 years experience`
                    })
                });

                if (!response.ok) {
                    throw new Error('API response was not ok');
                }

                return await response.json();
            } catch (apiError) {
                console.warn('API fetch failed, using sample data:', apiError);
                return generateSampleProfile(jobRole);
            }
        } catch (error) {
            console.error('Error in fetchProfileData:', error);
            throw error;
        }
    };

    const saveProfileToFirestore = async (userId, resumeId, profileData) => {
        try {
            // Save personal details
            const personalDetails = {
                firstName: profileData.FirstName,
                lastName: profileData.LastName,
                email: profileData.Email,
                phone: profileData.PhoneNo,
                linkedin: profileData.LinkedIn,
                github: profileData.Github
            };
            await savePersonalDetails(userId, resumeId, personalDetails);

            // Save objective
            await saveObjective(userId, resumeId, profileData.Objective);

            // Save work experience
            await saveWorkExperience(userId, resumeId, profileData.WorkExperience);

            // Save projects
            await saveProjects(userId, resumeId, profileData.Projects);

            // Save achievements
            await saveAchievements(userId, resumeId, profileData.Achievements);

            // Save skills
            await saveSkills(userId, resumeId, profileData.Skills);

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

            try {
                // Fetch profile data (will use sample data if API fails)
                const profileData = await fetchProfileData(jobRole);

                // Save all profile data to Firestore using the existing resumeId
                await saveProfileToFirestore(userId, resumeId, profileData);

                toast.success('Resume created successfully!');
                // Navigate to template selection page
                navigate(`/choosetemplate?resumeId=${resumeId}`);
            } catch (error) {
                console.error('Error while populating resume:', error);
                toast.warning('Resume created with basic information. Some data may be missing.');
                navigate(`/choosetemplate?resumeId=${resumeId}`);
            }
        } catch (error) {
            console.error('Error in resume creation process:', error);
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