import React from 'react';
import { Document, Paragraph, Packer, TextRun, TabStopType, BorderStyle } from 'docx';

// Validation helper functions
const isEmptyDescription = (description) => {
    const parsed = parseDescription(description);
    return !parsed || parsed.length === 0 || parsed.every(item => !item || item.trim() === '');
};

const hasObjective = (objective) => {
    return objective && objective.trim() !== '' && objective !== '<br>';
};

const hasSkills = (skills) => {
    if (!skills || typeof skills !== 'object') return false;

    return Object.entries(skills).some(([category, items]) => {
        if (!Array.isArray(items)) return false;
        return items.some(item => item && item.trim() !== '');
    });
};

const hasWorkExperience = (workExperience) => {
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

const hasProjects = (projects) => {
    if (!Array.isArray(projects) || projects.length === 0) return false;

    return projects.some(project => {
        const hasName = project.name && project.name.trim() !== '';
        const hasDescription = project.description && parseHTML(project.description).length > 0;
        const hasLink = project.link && project.link.trim() !== '';

        return hasName || hasDescription || hasLink;
    });
};

const hasEducation = (education) => {
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

const hasAchievements = (achievements) => {
    if (!achievements) return false;
    const parsedAchievements = parseAchievements(achievements);
    return parsedAchievements.length > 0;
};

// Section creation functions with validation
const createWorkExperienceEntries = (workExperience) => {
    if (!hasWorkExperience(workExperience)) {
        return [];
    }

    return workExperience.flatMap(exp => {
        if (isEmptyDescription(exp.description)) return [];

        return [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${exp.company} - ${exp.city}\t`,
                        bold: true,
                        size: 24,
                        color: '000000'
                    }),
                    new TextRun({
                        text: `${exp.startDate}${exp.startDate && exp.endDate ? " - " : ""}${exp.endDate}`,
                        size: 22,
                        color: '000000'
                    })
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
                spacing: { before: 100 }
            }),
            // Add job title in a new paragraph
            new Paragraph({
                children: [
                    new TextRun({
                        text: exp.jobTitle,
                        size: 22,
                        color: '666666',
                        italics: true
                    })
                ],
                spacing: { before: 20 }
            }),
            ...parseDescription(exp.description).map(desc =>
                new Paragraph({
                    children: [new TextRun({ text: `• ${desc}`, size: 22, color: '666666' })],
                    spacing: { before: 20 }
                })
            )
        ];
    });
};

const createContactSection = (personalDetails) => {
    const contactInfo = [];

    // Add contact details if they exist
    if (personalDetails.city || personalDetails.country) {
        contactInfo.push(new Paragraph({
            children: [
                new TextRun({
                    text: `${personalDetails.city || ''} ${personalDetails.city && personalDetails.country ? ',' : ''} ${personalDetails.country || ''}`,
                    size: 22,
                    color: '666666'
                })
            ],
            spacing: { before: 20 }
        }));
    }

    if (personalDetails.phone) {
        contactInfo.push(new Paragraph({
            children: [
                new TextRun({
                    text: personalDetails.phone,
                    size: 22,
                    color: '666666'
                })
            ],
            spacing: { before: 20 }
        }));
    }

    if (personalDetails.email) {
        contactInfo.push(new Paragraph({
            children: [
                new TextRun({
                    text: personalDetails.email,
                    size: 22,
                    color: '666666'
                })
            ],
            spacing: { before: 20 }
        }));
    }

    if (personalDetails.address) {
        contactInfo.push(new Paragraph({
            children: [
                new TextRun({
                    text: personalDetails.address,
                    size: 22,
                    color: '666666'
                })
            ],
            spacing: { before: 20 }
        }));
    }

    // Add LinkedIn
    if (personalDetails.linkedin) {
        contactInfo.push(new Paragraph({
            children: [
                new TextRun({
                    text: 'LinkedIn', // Display "LinkedIn" as the text
                    size: 22,
                    color: '666666',
                    hyperlink: personalDetails.linkedin // Use the link as the hyperlink
                })
            ],
            spacing: { before: 20 }
        }));
    }
    // Add GitHub
    if (personalDetails.github) {
        contactInfo.push(new Paragraph({
            children: [
                new TextRun({
                    text: 'GitHub', // Display "GitHub" as the text
                    size: 22,
                    color: '666666',
                    hyperlink: personalDetails.github // Use the link as the hyperlink
                })
            ],
            spacing: { before: 20 }
        }));
    }

    if (personalDetails.otherLinks && Array.isArray(personalDetails.otherLinks)) {
        personalDetails.otherLinks.forEach(linkObj => {
            // Ensure linkObj is an object with valid title and URL properties
            if (linkObj && typeof linkObj === 'object' && linkObj.title && linkObj.url) {
                contactInfo.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: linkObj.title, // Display the title (e.g., "YouTube")
                            size: 22,
                            color: '666666',
                            hyperlink: linkObj.url // Use the URL as the hyperlink
                        })
                    ],
                    spacing: { before: 20 }
                }));
            }
        });
    }

    return contactInfo;
};

const createProjectEntries = (projects) => {
    if (!hasProjects(projects)) {
        return [];
    }

    return projects.flatMap(project => {
        if (!project.name) return [];

        return [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${project.name}\t`,
                        bold: true,
                        size: 24,
                        color: '000000'
                    }),
                    project.link ? new TextRun({
                        text: 'Link',
                        size: 22,
                        color: '0D9488',
                        hyperlink: project.link
                    }) : new TextRun({ text: '' })
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
                spacing: { before: 100 }
            }),
            ...parseHTML(project.description).map(desc =>
                new Paragraph({
                    children: [new TextRun({ text: `• ${desc}`, size: 22, color: '666666' })],
                    spacing: { before: 20 }
                })
            )
        ];
    });
};

