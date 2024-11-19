import React from "react";
import { useLocation } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useTable } from 'react-table';  // For skill table rendering
import { FaCheck, FaTimes } from 'react-icons/fa';  // FontAwesome icons for check and cross

const Results = () => {
  const location = useLocation();
  const { results } = location.state || {};  // Access results passed from JobDescription

  // If results are not available
  if (!results) {
    return <div>No results available.</div>;
  }

  // Ensure that skills data is available and fallback to empty array if not
  const resumeSkills = results.skills_extracted_from_resume || {};
  const jobSkills = results.skills_extracted_from_job_description || {};
  const resumeHardSkills = resumeSkills.hard_skills || [];
  const jobHardSkills = jobSkills.hard_skills || [];

  // Match and Missing Skills Logic
  const matchingSkills = resumeHardSkills.filter(skill => jobHardSkills.includes(skill));
  const missingSkills = jobHardSkills.filter(skill => !resumeHardSkills.includes(skill));
  const extraSkills = resumeHardSkills.filter(skill => !jobHardSkills.includes(skill));

  // Table data (for matching/missing skills)
  const data = React.useMemo(() => {
    const allSkills = [...matchingSkills, ...missingSkills, ...extraSkills];
    return allSkills.map(skill => ({
      skill,
      inResume: resumeHardSkills.includes(skill) ? "Yes" : "No",
      inJobDescription: jobHardSkills.includes(skill) ? "Yes" : "No",
    }));
  }, [resumeHardSkills, jobHardSkills]);

  // Table columns definition
  const columns = React.useMemo(() => [
    {
      Header: 'Skill',
      accessor: 'skill', // Field to display skill name
    },
    {
      Header: 'In Resume',
      accessor: 'inResume', // Whether the skill exists in the resume
      Cell: ({ value }) => (
        <div className={`text-center flex items-center justify-center space-x-2`}>
          {value === "Yes" ? (
            <>
              <FaCheck className="text-green-500" />
              <span className="text-green-500">Yes</span>
            </>
          ) : (
            <>
              <FaTimes className="text-red-500" />
              <span className="text-red-500">No</span>
            </>
          )}
        </div>
      ),
    },
    {
      Header: 'In Job Description',
      accessor: 'inJobDescription', // Whether the skill exists in the job description
      Cell: ({ value }) => (
        <div className={`text-center flex items-center justify-center space-x-2`}>
          {value === "Yes" ? (
            <>
              <FaCheck className="text-green-500" />
              <span className="text-green-500">Yes</span>
            </>
          ) : (
            <>
              <FaTimes className="text-red-500" />
              <span className="text-red-500">No</span>
            </>
          )}
        </div>
      ),
    },
  ], []);

  // Use react-table hooks to handle table logic
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

  // Get ats_score and compatibility_score with fallback to 0 if undefined
  const atsScore = results.ats_score ?? 0;
  const compatibilityScore = results.compatibility_score ?? 0;

  return (
    <div className="results-container p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">Job Fit Analysis Dashboard</h1>

      {/* ATS and Compatibility Scores Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* ATS Score Card */}
        <div className="card bg-white shadow-lg rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">ATS Score</h3>
          <div style={{ width: 120, height: 120 }}>
            <CircularProgressbar
              value={atsScore}
              maxValue={100}
              text={`${atsScore.toFixed(2)}%`}
              strokeWidth={10}
              styles={{
                path: { stroke: '#4caf50' },
                text: { fill: '#4caf50', fontSize: '18px' },
                trail: { stroke: '#e0e0e0' },
              }}
            />
          </div>
          {atsScore < 50 && (
            <p className="text-red-600 mt-4">Your resume may not be well optimized for Applicant Tracking Systems. Consider improving keyword matching.</p>
          )}
        </div>

        {/* Compatibility Score Card */}
        <div className="card bg-white shadow-lg rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Compatibility Score</h3>
          <div style={{ width: 120, height: 120 }}>
            <CircularProgressbar
              value={compatibilityScore}
              maxValue={100}
              text={`${compatibilityScore.toFixed(2)}%`}
              strokeWidth={10}
              styles={{
                path: { stroke: '#ff9800' },
                text: { fill: '#ff9800', fontSize: '18px' },
                trail: { stroke: '#e0e0e0' },
              }}
            />
          </div>
          {compatibilityScore < 60 && (
            <p className="text-yellow-600 mt-4">Your resume could be better aligned with the job description. Consider adding missing skills.</p>
          )}
        </div>

        {/* Recommendation Card */}
        <div className="card bg-white shadow-lg rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Recommendation</h3>
          <p className="text-lg text-gray-600">{results.recommendation}</p>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="mt-10 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Skills Breakdown</h2>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-4 bg-indigo-50 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Skills Extracted from Resume</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{JSON.stringify(results.skills_extracted_from_resume, null, 2)}</pre>
          </div>

          <div className="card p-4 bg-indigo-50 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Skills Extracted from Job Description</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{JSON.stringify(results.skills_extracted_from_job_description, null, 2)}</pre>
          </div>
        </div> */}

        {/* Matching and Missing Skills Table */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Matching, Missing & Extra Skills</h3>
          <table {...getTableProps()} className="min-w-full table-auto">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} className="px-4 py-2 text-left bg-indigo-100">{column.render('Header')}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return <td {...cell.getCellProps()} className="border px-4 py-2">{cell.render('Cell')}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Results;
