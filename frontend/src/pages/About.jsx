import React from 'react';
import { motion } from 'framer-motion';
import aboutus from "../assets/aboutus.jpg";

const About = () => {
  const fadeFromRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const fadeFromLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const popup = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className="px-8 md:px-16 lg:px-32 py-12 space-y-7"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      id="about"
    >
      {/* About Us Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">ABOUT US</h2>
      </div>

      <motion.div
        className="flex flex-col md:flex-row gap-10 md:gap-10 items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.img
          src={aboutus}
          alt="About Us"
          className="w-full md:w-1/2 rounded-lg shadow-lg"
          variants={fadeFromLeft}
        />
        <motion.div
          className="flex flex-col gap-6 text-gray-600 md:w-1/2"
          variants={fadeFromRight}
        >
          <p>
            Resume Checker was developed to assist job seekers in improving their resumes
            to better align with applicant tracking systems (ATS) and hiring criteria. Our goal is
            to simplify the process, offering insights into enhancing resume effectiveness in a competitive job market.
          </p>
          <p>
            With comprehensive feedback on content, structure, and keyword alignment, we help
            users maximize their chances of standing out to recruiters and ATS systems alike.
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            Our mission at Resume Checker is to empower individuals to create impactful resumes
            that convey their skills and experience effectively. We aim to bridge the gap between
            applicants and hiring systems, making the job application process smoother and more successful.
          </p>
        </motion.div>
      </motion.div>

      {/* Spacer to move "Why Choose Us" section down */}
      <div className="py-1"></div>

      {/* Why Choose Us Section */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800">WHY CHOOSE US</h3>
      </div>

      <motion.div
        className="flex flex-col md:flex-row text-sm gap-6 items-center mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          className="border px-8 py-10 flex flex-col gap-3 text-gray-600 rounded-lg shadow-lg md:w-1/3"
          variants={popup}
        >
          <b>Comprehensive Analysis:</b>
          <p>
            We provide in-depth feedback on resume content, format, and relevance to the job market,
            tailored to boost your resume’s success.
          </p>
        </motion.div>
        <motion.div
          className="border px-8 py-10 flex flex-col gap-3 text-gray-600 rounded-lg shadow-lg md:w-1/3"
          variants={popup}
        >
          <b>Easy-to-Use Interface:</b>
          <p>
            Our platform is designed with simplicity in mind, offering a seamless experience
            to upload, check, and improve resumes.
          </p>
        </motion.div>
        <motion.div
          className="border px-8 py-10 flex flex-col gap-3 text-gray-600 rounded-lg shadow-lg md:w-1/3"
          variants={popup}
        >
          <b>Data-Driven Insights:</b>
          <p>
            With insights based on hiring trends, we provide actionable steps to optimize your
            resume, enhancing its relevance and appeal.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default About;
