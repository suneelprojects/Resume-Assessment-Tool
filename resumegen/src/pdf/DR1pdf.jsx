import React from 'react';
import { Page, Text, View, Document, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Remove external font registration
// Use system fonts instead
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        padding: 20,
        fontFamily: 'Helvetica'
    },
    container: {
        paddingTop: 10
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0d9488', // teal-600
        marginBottom: 5,
        fontFamily: 'Helvetica-Bold'
    },
    jobTitle: {
        fontSize: 14,
        color: '#4b5563', // gray-600
        fontFamily: 'Helvetica'
    },
    workjobTitle: {
        fontSize: 12,
        color: '#4b5563', // gray-600
        fontStyle: 'italic'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0d9488', // teal-600
        marginTop: 2,
        marginBottom: 5,
        paddingBottom: 5, // Adjust this value to move the border down
        borderBottom: '3px solid #0d9488',
        fontFamily: 'Helvetica-Bold'
    },

    contactInfo: {
        flexDirection: 'row',
        marginBottom: 10
    },
    contactItem: {
        fontSize: 10,
        marginBottom: 3,
        color: '#4b5563',
        fontFamily: 'Helvetica'
    },
    summary: {
        fontSize: 11,
        color: '#4b5563',
        marginBottom: 10,
        fontFamily: 'Helvetica'
    },
    skillCategory: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        fontFamily: 'Helvetica-Bold'
    },
    skillPill: {
        backgroundColor: '#99f6e4', // teal-100
        color: '#0d9488', // teal-600
        fontSize: 11,
        padding: '6px 12px', // Adjust for vertical and horizontal padding
        borderRadius: 10,
        marginRight: 5,
        marginBottom: 5,
        marginTop: 5,
        fontFamily: 'Helvetica'
    },
    experienceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    experienceTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151', // gray-700
        fontFamily: 'Helvetica-Bold'
    },
    experienceDate: {
        fontSize: 10,
        color: '#111827', // gray-900
        fontFamily: 'Helvetica'
    },
    listItem: {
        fontSize: 11,
        marginLeft: 10,
        marginBottom: 3,
        color: '#4b5563',
        fontFamily: 'Helvetica'
    },
    educationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    educationDetails: {
        fontSize: 11,
        color: '#111827',
        fontFamily: 'Helvetica'
    },
    educationDate: {
        color: '#4b5563',
        fontSize: 11,
        fontFamily: 'Helvetica'
    }
});

