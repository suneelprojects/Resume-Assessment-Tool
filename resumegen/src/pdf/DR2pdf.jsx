import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font
} from '@react-pdf/renderer';

/// Create styles using built-in fonts
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: 'white',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#000000',
  },
  jobTitle: {
    fontSize: 16,
    color: '#7C3AED',
    marginBottom: -15,
    fontFamily: 'Helvetica',
  },
  summary: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 16,
    fontFamily: 'Helvetica',
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#4B5563',
    padding: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  contactItem: {
    color: 'white',
    fontSize: 10,
    marginHorizontal: 4,
    fontFamily: 'Helvetica',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 5,
    marginTop: 0,
  },
  objective: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 16,
    fontFamily: 'Helvetica',
  },
  skillsSection: {
    marginBottom: 16,
  },
  skillCategory: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#000000',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#E6FFFA',
    color: '#0D9488',
    padding: '4 8',
    fontSize: 10,
    marginRight: 4,
    marginBottom: 4,
    fontFamily: 'Helvetica',
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  dates: {
    fontSize: 10,
    color: '#1F2937',
    fontFamily: 'Helvetica',
  },
  workjobTitle: {
    fontSize: 12,
    color: "#4b5563",
    fontStyle: 'italic',
    fontFamily: 'Helvetica',
  },
  descriptionList: {
    marginLeft: 12,
  },
  descriptionItem: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 2,
    fontFamily: 'Helvetica',
  },
  link: {
    color: 'white',
    fontSize: 10,
    textDecoration: 'none',
    fontFamily: 'Helvetica',
  },
  projectLink: {
    color: '#2563EB',
    fontSize: 10,
    textDecoration: 'none',
    fontFamily: 'Helvetica',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});

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

// PDF Document component with validations
const ResumePDF = ({ resumeData }) => {
  const {
    personalDetails = {},
    objective = "",
    skills = [],
    workExperience = [],
    education = [],
    achievements = [],
    projects = []
  } = resumeData;

  // Add this helper function before the ResumePDF component
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section - only display if there's header info */}
        {hasHeaderInfo(personalDetails) && (
          <View style={styles.header}>
            {(personalDetails.firstName || personalDetails.lastName) && (
              <Text style={styles.name}>
                {personalDetails.firstName} {personalDetails.lastName}
              </Text>
            )}
            {personalDetails.jobTitle && (
              <Text style={styles.jobTitle}>{personalDetails.jobTitle}</Text>
            )}
            {personalDetails.summary && (
              <Text style={styles.summary}>{personalDetails.summary}</Text>
            )}
          </View>
        )}

        {/* Contact Section - only display if there's contact info */}
        {hasContactInfo(personalDetails) && (
          <View style={styles.contactSection}>
            {personalDetails.email && (
              <Text style={styles.contactItem}>{personalDetails.email}</Text>
            )}
            {personalDetails.phone && (
              <Text style={styles.contactItem}>{personalDetails.phone}</Text>
            )}
            {personalDetails.address && (
              <Text style={styles.contactItem}>{personalDetails.address}</Text>
            )}
            {personalDetails.linkedin && (
              <Text style={styles.contactItem}>LinkedIn</Text>
            )}
            {personalDetails.github && (
              <Text style={styles.contactItem}>GitHub</Text>
            )}
            {personalDetails.otherLinks?.map((link, index) => (
              link.url && link.title && (
                <Text key={index} style={styles.contactItem}>
                  {link.title}
                </Text>
              )
            ))}
          </View>
        )}

        {/* Objective - Only shown if valid */}
        {hasObjective(objective) && (
          <View>
            <Text style={styles.sectionTitle}>Objective</Text>
            <Text style={styles.objective}>{objective}</Text>
          </View>
        )}

        {/* Skills - Only shown if valid */}
        {hasSkills(skills) && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {sortSkillCategories(skills).map(([category, skillList], index) => {
              const defaultCategories = ["Full Stack", "Cloud Computing", "Artificial Intelligence", "Data Science"];
              const isDefaultCategory = defaultCategories.includes(category);

              return skillList && skillList.length > 0 && (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={styles.skillCategory}>
                    {isDefaultCategory ? "Technical Skills" : category}
                  </Text>
                  <View style={styles.skillsContainer}>
                    {skillList.map((skill, idx) => (
                      skill && skill.trim() !== "" && (
                        <Text key={idx} style={styles.skillBadge}>
                          {skill}
                        </Text>
                      )
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Work Experience - Only shown if valid */}
        {hasWorkExperience(workExperience) && (
          <View>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {workExperience.map((experience, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.companyName}>
                    {experience.company} - {experience.city}
                  </Text>
                  <Text style={styles.dates}>
                    {experience.startDate}
                    {experience.startDate && experience.endDate && " - "}
                    {experience.endDate}
                  </Text>
                </View>
                <Text style={styles.workjobTitle}>{experience.jobTitle}</Text>
                <View style={styles.descriptionList}>
                  {parseDescription(experience.description).map((desc, i) => (
                    <Text key={i} style={styles.descriptionItem}>
                      • {desc}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects - Only shown if valid */}
        {hasProjects(projects) && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.companyName}>{project.name}</Text>
                  {project.link && (
                    <Text style={styles.projectLink}>Link</Text>
                  )}
                </View>
                <View style={styles.descriptionList}>
                  {parseHTML(project.description).map((desc, i) => (
                    <Text key={i} style={styles.descriptionItem}>
                      • {desc}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education - Only shown if valid */}
        {hasEducation(education) && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.companyName}>
                    {edu.degree} in {edu.major}
                  </Text>
                  <Text style={styles.dates}>
                  {edu.startDate}
                                        {edu.startDate && edu.endDate && " - "}
                                        {edu.endDate}
                  </Text>
                </View>
                <Text style={styles.descriptionItem}>
                  {edu.university}, {edu.city}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Achievements - Only shown if valid */}
        {hasAchievements(achievements) && (
          <View>
            <Text style={styles.sectionTitle}>Achievements & Certifications</Text>
            <View style={styles.descriptionList}>
              {parseHTML(achievements).map((achievement, index) => (
                <Text key={index} style={styles.descriptionItem}>
                  • {achievement}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

// Download component remains the same
export const DR2PDFDownload = ({ resumeData, onClose }) => {
  const fileName = `${resumeData.personalDetails?.firstName || ''}${resumeData.personalDetails?.lastName || ''}_resume.pdf`;

  return (
    <PDFDownloadLink
      document={<ResumePDF resumeData={resumeData} />}
      fileName={fileName}
      className="w-full cursor-pointer bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
    >
      {({ blob, url, loading, error }) =>
        loading ? '' : 'Download PDF'
      }
    </PDFDownloadLink>
  );
};