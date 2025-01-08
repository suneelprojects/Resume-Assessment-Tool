from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from resume_parser import ResumeParser
from resume_model import ResumeModel
import pandas as pd
import random
from fuzzywuzzy import process
import spacy
from datetime import datetime, timedelta
import json
# Load spaCy model for NLP
nlp = spacy.load("en_core_web_sm")

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all origins
CORS(app, origins="*")

# Get the environment (production or local) from environment variables
FLASK_ENV = os.getenv('FLASK_ENV', 'production')  # Default to production if not set
ALLOWED_EXTENSIONS = set(['pdf', 'docx'])
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')

# Initialize resume model
resume_model = ResumeModel()

# Ensure 'uploads' folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ROLE_SKILLS_PATH = os.path.join(os.getcwd(), 'role_skills.json')

# Dataset path for profile generation
default_dataset_path = os.path.join(os.getcwd(), 'Updated_Resume_Dataset_v2.csv')

def load_role_skills(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return {}

# Load skills once during application initialization
role_specific_skills = load_role_skills(ROLE_SKILLS_PATH)

def load_dataset(file_path):
    try:
        return pd.read_csv(file_path)
    except FileNotFoundError:
        return None

# Generate realistic start and end dates based on experience years
def generate_dates(experience_years):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=experience_years * 365)
    return start_date.strftime("%B, %Y"), end_date.strftime("%B, %Y")

# Enhanced role and experience extraction
def parse_input(input_text):
    roles = [
        "Junior Data Analyst", "Junior Data Scientist", "Junior Machine Learning Engineer",
        "Junior Python Data Scientist", "Junior Data Engineer", "Junior AI Engineer",
        "Junior NLP Engineer", "Computer Vision Engineer", "AWS Admin", "Junior DevOps Engineer",
        "Cloud Engineer", "Cloud Developer", "Java Full Stack Developer", "Python Full Stack Developer",
        "Frontend Developer", "Backend Developer", "React.js Developer", "MERN Stack Developer",
        "Java Developer", "Python Developer", "JavaScript Developer"
    ]

    input_text = input_text.lower()
    doc = nlp(input_text)

    # Extract years of experience
    experience = None
    for ent in doc.ents:
        if ent.label_ == "DATE" and "year" in ent.text:
            try:
                experience = int(ent.text.split()[0])
                break
            except ValueError:
                pass

    # Token-based role matching
    input_tokens = set(input_text.split())
    best_match = None
    best_score = 0

    for role in roles:
        role_tokens = set(role.lower().split())
        common_tokens = input_tokens.intersection(role_tokens)
        match_score = len(common_tokens) / len(role_tokens)
        if match_score > best_score:
            best_match = role
            best_score = match_score

    threshold = 0.5
    if best_score >= threshold:
        return best_match, experience

    return None, experience

# Generate enriched and structured resume profile
def generate_profile(dataset, role, experience):
    filtered_data = dataset[dataset['Role'] == role]
    if filtered_data.empty:
        return {"error": f"No profile data available for the role: {role}"}

    selected_rows = filtered_data.sample(n=min(2, len(filtered_data))).to_dict('records')
    start_date, end_date = generate_dates(experience) if experience else (None, None)

    # Get role-specific skills from the JSON
    skills_from_json = role_specific_skills.get(role, [])
    skills = f"{selected_rows[0]['Skills']}, {', '.join(skills_from_json)}"

    profile = {
        "Role": role,
        "jobTitle": role,
        "FirstName": "John",
        "LastName": "Doe",
        "Email": "abc@gmail.com",
        "PhoneNo": "1234567890",
        "LinkedIn": "https://www.linkedin.com/in/name/",
        "Github": "https://github.com/name",
        "Objective": selected_rows[0]['Objective'],
        "WorkExperience": [
            {
                "company": row['Company'],
                "city": row['City'],
                "jobTitle": role,
                "startDate": start_date,
                "endDate": end_date,
                "description": f"<ul><li>Worked for {experience} years as a {role} enhancing my {skills} skills.</li></ul>"
            }
            for row in selected_rows
        ],
        "Projects": [
            {
                "name": row['ProjectName'],
                "link": row['ProjectLink'],
                "description": f"<ul><li>{'</li><li>'.join(row['ProjectDescription'].split('. '))}</li></ul>"

            }
            for row in selected_rows
        ],
        "Skills": skills,
                "Achievements": f"<ul><li>{'</li><li>'.join(selected_rows[0]['Achievements'].split('. '))}</li></ul>",

    }
    return profile

