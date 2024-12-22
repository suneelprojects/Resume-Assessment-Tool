import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center">
      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4">
            Build Your <span className="text-blue-600">Perfect Resume</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Empower your job search with a professional resume. Create, improve, and analyze your resume effortlessly.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Resume Card */}
          <div className="relative group bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="p-8 z-10 relative flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Create a <span className="text-blue-600">New Resume</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Start building a professional resume that highlights your skills and experience.
              </p>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition"
                onClick={() => navigate("/hero")}
              >
                Create Now
              </button>
            </div>
          </div>

          {/* Check Your Score Card */}
          <div className="relative group bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="p-8 z-10 relative flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Check Your <span className="text-green-600">Score</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Evaluate your resume and receive actionable feedback to stand out in the crowd.
              </p>
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-lg shadow-md hover:from-green-600 hover:to-green-800 transition"
                onClick={() => navigate("/home")}
              >
                Check Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
