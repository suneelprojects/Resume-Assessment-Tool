from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import socket
from resume_parser import ResumeParser
from resume_model import ResumeModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=os.environ.get('ALLOWED_ORIGIN', '*'))  # CORS for all origins

# Initialize resume model
resume_model = ResumeModel()

# Ensure 'uploads' folder exists
os.makedirs("uploads", exist_ok=True)

@app.route("/api/extract_resume", methods=["POST"])
def extract_resume():
    file = request.files.get("resume")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    try:
        # Save the uploaded file
        file_path = os.path.join("uploads", file.filename)
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

        # Return both extracted text and parsed data as JSON
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

        ats_score = resume_model.calculate_ats_score(resume_text, job_description_text, role)
        resume_skills = resume_model.categorize_skills(resume_text)
        job_skills = resume_model.categorize_skills(job_description_text)
        similarity_score, recommendation = resume_model.hugging_face_recommendation_bert(resume_text, job_description_text)

        result = {
            "ats_score": ats_score,
            "skills_extracted_from_resume": resume_skills,
            "skills_extracted_from_job_description": job_skills,
            "semantic_similarity_score": similarity_score,
            "recommendation": recommendation
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text")
        input_role = data.get("input_role")

        if not resume_text or not input_role:
            return jsonify({"error": "Missing required fields"}), 400

        # Predict role based on resume text
        input_role_confidence, suggested_roles, suggested_confidences = resume_model.predict_role(resume_text, input_role)

        return jsonify({
            "given_role": input_role,
            "confidence": input_role_confidence,
            "suggested_roles": [
                {"role": role, "confidence": confidence}
                for role, confidence in zip(suggested_roles[:10], suggested_confidences[:10])
            ]
        })

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 400


if __name__ == "__main__":
    # Dynamically determine IP address
    ip_address = socket.gethostbyname(socket.gethostname())
    app.run(host='0.0.0.0', port=80, debug=True)  # Listen on all interfaces (0.0.0.0)
