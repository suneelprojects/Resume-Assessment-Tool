import os
import json
import re
import joblib
import numpy as np
import tensorflow as tf
from transformers import BertTokenizer, BertModel
from collections import Counter
import PyPDF2
import docx

class ResumeModel:
    def __init__(self):
        # Define base directory as the script's directory
        self.base_dir = os.path.dirname(os.path.abspath(__file__))

        # Load role skills data dynamically from the JSON file
        self.role_skills = self.load_role_skills_from_json(os.path.join(self.base_dir, "role_skills.json"))

        # Load skills and education data dynamically
        self.hard_skills = self.load_skills_from_file(os.path.join(self.base_dir, "technical_skills_list.txt"))

        self.education_keywords = self.load_skills_from_file(os.path.join(self.base_dir, "academic_degrees_list.txt"))

        # Initialize BERT model and tokenizer
        self.bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.bert_model = BertModel.from_pretrained('bert-base-uncased')

        # Load trained model, vectorizer, and label encoder
        self.model = tf.keras.models.load_model(os.path.join(self.base_dir, "update.h5"))
        self.vectorizer = joblib.load(os.path.join(self.base_dir, "vectorizer.pkl"))
        self.label_encoder = joblib.load(os.path.join(self.base_dir, "label_encoder.pkl"))

    def load_role_skills_from_json(self, file_path):
        """Load role skills from a JSON file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                return data
        except FileNotFoundError:
            print(f"Error: File not found at {file_path}. Please check the file path.")
            return {}
        except Exception as e:
            print(f"Error reading file {file_path}: {str(e)}")
            return {}

    def load_skills_from_file(self, file_path):
        """Load items from a text file into a list."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return [line.strip() for line in file.readlines() if line.strip()]
        except FileNotFoundError:
            print(f"Error: File not found at {file_path}. Please check the file path.")
            return []
        except Exception as e:
            print(f"Error reading file {file_path}: {str(e)}")
            return []

    def extract_text_from_pdf(self, file_path):
        """Extract text from a PDF file."""
        try:
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                return "".join([page.extract_text() for page in reader.pages])
        except Exception as e:
            return f"Error extracting text from PDF: {str(e)}"

    def extract_text_from_docx(self, file_path):
        """Extract text from a DOCX file."""
        try:
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            return f"Error extracting text from DOCX: {str(e)}"

    def categorize_skills(self, text):
        """Categorize skills into hard, soft, and other categories."""
        skills = {"hard_skills": []}

        for category, skills_list in [("hard_skills", self.hard_skills)]:
            for skill in skills_list:
                if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                    skills[category].append(skill)

        return skills

    def extract_education(self, text):
        """Extract education details from text."""
        return [degree for degree in self.education_keywords if re.search(r'\b' + re.escape(degree) + r'\b', text, re.IGNORECASE)]

    def extract_experience(self, text):
        """Extract total experience in years from text."""
        experience_years = re.search(r'(\d+)[\s-]?(?:years|yrs)[\s-]?(?:of)?[\s-]?(?:experience)?', text, re.IGNORECASE)
        experience_months = re.search(r'(\d+)[\s-]?(?:months?|mos?)[\s-]?(?:of)?[\s-]?(?:experience)?', text, re.IGNORECASE)
        years = int(experience_years.group(1)) if experience_years else 0
        months = int(experience_months.group(1)) if experience_months else 0
        return years + months / 12

    def calculate_ats_score(self, resume_text, required_skills):
        """Calculate ATS-friendly score."""
        # Section Presence Check
        essential_sections = ["Contact", "Education", "Skills", "Work Experience"]
        sections_found = [section for section in essential_sections if section.lower() in resume_text.lower()]
        section_score = len(sections_found) / len(essential_sections) * 100

        # Skill Matching
        extracted_skills = self.categorize_skills(resume_text)["hard_skills"]
        matched_skills = [skill for skill in required_skills if skill in extracted_skills]
        skill_score = len(matched_skills) / len(required_skills) * 100 if required_skills else 0

        # Formatting Check
        formatting_issues = 0
        if not re.search(r'\b\d{10}\b', resume_text):
            formatting_issues += 1
        if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', resume_text):
            formatting_issues += 1
        if re.search(r'[^\x00-\x7F]', resume_text):
            formatting_issues += 1
        formatting_score = (1 - (formatting_issues / 3)) * 100

        # Overall ATS Score
        ats_score = (skill_score * 0.6) + (section_score * 0.3) + (formatting_score * 0.1)
        return ats_score, skill_score, section_score, formatting_score


    def hugging_face_recommendation_bert(self, resume_text, job_description):
        """Use BERT for semantic similarity and skill recommendation."""
        resume_text_truncated = resume_text[:512]
        job_desc_text_truncated = job_description[:512]

        resume_input_ids = self.bert_tokenizer(resume_text_truncated, return_tensors='pt', truncation=True, padding=True)
        job_desc_input_ids = self.bert_tokenizer(job_desc_text_truncated, return_tensors='pt', truncation=True, padding=True)

        resume_embedding = self.bert_model(**resume_input_ids).last_hidden_state.mean(dim=1).detach().numpy()
        job_desc_embedding = self.bert_model(**job_desc_input_ids).last_hidden_state.mean(dim=1).detach().numpy()

        cosine_similarity = np.dot(resume_embedding, job_desc_embedding.T) / (
            np.linalg.norm(resume_embedding) * np.linalg.norm(job_desc_embedding))
        similarity_score = cosine_similarity.item() * 100

        resume_skills = self.categorize_skills(resume_text)
        job_skills = self.categorize_skills(job_description)

        resume_hard_skills = set(resume_skills["hard_skills"])
        job_hard_skills = set(job_skills["hard_skills"])

        missing_skills = list(job_hard_skills - resume_hard_skills)

        recommendation = "Your resume is a good match for the job description!" if similarity_score >= 50 else "Your resume does not match well with the job description."

        if missing_skills:
            recommendation += f"\nHowever, you may want to consider adding the following skills to your resume: {', '.join(missing_skills)}"

        return similarity_score, recommendation
    def predict_role(self, resume_text, input_role):
        """
        Predict the role based on the resume text and provide suggestions for improvement.
        Includes ATS-friendly score calculation.
        """
        # Transform the resume text using the vectorizer
        resume_transformed = self.vectorizer.transform([resume_text]).toarray()

        # Predict the role probabilities using the model
        role_probabilities = self.model.predict(resume_transformed)

        # Get the index and confidence for the provided role
        input_role_encoded = self.label_encoder.transform([input_role])
        input_role_index = input_role_encoded[0]
        input_role_confidence = float(role_probabilities[0][input_role_index] * 100)

        # Get the role predictions and their respective confidence
        sorted_indices = np.argsort(role_probabilities[0])[::-1]  # Sort in descending order
        suggested_roles = self.label_encoder.inverse_transform(sorted_indices)
        suggested_confidences = [float(confidence * 100) for confidence in role_probabilities[0][sorted_indices]]

        # Extract skills from the resume
        categorized_skills = self.categorize_skills(resume_text)
        resume_skills = categorized_skills["hard_skills"]

        # Get skills required for the input role
        required_skills = self.role_skills.get(input_role, [])

        # Find missing skills
        missing_skills = [skill for skill in required_skills if skill not in resume_skills]

        # Calculate ATS-friendly score
        ats_score, skill_score, section_score, formatting_score = self.calculate_ats_score(
            resume_text, required_skills
        )

        # Output the results
        results = {
            "input_role": input_role,
            "input_role_confidence": input_role_confidence,
            "ats_score": ats_score,
            "skill_score": skill_score,
            "section_score": section_score,
            "formatting_score": formatting_score,
            "suggested_roles": [
                {"role": role, "confidence": confidence}
                for role, confidence in zip(suggested_roles[:20], suggested_confidences[:20])  # Top 5 roles
            ],
            "resume_skills": resume_skills,
            "missing_skills": missing_skills,
        }

        # Print results for easier debugging or viewing
        print(f"Role Confidence for '{input_role}': {input_role_confidence:.2f}%")
        print(f"ATS-Friendly Score: {ats_score:.2f}%")
        print(f"  - Skill Match Score: {skill_score:.2f}%")
        print(f"  - Section Presence Score: {section_score:.2f}%")
        print(f"  - Formatting Score: {formatting_score:.2f}%")
        print("\nTop Suggested Roles:")
        for role in results["suggested_roles"]:
            print(f"  - {role['role']}: {role['confidence']:.2f}%")
        print(f"\nMatched Skills: {', '.join(resume_skills) if resume_skills else 'None'}")
        print(f"Missing Skills for '{input_role}':")
        if missing_skills:
            for skill in missing_skills:
                print(f"  - {skill}")
        else:
            print("  - None")

        return results
