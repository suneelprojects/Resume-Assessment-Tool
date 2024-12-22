import React from 'react';
import { Document, Paragraph, Packer, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle,TabStopType } from 'docx';

export const DOCXDownload = ({ resumeData, template, onClose }) => {

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
    const hasObjective = () => {
      return resumeData.objective && resumeData.objective.trim() !== '' && resumeData.objective !== '<br>';
    };
  
    const hasSkills = () => {
      if (!resumeData.skills || typeof resumeData.skills !== 'object') return false;
  
      return Object.entries(resumeData.skills).some(([category, items]) => {
        if (!Array.isArray(items)) return false;
        return items.some(item => item && item.trim() !== '');
      });
    };
  
    const hasWorkExperience = () => {
      if (!Array.isArray(resumeData.workExperience) || resumeData.workExperience.length === 0) {
        return false;
      }
  
      return resumeData.workExperience.some(exp => {
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
      if (!Array.isArray(resumeData.projects) || resumeData.projects.length === 0) return false;
  
      return resumeData.projects.some(project => {
        const hasName = project.name && project.name.trim() !== '';
        const hasDescription = project.description && parseHTML(project.description).length > 0;
        const hasLink = project.link && project.link.trim() !== '';
  
        return hasName || hasDescription || hasLink;
      });
    };
  
    const hasEducation = () => {
      if (!Array.isArray(resumeData.education) || resumeData.education.length === 0) return false;
  
      return resumeData.education.some(edu => {
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
      if (!resumeData.achievements) return false;
      const parsedAchievements = parseAchievements(resumeData.achievements);
      return parsedAchievements.length > 0;
    };


  const createDocxDocument = () => {
    const children = [
      // Header with Name
      new Paragraph({
        children: [
          new TextRun({
            text: `${resumeData.personalDetails.firstName} ${resumeData.personalDetails.lastName}`,
            bold: true,
            size: 32,
            color: '000000'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      }),

      // Contact Information
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
      }),

      // Horizontal Line
      new Paragraph({
        children: [
          new TextRun({
            text: '_'.repeat(85),
            color: '000000'
          })
        ],
        spacing: { after: 200 }
      }),
    ];

    // Add sections only if they have content
    if (hasObjective()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SUMMARY',
              bold: true,
              size: 26,
              color: '000000'
            })
          ],
          spacing: { before: 100, after: 100 }
        }),
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

    if (hasWorkExperience()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROFESSIONAL EXPERIENCE',
              bold: true,
              size: 26,
              color: '000000'
            })
          ],
          spacing: { before: 100, after: 100 }
        }),
        ...createWorkExperienceEntries(resumeData.workExperience)
      );
    }

    if (hasProjects()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROJECTS',
              bold: true,
              size: 26,
              color: '000000'
            })
          ],
          spacing: { before: 100, after: 100 }
        }),
        ...createProjectEntries(resumeData.projects)
      );
    }

    if (hasEducation()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'EDUCATION',
              bold: true,
              size: 26,
              color: '000000'
            })
          ],
          spacing: { before: 100, after: 100 }
        }),
        ...createEducationEntries(resumeData.education)
      );
    }

    if (hasSkills()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SKILLS',
              bold: true,
              size: 26,
              color: '000000'
            })
          ],
          spacing: { before: 100, after: 100 }
        }),
        ...createSkillsEntries(resumeData.skills)
      );
    }

    if (hasAchievements()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'ACHIEVEMENTS & CERTIFICATIONS',
              bold: true,
              size: 26,
              color: '000000'
            })
          ],
          spacing: { before: 100, after: 100 }
        }),
        ...createAchievementsEntries(resumeData.achievements)
      );
    }

    return new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });
  };

  const buildContactLine = (personalDetails) => {
    const contactParts = [
      personalDetails.address || 'Location not provided',
      personalDetails.phone || 'Phone not provided',
      personalDetails.email || 'Email not provided',
      personalDetails.linkedin ? 'LinkedIn' : '',
      personalDetails.github ? 'GitHub' : ''
    ].filter(Boolean);

    return contactParts.join(' • ');
  };

  const createWorkExperienceEntries = (workExperience) => {
    if (!workExperience || workExperience.length === 0) {
      return [
        new Paragraph({
          children: [
            new TextRun({ text: 'No work experience provided.', size: 22 })
          ]
        })
      ];
    }
  
    return workExperience.flatMap((exp) => [
      new Paragraph({
        children: [
          new TextRun({
            text: `${exp.company || 'Company name not provided'}, ${exp.city || 'Location not provided'}\t`,
            bold: true,
            size: 22,
            color: '000000'
          }),
          new TextRun({
            text: `${exp.startDate || 'Start date not provided'} – ${exp.endDate || 'End date not provided'}`,
            size: 22,
            color: '666666',
            italics: true
          })
        ],
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: 9000 // Right-align the date at the end of the page
          }
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: exp.jobTitle || 'Role not provided',
            size: 22,
            color: '666666'
          })
        ]
      }),
      ...parseDescription(exp.description).map((desc) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${desc}`,
              size: 22,
              color: '666666'
            })
          ],
          bullet: { level: 0 }
        })
      )
    ]);
  };
  

  const createProjectEntries = (projects) => {
    if (!projects || projects.length === 0) {
      return [
        new Paragraph({
          children: [
            new TextRun({ text: 'No projects provided.', size: 22 })
          ]
        })
      ];
    }
  
    return projects.flatMap((project) => [
      new Paragraph({
        children: [
          new TextRun({
            text: project.name || 'Project name not provided',
            bold: true,
            size: 22,
            color: '000000'
          }),
          new TextRun({
            text: project.link ? '\tLink' : '', // Add tab and 'Link' text
            size: 22,
            color: '0000EE', // Hyperlink blue
            hyperlink: project.link ? { id: project.link } : undefined // Make 'Link' clickable
          })
        ],
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: 9000 // Adjust this value based on page width and margins
          }
        ],
        spacing: { before: 100 } // Add spacing before the project entry
      }),
      ...parseDescription(project.description).map((desc) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${desc}`,
              size: 22,
              color: '666666'
            })
          ],
          bullet: { level: 0 }
        })
      )
    ]);
  };
  
  

  const createEducationEntries = (education) => {
    if (!education || education.length === 0) {
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: 'No education details provided.',
              size: 22
            })
          ]
        })
      ];
    }
  
    return education.flatMap((edu) => [
      new Paragraph({
        children: [
          new TextRun({
            text: `${edu.degree || 'Degree not provided'} in ${edu.major || 'Field not provided'}\t`,
            bold: true,
            size: 22,
            color: '000000'
          }),
          new TextRun({
            text: `${edu.startDate || 'Start date not provided'} - ${edu.endDate || 'End date not provided'}`,
            size: 22,
            color: '666666',
            italics: true
          })
        ],
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: 9000 // Adjust this value for the right margin position
          }
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${edu.university || 'University not provided'}, ${edu.city || 'Location not provided'}`,
            size: 22,
            color: '666666',
            italics: true
          })
        ]
      })
    ]);
  };
  

  const createSkillsEntries = (skills) => {
    if (!skills || Object.keys(skills).length === 0) {
      return [new Paragraph({ children: [new TextRun({ text: 'No skills provided.', size: 22 })] })];
    }

    return Object.entries(skills).reverse().map(([category, items]) => 
      new Paragraph({
        children: [
          new TextRun({
            text: category.trim().toLowerCase() === 'full stack' ? 'Technical Skills' : category,
            bold: true,
            size: 22,
            color: '000000'
          }),
          new TextRun({
            text: `: ${Array.isArray(items) && items.length > 0 ? items.join(', ') : 'No skills provided under this category.'}`,
            size: 22,
            color: '666666'
          })
        ],
        spacing: { before: 100 }
      })
    );
  };

  const createAchievementsEntries = (achievements) => {
    if (!achievements || achievements.length === 0) {
      return [new Paragraph({ children: [new TextRun({ text: 'No achievements or certifications provided.', size: 22 })] })];
    }

    return parseDescription(achievements).map(achievement => 
      new Paragraph({
        children: [
          new TextRun({
            text: `${achievement}`,
            size: 22,
            color: '666666'
          })
        ],
        bullet: { level: 0 }
      })
    );
  };

  const handleDocxDownload = async () => {
    const doc = createDocxDocument();
    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${resumeData.personalDetails.firstName}_${resumeData.personalDetails.lastName}_Resume.docx`;
    link.click();
    onClose();
  };

  return (
    <button 
      onClick={handleDocxDownload}
      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center space-x-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      <span>Download DOCX</span>
    </button>
  );
};