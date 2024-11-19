import React from "react";
import { FaInstagram, FaWhatsapp, FaYoutube, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
    return (
        <footer className="pt-16 pb-12 bg-[#f7f7f7] overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="container"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 md:gap-4">
                    {/* first section */}
                    <div className="space-y-4 max-w-[300px]">
                        <h1 className="text-2xl font-bold">Resume Checker</h1>
                        <p className="text-dark2">
                            Resume Checker helps you optimize your resume for Applicant Tracking Systems (ATS).
                            Get an ATS score and actionable tips to improve your resume, enhancing your chances
                            of landing interviews in today's job market.
                        </p>
                    </div>
                    {/* second section */}
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold">Features</h1>
                            <div className="text-dark2">
                                <ul className="space-y-2 text-lg">
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        ATS Score Analysis
                                    </li>
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        Personalized Recommendations
                                    </li>
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        Keyword Optimization
                                    </li>
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        Formatting & Layout Tips
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold">Links</h1>
                            <div className="text-dark2">
                                <ul className="space-y-2 text-lg">
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        Home
                                    </li>
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        Services
                                    </li>
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        About
                                    </li>
                                    <li className="cursor-pointer hover:text-secondary duration-200">
                                        Contact
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* third section */}
                    <div className="space-y-4 max-w-[300px]">
                        <h1 className="text-2xl font-bold">Get In Touch</h1>
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Enter your email"
                                className="p-3 rounded-s-xl bg-white w-full py-4 focus:ring-0 focus:outline-none placeholder:text-dark2"
                                required
                            />
                            <button className="bg-primary text-white font-semibold py-4 px-6 rounded-e-xl">
                                Go
                            </button>
                        </div>
                        {/* social icons */}
                        <div className="flex space-x-6 py-3 text-2xl">
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
                <div className="text-center mt-12 text-gray-500 text-md">
                    © 2024 Resume Checker. All rights reserved.
                </div>
            </motion.div>
        </footer>
    );
};

export default Footer;