import React from 'react';
import { Document, Paragraph, Packer, TextRun, AlignmentType, TabStopType, BorderStyle } from 'docx';

// Validation helper functions
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

const isEmptyDescription = (description) => {
  const parsed = parseDescription(description);
  return !parsed || parsed.length === 0 || parsed.every(item => !item || item.trim() === '');
};

// Section validation functions
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

  return workExperience.flatMap(exp => [
    new Paragraph({
      children: [
        new TextRun({
          text: `${exp.company || "Company name not provided"}, ${exp.city || "Location not provided"}\t`,
          bold: true,
          size: 24,
          color: '000000'
        }),
        new TextRun({
          text: `${exp.startDate || "Start date not provided"} – ${exp.endDate || "End date not provided"}`,
          size: 22,
          color: '666666'
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
          color: '666666',
          italics: true
        })
      ],
      spacing: { before: 40 }
    }),
    ...parseDescription(exp.description).map(desc =>
      new Paragraph({
        children: [new TextRun({ text: desc, size: 22, color: '666666' })],
        bullet: { level: 0 },
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
          color: '000000'
        }),
        new TextRun({
          text: `${edu.startDate} - ${edu.endDate}`,
          size: 22,
          color: '666666'
        })
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
      spacing: { before: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${edu.university || "University not provided"}, ${edu.city || "Location not provided"}`,
          size: 22,
          color: '666666',
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

  return Object.entries(skills).flatMap(([category, items]) => [
    new Paragraph({
      children: [
        new TextRun({
          text: category.trim().toLocaleLowerCase() === "full stack" ? "Technical Skills" : category,
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
          text: Array.isArray(items) && items.length > 0 ? items.join(", ") : "No skills provided under this category.",
          size: 22,
          color: '666666'
        })
      ],
      spacing: { before: 40 }
    })
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
          text: project.name || "Project name not provided",
          bold: true,
          size: 24,
          color: '000000'
        }),
        project.link ? new TextRun({
          text: `\tLink`,
          size: 22,
          color: '666666',
          style: { underline: true },
          hyperlink: project.link
        }) : new TextRun({ text: '' })
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
      spacing: { before: 100 }
    }),
    ...parseHTML(project.description).map(desc =>
      new Paragraph({
        children: [new TextRun({ text: desc, size: 22, color: '666666' })],
        bullet: { level: 0 },
        spacing: { before: 20 }
      })
    )
  ]);
};

const createAchievementsEntries = (achievements) => {
  if (!hasAchievements(achievements)) {
    return [];
  }

  return parseAchievements(achievements).map(achievement =>
    new Paragraph({
      children: [new TextRun({ text: achievement, size: 22, color: '666666' })],
      bullet: { level: 0 },
      spacing: { before: 20 }
    })
  );
};

const buildContactLine = (personalDetails) => {
  const contactParts = [
    personalDetails.address || 'Thorrur',
    personalDetails.phone || '9063495488',
    personalDetails.email || 'pasha@gmail.com',
    personalDetails.linkedin ? 'LinkedIn' : '',
    ...(personalDetails.otherLinks?.map(link => link.title) || [])
  ].filter(Boolean);

  return contactParts.join(' | ');
};

export const PR2DOCXDownload = ({ resumeData, template, onClose }) => {
  const createSectionHeader = (title) => [
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 26,
          color: '15803d'
        })
      ],
      spacing: { before: 200, after: 0 },
      border: {
        bottom: {
          color: '15803d',
          size: 0.5,
          space: 8,
          style: BorderStyle.SINGLE
        }
      }
    })
  ];

  const createDocxDocument = () => {
    const sections = [];

    // Header (always included)
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${resumeData.personalDetails.firstName} ${resumeData.personalDetails.lastName}`,
            bold: true,
            size: 32,
            color: '15803d'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: buildContactLine(resumeData.personalDetails),
            size: 22,
            color: '666666'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    // Objective Section
    if (hasObjective(resumeData.objective)) {
      sections.push(
        ...createSectionHeader('OBJECTIVE'),
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.objective,
              size: 22,
              color: '666666'
            })
          ],
          spacing: { after: 200 }
        })
      );
    }

    // Experience Section
    if (hasWorkExperience(resumeData.workExperience)) {
      sections.push(
        ...createSectionHeader('EXPERIENCE'),
        ...createWorkExperienceEntries(resumeData.workExperience)
      );
    }

    // Education Section
    if (hasEducation(resumeData.education)) {
      sections.push(
        ...createSectionHeader('EDUCATION'),
        ...createEducationEntries(resumeData.education)
      );
    }

    // Skills Section
    if (hasSkills(resumeData.skills)) {
      sections.push(
        ...createSectionHeader('SKILLS'),
        ...createSkillsEntries(resumeData.skills)
      );
    }

    // Projects Section
    if (hasProjects(resumeData.projects)) {
      sections.push(
        ...createSectionHeader('PROJECTS'),
        ...createProjectEntries(resumeData.projects)
      );
    }

    // Achievements Section
    if (hasAchievements(resumeData.achievements)) {
      sections.push(
        ...createSectionHeader('ACHIEVEMENTS & CERTIFICATIONS'),
        ...createAchievementsEntries(resumeData.achievements)
      );
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
      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center space-x-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      <span>Download DOCX</span>
    </button>
  );
};

export default PR2DOCXDownload;