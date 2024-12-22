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
                    text: `${exp.startDate || "Start date not provided"} – ${exp.endDate || "End date not provided"}`,
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
                    underline: true,
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
                    text: `(${edu.startDate} - ${edu.endDate})`,
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

const createSkillsEntries = (skills) => {
    if (!hasSkills(skills)) {
        return [];
    }

    return Object.entries(skills).flatMap(([category, skillList]) => [
        new Paragraph({
            children: [
                new TextRun({
                    text: category.trim().toLocaleLowerCase() === "full stack" ? "Technical Skills" : category,
                    bold: true,
                    size: 24,
                    color: '1F2937'
                })
            ],
            spacing: { before: 200 }
        }),
        new Paragraph({
            children: skillList.map((skill, index) => [
                new TextRun({
                    text: skill,
                    size: 22,
                    color: '0D9488',
                    bold: true
                }),
                new TextRun({
                    text: index < skillList.length - 1 ? ', ' : '',
                    size: 22,
                    color: '0D9488'
                })
            ]).flat()
        })
    ]);
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

        // Header with Name
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

        // Contact Information
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
                                                text: buildContactLine(resumeData.personalDetails),
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