import React from 'react';
import { Document, Paragraph, Packer, TextRun, AlignmentType, TabStopType, Table, TableRow, TableCell, VerticalAlign, WidthType } from 'docx';

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

// Helper function to check if contact section should be displayed
const hasContactInfo = (personalDetails) => {
    const {
      phone,
      email,
      address,
      linkedin,
      github,
      otherLinks
    } = personalDetails || {};
  
    return (
      (phone && phone.trim() !== '') ||
      (email && email.trim() !== '') ||
      (address && address.trim() !== '') ||
      (linkedin && linkedin.trim() !== '') ||
      (github && github.trim() !== '') ||
      (otherLinks && otherLinks.length > 0 && otherLinks.some(link => link.url && link.url.trim() !== ''))
    );
  };
  
  // Helper function to check if header should be displayed
  const hasHeaderInfo = (personalDetails) => {
    const {
      firstName,
      lastName,
      jobTitle,
      summary
    } = personalDetails || {};
  
    return (
      (firstName && firstName.trim() !== '') ||
      (lastName && lastName.trim() !== '') ||
      (jobTitle && jobTitle.trim() !== '') ||
      (summary && summary.trim() !== '')
    );
  };

const createWorkExperienceEntries = (workExperience) => {
    if (!hasWorkExperience(workExperience)) {
        return [];
    }

    return workExperience.flatMap(exp => [
        new Paragraph({
            children: [
                new TextRun({
                    text: `${exp.company || "Company name not provided"}, ${exp.city || "Location not provided"}\t`,
                    bold: true,
                    size: 24,
                    color: '1F2937'
                }),
                new TextRun({
                    text: `${exp.startDate}${exp.startDate && exp.endDate ? " - " : ""}${exp.endDate}`,
                    size: 22,
                    color: '111827'
                })
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            spacing: { before: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: exp.jobTitle || "Role not provided",
                    size: 22,
                    color: '4B5563',
                    italics: true
                })
            ],
            spacing: { before: 40 }
        }),
        ...parseDescription(exp.description).map(desc =>
            new Paragraph({
                children: [new TextRun({ text: `• ${desc}`, size: 22, color: '4B5563' })],
                spacing: { before: 20 }
            })
        )
    ]);
};

const createProjectEntries = (projects) => {
    if (!hasProjects(projects)) {
        return [];
    }

    return projects.flatMap(project => [
        new Paragraph({
            children: [
                new TextRun({
                    text: `${project.name || "Project name not provided"}\t`,
                    bold: true,
                    size: 24,
                    color: '1F2937'
                }),
                project.link ? new TextRun({
                    text: 'Link',
                    size: 22,
                    color: '4B5563',
                    hyperlink: project.link
                }) : new TextRun({ text: '' })
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            spacing: { before: 100 }
        }),
        ...parseHTML(project.description).map(desc =>
            new Paragraph({
                children: [new TextRun({ text: `• ${desc}`, size: 22, color: '4B5563' })],
                spacing: { before: 20 }
            })
        )
    ]);
};

const createEducationEntries = (education) => {
    if (!hasEducation(education)) {
        return [];
    }

    return education.flatMap(edu => [
        new Paragraph({
            children: [
                new TextRun({
                    text: `${edu.degree || "Degree not provided"} in ${edu.major || "Field not provided"}\t`,
                    bold: true,
                    size: 24,
                    color: '1F2937'
                }),
                new TextRun({
                    text: `\t${edu.startDate}${edu.startDate && edu.endDate ? " - " : ""}${edu.endDate}`,
                    size: 22,
                    color: '111827'
                })
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            spacing: { before: 200 }
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `${edu.university || "University not provided"}, ${edu.city || "Location not provided"}`,
                    size: 22,
                    color: '6B7280',
                    italics: true
                })
            ],
            spacing: { before: 40 }
        })
    ]);
};

// Add this helper function before createSkillsEntries
const sortSkillCategories = (skills) => {
    if (!skills) return [];

    const skillsArray = Object.entries(skills);
    const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];

    // Keep track of original indices for custom categories
    const customSkillsWithIndex = skillsArray
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry: [category] }) => !defaultCategories.includes(category));

    // Sort custom skills based on their original order
    const sortedCustomSkills = customSkillsWithIndex
        .sort((a, b) => a.index - b.index)
        .map(({ entry }) => entry);

    // Technical skills remain the same
    const technicalSkills = skillsArray.filter(([category]) =>
        defaultCategories.includes(category)
    );

    // Return with technical skills first, followed by custom categories in original order
    return [...technicalSkills, ...sortedCustomSkills];
};

const createSkillsEntries = (skills) => {
    if (!hasSkills(skills)) {
        return [];
    }

    const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];
    
    // Use the new sorting function
    return sortSkillCategories(skills).flatMap(([category, skillList]) => {
        // Skip empty skill lists
        if (!skillList || skillList.length === 0) {
            return [];
        }

        const isDefaultCategory = defaultCategories.includes(category);
        
        return [
            // Category header
            new Paragraph({
                children: [
                    new TextRun({
                        text: isDefaultCategory ? "Technical Skills" : category,
                        bold: true,
                        size: 24,
                        color: '1F2937'
                    }),
                ],
                spacing: { before: 200 },
            }),
            // Skills list
            new Paragraph({
                children: skillList
                    .filter(skill => skill && skill.trim() !== "")
                    .map((skill, index, array) => [
                        new TextRun({
                            text: skill,
                            size: 22,
                            color: '0D9488',
                            bold: true,
                        }),
                        new TextRun({
                            text: index < array.length - 1 ? ', ' : '',
                            size: 22,
                            color: '0D9488',
                        }),
                    ]).flat(),
                spacing: { before: 40 },
            }),
        ];
    });
};