const createEducationEntries = (education) => {
    if (!hasEducation(education)) {
        return [];
    }

    return education.flatMap(edu => [
        new Paragraph({
            children: [
                new TextRun({
                    text: `${edu.degree} in ${edu.major}`,
                    bold: true,
                    size: 24,
                    color: '000000'
                }),
                new TextRun({
                    text: `\t${edu.startDate}${edu.startDate && edu.endDate ? " - " : ""}${edu.endDate}`,
                    size: 22,
                    color: '000000'
                })
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `${edu.university}, ${edu.city}`,
                    size: 22,
                    color: '666666',
                    italics: true
                })
            ],
            spacing: { before: 40 }
        })
    ]);
};

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

const createSkillsEntries = (skills) => {
    if (!hasSkills(skills)) {
        return [];
    }

    return sortSkillCategories(skills).flatMap(([category, skillList]) => {
        if (!skillList || !skillList.length) return [];

        const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];
        const isDefaultCategory = defaultCategories.includes(category);
        const filteredSkills = skillList.filter(skill => skill && skill.trim() !== '');

        if (!filteredSkills.length) return [];

        return [
            new Paragraph({
                children: [
                    new TextRun({
                        text: isDefaultCategory ? "Technical Skills" : category,
                        bold: true,
                        size: 24,
                        color: '000000'
                    })
                ],
                spacing: { before: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: filteredSkills.join(', '),
                        size: 22,
                        color: '0D9488'
                    })
                ],
                spacing: { before: 20 }
            })
        ];
    });
};

// Parsing helper functions remain the same...
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

const parseDescription = parseHTML;
const parseAchievements = parseHTML;

export const DR1DOCXDownload = ({ resumeData, template, onClose }) => {
    const createDocxDocument = () => {
        const createSectionTitle = (text) => [
            new Paragraph({
                children: [new TextRun({ text: '' })],
                border: {
                    top: {
                        color: '0D9488',
                        size: 15,
                        style: BorderStyle.SINGLE
                    }
                },
                spacing: { before: 200, after: 10 }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        size: 26,
                        color: '0D9488'
                    })
                ],
                spacing: { before: 10, after: 100 }
            })
        ];

        const sections = [
            // Header (always shown)
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${resumeData.personalDetails.firstName} ${resumeData.personalDetails.lastName}`,
                        bold: true,
                        size: 32,
                        color: '0D9488'
                    })
                ],
                spacing: { after: 50 }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: resumeData.personalDetails.jobTitle || '',
                        size: 26,
                        color: '666666'
                    })
                ],
                spacing: { before: 50, after: 200 }
            }),

            // Contact (always shown)
            ...createSectionTitle('CONTACT'),
            ...createContactSection(resumeData.personalDetails),
        ];

        // Summary (conditional)
        if (hasObjective(resumeData.objective)) {
            sections.push(
                ...createSectionTitle('SUMMARY'),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: resumeData.objective,
                            size: 22,
                            color: '666666'
                        })
                    ],
                    spacing: { before: 100, after: 100 }
                })
            );
        }

        // Skills (conditional)
        if (hasSkills(resumeData.skills)) {
            sections.push(
                ...createSectionTitle('SKILLS'),
                ...createSkillsEntries(resumeData.skills)
            );
        }

        // Work Experience (conditional)
        if (hasWorkExperience(resumeData.workExperience)) {
            sections.push(
                ...createSectionTitle('PROFESSIONAL EXPERIENCE'),
                ...createWorkExperienceEntries(resumeData.workExperience)
            );
        }

        // Projects (conditional)
        if (hasProjects(resumeData.projects)) {
            sections.push(
                ...createSectionTitle('PROJECTS'),
                ...createProjectEntries(resumeData.projects)
            );
        }

        // Education (conditional)
        if (hasEducation(resumeData.education)) {
            sections.push(
                ...createSectionTitle('EDUCATION'),
                ...createEducationEntries(resumeData.education)
            );
        }

        // Achievements (conditional)
        if (hasAchievements(resumeData.achievements)) {
            sections.push(
                ...createSectionTitle('ACHIEVEMENTS & CERTIFICATIONS'),
                ...parseAchievements(resumeData.achievements).map(achievement =>
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `• ${achievement}`,
                                size: 22,
                                color: '666666'
                            })
                        ],
                        spacing: { before: 20, after: 20 }
                    })
                )
            );
        }

        return new Document({
            sections: [{
                properties: {},
                children: sections
            }]
        });
    };

    // Rest of the component remains the same...
    const generateAndDownloadDocx = async () => {
        const doc = createDocxDocument();
        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.personalDetails.firstName}_${resumeData.personalDetails.lastName}_Resume.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        if (onClose) onClose();
    };

    return (
        <button
            onClick={generateAndDownloadDocx}
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            <span>Download DOCX</span>
        </button>
    );
};

export default DR1DOCXDownload;