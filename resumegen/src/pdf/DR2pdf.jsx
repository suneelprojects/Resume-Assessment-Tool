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

// Register a web-safe font to ensure content is visible
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    }
  ]
});

// Create styles with default font family
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    backgroundColor: 'white',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
  },
  jobTitle: {
    fontSize: 16,
    color: '#7C3AED',
    marginBottom: -15,
  },
  summary: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 16,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
    marginTop: 0,
  },
  objective: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 16,
  },
  skillsSection: {
    marginBottom: 16,
  },
  skillCategory: {
    fontSize: 14,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#374151',
  },
  dates: {
    fontSize: 10,
    color: '#1F2937',
  },
  descriptionList: {
    marginLeft: 12,
  },
  descriptionItem: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 2,
  },
  link: {
    color: 'white',
    fontSize: 10,
    textDecoration: 'none',
  },
  projectLink: {
    color: '#2563EB',
    fontSize: 10,
    textDecoration: 'none',
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
  }
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header is always shown */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalDetails.firstName} {personalDetails.lastName}
          </Text>
          <Text style={styles.jobTitle}>{personalDetails.jobTitle}</Text>
          <Text style={styles.summary}>{personalDetails.summary}</Text>
        </View>

        {/* Contact Section is always shown */}
        <View style={styles.contactSection}>
          <Text style={styles.contactItem}>{personalDetails.email}</Text>
          <Text style={styles.contactItem}>{personalDetails.phone}</Text>
          <Text style={styles.contactItem}>{personalDetails.address}</Text>
          <Text style={styles.contactItem}>LinkedIn</Text>
          {personalDetails.otherLinks && personalDetails.otherLinks.map((link, index) => (
            <Text key={index} style={styles.contactItem}>
              {link.title}
            </Text>
          ))}
        </View>

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
            {Object.entries(skills).map(([category, skillList], index) => (
              skillList && skillList.length > 0 && (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={styles.skillCategory}>
                    {category.trim().toLowerCase() === "full stack" 
                      ? "Technical Skills" 
                      : category}
                  </Text>
                  <View style={styles.skillsContainer}>
                    {skillList.map((skill, idx) => (
                      <Text key={idx} style={styles.skillBadge}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              )
            ))}
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
                    {experience.startDate} - {experience.endDate || "Present"}
                  </Text>
                </View>
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
                    {edu.startDate} - {edu.endDate}
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
      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
    >
      {({ blob, url, loading, error }) =>
        loading ? '' : 'Download PDF'
      }
    </PDFDownloadLink>
  );
};