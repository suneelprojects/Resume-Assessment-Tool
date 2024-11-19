import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronRight, FaChevronDown } from "react-icons/fa"; // Importing Font Awesome icons

const faqs = [
  {
    question: "What is an ATS resume score?",
    answer:
      "An ATS (Applicant Tracking System) resume score is a measure of how well your resume is optimized to pass through automated resume screening systems. These systems are used by many companies to filter resumes based on keywords, formatting, and other factors. The score helps you understand how well your resume aligns with industry standards and job descriptions, which increases your chances of being noticed by recruiters.",
  },
  {
    question: "How does the resume score checker work?",
    answer:
      "Our resume score checker scans your resume against a wide range of industry standards and specific job descriptions. It evaluates key elements like the use of relevant keywords, the structure and formatting of the resume, and overall readability. Based on this evaluation, it assigns a score and provides detailed suggestions for improvement, helping you optimize your resume to increase your chances of passing through ATS filters and catching the eye of recruiters.",
  },
  {
    question: "How can I improve my resume score?",
    answer:
      "Improving your resume score involves optimizing several key areas. First, ensure your resume includes relevant keywords that match the job description. Use a clean, structured format with clear headings and bullet points to enhance readability for ATS systems. Avoid complex layouts with graphics or tables, as these can confuse the system. Additionally, our tool provides personalized tips to help you tailor your resume for better optimization.",
  },
  {
    question: "What are the benefits of using an ATS-friendly resume?",
    answer:
      "An ATS-friendly resume significantly increases your chances of getting noticed by recruiters and passing through automated ATS filters. Many companies rely on ATS to screen resumes, and if your resume is not optimized for these systems, it may never reach a hiring manager. By using an ATS-friendly format, you ensure your resume gets a fair chance to be seen and considered by recruiters, ultimately improving your chances of landing interviews.",
  },
  {
    question: "What tips can help me create a better resume?",
    answer:
      "To create a better resume, focus on clarity, relevance, and simplicity. Use job-specific keywords that match the job description and industry standards. Structure your resume with clear sections (e.g., work experience, skills, education) and use bullet points to make it easily scannable. Avoid using graphics, images, or complex layouts that can confuse ATS. Additionally, keep the formatting clean, and make sure your resume is tailored to the specific job you are applying for.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0); // First question open by default

  const toggleFaq = (index) => {
    setOpenIndex(index === openIndex ? -1 : index); // Toggle open/close for clicked question
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  return (
    <section className="px-8 md:px-16 lg:px-32 py-12 max-w-[85rem] mx-auto space-y-8" id="faq">
      {/* Static heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-[3rem]">
        Frequently Asked Questions
      </h2>

      {/* FAQ List */}
      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className={`border-b pb-6 ${
              index === openIndex ? "text-blue-700" : "text-gray-800"
            }`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn} // Fade-in effect
          >
            {/* Question */}
            <div
              className="flex justify-between items-center cursor-pointer hover:text-blue-600 transition"
              onClick={() => toggleFaq(index)}
            >
              <h3 className="text-xl md:text-2xl font-semibold">{faq.question}</h3>
              <div
                className={`flex items-center justify-center w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6`}
                style={{ minWidth: "1rem", minHeight: "1rem" }}
              >
                {index === openIndex ? (
                  <FaChevronDown className="w-full h-full text-gray-600" />
                ) : (
                  <FaChevronRight className="w-full h-full text-gray-600" />
                )}
              </div>
            </div>

            {/* Answer (No animation) */}
            {index === openIndex && (
              <p className="mt-4 text-base md:text-lg text-gray-600">{faq.answer}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
