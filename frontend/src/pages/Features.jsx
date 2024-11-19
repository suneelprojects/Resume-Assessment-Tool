import React from "react";
import { motion } from "framer-motion";
import atsScoreImage from "../assets/feature-1.jpg";
import recommendationsImage from "../assets/feature-2.jpg";
import keywordOptimizationImage from "../assets/feature-3.jpg";
import formattingImage from "../assets/feature-4.jpg";

const Features = () => {
  const fadeFromLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  const fadeFromRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  return (
    <div>
      {/* Header Section */}
      <motion.div
        className="px-6 md:px-16 lg:px-32 py-5 max-w-6xl mx-auto text-center"
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        }}
      >
        <h1 className="text-4xl font-bold text-gray-900">Features</h1>
      </motion.div>

      {/* Features Section */}
      <div className="px-8 md:px-16 lg:px-32 py-8 space-y-10 max-w-7xl mx-auto">
        {/* ATS Score Analysis */}
        <motion.div
          className="flex flex-col-reverse md:flex-row gap-12 items-center"
          initial={{ opacity: 0.2, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true, amount: 0.3 }} 
          transition={{ duration: 1.2, ease: "easeInOut" }} 
        >
          <div className="md:w-1/2 relative">
            <div className="absolute bg-gradient-to-r from-blue-100 to-blue-50 w-full h-full rounded-2xl -rotate-3" />
            <img
              src={atsScoreImage}
              alt="ATS Score Analysis"
              className="relative z-10 rounded-xl shadow-lg w-full object-cover"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">ATS Score Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              Our ATS Score Analysis tool evaluates your resume against applicant tracking systems (ATS),
              ensuring that it's optimized for automated screenings. By focusing on key aspects such as keywords,
              formatting, and structure, we help improve your chances of passing the initial automated review
              and getting noticed by recruiters.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With detailed insights into your resume’s strengths and weaknesses, we make sure that your resume
              is fully aligned with industry standards and ATS requirements, so you can stand out in a competitive
              job market.
            </p>
          </div>
        </motion.div>

        {/* Personalized Recommendations */}
        <motion.div
          className="flex flex-col-reverse md:flex-row-reverse gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeFromRight}
          transition={{ duration: 0.8}}
        >
          <div className="md:w-1/2 relative">
            <div className="absolute bg-gradient-to-r from-purple-100 to-purple-50 w-full h-full rounded-2xl rotate-3" />
            <img
              src={recommendationsImage}
              alt="Personalized Recommendations"
              className="relative z-10 rounded-xl shadow-lg w-full object-cover"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h3>
            <p className="text-gray-600 leading-relaxed">
              Based on the unique content of your resume, our platform generates personalized recommendations
              to enhance its relevance and appeal. We provide actionable tips for improving keyword usage, content
              structure, and overall clarity.
            </p>
            <p className="text-gray-600 leading-relaxed">
              These tailored suggestions will help you refine your resume, ensuring it highlights your most relevant
              skills and experiences in the best possible way. Our goal is to boost your chances of securing an interview.
            </p>
          </div>
        </motion.div>

        {/* Keyword Optimization */}
        <motion.div
          className="flex flex-col-reverse md:flex-row gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeFromLeft}
          transition={{ duration: 0.8}}
        >
          <div className="md:w-1/2 relative">
            <div className="absolute bg-gradient-to-r from-green-100 to-green-50 w-full h-full rounded-2xl -rotate-3" />
            <img
              src={keywordOptimizationImage}
              alt="Keyword Optimization"
              className="relative z-10 rounded-xl shadow-lg w-full object-cover"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Keyword Optimization</h3>
            <p className="text-gray-600 leading-relaxed">
              Our Keyword Optimization tool identifies the most relevant keywords and phrases for your target job
              field. By analyzing job descriptions and industry trends, we help you incorporate these keywords into
              your resume.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This ensures that your resume is optimized for both ATS scanning and human readers, making sure you
              stand out to both recruiters and automated systems. By incorporating key terms, your resume will be
              better equipped to pass through ATS filters.
            </p>
          </div>
        </motion.div>

        {/* Formatting & Layout Tips */}
        <motion.div
          className="flex flex-col-reverse md:flex-row-reverse gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeFromRight}
          transition={{ duration: 0.8}}
        >
          <div className="md:w-1/2 relative">
            <div className="absolute bg-gradient-to-r from-red-100 to-red-50 w-full h-full rounded-2xl rotate-3" />
            <img
              src={formattingImage}
              alt="Formatting & Layout Tips"
              className="relative z-10 rounded-xl shadow-lg w-full object-cover"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Formatting & Layout Tips</h3>
            <p className="text-gray-600 leading-relaxed">
              We provide expert advice on optimizing the layout and formatting of your resume. Our tips ensure
              that your resume is not only ATS-friendly but also visually appealing to human readers.
            </p>
            <p className="text-gray-600 leading-relaxed">
              A clean and well-structured resume improves readability and ensures that key information stands out.
              We help you strike the right balance between aesthetics and function to make your resume both effective
              and engaging.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