export const DR1PDFDownload = ({ resumeData, template }) => {
    // Destructure resume data with fallbacks
    const {
        personalDetails = {},
        objective = "",
        skills = [],
        workExperience = [],
        education = [],
        achievements = [],
        projects = [],
    } = resumeData;

    // Validation helper functions
    const isEmptyDescription = (description) => {
        const parsed = parseDescription(description);
        return !parsed || parsed.length === 0 || parsed.every(item => !item || item.trim() === '');
    };

    const hasObjective = () => {
        return objective && objective.trim() !== '' && objective !== '<br>';
    };

    const hasSkills = () => {
        if (!skills || typeof skills !== 'object') return false;

        return Object.entries(skills).some(([category, items]) => {
            if (!Array.isArray(items)) return false;
            return items.some(item => item && item.trim() !== '');
        });
    };

    const hasWorkExperience = () => {
        if (!Array.isArray(workExperience) || workExperience.length === 0) {
            return false;
        }

        return workExperience.some(exp => {
            const hasCompany = exp.company && exp.company.trim() !== '';
            const hasJobTitle = exp.jobTitle && exp.jobTitle.trim() !== '';
            const hasDescription = !isEmptyDescription(exp.description);
            const hasCity = exp.city && exp.city.trim() !== '';
            const hasDates = (exp.startDate && exp.startDate.trim() !== '') ||
                (exp.endDate && exp.endDate.trim() !== '');

            return hasCompany || hasJobTitle || hasDescription || hasCity || hasDates;
        });
    };

    const hasProjects = () => {
        if (!Array.isArray(projects) || projects.length === 0) return false;

        return projects.some(project => {
            const hasName = project.name && project.name.trim() !== '';
            const hasDescription = project.description && parseHTML(project.description).length > 0;
            const hasLink = project.link && project.link.trim() !== '';

            return hasName || hasDescription || hasLink;
        });
    };

    const hasEducation = () => {
        if (!Array.isArray(education) || education.length === 0) return false;

        return education.some(edu => {
            const hasDegree = edu.degree && edu.degree.trim() !== '';
            const hasUniversity = edu.university && edu.university.trim() !== '';
            const hasMajor = edu.major && edu.major.trim() !== '';
            const hasCity = edu.city && edu.city.trim() !== '';
            const hasDates = (edu.startDate && edu.startDate.trim() !== '') ||
                (edu.endDate && edu.endDate.trim() !== '');

            return hasDegree || hasUniversity || hasMajor || hasCity || hasDates;
        });
    };

    const hasAchievements = () => {
        if (!achievements) return false;
        const parsedAchievements = parseAchievements(achievements);
        return parsedAchievements.length > 0;
    };

    // Parsing helper functions
    const parseHTML = (htmlString) => {
        if (!htmlString || htmlString.trim() === '' || htmlString === '<br>') {
            return [];
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, "text/html");
            const items = Array.from(doc.querySelectorAll("li")).map((li) => li.textContent);
            return items.filter(item => item && item.trim() !== '');
        } catch {
            return htmlString.trim() !== '' ? [htmlString] : [];
        }
    };

    const parseDescription = (htmlString) => {
        if (!htmlString || htmlString.trim() === '' || htmlString === '<br>') {
            return [];
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, "text/html");
            const items = Array.from(doc.querySelectorAll("li")).map((li) => li.textContent);
            return items.filter(item => item && item.trim() !== '');
        } catch {
            return htmlString.trim() !== '' ? [htmlString] : [];
        }
    };

    const parseAchievements = (htmlString) => {
        if (!htmlString || htmlString.trim() === '' || htmlString === '<br>') {
            return [];
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, "text/html");
            const items = Array.from(doc.querySelectorAll("li")).map((li) => li.textContent);
            return items.filter(item => item && item.trim() !== '');
        } catch {
            return htmlString.trim() !== '' ? [htmlString] : [];
        }
    };

    // Helper function to sort skills categories
    const sortSkillCategories = (skills) => {
        if (!skills) return [];

        const skillsArray = Object.entries(skills);
        const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];

        // Separate technical skills (default categories) and custom categories
        const technicalSkills = skillsArray.filter(([category]) =>
            defaultCategories.includes(category)
        );

        const customSkills = skillsArray.filter(([category]) =>
            !defaultCategories.includes(category)
        );

        // Return with technical skills first, followed by custom categories
        return [...technicalSkills, ...customSkills];
    };

    const generatePDF = async () => {
        const doc = (
            <Document>
                <Page size="A4" style={styles.page}>
                    {/* Header - Always show */}
                    <View style={styles.container}>
                        <Text style={styles.name}>
                            {personalDetails.firstName} {personalDetails.lastName}
                        </Text>
                        <Text style={styles.jobTitle}>
                            {personalDetails.jobTitle}
                        </Text>
                    </View>

                    {/* Contact - Always show */}
                    <View style={[styles.sectionTitle, { marginTop: 15 }]}>
                        <Text>CONTACT</Text>
                    </View>
                    <View style={styles.contactInfo}>
                        <View>
                            <Text style={styles.contactItem}>
                                {personalDetails.phone}
                            </Text>
                            <Text style={styles.contactItem}>
                                {personalDetails.email}
                            </Text>
                            <Text style={styles.contactItem}>
                                {personalDetails.address}
                            </Text>
                            {personalDetails.linkedin && (
                                <Text style={styles.contactItem}>
                                    LinkedIn
                                </Text>
                            )}
                            {personalDetails.github && (
                                <Text style={styles.contactItem}>
                                    GitHub
                                </Text>
                            )}
                            {personalDetails.otherLinks?.map((link, index) => (
                                <Text key={index} style={styles.contactItem}>
                                    {link.title}
                                </Text>
                            ))}
                        </View>
                    </View>

                    {/* Summary - Conditional */}
                    {hasObjective() && (
                        <>
                            <View style={styles.sectionTitle}>
                                <Text>SUMMARY</Text>
                            </View>
                            <Text style={styles.summary}>{objective}</Text>
                        </>
                    )}

                    {/* Skills - Conditional */}
                    {hasSkills() && (
                        <>
                            <View style={styles.sectionTitle}>
                                <Text>Skills</Text>
                            </View>
                            {sortSkillCategories(skills).map(([category, skillList], index) => {
                                const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];
                                const isDefaultCategory = defaultCategories.includes(category);

                                return skillList && skillList.length > 0 && (
                                    <View key={index}>
                                        <Text style={styles.skillCategory}>
                                            {isDefaultCategory ? "Technical Skills" : category}
                                        </Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {skillList.map((skill, idx) => (
                                                skill && skill.trim() !== "" && (
                                                    <Text key={idx} style={styles.skillPill}>
                                                        {skill}
                                                    </Text>
                                                )
                                            ))}
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {/* Professional Experience - Conditional */}
                    {hasWorkExperience() && (
                        <>
                            <View style={styles.sectionTitle}>
                                <Text>PROFESSIONAL EXPERIENCE</Text>
                            </View>
                            {workExperience.map((experience, index) => (
                                !isEmptyDescription(experience.description) && (
                                    <View key={index}>
                                        <View style={styles.experienceHeader}>
                                            <Text style={styles.experienceTitle}>
                                                {experience.company} - {experience.city}
                                            </Text>
                                            <Text style={styles.experienceDate}>
                                                {experience.startDate}
                                                {experience.startDate && experience.endDate && " - "}
                                                {experience.endDate}
                                            </Text>
                                        </View>
                                        <Text style={styles.workjobTitle}>{experience.jobTitle}</Text>
                                        {parseDescription(experience.description).map((desc, i) => (
                                            <Text key={i} style={styles.listItem}>
                                                • {desc}
                                            </Text>
                                        ))}
                                    </View>
                                )
                            ))}
                        </>
                    )}

                    {/* Projects - Conditional */}
                    {hasProjects() && (
                        <>
                            <View style={styles.sectionTitle}>
                                <Text>Projects</Text>
                            </View>
                            {projects.map((project, index) => (
                                project.name && (
                                    <View key={index}>
                                        <View style={styles.experienceHeader}>
                                            <Text style={styles.experienceTitle}>
                                                {project.name}
                                            </Text>
                                            {project.link && (
                                                <Text style={styles.experienceDate}>
                                                    Link
                                                </Text>
                                            )}
                                        </View>
                                        {parseHTML(project.description).map((desc, i) => (
                                            <Text key={i} style={styles.listItem}>
                                                • {desc}
                                            </Text>
                                        ))}
                                    </View>
                                )
                            ))}
                        </>
                    )}

                    {/* Education - Conditional */}
                    {hasEducation() && (
                        <>
                            <View style={styles.sectionTitle}>
                                <Text>Education</Text>
                            </View>
                            {education.map((edu, index) => (
                                <View key={index} style={styles.educationRow}>
                                    <View>
                                        <Text style={[styles.educationDetails, { fontFamily: 'Helvetica-Bold' }]}>
                                            {edu.degree} in {edu.major}
                                        </Text>
                                        <Text style={styles.educationDate}>
                                            {edu.university}, {edu.city}
                                        </Text>
                                    </View>
                                    <Text style={styles.educationDetails}>
                                        {edu.startDate}
                                        {edu.startDate && edu.endDate && " - "}
                                        {edu.endDate}
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}

                    {/* Achievements - Conditional */}
                    {hasAchievements() && (
                        <>
                            <View style={styles.sectionTitle}>
                                <Text>ACHIEVEMENTS & CERTIFICATIONS</Text>
                            </View>
                            {parseAchievements(achievements).map((achievement, index) => (
                                <Text key={index} style={styles.listItem}>
                                    • {achievement}
                                </Text>
                            ))}
                        </>
                    )}
                </Page>
            </Document>
        );

        const pdfBlob = await pdf(doc).toBlob();
        saveAs(pdfBlob, `${personalDetails.firstName}_${personalDetails.lastName}_Resume.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            <span>Download PDF</span>
        </button>
    );
};
