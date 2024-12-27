import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/helvetica_400.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/helvetica_700.ttf', fontWeight: 'bold' }
  ]
});

export const PR2PDFDownload = ({ resumeData, template, onClose }) => {
  // Helper functions for validation
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

  // Validation helper functions
  const isEmptyDescription = (description) => {
    const parsed = parseDescription(description);
    return !parsed || parsed.length === 0 || parsed.every(item => !item || item.trim() === '');
  };

  const hasObjective = () => {
    const { objective } = resumeData;
    return objective && objective.trim() !== '' && objective !== '<br>';
  };

  const hasSkills = () => {
    const { skills } = resumeData;
    if (!skills || typeof skills !== 'object') return false;

    return Object.entries(skills).some(([category, items]) => {
      if (!Array.isArray(items)) return false;
      return items.some(item => item && item.trim() !== '');
    });
  };

  const hasWorkExperience = () => {
    const { workExperience } = resumeData;
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
    const { projects } = resumeData;
    if (!Array.isArray(projects) || projects.length === 0) return false;

    return projects.some(project => {
      const hasName = project.name && project.name.trim() !== '';
      const hasDescription = project.description && parseHTML(project.description).length > 0;
      const hasLink = project.link && project.link.trim() !== '';

      return hasName || hasDescription || hasLink;
    });
  };

  const hasEducation = () => {
    const { education } = resumeData;
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
    const { achievements } = resumeData;
    if (!achievements) return false;
    const parsedAchievements = parseAchievements(achievements);
    return parsedAchievements.length > 0;
  };

  // Create PDF styles
  const styles = StyleSheet.create({
    // ... (keeping existing styles)
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.5,
      color: '#333333'
    },
    header: {
      marginBottom: 20,
      textAlign: 'center'
    },
    fullName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#15803d',
      marginBottom: 14
    },
    contactInfo: {
      fontSize: 11,
      color: '#666666'
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#15803d',
      borderBottomWidth: 1,
      borderBottomColor: '#15803d',
      marginBottom: 10,
      paddingBottom: 2,
      marginTop:-10,
    },
    sectionContent: {
      marginBottom: 15
    },
    objective: {
      fontSize: 11,
      marginBottom: 10
    },
    experienceBlock: {
      marginBottom: 10
    },
    companyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2
    },
    companyName: {
      fontSize: 12,
      fontWeight: 'bold'
    },
    dateText: {
      fontSize: 10,
      color: '#666666'
    },
    jobTitle: {
      fontSize: 11,
      fontStyle: 'italic',
      color: '#666666',
      marginBottom: 3
    },
    bulletPoint: {
      fontSize: 11,
      marginLeft: 10,
      marginBottom: 2,
      color: '#666666',
    },
    skillCategory: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2
    },
    skillList: {
      fontSize: 11,
      color: '#666666'
    }
  });

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

  // PDF Document Component with validations
  const ResumePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
       {/* Header Section */}
<View style={styles.header}>
  {resumeData.personalDetails.firstName && resumeData.personalDetails.lastName && (
    <Text style={styles.fullName}>
      {`${resumeData.personalDetails.firstName} ${resumeData.personalDetails.lastName}`}
    </Text>
  )}
  <Text style={styles.contactInfo}>
    {[
      resumeData.personalDetails.address,
      resumeData.personalDetails.phone,
      resumeData.personalDetails.email,
      resumeData.personalDetails.linkedin,
      resumeData.personalDetails.github,
      ...(resumeData.personalDetails.otherLinks?.map(link => link.url) || [])
    ]
      .filter(Boolean)
      .map((item, index, array) => {
        const isLink = item.startsWith('http') || item.includes('@');
        const displayText = isLink ? item : item;
        return index === array.length - 1 ? displayText : `${displayText} | `;
      })}
  </Text>
</View>

        {/* Objective Section */}
        {hasObjective() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>OBJECTIVE</Text>
            <Text style={styles.objective}>{resumeData.objective}</Text>
          </View>
        )}

        {/* Experience Section */}
        {hasWorkExperience() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            {resumeData.workExperience?.map((experience, index) => (
              <View key={index} style={styles.experienceBlock}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>
                    {experience.company}, {experience.city}
                  </Text>
                  <Text style={styles.dateText}>
                  {experience.startDate}
                                                {experience.startDate && experience.endDate && " - "}
                                                {experience.endDate}
                  </Text>
                </View>
                <Text style={styles.jobTitle}>{experience.jobTitle}</Text>
                {parseDescription(experience.description).map((desc, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {desc}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {hasEducation() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {resumeData.education?.map((edu, index) => (
              <View key={index} style={styles.experienceBlock}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>
                    {edu.degree} in {edu.major}
                  </Text>
                  <Text style={styles.dateText}>
                  {edu.startDate}
                                        {edu.startDate && edu.endDate && " - "}
                                        {edu.endDate}
                  </Text>
                </View>
                <Text style={styles.jobTitle}>
                  {edu.university}, {edu.city}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {hasSkills() && (
  <View style={styles.sectionContent}>
    <Text style={styles.sectionTitle}>SKILLS</Text>
    {sortSkillCategories(resumeData.skills || {}).map(([category, items], index) => {
      const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];
      const isDefaultCategory = defaultCategories.includes(category);

      return (
        <View key={index} style={{ marginBottom: 5 }}>
          <Text style={styles.skillCategory}>
            {isDefaultCategory ? "Technical Skills" : category}
          </Text>
          <Text style={styles.skillList}>
            {Array.isArray(items) ? items.join(", ") : "No skills provided"}
          </Text>
        </View>
      );
    })}
  </View>
)}

        {/* Projects Section */}
        {hasProjects() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {resumeData.projects?.map((project, index) => (
              <View key={index} style={styles.experienceBlock}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>{project.name}</Text>
                  {project.link && <Text style={styles.dateText}>Link</Text>}
                </View>
                {parseHTML(project.description).map((desc, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {desc}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Achievements Section */}
        {hasAchievements() && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS & CERTIFICATIONS</Text>
            {parseAchievements(resumeData.achievements).map((achievement, index) => (
              <Text key={index} style={styles.bulletPoint}>• {achievement}</Text>
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