import React from "react";
import Hero from "./pages/Hero";
import { Route, Routes } from "react-router-dom";
import JobDescription from "./pages/JobDescription";
import Results from "./pages/Results";
import ResumeRole from "./pages/ResumeRole";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from "./pages/MainLayout";
const App = () => {
  return (
    <main className="overflow-x-hidden">
            <ToastContainer />

      <Navbar />
      <Routes>
      <Route path="/" element={<MainLayout/>} />
      <Route path="/job-description" element={<JobDescription />} />
        <Route path="/role" element={<ResumeRole />} />
        <Route path="/results" element={<Results />} />
      </Routes>
      <Footer />

    </main>
  );
};

export default App;
// import React, { useState } from 'react';

// function App() {
//   const [resumeText, setResumeText] = useState('');
//   const [inputRole, setInputRole] = useState('');
//   const [predictionResult, setPredictionResult] = useState(null);
//   const [error, setError] = useState(null);

//   // Handle the form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Make the POST request to the Flask API
//     try {
//       const response = await fetch('http://127.0.0.1:5000/predict', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           resume_text: resumeText,
//           input_role: inputRole,
//         }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setPredictionResult(data);
//         setError(null);
//       } else {
//         setError(data.error || 'An error occurred');
//         setPredictionResult(null);
//       }
//     } catch (err) {
//       setError('Failed to connect to the backend');
//       setPredictionResult(null);
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Role Prediction</h1>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Resume Text:</label>
//           <textarea
//             rows="10"
//             cols="50"
//             value={resumeText}
//             onChange={(e) => setResumeText(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Input Role:</label>
//           <input
//             type="text"
//             value={inputRole}
//             onChange={(e) => setInputRole(e.target.value)}
//           />
//         </div>
//         <button type="submit">Predict</button>
//       </form>

//       {predictionResult && (
//         <div>
//           <h2>Prediction Result</h2>
//           <p><strong>Given Role:</strong> {predictionResult.given_role}</p>
//           <p><strong>Confidence:</strong> {predictionResult.confidence.toFixed(2)}%</p>
//           <h3>Suggested Roles:</h3>
//           <ul>
//             {predictionResult.suggested_roles.map((role, index) => (
//               <li key={index}>
//                 {role.role}: {role.confidence.toFixed(2)}%
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {error && <p style={{ color: 'red' }}>{error}</p>}
//     </div>
//   );
// }

// export default App;
