import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { Shield, AlertCircle, User } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Default admin credentials
  const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@admin.com'
  };

  // Check if admin account exists, if not create it
  const setupAdminAccount = async () => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, DEFAULT_ADMIN.email);
      
      if (methods.length === 0) {
        // Admin account doesn't exist, create it
        await createUserWithEmailAndPassword(
          auth,
          DEFAULT_ADMIN.email,
          DEFAULT_ADMIN.password
        );
        console.log('Admin account created successfully');
      }
    } catch (error) {
      console.error('Error setting up admin account:', error);
    }
  };

  // Run setup on component mount
  useEffect(() => {
    setupAdminAccount();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if credentials match default admin
      if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
        await signInWithEmailAndPassword(
          auth, 
          DEFAULT_ADMIN.email, 
          DEFAULT_ADMIN.password
        );
        navigate('/admindashboard');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-blue-100 mt-1">Access dashboard and manage users</p>
        </div>

        {/* Login Form */}
        <div className="p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {/* Default Credentials Notice */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 text-center">
                Default Admin Credentials:<br />
                Username: admin<br />
                Password: admin123
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;