const createAchievementsEntries = (achievements) => {
    if (!hasAchievements(achievements)) {
        return [];
    }

    const parsedAchievements = parseAchievements(achievements);
    return parsedAchievements.map(achievement =>
        new Paragraph({
            children: [new TextRun({ text: `• ${achievement}`, size: 22, color: '4B5563' })],
            spacing: { before: 20 }
        })
    );
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

const buildContactLine = (personalDetails) => {
    const contactParts = [
        personalDetails.email,
        personalDetails.phone,
        personalDetails.address,
        personalDetails.linkedin ? 'LinkedIn' : '',
        ...(personalDetails.otherLinks?.map(link => link.title) || [])
    ].filter(Boolean);

    return contactParts.join(' | ');
};

export const DR2DOCXDownload = ({ resumeData, template, onClose }) => {
    const createDocxDocument = () => {
        const sections = [];

        // Header with Name - only if header info exists
if (hasHeaderInfo(resumeData.personalDetails)) {
    // Name
    if (resumeData.personalDetails.firstName || resumeData.personalDetails.lastName) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${resumeData.personalDetails.firstName} ${resumeData.personalDetails.lastName}`,
                        bold: true,
                        size: 32,
                        color: '1F2937'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            })
        );
    }

    // Job Title
    if (resumeData.personalDetails.jobTitle) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: resumeData.personalDetails.jobTitle,
                        size: 26,
                        color: '7C3AED'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        );
    }

}

        // Contact Information - only if contact info exists
if (hasContactInfo(resumeData.personalDetails)) {
    const contactParts = [];
    
    if (resumeData.personalDetails.email) {
        contactParts.push(resumeData.personalDetails.email);
    }
    if (resumeData.personalDetails.phone) {
        contactParts.push(resumeData.personalDetails.phone);
    }
    if (resumeData.personalDetails.address) {
        contactParts.push(resumeData.personalDetails.address);
    }
    if (resumeData.personalDetails.linkedin) {
        contactParts.push('LinkedIn');
    }
    if (resumeData.personalDetails.github) {
        contactParts.push('GitHub');
    }
    if (resumeData.personalDetails.otherLinks?.length > 0) {
        resumeData.personalDetails.otherLinks.forEach(link => {
            if (link.url && link.title) {
                contactParts.push(link.title);
            }
        });
    }

    if (contactParts.length > 0) {
        sections.push(
            new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: contactParts.join(' | '),
                                                size: 22,
                                                color: 'FFFFFF',
                                                bold: true
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],
                                shading: { fill: '4B5563' },
                                verticalAlign: VerticalAlign.CENTER,
                            }),
                        ],
                    }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
            })
        );
    }
}

        // Objective Section
        if (hasObjective(resumeData.objective)) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'OBJECTIVE',
                            bold: true,
                            size: 26,
                            color: '1F2937'
                        })
                    ],
                    spacing: { before: 200, after: 100 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: resumeData.objective,
                            size: 22,
                            color: '4B5563'
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
        }

        // Skills Section
        if (hasSkills(resumeData.skills)) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'SKILLS',
                            bold: true,
                            size: 26,
                            color: '1F2937'
                        })
                    ],
                    spacing: { before: 200, after: 100 }
                }),
                ...createSkillsEntries(resumeData.skills)
            );
        }

        // Work Experience Section
        if (hasWorkExperience(resumeData.workExperience)) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'WORK EXPERIENCE',
                            bold: true,
                            size: 26,
                            color: '1F2937'
                        })
                    ],
                    spacing: { before: 200, after: 100 }
                }),
                ...createWorkExperienceEntries(resumeData.workExperience)
            );
        }

        // Projects Section
        if (hasProjects(resumeData.projects)) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'PROJECTS',
                            bold: true,
                            size: 26,
                            color: '1F2937'
                        })
                    ],
                    spacing: { before: 200, after: 100 }
                }),
                ...createProjectEntries(resumeData.projects)
            );
        }

        // Education Section
        if (hasEducation(resumeData.education)) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EDUCATION',
                            bold: true,
                            size: 26,
                            color: '1F2937'
                        })
                    ],
                    spacing: { before: 200, after: 100 }
                }),
                ...createEducationEntries(resumeData.education)
            );
        }

        // Achievements Section
        if (hasAchievements(resumeData.achievements)) {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: 'ACHIEVEMENTS & CERTIFICATIONS', bold: true, size: 26, color: '1F2937' })],
                    spacing: { before: 200, after: 100 }
                }),
                ...createAchievementsEntries(resumeData.achievements)
            )
        }
        return new Document({
            sections: [{
                properties: {},
                children: sections
            }]
        });
    };

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
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
            Download DOCX
        </button>
    );
};

export default DR2DOCXDownload;