import os
import re
import spacy
import pandas as pd
import logging
from collections import OrderedDict
from pdfminer.high_level import extract_text

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ResumeParser:
    def __init__(self, resume):
        self.nlp = spacy.load('en_core_web_sm')
        self.details = {}
        self.resume = resume
        self.text_raw = self.extract_resume_text(self.resume)
        self.text = ' '.join(self.text_raw.split())
        self.nlp_doc = self.nlp(self.text)
        self._extract_basic_details()

    def extract_resume_text(self, file_path):
        """Extract text from PDF resume file using pdfminer."""
        try:
            return extract_text(file_path)
        except Exception as e:
            logging.error(f"Error extracting text from {file_path}: {e}")
            return ""

    def extract_name(self, nlp_doc, text_raw):
        """Extract candidate's name."""
        # First line check for name (avoiding address and other non-name information)
        first_line = text_raw.splitlines()[0]
        if first_line and not re.search(r'^\d{1,3}[a-zA-Z ]+', first_line):
            name = first_line.strip()
            if len(name.split()) >= 2:
                return name
        # Fallback to spaCy's NER
        for ent in nlp_doc.ents:
            if ent.label_ == 'PERSON':
                return ent.text.strip()
        return None

    def extract_email(self, text):
        """Extract email address from resume text using regex."""
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        matches = re.findall(email_pattern, text)
        return matches[0] if matches else None

    def extract_mobile_number(self, text):
        """Extract mobile number from resume text using regex."""
        phone_pattern = r'\b(?:\+?\d{1,2}\s?\(?\d{1,4}\)?\s?\d{3}[-\s]?\d{4}|\d{10}|\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4})\b'
        matches = re.findall(phone_pattern, text)
        return re.sub(r'[^0-9]', '', matches[0]) if matches else None

    def extract_skills_from_csv(self, csv_path, text):
        """Extract skills from CSV list based on resume text."""
        if not csv_path or not os.path.exists(csv_path):
            logging.warning("Skills CSV file is missing. Skills extraction may be incomplete.")
            return []
        try:
            skills_data = pd.read_csv(csv_path, header=None)
            skills_list = skills_data.values.flatten().tolist()
        except Exception as e:
            logging.error(f"Error reading CSV: {e}")
            return []
        skills_list = [skill.strip().lower() for skill in skills_list if skill not in ['technical skills', 'soft skills']]
        text = text.lower()
        return [skill for skill in skills_list if re.search(rf'\b{re.escape(skill)}\b', text)]

    def extract_section(self, section_name, text, keywords=None):
        """Extract a section of the resume based on section name and optional keywords."""
        match = re.search(rf'({section_name}).*?(?=(Skills|Experience|Projects|Certifications|$))', text, re.IGNORECASE | re.DOTALL)
        if match:
            section_text = match.group(0)
            if keywords:
                for line in section_text.splitlines():
                    if any(keyword.lower() in line.lower() for keyword in keywords):
                        return line.strip()
            else:
                return section_text.strip()
        return None

    def extract_education(self, text):
        """Extract education details from resume text."""
        education_keywords = ['B. Tech', 'Bachelor', 'Master', 'PhD', 'M.Sc', 'Diploma', 'Degree', 'CGPA', 'B.S.']
        return self.extract_section('Education', text, education_keywords)

    def extract_experience(self, text):
        """Extract work experience details from resume text."""
        return self.extract_section('Experience', text)

    def extract_projects(self, text):
        """Extract projects from resume text."""
        return self.extract_section('Projects', text)

    def extract_soft_skills(self, text):
        """Extract soft skills from resume text."""
        soft_skills_keywords = ['Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Communication', 'Adaptability', 'Time Management', 'Project Management']
        return list(set([keyword for keyword in soft_skills_keywords if keyword.lower() in text.lower()]))

    def _extract_basic_details(self):
        """Extract basic details from resume text."""
        csv_path = 'skills.csv' if os.path.exists('skills.csv') else None
        self.details['name'] = self.extract_name(self.nlp_doc, self.text_raw)
        self.details['email'] = self.extract_email(self.text)
        self.details['mobile_number'] = self.extract_mobile_number(self.text)
        self.details['skills'] = self.extract_skills_from_csv(csv_path, self.text) if csv_path else []
        self.details['soft_skills'] = self.extract_soft_skills(self.text)
        self.details['education'] = self.extract_education(self.text)
        self.details['experience'] = self.extract_experience(self.text)
        self.details['projects'] = self.extract_projects(self.text)

    def get_extracted_data(self):
        """Get the extracted details from the resume."""
        return OrderedDict({
            'name': self.details.get('name'),
            'email': self.details.get('email'),
            'mobile_number': self.details.get('mobile_number'),
            'skills': self.details.get('skills'),
            'education': self.details.get('education'),
            'experience': self.details.get('experience'),
            'projects': self.details.get('projects'),
            'soft_skills': self.details.get('soft_skills')
        })


if __name__ == '__main__':
    import multiprocessing as mp
    import pickle

    def resume_result_wrapper(resume):
        """Wrapper to extract resume details."""
        parser = ResumeParser(resume)
        return parser.get_extracted_data()

    # Example folder where resumes are stored
    resumes = [os.path.join('resumes', f) for f in os.listdir('resumes') if f.endswith('.pdf')]

    # Parallel processing of resumes
    with mp.Pool(mp.cpu_count()) as pool:
        results = [pool.apply_async(resume_result_wrapper, args=(resume,)) for resume in resumes]
        results = [p.get() for p in results]

    # Print results (Optional)
    import pprint
    pprint.pprint(results)

    # Save the model for future use (Optional)
    with open('resume_parser_model.pkl', 'wb') as model_file:
        pickle.dump(ResumeParser, model_file)
