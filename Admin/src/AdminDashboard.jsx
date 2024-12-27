import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // Add this import
import { auth, db } from './services/firebaseConfig';
import { Users, FileText, Loader, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = [];
      let totalResumes = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const resumesRef = collection(db, 'users', userDoc.id, 'resumes');
        const resumesSnapshot = await getDocs(resumesRef);
        const userResumes = resumesSnapshot.size;
        totalResumes += userResumes;

        usersData.push({
          ...userData,
          id: userDoc.id,
          totalResumes: userResumes
        });
      }

      setUsers(usersData);
      setStats({
        totalUsers: usersSnapshot.size,
        totalResumes: totalResumes
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      navigate('/adminlogin'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
        <div className="p-8 rounded-xl bg-white/10 backdrop-blur-lg">
          <Loader className="w-12 h-12 animate-spin text-purple-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white animate-fade-in">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full shadow-lg 
                     hover:bg-red-600 transition-all duration-300 hover:shadow-xl transform hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-purple-500/20">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-purple-500/20 rounded-2xl">
                <Users className="w-10 h-10 text-purple-200" />
              </div>
              <div>
                <p className="text-purple-200 text-lg">Total Users</p>
                <p className="text-4xl font-bold text-white mt-1">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-purple-500/20">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-purple-500/20 rounded-2xl">
                <FileText className="w-10 h-10 text-purple-200" />
              </div>
              <div>
                <p className="text-purple-200 text-lg">Total Resumes</p>
                <p className="text-4xl font-bold text-white mt-1">{stats.totalResumes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-purple-500/20">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-500/20">
              <thead className="bg-purple-500/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-200 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-200 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-200 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-200 uppercase tracking-wider">
                    Total Resumes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/20">
                {users.map((user) => (
                  <tr 
                    key={user.uuid} 
                    className="hover:bg-purple-500/10 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-200">{user.displayName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-200">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{user.totalResumes}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;