# API endpoint to generate profile
@app.route('/api/generate_profile', methods=['POST'])
def generate_profile_api():
    try:
        data = request.get_json()
        input_text = data.get("input_text")
        if not input_text:
            return jsonify({"error": "Missing required field: 'input_text'"}), 400

        dataset = load_dataset(default_dataset_path)
        if dataset is None:
            return jsonify({"error": "Dataset not found"}), 500

        role, experience = parse_input(input_text)
        if not role or experience is None:
            return jsonify({"error": "Could not extract role or experience"}), 400

        profile = generate_profile(dataset, role, experience)
        return jsonify(profile), 200

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route("/api/extract_resume", methods=["POST"])
def extract_resume():
    file = request.files.get("resume")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Extract raw text from the resume based on the file type (PDF or DOCX)
        if file.filename.endswith(".pdf"):
            extracted_text = resume_model.extract_text_from_pdf(file_path)
        elif file.filename.endswith(".docx"):
            extracted_text = resume_model.extract_text_from_docx(file_path)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        # Parse resume using ResumeParser
        resume_parser = ResumeParser(file_path)
        parsed_data = resume_parser.get_extracted_data()

        return jsonify({
            "extractedText": extracted_text,
            "parsedData": parsed_data
        })

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        resume_text = data.get("resumeText")
        job_description_text = data.get("jobDescription")
        role = data.get("role")

        if not resume_text or not job_description_text or not role:
            return jsonify({"error": "Missing required fields"}), 400

        resume_skills = resume_model.categorize_skills(resume_text)
        job_skills = resume_model.categorize_skills(job_description_text)

        ats_score, skill_score, section_score, formatting_score = resume_model.calculate_ats_score(
            resume_text, job_skills["hard_skills"]
        )

        similarity_score, recommendation = resume_model.hugging_face_recommendation_bert(
            resume_text, job_description_text
        )

        result = {
            "ats_score": {
                "overall": ats_score,
                "skill_match": skill_score,
                "section_presence": section_score,
                "formatting": formatting_score,
            },
            "skills_extracted_from_resume": resume_skills,
            "skills_extracted_from_job_description": job_skills,
            "semantic_similarity_score": similarity_score,
            "recommendation": recommendation,
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

# @app.route('/api/generate_profile', methods=['POST'])
# def generate_profile_api():
#     try:
#         data = request.get_json()
#         input_text = data.get("input_text")

#         if not input_text:
#             return jsonify({"error": "Missing required field: 'input_text'"}), 400

#         dataset = load_dataset(default_dataset_path)
#         role, experience = parse_input(input_text)

#         if not role or not experience:
#             return jsonify({"error": "Could not extract role or experience from the input"}), 400

#         profile = generate_profile(dataset, role, experience)

#         return jsonify(profile), 200

#     except Exception as e:
#         return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text")
        input_role = data.get("input_role")

        if not resume_text or not input_role:
            return jsonify({"error": "Missing required fields"}), 400

        # Call predict_role and retrieve the full dictionary
        prediction_results = resume_model.predict_role(resume_text, input_role)

        # Construct the response using the returned dictionary
        response = {
            "given_role": prediction_results["input_role"],
            "confidence": prediction_results["input_role_confidence"],
            "suggested_roles": prediction_results["suggested_roles"],
            "resume_skills": prediction_results["resume_skills"],
            "missing_skills": prediction_results["missing_skills"],
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500



if __name__ == "__main__":
    # Run the app on the appropriate host and port based on the environment
    if FLASK_ENV == 'production':
        # For production, bind to the host and port for deployment (e.g., devopsdost.xyz)
        app.run(debug=False, host='0.0.0.0', port=5000)  # Production server, port 80
    else:
        # For local development, use localhost and port 5000
        app.run(debug=True, host='0.0.0.0', port=5000)  # Local development
