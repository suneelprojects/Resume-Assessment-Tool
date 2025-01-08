import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useStep } from "../hooks/StepContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { saveSkills, fetchSkills } from "../services/firebaseUtils";

const Skills = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setCurrentStep } = useStep();

    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const resumeId = new URLSearchParams(location.search).get('resumeId');

    // Default skills with 10 skills each
    const DEFAULT_SKILLS = {
        "Full Stack": [
            "JavaScript", "React", "Node.js", "HTML", "CSS",
            "Express.js", "Redux", "TypeScript", "GraphQL", "MongoDB"
        ],
        "Cloud Computing": [
            "AWS", "Kubernetes", "Docker", "Azure", "Terraform",
            "CI/CD Pipelines", "Google Cloud", "Serverless", "CloudFormation", "Microservices"
        ],
        "Artificial Intelligence": [
            "Machine Learning", "Deep Learning", "Python", "TensorFlow", "PyTorch",
            "NLP", "Computer Vision", "Neural Networks", "Data Analysis", "GPT Models"
        ],
        "Data Science": [
            "Python", "R", "SQL", "Pandas", "NumPy",
            "Matplotlib", "Scikit-learn", "Data Visualization", "Statistics", "Big Data Analytics"
        ]
    };

    const [skills, setSkills] = useState({});
    const [categories, setCategories] = useState(Object.keys(DEFAULT_SKILLS));
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newCategories, setNewCategories] = useState([]);
    const [subheading, setSubheading] = useState("Technical Skills");

    // Listen to authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Modify the fetchExistingSkills function in useEffect
    useEffect(() => {
        const fetchExistingSkills = async () => {
            if (userId && resumeId) {
                try {
                    const existingSkills = await fetchSkills(userId, resumeId);
                    const mergedSkills = { ...DEFAULT_SKILLS };
                    const dynamicCategories = [];

                    Object.entries(existingSkills).forEach(([category, skills]) => {
                        // Ensure skills is always an array
                        const skillsArray = Array.isArray(skills) ? skills : [];

                        if (!DEFAULT_SKILLS[category]) {
                            dynamicCategories.push({
                                name: category,
                                skills: skillsArray
                            });
                        } else {
                            mergedSkills[category] = skillsArray;
                        }
                    });

                    setSkills(mergedSkills);
                    setCategories(Object.keys(DEFAULT_SKILLS));
                    setNewCategories(dynamicCategories);

                    const savedCategory = localStorage.getItem(`selectedCategory-${resumeId}`);
                    if (savedCategory && DEFAULT_SKILLS[savedCategory]) {
                        setSelectedCategory(savedCategory);
                    }
                } catch (error) {
                    console.error("Error fetching skills:", error);
                    toast.error("Failed to load skills");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchExistingSkills();
    }, [userId, resumeId]);

    // Save selected category to localStorage
    useEffect(() => {
        if (selectedCategory && resumeId) {
            localStorage.setItem(`selectedCategory-${resumeId}`, selectedCategory);
        }
    }, [selectedCategory, resumeId]);

    const handleCategorySelect = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        setSubheading(category + " Skills");
    };

    const handleAddCategory = () => {
        let newCategoryName = "Unnamed Category";
        let counter = 1;

        while (
            Object.keys(DEFAULT_SKILLS).includes(newCategoryName) ||
            newCategories.some(cat => cat.name === newCategoryName)
        ) {
            newCategoryName = `Unnamed Category ${counter}`;
            counter++;
        }

        const newCategory = {
            name: newCategoryName,
            skills: [] // Explicitly initialize as empty array
        };
        setNewCategories(prev => [...prev, newCategory]);
    };

    // Add a utility function to safely access skills
    const getCategorySkills = (category, isDynamic = false) => {
        if (isDynamic) {
            const categoryObj = newCategories.find(cat => cat.name === category);
            return Array.isArray(categoryObj?.skills) ? categoryObj.skills : [];
        }
        return Array.isArray(skills[category]) ? skills[category] :
            Array.isArray(DEFAULT_SKILLS[category]) ? DEFAULT_SKILLS[category] : [];
    };

    const handleAddSkill = async (categoryName, event, isDynamic = false) => {
        if (event.key === "Enter" && event.target.textContent.trim() !== "") {
            const newSkill = event.target.textContent.trim();

            if (isDynamic) {
                // For dynamic (new) categories
                setNewCategories(prev =>
                    prev.map((category) =>
                        category.name === categoryName
                            ? { ...category, skills: [...category.skills, newSkill] }
                            : category
                    )
                );
            } else {
                // For existing/default categories
                setSkills(prevSkills => {
                    // Create a new object to avoid direct mutation
                    const updatedSkills = { ...prevSkills };

                    // If the category doesn't exist, initialize it with default skills
                    if (!updatedSkills[categoryName]) {
                        updatedSkills[categoryName] = DEFAULT_SKILLS[categoryName] || [];
                    }

                    // Add the new skill if it's not already present
                    if (!updatedSkills[categoryName].includes(newSkill)) {
                        updatedSkills[categoryName] = [...updatedSkills[categoryName], newSkill];
                    }

                    return updatedSkills;
                });
            }

            event.target.textContent = "";
            event.preventDefault();

            // Save immediately after adding skill
            await saveCurrentSkills();
        }
    };

    const handleDeleteSkill = async (categoryName, skill, isDynamic = false) => {
        if (isDynamic) {
            setNewCategories((prev) =>
                prev.map((category) =>
                    category.name === categoryName
                        ? { ...category, skills: category.skills.filter((s) => s !== skill) }
                        : category
                )
            );
        } else {
            setSkills((prevSkills) => ({
                ...prevSkills,
                [categoryName]: prevSkills[categoryName].filter((s) => s !== skill),
            }));
        }

        // Save after deleting skill
        await saveCurrentSkills();
    };

    const saveCurrentSkills = async () => {
        try {
            if (!userId || !resumeId) {
                toast.error("User or Resume ID is missing!");
                return;
            }

            const skillsToSave = {};

            // Iterate through selected category and default categories
            if (selectedCategory) {
                const currentSkills = skills[selectedCategory] || [];
                const defaultSkills = DEFAULT_SKILLS[selectedCategory] || [];

                // Always save the full set of skills if category is selected
                // This ensures default skills are saved even if no new skills are added
                skillsToSave[selectedCategory] = currentSkills.length > 0
                    ? [...new Set([...defaultSkills, ...currentSkills])]
                    : defaultSkills;
            }

            // Add new categories and their skills
            newCategories.forEach(category => {
                if (category.skills.length > 0) {
                    skillsToSave[category.name] = category.skills;
                }
            });

            await saveSkills(userId, resumeId, skillsToSave);
        } catch (error) {
            console.error("Error saving skills:", error);
            toast.error(`Failed to save skills: ${error.message}`);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await saveCurrentSkills();
        navigate(`/choosetemplate?resumeId=${resumeId}`);

        toast.success("Skills saved successfully!", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
        });
    };

    const handleNavigation = (direction) => {
        if (direction === "previous") {
            setCurrentStep(6); // Set to previous section
            navigate(`/allpages/achievements?resumeId=${resumeId}`);
        }
    };

    const handleDeleteCategory = (index) => {
        setNewCategories((prev) => prev.filter((_, i) => i !== index));
    };

    // Loading state component
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center ml-0 md:ml-64">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-purple-200"></div>
                    <div className="h-4 w-36 bg-purple-200 rounded"></div>
                    <div className="text-purple-500">Loading your skills...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 ml-0 md:ml-64">
            <div className="my-8 w-full max-w-4xl bg-white/30 border border-white/20 rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
                <form
                    className="grid grid-cols-1 gap-y-6 w-full"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Heading with navigation arrows */}
                    <div className="mb-1 flex justify-between items-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            Skills
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => handleNavigation("previous")}
                                className="p-2 rounded-md bg-white/40 hover:bg-purple-200 focus:outline-none transition-all duration-300 transform hover:scale-105 group"
                                aria-label="Previous"
                            >
                                <ChevronLeftIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
                            </button>
                            <button
                                type="button"
                                // onClick={() => handleNavigation("next")}
                                className="p-2 rounded-md bg-white/40 hover:bg-purple-200 focus:outline-none transition-all duration-300 transform hover:scale-105 group"
                                aria-label="Next"
                            >
                                <ChevronRightIcon className="h-6 w-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Select Skill Category
                        </label>
                        <select
                            className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/90"
                            value={selectedCategory}
                            onChange={(e) => {
                                const category = e.target.value;
                                setSelectedCategory(category);
                                setSubheading(
                                    Object.keys(DEFAULT_SKILLS).includes(category)
                                        ? "Technical Skills"
                                        : `${category} Skills`
                                );
                            }}
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selected Category Skills */}
                    {selectedCategory && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {subheading}
                            </label>
                            <div className="border border-gray-300 rounded-lg p-4 bg-white/70 flex flex-wrap gap-2">
                                {(skills[selectedCategory] || DEFAULT_SKILLS[selectedCategory]).map((skill, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                                    >
                                        <span className="mr-2">{skill}</span>
                                        <XCircleIcon
                                            className="h-5 w-5 text-purple-500 cursor-pointer hover:text-purple-700"
                                            onClick={() => handleDeleteSkill(selectedCategory, skill)}
                                        />
                                    </div>
                                ))}
                                <div
                                    contentEditable
                                    onKeyDown={(e) => handleAddSkill(selectedCategory, e)}
                                    className="bg-white text-gray-700 px-3 py-1 rounded-full outline-none cursor-text min-w-[100px] focus:ring-2 focus:ring-purple-500"
                                    placeholder="Type and press Enter"
                                />
                            </div>
                        </div>
                    )}

                    {/* Dynamic Categories */}
                    {newCategories.map((category, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                                <input
                                    type="text"
                                    defaultValue={category.name}
                                    className="text-sm font-medium text-gray-700 border-b border-gray-300 focus:border-purple-500 focus:outline-none flex-grow p-1"
                                    onBlur={(e) => {
                                        const newName = e.target.value.trim();
                                        setNewCategories(prev =>
                                            prev.map((cat, i) =>
                                                i === index ? { ...cat, name: newName || `Unnamed Category ${index + 1}` } : cat
                                            )
                                        );
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(index)}
                                    className="text-gray-500 hover:text-red-500 focus:outline-none transition-all duration-300 transform hover:scale-110 hover:rotate-6"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2v0m6 0a2 2 0 012 2v0m-8 0h10m-6 4v6m-4-6v6m8-6v6"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="border border-gray-300 rounded-lg p-4 bg-white/70 flex flex-wrap gap-2">
                                {getCategorySkills(category.name, true).map((skill, skillIndex) => (
                                    <div
                                        key={skillIndex}
                                        className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                                    >
                                        <span className="mr-2">{skill}</span>
                                        <XCircleIcon
                                            className="h-5 w-5 text-purple-500 cursor-pointer hover:text-purple-700"
                                            onClick={() => handleDeleteSkill(category.name, skill, true)}
                                        />
                                    </div>
                                ))}
                                <div
                                    contentEditable
                                    onKeyDown={(e) => handleAddSkill(category.name, e, true)}
                                    className="bg-white text-gray-700 px-3 py-1 rounded-full outline-none cursor-text min-w-[100px] focus:ring-2 focus:ring-purple-500"
                                    placeholder="Type and press Enter"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Add Category and Save Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                        <button
                            type="button"
                            onClick={handleAddCategory}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 focus:outline-none transition-all duration-300 transform hover:scale-105 bg-purple-50 px-4 py-2 rounded-lg group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Skill Category</span>
                        </button>

                        <button
                            type="submit"
                            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-10 rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none transition-all duration-300 transform hover:scale-105"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Skills;