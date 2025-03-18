import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset previous error messages
    setError('');
    setEmailError('');
    setPasswordError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Navigate to the Hero page after successful login
    } catch (error) {
      // Map Firebase errors to user-friendly messages
      switch (error.code) {
        case 'auth/invalid-email':
          setEmailError('Please enter a valid email address.');
          break;
        case 'auth/user-not-found':
          setError('No user found with this email address.');
          break;
        case 'auth/wrong-password':
          setPasswordError('Incorrect password. Please try again.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password sign-in is currently disabled.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError('Please enter your email to reset your password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent('A password reset email has been sent to your inbox.');
    } catch (error) {
      // Handle possible errors
      switch (error.code) {
        case 'auth/invalid-email':
          setEmailError('Invalid email address.');
          break;
        case 'auth/user-not-found':
          setError('No account is associated with this email.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    }
  };

  const handleGoBack = () => {
    navigate("/"); // Navigate back to the main page
  };

  return (
    <div className="bg-white min-h-screen w-full flex items-center justify-center overflow-y-auto py-8">
      <div className="flex flex-col md:flex-row w-11/12 max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden relative">
        {/* Back Arrow Icon */}
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Left Side: ATS Description */}
        <div className="md:w-5/12 p-8 bg-gray-50 flex flex-col justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
          <h2 className="text-4xl font-semibold text-gray-800 mb-4">Welcome to the Application Tracking System</h2>
          <p className="text-lg text-gray-600 leading-relaxed">Easily manage job applications, track hiring processes, and stay organized with a simple yet powerful ATS. Get started now and streamline your recruitment journey.</p>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-7/12 p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Login</h2>
            <p className="text-md text-gray-500">Please enter your email and password to log in</p>
          </div>
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="mb-6 flex items-center border-b-2 border-gray-300">
              <i className="fas fa-envelope mr-4 text-gray-500 text-lg"></i> {/* Font Awesome Email Icon */}
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

            {/* General Error Message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md shadow-sm">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 text-lg font-semibold">
              Login
            </button>

            {/* Forgot Password Link */}
            <p
              onClick={handleForgotPassword}
              className="text-center text-blue-500 hover:underline mt-4 cursor-pointer"
            >
              Forgot Password?
            </p>

            {/* Reset Confirmation Message */}
            {resetEmailSent && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded-md shadow-sm">
                <p className="text-sm">{resetEmailSent}</p>
              </div>
            )}

            <p className="text-center text-gray-600 mt-5 text-sm">Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;