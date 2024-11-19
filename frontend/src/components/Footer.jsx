import React from "react";
import { FaInstagram, FaWhatsapp, FaYoutube, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="pt-16 pb-12 bg-[#004d4d] text-white overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} 
                transition={{ duration: 0.8 }}
                className="px-8 md:px-16 lg:px-32"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 md:gap-4">
                    {/* first section */}
                    <div className="space-y-4 max-w-[350px]">
                        <h1 className="text-2xl font-bold">Resume Checker</h1>
                        <p className="text-gray-200 text-[17px]">
                            Resume Checker helps you optimize your resume for Applicant Tracking Systems (ATS).
                            Get an ATS score and actionable tips to improve your resume, enhancing your chances
                            of landing interviews in today's job market.
                        </p>
                    </div>
                    {/* second section */}
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold">Features</h1>
                            <ul className="space-y-2 text-lg">
                                <li>
                                    ATS Score Analysis
                                </li>
                                <li>
                                    Personalized Recommendations
                                </li>
                                <li>
                                    Keyword Optimization
                                </li>
                                <li>
                                    Formatting & Layout Tips
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4 ml-6">
                            <h1 className="text-2xl font-bold">Links</h1>
                            <ul className="space-y-2 text-lg">
                                <button 
                                    onClick={() => scrollToSection('home')}
                                    className="block w-full text-left cursor-pointer hover:text-[#00b3b3] hover:scale-105 duration-200"
                                >
                                    Home
                                </button>
                                <button 
                                    onClick={() => scrollToSection('about')}
                                    className="block w-full text-left cursor-pointer hover:text-[#00b3b3] hover:scale-105 duration-200"
                                >
                                    About Us
                                </button>
                                <button 
                                    onClick={() => scrollToSection('features')}
                                    className="block w-full text-left cursor-pointer hover:text-[#00b3b3] hover:scale-105 duration-200"
                                >
                                    Features
                                </button>
                                <button 
                                    onClick={() => scrollToSection('faq')}
                                    className="block w-full text-left cursor-pointer hover:text-[#00b3b3] hover:scale-105 duration-200"
                                >
                                    FAQs
                                </button>
                            </ul>
                        </div>
                    </div>
                    {/* third section */}
                    <div className="space-y-4 max-w-[300px]">
                        <h1 className="text-2xl font-bold">Get In Touch</h1>
                        <div className="flex space-x-6 py-3 text-[27px]">
                            <a href="">
                                <FaWhatsapp className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
                            </a>
                            <a href="">
                                <FaInstagram className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
                            </a>
                            <a href="">
                                <FaFacebook className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
                            </a>
                            <a href="">
                                <FaYoutube className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
                            </a>
                        </div>
                    </div>
                </div>
                {/* copyright text */}
                <div className="text-center mt-12 text-gray-400 text-md">
                    © 2024 Resume Checker. All rights are reserved.
                </div>
            </motion.div>
        </footer>
    );
};

export default Footer;