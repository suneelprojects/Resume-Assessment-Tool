import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register fonts if needed
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/helvetica_400.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/helvetica_700.ttf', fontWeight: 'bold' }
  ]
});

export const PDFDownload = ({ resumeData, template, onClose }) => {
  // Create PDF styles to match ProfessionalResume1
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.5,
      color: '#333333'
    },
    header: {
      borderBottomWidth: 2,
      borderBottomColor: '#000',
      paddingBottom: 10,
      marginBottom: 15
    },
    fullName: {
      fontSize: 18,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 5
    },
    contactInfo: {
      textAlign: 'center',
      fontSize: 12,
      color: '#666666',
      marginTop: 5
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 2,
      paddingBottom: 3
    },
    sectionContent: {
      marginBottom: 10
    },
    summerydesc: {
      fontSize: 12,
    },
    jobHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5
    },
    jobTitle: {
      fontWeight: 'bold',
      fontSize: 12,
      color: '#000000'
    },
    jobDate: {
      fontSize: 9,
      color: '#666666'
    },
    listItem: {
      marginLeft: 10,
      marginBottom: 3,
      fontSize: 12
    },
    skills: {
      fontSize: 12,
    }
  });

   // Helper function to clean URLs
   const cleanUrl = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  };

  // Function to build contact info text
  const buildContactInfo = () => {
    const { personalDetails } = resumeData;
    const parts = [];

    if (personalDetails.address?.trim()) {
      parts.push(personalDetails.address);
    }

    if (personalDetails.phone?.trim()) {
      parts.push(personalDetails.phone);
    }

    if (personalDetails.email?.trim()) {
      parts.push(personalDetails.email);
    }

    if (personalDetails.linkedin?.trim()) {
      parts.push(cleanUrl(personalDetails.linkedin));
    }

    if (personalDetails.github?.trim()) {
      parts.push(cleanUrl(personalDetails.github));
    }

    if (personalDetails.otherLinks?.length > 0) {
      personalDetails.otherLinks.forEach(link => {
        if (link.url?.trim()) {
          parts.push(cleanUrl(link.url));
        }
      });
    }

    return parts.join(' • ');
  };

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

  // Add sorting function for skills categories
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


  // PDF Document Component
  const ResumePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.fullName}>
            {resumeData.personalDetails.firstName} {resumeData.personalDetails.lastName}
          </Text>
          <Text style={styles.contactInfo}>
            {buildContactInfo()}
          </Text>
        </View>

        {/* Summary */}
        {hasObjective() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text style={styles.summerydesc}>{resumeData.objective}</Text>
          </View>
        )}

        {/* Professional Experience */}
        {hasWorkExperience() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
            {resumeData.workExperience.filter(exp => {
              const hasContent = (
                (exp.company && exp.company.trim() !== '') ||
                (exp.jobTitle && exp.jobTitle.trim() !== '') ||
                !isEmptyDescription(exp.description) ||
                (exp.city && exp.city.trim() !== '') ||
                (exp.startDate && exp.startDate.trim() !== '') ||
                (exp.endDate && exp.endDate.trim() !== '')
              );
              return hasContent;
            }).map((experience, index) => (
              <View key={index}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>
                    {experience.company}
                    {experience.city && `, ${experience.city}`}
                  </Text>
                  {(experience.startDate?.trim() || experience.endDate?.trim()) && (
                    <Text style={styles.jobDate}>
                      {experience.startDate?.trim()} – {experience.endDate?.trim()}
                    </Text>
                  )}
                </View>
                {experience.jobTitle && experience.jobTitle.trim() && (
                  <Text style={{ ...styles.jobTitle, fontStyle: 'italic', marginTop: -5, color: '#333333' }}>
                    {experience.jobTitle}
                  </Text>
                )}
                {!isEmptyDescription(experience.description) && parseDescription(experience.description).map((desc, i) => (
                  <Text key={i} style={styles.listItem}>• {desc}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {hasProjects() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {resumeData.projects.filter(project => {
              const hasContent = (
                (project.name && project.name.trim() !== '') ||
                (project.description && parseHTML(project.description).length > 0) ||
                (project.link && project.link.trim() !== '')
              );
              return hasContent;
            }).map((project, index) => (
              <View key={index}>
                <View style={styles.jobHeader}>
                  {project.name && project.name.trim() && (
                    <Text style={styles.jobTitle}>{project.name}</Text>
                  )}
                  {project.link && project.link.trim() && (
                    <Text style={styles.jobDate}>Link</Text>
                  )}
                </View>
                {parseHTML(project.description).length > 0 && parseHTML(project.description).map((desc, i) => (
                  <Text key={i} style={styles.listItem}>• {desc}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {hasEducation() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {resumeData.education.filter(edu => {
              const hasContent = (
                (edu.degree && edu.degree.trim() !== '') ||
                (edu.university && edu.university.trim() !== '') ||
                (edu.major && edu.major.trim() !== '') ||
                (edu.city && edu.city.trim() !== '') ||
                (edu.startDate && edu.startDate.trim() !== '') ||
                (edu.endDate && edu.endDate.trim() !== '')
              );
              return hasContent;
            }).map((edu, index) => (
              <View key={index}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>
                    {edu.degree && edu.degree.trim() && edu.degree}
                    {edu.major && edu.major.trim() && ` in ${edu.major}`}
                  </Text>
                  {(edu.startDate?.trim() || edu.endDate?.trim()) && (
                    <Text style={styles.jobDate}>
                      {edu.startDate} - {edu.endDate}
                    </Text>
                  )}
                </View>
                {(edu.university || edu.city) && (
                  <Text style={{ fontStyle: 'italic' }}>
                    {edu.university && edu.university.trim()}
                    {edu.city && edu.city.trim() && `, ${edu.city}`}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {hasSkills() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            {sortSkillCategories(resumeData.skills)
              .filter(([_, items]) => Array.isArray(items) && items.some(item => item && item.trim() !== ''))
              .map(([category, items], index) => {
                const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];
                const isDefaultCategory = defaultCategories.includes(category);

                return (
                  <View key={index}>
                    <Text style={styles.jobTitle}>
                      {isDefaultCategory ? "Technical Skills" : category}
                    </Text>
                    <Text style={styles.skills}>
                      {items.filter(item => item && item.trim() !== '').join(", ")}
                    </Text>
                  </View>
                );
              })}
          </View>
        )}

        {/* Achievements */}
        {hasAchievements() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS & CERTIFICATIONS</Text>
            {parseAchievements(resumeData.achievements).map((achievement, index) => (
              <Text key={index} style={styles.listItem}>• {achievement}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );

  const handlePDFDownload = async () => {
    const blob = await pdf(<ResumePDF />).toBlob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${resumeData.personalDetails.firstName}_${resumeData.personalDetails.lastName}_Resume.pdf`;
    link.click();
    onClose();
  };

  return (
    <button
      onClick={handlePDFDownload}
      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center space-x-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      <span>Download PDF</span>
    </button>
  );
};