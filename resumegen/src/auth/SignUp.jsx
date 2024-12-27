import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { Eye, EyeOff } from 'lucide-react';
import { createUserDocument } from '../services/firebaseUtils';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("Starting signup process..."); // Debug log
  
    try {
      // Basic validation
      if (!termsAccepted) {
        setError('You must accept the Terms of Service and Privacy Policy to proceed.');
        return;
      }
  
      if (!username || !email || !password || !confirmPassword) {
        setError('All fields are required');
        return;
      }
  
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match.');
        return;
      }
  
      // First create the user in Firebase Auth
      console.log("Creating user authentication..."); // Debug log
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User authenticated successfully:", userCredential.user.uid); // Debug log
  
      // Then create the user document in Firestore
      console.log("Creating user document..."); // Debug log
      await createUserDocument(userCredential.user, {
        displayName: username,
      });
      console.log("User document created successfully"); // Debug log
  
      // Show success message
      alert("Account created successfully! Please log in.");
      
      // Navigate to login page
      navigate('/login', { replace: true });
  
    } catch (error) {
      console.error("Signup error:", error); // Debug log
  
      // Handle specific error cases
      switch (error.code) {
        case 'auth/invalid-email':
          setEmailError('Please enter a valid email address.');
          break;
        case 'auth/email-already-in-use':
          setEmailError('This email is already in use. Please choose another one.');
          break;
        case 'auth/weak-password':
          setPasswordError('Password should be at least 6 characters long.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password sign-up is currently disabled.');
          break;
        default:
          setError(`Registration failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="bg-white min-h-screen w-full flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-11/12 max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Side: ATS Description */}
        <div className="md:w-5/12 p-8 bg-gray-50 flex flex-col justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
          <h2 className="text-4xl font-semibold text-gray-800 mb-4">Welcome to the Application Tracking System</h2>
          <p className="text-lg text-gray-600 leading-relaxed">Easily manage job applications, track hiring processes, and stay organized with a simple yet powerful ATS. Get started now and streamline your recruitment journey.</p>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="md:w-7/12 p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Sign Up</h2>
            <p className="text-md text-gray-500">Please fill in the details to create an account</p>
          </div>
          <form onSubmit={handleSignup}>
            {/* Username Input */}
            <div className="mb-6 flex items-center border-b-2 border-gray-300">
              <i className="fas fa-user mr-4 text-gray-500 text-lg"></i>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-transparent focus:outline-none focus:border-blue-500 transition duration-300 placeholder-gray-500 text-gray-800 text-lg"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email Input */}
            <div className="mb-6 flex items-center border-b-2 border-gray-300">
              <i className="fas fa-envelope mr-4 text-gray-500 text-lg"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-transparent focus:outline-none focus:border-blue-500 transition duration-300 placeholder-gray-500 text-gray-800 text-lg"
                placeholder="Enter your email"
                required
              />
            </div>
            {emailError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md shadow-sm">
                <p className="text-sm">{emailError}</p>
              </div>
            )}

            {/* Password Input */}
            <div className="mb-6 flex items-center border-b-2 border-gray-300">
              <i className="fas fa-lock mr-4 text-gray-500 text-lg"></i>
              <div className="relative w-full flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-transparent focus:outline-none focus:border-blue-500 transition duration-300 placeholder-gray-500 text-gray-800 text-lg pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-gray-500 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {passwordError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md shadow-sm">
                <p className="text-sm">{passwordError}</p>
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="mb-6 flex items-center border-b-2 border-gray-300">
              <i className="fas fa-lock mr-4 text-gray-500 text-lg"></i>
              <div className="relative w-full flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-transparent focus:outline-none focus:border-blue-500 transition duration-300 placeholder-gray-500 text-gray-800 text-lg pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {confirmPasswordError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md shadow-sm">
                <p className="text-sm">{confirmPasswordError}</p>
              </div>
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="mr-2"
              />
              <label className="text-gray-600 text-sm">
                I agree to the 
                <Link className="text-blue-500 hover:underline"> Terms of Service</Link> and 
                <Link className="text-blue-500 hover:underline"> Privacy Policy</Link>
              </label>
            </div>

            {/* General Error Message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md shadow-sm">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 text-lg font-semibold">
              Sign Up
            </button>
            <p className="text-center text-gray-600 mt-5 text-sm">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;