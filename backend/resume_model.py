import os
import re
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from transformers import BertTokenizer, BertModel
from collections import Counter, OrderedDict
import spacy
import PyPDF2
import docx
from pdfminer.high_level import extract_text


class ResumeModel:
    def __init__(self):
        # Define base directory as current directory or user folder
        self.base_dir = os.path.dirname(os.path.abspath(__file__))  # The directory of the current script

        # Load skills and model-related files using os.path.join for universal paths
        self.hard_skills = self.load_skills_from_file(os.path.join(self.base_dir, "technical_skills_list.txt"))
        self.soft_skills = [
            "problem-solving", "communication", "teamwork", "leadership", "adaptability", "critical thinking",
            "time management", "creativity", "analytical skills"
        ]
        self.other_skills = [
            "Agile", "Jira", "project management", "customer service", "stakeholder management"
        ]
        
        # Initialize BERT model and tokenizer
        self.bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.bert_model = BertModel.from_pretrained('bert-base-uncased')
        
        # Load trained model, vectorizer, and label encoder using os.path.join for universal paths
        self.model = tf.keras.models.load_model(os.path.join(self.base_dir, "update.h5"))
        self.vectorizer = joblib.load(os.path.join(self.base_dir, "vectorizer.pkl"))
        self.label_encoder = joblib.load(os.path.join(self.base_dir, "label_encoder.pkl"))
        


    def load_skills_from_file(self, file_path):
        """Load skills from the text file into a list."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                skills = [line.strip() for line in file.readlines() if line.strip()]
            return skills
        except Exception as e:
            print(f"Error reading skills from file: {str(e)}")
            return []

    def extract_text_from_pdf(self, file_path):
        try:
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                return "".join([page.extract_text() for page in reader.pages])
        except Exception as e:
            return f"Error extracting text from PDF: {str(e)}"

    def extract_text_from_docx(self, file_path):
        try:
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            return f"Error extracting text from DOCX: {str(e)}"

    def categorize_skills(self, text):
        skills = {"hard_skills": [], "soft_skills": [], "other_skills": []}
        for category, skills_list in [("hard_skills", self.hard_skills), 
                                     ("soft_skills", self.soft_skills), 
                                     ("other_skills", self.other_skills)]:
            skills[category] = [skill for skill in skills_list if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE)]
        return skills

    def extract_education(self, text):
        education_keywords = [
            "Bachelor of Science", "Bachelor of Technology", "Bachelor of Arts", "Bachelor of Commerce", "B.Sc",
            "B.Tech", "B. Tech", "B.A", "B.Com", "Master of Science", "Master of Technology", "Master of Arts",
            "Master of Commerce", "M.Sc", "M.Tech", "M.A", "M.Com", "PhD", "Doctor of Philosophy", "MBA", "Diploma",
            "Associate Degree", "Engineering"
        ]        
        return [degree for degree in education_keywords if re.search(r'\b' + re.escape(degree) + r'\b', text, re.IGNORECASE)]

    def extract_experience(self, text):
        # Experience extraction logic
        experience_years = re.search(r'(\d+)[\s-]?(?:years|yrs)[\s-]?(?:of)?[\s-]?(?:experience)?', text, re.IGNORECASE)
        experience_months = re.search(r'(\d+)[\s-]?(?:months?|mos?)[\s-]?(?:of)?[\s-]?(?:experience)?', text, re.IGNORECASE)
        years = int(experience_years.group(1)) if experience_years else 0
        months = int(experience_months.group(1)) if experience_months else 0
        return years + months / 12


    def calculate_ats_score(self, resume_text, job_description, role=""):
        """Calculate ATS score based on resume and job description."""
        resume_words = Counter(re.findall(r'\b\w+\b', resume_text.lower()))
        job_words = Counter(re.findall(r'\b\w+\b', job_description.lower()))
        common_words = sum((resume_words & job_words).values())
        total_job_words = sum(job_words.values())
        role_mention = resume_words[role.lower()] if role else 0
        return ((common_words + role_mention) / (total_job_words + 1)) * 100 if total_job_words else 0

    def hugging_face_recommendation_bert(self, resume_text, job_description):
        """Use BERT to calculate semantic similarity between resume and job description."""
        resume_text_truncated = resume_text[:512]
        job_desc_text_truncated = job_description[:512]

        # Tokenize and get embeddings for resume and job description
        resume_input_ids = self.bert_tokenizer(resume_text_truncated, return_tensors='pt', truncation=True, padding=True)
        job_desc_input_ids = self.bert_tokenizer(job_desc_text_truncated, return_tensors='pt', truncation=True, padding=True)

        resume_embedding = self.bert_model(**resume_input_ids).last_hidden_state.mean(dim=1).detach().numpy()
        job_desc_embedding = self.bert_model(**job_desc_input_ids).last_hidden_state.mean(dim=1).detach().numpy()

        # Compute cosine similarity between embeddings
        cosine_similarity = np.dot(resume_embedding, job_desc_embedding.T) / (
            np.linalg.norm(resume_embedding) * np.linalg.norm(job_desc_embedding))
        similarity_score = cosine_similarity.item() * 100  # Convert to percentage

        # Categorize skills in both resume and job description
        resume_skills = self.categorize_skills(resume_text)
        job_skills = self.categorize_skills(job_description)

        # Extract hard skills from both resume and job description
        resume_hard_skills = set(resume_skills["hard_skills"])
        job_hard_skills = set(job_skills["hard_skills"])

        # Calculate missing hard skills by subtracting resume skills from job description skills
        missing_skills = list(job_hard_skills - resume_hard_skills)

        # Recommendation message based on similarity score and missing skills
        recommendation = "Your resume is a good match for the job description!" if similarity_score >= 50 else "Your resume does not match well with the job description."

        if missing_skills:
            recommendation += f"\nHowever, you are missing the following skills that are important for the job: {', '.join(missing_skills)}"

        return similarity_score, recommendation

    def predict_role(self, resume_text, input_role):
        """Predict role based on resume text."""
        # Transform resume text for prediction
        resume_transformed = self.vectorizer.transform([resume_text]).toarray()
        role_probabilities = self.model.predict(resume_transformed)

        # Get role probabilities and map them to suggested roles
        input_role_encoded = self.label_encoder.transform([input_role])
        input_role_index = input_role_encoded[0]
        input_role_confidence = float(role_probabilities[0][input_role_index] * 100)

        sorted_indices = np.argsort(role_probabilities[0])[::-1]
        suggested_roles = self.label_encoder.inverse_transform(sorted_indices)
        suggested_confidences = [float(role_probabilities[0][i] * 100) for i in sorted_indices]

        return input_role_confidence, suggested_roles, suggested_confidences
