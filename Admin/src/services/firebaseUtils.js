import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db, auth } from "./firebaseConfig"; // Import Firebase config

// ================== Authentication Functions ==================

// In your firebase services file
export const createUserDocument = async (user, additionalData) => {
  if (!user) {
    console.error("No user provided to createUserDocument");
    return;
  }

  try {
    console.log("Creating document for user:", user.uid); // Debug log
    const userRef = doc(db, "users", user.uid);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: additionalData.displayName,
      createdAt: new Date().toISOString(),
    };

    console.log("Attempting to save user data:", userData); // Debug log
    await setDoc(userRef, userData);
    console.log("User document created successfully"); // Debug log
    return userData;
  } catch (error) {
    console.error("Error in createUserDocument:", error);
    throw error;
  }
};

/**
 * Register a new user
 **/
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw new Error("Failed to register user. Please try again.");
  }
};

/**
 * Login an existing user
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in user:", error.message);
    throw new Error("Failed to login. Check your email or password.");
  }
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Error logging out user:", error.message);
    throw new Error("Failed to log out. Please try again.");
  }
};

// ================== Firestore Functions ==================

/**
 * Create a new resume and return its ID
 */
export const createResume = async (userId, resumeName) => {
  if (!userId || !resumeName) throw new Error("User ID and Resume Name are required!");

  try {
    const resumeId = doc(collection(doc(db, "users", userId), "resumes")).id;
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);

    await setDoc(resumeRef, {
      name: resumeName,
      createdAt: new Date(),
    });

    console.log("Resume created successfully.");
    return resumeId;
  } catch (error) {
    console.error("Error creating resume:", error.message);
    throw new Error("Failed to create resume. Please try again.");
  }
};

export const deleteResume = async (userId, resumeId) => {
  try {
      await deleteDoc(doc(db, 'users', userId, 'resumes', resumeId));
  } catch (error) {
      console.error("Error deleting resume:", error);
      throw error;
  }
};

/**
 * Save personal details
 */
export const savePersonalDetails = async (userId, resumeId, details) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await setDoc(resumeRef, { personalDetails: details }, { merge: true });
    console.log("Personal details saved successfully!");
  } catch (error) {
    console.error("Error saving personal details:", error.message);
    throw new Error("Failed to save personal details.");
  }
};

/**
 * Fetch personal details
 */
export const fetchPersonalDetails = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Return the entire document data, which should include personal details
      return docSnap.data() || {};
    }
    return null;
  } catch (error) {
    console.error("Error fetching personal details:", error);
    throw error;
  }
};

/**
 * Save resume objective
 */
export const saveObjective = async (userId, resumeId, objective) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await setDoc(resumeRef, { objective }, { merge: true });
    console.log("Objective saved successfully!");
  } catch (error) {
    console.error("Error saving objective:", error.message);
    throw new Error("Failed to save objective.");
  }
};

/**
 * Fetch resume objective
 */
export const fetchObjective = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().objective || '';
    }
    return '';
  } catch (error) {
    console.error("Error fetching objective:", error);
    throw error;
  }
};

/**
 * Save work experience details
 */
export const saveWorkExperience = async (userId, resumeId, experiences) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");
  if (!Array.isArray(experiences)) throw new Error("Experiences must be an array.");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await updateDoc(resumeRef, {
      workExperience: experiences,
    }, { merge: true });
    console.log("Work experience saved successfully!");
  } catch (error) {
    console.error("Error saving work experience:", error.message);
    throw new Error("Failed to save work experience.");
  }
};

/**
 * Fetch work experience details
 */
export const fetchWorkExperience = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().workExperience || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching work experience:", error);
    throw error;
  }
};

/**
 * Save projects to Firestore
 */
export const saveProjects = async (userId, resumeId, projects) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");
  if (!Array.isArray(projects)) throw new Error("Projects must be an array.");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await updateDoc(resumeRef, {
      projects: projects, // Replace existing projects instead of using arrayUnion
    }, { merge: true });
    console.log("Projects saved successfully!");
  } catch (error) {
    console.error("Error saving projects:", error.message);
    throw new Error("Failed to save projects.");
  }
};

/**
 * Fetch projects from Firestore
 */
export const fetchProjects = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().projects || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

/**
 * Save education details
 */
export const saveEducationDetails = async (userId, resumeId, educationDetails) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");
  if (!Array.isArray(educationDetails)) throw new Error("Education details must be an array.");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await updateDoc(resumeRef, {
      education: educationDetails, // Replace existing education instead of using arrayUnion
    }, { merge: true });
    console.log("Education details saved successfully!");
  } catch (error) {
    console.error("Error saving education details:", error.message);
    throw new Error("Failed to save education details.");
  }
};

/**
 * Fetch education details
 */
export const fetchEducationDetails = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().education || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching education details:", error);
    throw error;
  }
};

/**
 * Save achievements to Firestore
 */
export const saveAchievements = async (userId, resumeId, achievements) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await setDoc(resumeRef, { achievements }, { merge: true });
    console.log("Achievements saved successfully!");
  } catch (error) {
    console.error("Error saving achievements:", error.message);
    throw new Error("Failed to save achievements.");
  }
};

/**
 * Fetch achievements from Firestore
 */
export const fetchAchievements = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().achievements || '';
    }
    return '';
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw error;
  }
};

/**
 * Save skills to Firestore
 */
export const saveSkills = async (userId, resumeId, skillsData) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");
  if (typeof skillsData !== 'object') throw new Error("Skills data must be an object.");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await updateDoc(resumeRef, {
      skills: skillsData,
    }, { merge: true });
    console.log("Skills saved successfully!");
  } catch (error) {
    console.error("Error saving skills:", error.message);
    throw new Error("Failed to save skills.");
  }
};

/**
 * Fetch skills from Firestore
 */
export const fetchSkills = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().skills || {};
    }
    return {};
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};

/**
 * Fetch all resumes for a user
 */
export const getUserResumes = async (userId) => {
  try {
    const resumesRef = collection(doc(db, "users", userId), "resumes");
    const querySnapshot = await getDocs(resumesRef);

    const resumes = [];
    querySnapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() });
    });

    console.log("User resumes fetched successfully.");
    return resumes;
  } catch (error) {
    console.error("Error fetching user resumes:", error.message);
    throw new Error("Failed to fetch user resumes.");
  }
};

/**
 * Fetch a single resume by ID
 */
export const getResumeById = async (userId, resumeId) => {
  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    const docSnap = await getDoc(resumeRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Resume not found!");
    }
  } catch (error) {
    console.error("Error fetching resume:", error.message);
    throw new Error("Failed to fetch resume.");
  }
};

/**
 * Subscribe to real-time updates for a resume
 */
export const subscribeToResume = (userId, resumeId, callback) => {
  const resumeRef = doc(db, "users", userId, "resumes", resumeId);
  return onSnapshot(resumeRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      console.error("No such document!");
    }
  });
};

/**
 * Save complete resume with template
 */
export const saveCompleteResume = async (userId, resumeId, resumeData, template) => {
  if (!userId || !resumeId) throw new Error("User ID or Resume ID is missing!");

  try {
    const resumeRef = doc(db, "users", userId, "resumes", resumeId);
    await updateDoc(resumeRef, {
      completeResume: resumeData,
      template: template
    }, { merge: true });
  } catch (error) {
    console.error("Error saving complete resume:", error.message);
    throw new Error("Failed to save complete resume.");
  }
};

/**
 * Check if a resume has a complete template
 */
export const hasCompleteResume = async (userId, resumeId) => {
  try {
    const docRef = doc(db, 'users', userId, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.completeResume && data.template;
    }
    return false;
  } catch (error) {
    console.error("Error checking complete resume:", error);
    throw error;
  }
};